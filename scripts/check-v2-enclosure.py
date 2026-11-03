"""Nominal enclosure fit screen; physical retention/process qualification is open."""
from pathlib import Path
import json,math,hashlib,sys,itertools,importlib.util
import cadquery as cq
R=Path(__file__).resolve().parents[1];OUT=R/'artifacts/v2/enclosure'
spec=importlib.util.spec_from_file_location('case_builder',R/'scripts/build-v2-enclosure.py');builder=importlib.util.module_from_spec(spec);spec.loader.exec_module(builder)
baseline_bytes=(R/'assembly.circuit.json').read_bytes();baseline=json.loads(baseline_bytes);concept_bytes=(R/'enclosure-concept.circuit.json').read_bytes();concept=json.loads(concept_bytes)
assert concept[:len(baseline)]==baseline
plans=json.loads((OUT/'native-case-plans.json').read_text())
all_names={e['source_component_id']:e['name'] for e in concept if e['type']=='source_component'}
for name,plan in plans.items():
 cad=next(e for e in concept if e['type']=='cad_component' and all_names[e['source_component_id']]=='ENCLOSURE_'+name+'_CONCEPT')
 assert cad['model_jscad']['shape']==plan and cad['position']=={'x':0,'y':0,'z':0} and cad['rotation']=={'x':0,'y':0,'z':0}
case={name:builder.from_plan(p) for name,p in plans.items()};hard={k:v for k,v in case.items() if k in ['LID','REAR_CARRIER']};names={e['source_component_id']:e['name'] for e in baseline if e['type']=='source_component'};dnp={e['source_component_id'] for e in baseline if e['type']=='pcb_component' and e.get('do_not_place')}
parts={};cache={}
def bounds(s):
 b=s.BoundingBox();return [b.xmin,b.ymin,b.zmin,b.xmax,b.ymax,b.zmax]
def lower(a,b):return math.sqrt(sum(max(a[i]-b[i+3],b[i]-a[i+3],0)**2 for i in range(3)))
for e in baseline:
 if e['type']!='cad_component' or not e.get('model_step_url') or e['source_component_id'] in dnp:continue
 p=R/('imports/supplier/'+e['model_step_url'].split('/imports/supplier/')[-1])
 if str(p) not in cache:cache[str(p)]=cq.importers.importStep(str(p)).val()
 s=cache[str(p)].translate(tuple(-e['model_origin_position'][a] for a in 'xyz'))
 for a,axis in zip('xyz',[(1,0,0),(0,1,0),(0,0,1)]):
  if e['rotation'][a]:s=s.rotate((0,0,0),axis,e['rotation'][a])
 parts[names[e['source_component_id']]]=s.translate(tuple(e['position'][a] for a in 'xyz'))
assert len(parts)==97
pcb=cq.Workplane('XY').box(34.5,34.5,1.6).val()
for x,y in itertools.product([-13,13],repeat=2):pcb=pcb.cut(cq.Workplane('XY').circle(1.6).extrude(4,both=True).val().translate((x,y,0)))
parts['PCB']=pcb
parts['MOTOR_BODY_MAX_ENVELOPE']=cq.Workplane('XY').box(35.2,35.2,28.2).val().translate((0,0,-20.9))
for x,y in itertools.product([-13,13],repeat=2):parts[f'REFERENCE_REAR_HEAD_{x}_{y}']=cq.Workplane('XY').box(5.5,5.5,7.5).val().translate((x,y,-7.55))
# Nominal 10 x 7 mm USB plug bodies, matching the recorded aperture assumption.
parts['PD_PLUG_ENVELOPE']=cq.Workplane('XY').box(10,7,25).val().translate((.6,14.85,20.71))
parts['DATA_PLUG_ENVELOPE']=cq.Workplane('XY').box(7,10,25).val().translate((-14.85,4.65,20.71))
# Top access remains open over the WAGO body and push buttons.
parts['WAGO_SERVICE_ENVELOPE']=cq.Workplane('XY').box(16.1,13,25).val().translate((-.3,-10.7,20.5))
collisions=[];checks=[]
for name,shape in hard.items():
 b=bounds(shape)
 for other,s in parts.items():
  if lower(b,bounds(s))>1e-6:continue
  v=shape.intersect(s).Volume()
  if v>1e-5:collisions.append({'case_part':name,'other':other,'intersection_mm3':v})
 for other,s in hard.items():
  if other<=name:continue
  v=shape.intersect(s).Volume()
  if v>1e-5:collisions.append({'case_parts':[name,other],'intersection_mm3':v})
 for pad,s in case.items():
  if pad in hard:continue
  v=shape.intersect(s).Volume()
  if v>1e-5:collisions.append({'case_part':name,'grip_pad':pad,'intersection_mm3':v})
