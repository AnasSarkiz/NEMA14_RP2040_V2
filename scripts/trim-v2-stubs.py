"""Trim obsolete endpoint branches only when live physical-pad partitions remain identical."""
import json,math,sys
from shapely.ops import unary_union
from v2_route_io import g
errors=json.loads((g.ROOT/'artifacts/v2/routing/native-drc.json').read_text())['errors']
def signature(net):
 elems,roots=g.groups(net);out={}
 for e,r in zip(elems,roots):
  if e.get('pcb_port_id'):out.setdefault(r,set()).add(e['pcb_port_id'])
 return sorted(sorted(v) for v in out.values())
records=[]
for err in errors:
 if err.get('pcb_trace_id','').startswith(('oscillator_','reviewed_local_critical_')) or (err.get('pcb_trace_id','').startswith('usb_') and '--include-usb' not in sys.argv):continue
 if 'dangling endpoint' not in err.get('message',''):continue
 e=next((e for e in g.j if e.get('pcb_trace_id')==err['pcb_trace_id']),None)
 if e is None:continue
 isstart=err['pcb_trace_error_id'].endswith('_start');route=e['route']
 ordered=list(reversed(route)) if not isstart else list(route)
 prefix=[]
 for point in ordered:
  if point['route_type']!='wire' or point['layer']!=ordered[0].get('layer'):break
  prefix.append(point)
 if len(prefix)<2:continue
 tail=ordered[len(prefix):];ordered=prefix
 net=g.key(e);layer=ordered[0]['layer'];geoms=[]
 for other in g.j:
  if other is e or g.key(other)!=net:continue
  if other['type'] in ['pcb_smtpad','pcb_plated_hole'] and layer in other.get('layers',[other.get('layer','top')]):geoms.append(g.geometry(other).buffer(-.02))
  elif other['type']=='pcb_via' and layer in other['layers']:
   vgeom=g.Point(other['x'],other['y']).buffer(other['outer_diameter']/2)
   live=any(o is not e and o['type']=='pcb_trace' and g.key(o)==net and any(a['route_type']==b['route_type']=='wire' and a['layer']==b['layer'] and g.LineString([(a['x'],a['y']),(b['x'],b['y'])]).buffer(min(a['width'],b['width'])/2).intersects(vgeom) for a,b in zip(o['route'],o['route'][1:])) for o in g.j)
   if live:geoms.append(g.Point(other['x'],other['y']))
  # Only a via with another live conductor may anchor an obsolete branch.
  elif other['type']=='pcb_trace':
   for a,b in zip(other['route'],other['route'][1:]):
    if a['route_type']==b['route_type']=='wire' and a['layer']==b['layer']==layer:geoms.append(g.LineString([(a['x'],a['y']),(b['x'],b['y'])]))
 # Projected route targets may differ from the original segment by floating
 # point roundoff. A sub-micron intersection tolerance finds those real joins;
 # the physical pad-partition comparison below still guards every trim.
 path=g.LineString([(p['x'],p['y']) for p in ordered]);hit=path.intersection(unary_union(geoms).buffer(1e-7));
 if hit.is_empty:continue
 pieces=list(hit.geoms) if hasattr(hit,'geoms') else [hit]
 offsets=[path.project(g.Point(*p.coords[0])) for p in pieces if hasattr(p,'coords') and len(p.coords)]
 offsets += [path.project(g.Point(*p.coords[-1])) for p in pieces if hasattr(p,'coords') and len(p.coords)]
 if not offsets:continue
 offset=min(offsets)
 if offset<1e-7:continue
 if offset>=path.length-.01:continue
 pt=path.interpolate(offset);new=[dict(ordered[0],x=pt.x,y=pt.y)];new[0].pop('start_pcb_port_id',None);new[0].pop('end_pcb_port_id',None)
 dist=0
 for a,b in zip(ordered,ordered[1:]):
  dist+=math.hypot(b['x']-a['x'],b['y']-a['y'])
  if dist>offset+1e-8:new.append(b)
 new+=tail
 candidate=new if isstart else list(reversed(new));before=signature(net);old=e['route'];e['route']=candidate
 if signature(net)!=before:e['route']=old;continue
 e['pcb_port_ids']=[p[k] for p in candidate for k in ['start_pcb_port_id','end_pcb_port_id'] if k in p]
 records.append({'trace_id':e['pcb_trace_id'],'endpoint':'start' if isstart else 'end','removed_length_mm':offset,'new_endpoint_mm':[pt.x,pt.y],'live_pad_connectivity_unchanged':True})
g.path.write_text(json.dumps(g.j,indent=2)+'\n');p=g.ROOT/'artifacts/v2/routing/trimmed-stubs.json';history=json.loads(p.read_text()) if p.exists() else [];history.extend(records);p.write_text(json.dumps(history,indent=2)+'\n');print(json.dumps(records))
