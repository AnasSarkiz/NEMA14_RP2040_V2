"""Check high-priority legend ink using native Gerber strokes, not text boxes."""
import json,math,hashlib,sys,html,importlib.util
from pathlib import Path
from shapely.geometry import Point,LineString,Polygon,box,mapping
from shapely.affinity import rotate
from shapely.ops import unary_union
ROOT=Path(__file__).resolve().parents[1]
j=json.loads((ROOT/'artifacts/v2/routing/freerouted.circuit.json').read_text())
ink=json.loads(Path('/tmp/nema14-critical-ink.json').read_text())
labels=json.loads((ROOT/'src/critical-markings.json').read_text())
actual={e['pcb_silkscreen_text_id']:e for e in j if e['type']=='pcb_silkscreen_text' and e['pcb_silkscreen_text_id'].startswith('v2_critical_')}
assert len(actual)==len(labels)==len(ink['labels']), 'Critical label set differs from the actual board'
assert ink['source_sha256']==hashlib.sha256((ROOT/'artifacts/v2/routing/freerouted.circuit.json').read_bytes()).hexdigest()
for l in labels:
 e=actual['v2_critical_'+l['id']]
 assert (e['text'],e['layer'],e['anchor_position'],e['ccw_rotation'],e['font_size'])==(l['text'],l['layer'],{'x':l['x'],'y':l['y']},l['rotation'],l['font_size']),l['id']
 assert e.get('is_knockout',False)==l.get('is_knockout',False),l['id']
 if l.get('is_knockout'):assert e['knockout_padding']==l['knockout_padding']

board=box(-17.25,-17.25,17.25,17.25)
sources={e['source_component_id']:e['name'] for e in j if e['type']=='source_component'}
pcs={e['pcb_component_id']:e for e in j if e['type']=='pcb_component'}
def geom(e):
 x,y=e['x'],e['y'];shape=e.get('shape',e.get('hole_shape'))
 w=e.get('width',e.get('outer_width',e.get('outer_diameter',e.get('hole_width',e.get('hole_diameter',e.get('radius',0)*2)))));h=e.get('height',e.get('outer_height',e.get('outer_diameter',e.get('hole_height',e.get('hole_diameter',e.get('radius',0)*2)))))
 if shape=='circle' or e['type']=='pcb_via':return Point(x,y).buffer(w/2)
 if shape in ['pill','rotated_pill']:
  dx,dy=((w-h)/2,0) if w>=h else (0,(h-w)/2)
  g=LineString([(x-dx,y-dy),(x+dx,y+dy)]).buffer(min(w,h)/2)
 elif shape=='polygon':g=Polygon([(p['x'],p['y']) for p in e['points']])
 else:g=box(x-w/2,y-h/2,x+w/2,y+h/2)
 return rotate(g,e.get('ccw_rotation',0),origin=(x,y))
obstacles={'top':[],'bottom':[]};bodies={'top':[],'bottom':[]}
for e in j:
 t=e['type']
 if t=='pcb_courtyard_outline':
  c=pcs[e['pcb_component_id']]
  if not c.get('do_not_place'):bodies[e['layer']].append((sources[c['source_component_id']],Polygon([(p['x'],p['y']) for p in e['outline']])))
 if t not in ['pcb_smtpad','pcb_plated_hole','pcb_hole','pcb_via']:continue
 layers=[e['layer']] if t=='pcb_smtpad' else ['top','bottom']
 for side in layers:
  if e.get('is_covered_with_solder_mask') or (t=='pcb_via' and e.get('tented_on_'+side,False)):continue
  obstacles[side].append((e.get(t+'_id'),geom(e)))
for side in obstacles:
 for x in [-13,13]:
  for y in [-13,13]:bodies[side].append(('screw-head',Point(x,y).buffer(3.2)))
# Verify each printed motor column against the real physical pin and net.
ports={e['source_port_id']:e for e in j if e['type']=='source_port'}
nets={e['source_net_id']:e['name'] for e in j if e['type']=='source_net'}
motor_id=next(e['source_component_id'] for e in j if e['type']=='source_component' and e['name']=='J_MOTOR')
for l in labels:
 if l.get('target')!='J_MOTOR' or 'pin' not in l:continue
 p=next(e for e in ports.values() if e['source_component_id']==motor_id and e['pin_number']==l['pin'])
 t=next(e for e in j if e['type']=='source_trace' and p['source_port_id'] in e.get('connected_source_port_ids',[]))
 assert l['net'] in [nets[n] for n in t['connected_source_net_ids']]
 pp=next(e for e in j if e['type']=='pcb_port' and e.get('source_port_id')==p['source_port_id'])
 assert abs(pp['x']-l['x'])<.001, 'Motor column label does not match its pin'