h=json.loads((R/'artifacts/v2/assembly/harness-definition.json').read_text());wire_min=math.inf
for w in h['wires']:
 for a,b in zip(w['path'],w['path'][1:]):
  edge=cq.Edge.makeLine(cq.Vector(*(a[k] for k in 'xyz')),cq.Vector(*(b[k] for k in 'xyz')))
  for name,s in hard.items():
   d=edge.distance(s)-w['insulation_radius_mm'];wire_min=min(wire_min,d)
   if d<.2-1e-5:collisions.append({'wire_pin':w['pin'],'case_part':name,'wire_clearance_mm':d})
 # Check a straight 20 mm insertion/removal path out of the actual bore.
 a=[w['entry'][k] for k in 'xyz'];b=[w['entry'][k]+w['axis'][k]*20 for k in 'xyz'];edge=cq.Edge.makeLine(cq.Vector(*a),cq.Vector(*b))
 for name,s in hard.items():
  d=edge.distance(s)-1.0
  if d<0:collisions.append({'wire_insertion_pin':w['pin'],'case_part':name,'clearance_mm':d})
# Compliant pads are modeled at their compressed nominal thickness, not a
# prediction of actual grip force. They may contact the motor envelope.
for name,s in case.items():
 if name in hard:continue
 v=s.intersect(parts['MOTOR_BODY_MAX_ENVELOPE']).Volume()
 if v>1e-5:collisions.append({'grip_pad':name,'unintended_motor_penetration_mm3':v})
export_hashes={}
for name,s in case.items():
 path=OUT/(name.lower()+'.step');roundtrip=cq.importers.importStep(str(path)).val()
 assert roundtrip.isValid() and len(roundtrip.Solids())==1
 assert abs(roundtrip.Volume()-s.Volume())<1e-4
 for suffix in ['.step','.stl']:
  p=OUT/(name.lower()+suffix);export_hashes[p.name]=hashlib.sha256(p.read_bytes()).hexdigest()
rows=[]
for name,s in case.items():rows.append({'name':name,'bounds_mm':bounds(s),'volume_mm3':s.Volume(),'connected_solids':len(s.Solids()),'valid':s.isValid()})
report={'passed':not collisions,'enclosure_sha256':hashlib.sha256(concept_bytes).hexdigest(),'approved_assembly_sha256':hashlib.sha256(baseline_bytes).hexdigest(),'approved_PCB_motor_and_wires_preserved':True,'actual_supplier_STEP_parts_checked':97,'case_parts':rows,'native_CAD_plans_and_STEP_roundtrip_match':True,'export_sha256':export_hashes,'nominal_wire_to_case_min_clearance_mm':wire_min,'USB_nominal_plug_body_mm':[10,7],'WAGO_button_and_wire_service_openings_checked':True,'wire_insert_remove_straight_path_mm':20,'modeled_grip_pad_compression_mm':.2,'collisions':collisions,'physical_retention_verified':False,'case_closure_fasteners_selected':False,'thermal_material_and_print_process_qualified':False,'rear_attachment_and_motor_dimensions_require_sample_check':True,'fabrication_ready':False,'scope':'Geometric prototype concept; not a production enclosure or final fastening/thermal design'}
(OUT/'fit-verification.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2));raise SystemExit(bool(collisions))
