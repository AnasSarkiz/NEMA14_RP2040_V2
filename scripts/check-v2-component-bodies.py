"""Screen every fitted supplier STEP body against every other fitted body."""
from pathlib import Path
from v2_model_assets import local_model
import json,math,itertools,hashlib
import cadquery as cq
board_path=Path('artifacts/v2/routing/freerouted.circuit.json');j=json.loads(board_path.read_text());names={e['source_component_id']:e['name'] for e in j if e['type']=='source_component'};dnp={e['source_component_id'] for e in j if e['type']=='pcb_component' and e.get('do_not_place')};parts={};cache={};bounds={}
for e in j:
 if e['type']!='cad_component' or not e.get('model_step_url') or e['source_component_id'] in dnp:continue
 p=local_model(e['model_step_url'])
 if str(p) not in cache:cache[str(p)]=cq.importers.importStep(str(p)).val()
 s=cache[str(p)].translate(tuple(-e['model_origin_position'][k] for k in 'xyz'))
 for k,axis in zip('xyz',[(1,0,0),(0,1,0),(0,0,1)]):
  if e['rotation'][k]:s=s.rotate((0,0,0),axis,e['rotation'][k])
 s=s.translate(tuple(e['position'][k] for k in 'xyz'));name=names[e['source_component_id']];parts[name]=s;b=s.BoundingBox();bounds[name]=[b.xmin,b.ymin,b.zmin,b.xmax,b.ymax,b.zmax]
rows=[]
for a,b in itertools.combinations(parts,2):
 aa,bb=bounds[a],bounds[b];gap=math.sqrt(sum(max(aa[k]-bb[k+3],bb[k]-aa[k+3],0)**2 for k in range(3)))
 if gap>.1:continue
 distance=parts[a].distance(parts[b])
 if distance<.1:rows.append({'a':a,'b':b,'distance_mm':distance,'intersection_volume_mm3':parts[a].intersect(parts[b]).Volume() if distance<1e-6 else 0})
expected={names[e['source_component_id']] for e in j if e['type']=='pcb_component' and not e.get('do_not_place') and next(x for x in j if x['type']=='source_component' and x['source_component_id']==e['source_component_id'])['ftype']!='simple_test_point'}
assert set(parts)==expected and len(parts)==98
report={'passed':not rows,'source_sha256':hashlib.sha256(board_path.read_bytes()).hexdigest(),'fitted_STEP_parts_checked':len(parts),'minimum_screened_clearance_mm':.1,'close_pairs':rows,'scope':'Nominal supplier STEP component-to-component clearance; does not qualify assembly tolerances, plug/tool access or rear fastening'}
Path('artifacts/v2/routing/component-body-verification.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2));raise SystemExit(bool(rows))