spec=importlib.util.spec_from_file_location('critical_ink_cam',ROOT/'scripts/audit-manufacturing.py')
cam=importlib.util.module_from_spec(spec);spec.loader.exec_module(cam)
polys={};guards={};errors=[];results=[]
for label in ink['labels']:
 # Respect dark/clear Gerber polarity: knockout letters are absent ink, while
 # the background and enclosed letter counters are positive printed regions.
 poly=cam.gerber(Path(label['gerber_path']))[0];polys[label['id']]=poly
 label['geometry']=mapping(poly)
 guard=box(*poly.bounds) if label.get('is_knockout') else poly;guards[label['id']]=guard
 hit=[name for name,g in obstacles[label['layer']] if guard.distance(g)<.20-1e-6]
 covered=[name for name,g in bodies[label['layer']] if guard.intersection(g).area>1e-7]
 edge=guard.distance(board.boundary) if board.covers(guard) else -1
 widths={s['width'] for s in label['segments']}
 if hit or covered or edge<.25-1e-6 or min(widths)<.15:errors.append({'label':label['text'],'id':label['id'],'pad_or_hole_hits':hit,'covered_by':covered,'edge_clearance_mm':edge})
 if label.get('is_knockout'):
  if guard.difference(poly).area<1 or poly.area<1:errors.append({'invalid_knockout_geometry':label['text']})
  pieces=[poly] if poly.geom_type=='Polygon' else list(poly.geoms)
  if any(p.buffer(-.075).is_empty for p in pieces):errors.append({'knockout_white_feature_below_0_15_mm':label['text']})
 results.append({'id':label['id'],'text':label['text'],'layer':label['layer'],'font_size_mm':label['font_size'],'is_knockout':label.get('is_knockout',False),'minimum_stroke_mm':min(widths),'bounds_mm':list(poly.bounds),'pad_clearance_mm':min(guard.distance(g) for _,g in obstacles[label['layer']]),'edge_clearance_mm':edge})
Path('/tmp/nema14-critical-ink.json').write_text(json.dumps(ink,indent=2)+'\n')
# Preserve existing logo/warning vectors, and require separation from this ink.
legacy_ink=unary_union([LineString([(p['x'],p['y']) for p in e['route']]).buffer(e['stroke_width']/2) for e in j if e['type']=='pcb_silkscreen_path' and e['layer']=='bottom' and len(e['route'])>1])
for l in ink['labels']:
 if l['layer']=='bottom' and guards[l['id']].distance(legacy_ink)<.20:errors.append({'label_touches_existing_artwork':l['text']})
for i,a in enumerate(ink['labels']):
 for b in ink['labels'][:i]:
  if a['layer']==b['layer'] and guards[a['id']].distance(guards[b['id']])<.20:errors.append({'labels_touch':[a['text'],b['text']]})
# Render actual native Gerber ink. Bottom view is mirrored for underside reading.
for side in ['top','bottom']:
 flip=-1 if side=='bottom' else 1
 def path(g,color):
  out=''
  for p in ([g] if g.geom_type=='Polygon' else getattr(g,'geoms',[])):
   if p.geom_type!='Polygon':continue
   rings=[p.exterior,*p.interiors]
   d=' '.join('M '+' L '.join(f'{flip*x},{-y}' for x,y in ring.coords)+' Z' for ring in rings)
   out+=f'<path d="{d}" fill="{color}" fill-rule="evenodd"/>'
  return out
 svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="-18 -18 36 36" width="1200" height="1200"><rect x="-17.25" y="-17.25" width="34.5" height="34.5" fill="#165534"/>'
 for _,g in bodies[side]:svg+=path(g,'#294e40')
 for _,g in obstacles[side]:svg+=path(g,'#aaa')
 for l in ink['labels']:
  if l['layer']==side:svg+=path(polys[l['id']],'white')
 svg+='</svg>'
 (ROOT/f'artifacts/v2/routing/critical-silkscreen-{side}.svg').write_text(svg)
report={'passed':not errors,'source_sha256':ink['source_sha256'],'scope':'High-priority text only, native Gerber ink; 0.20 mm exposed-pad/hole and label clearance, 0.25 mm board edge; fitted-body and screw-head visibility; not a full CAM release','critical_label_count':len(results),'motor_pin_net_and_column_checks_passed':True,'bottom_gerber_text_mirroring':'Native default bottom mirroring; review SVG is the underside view','labels':results,'errors':errors}
(ROOT/'artifacts/v2/routing/critical-silkscreen-verification.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'passed':not errors,'errors':errors},indent=2))
raise SystemExit(bool(errors))
