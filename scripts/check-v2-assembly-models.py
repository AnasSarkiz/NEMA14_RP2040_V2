"""Validate native CAD wire transforms against independently checked centerlines."""
import json,math,hashlib,struct
from pathlib import Path
R=Path(__file__).resolve().parents[1];b=(R/'assembly.circuit.json').read_bytes();j=json.loads(b);h=json.loads((R/'artifacts/v2/assembly/harness-definition.json').read_text());names={e['source_component_id']:e['name'] for e in j if e['type']=='source_component'};cad={names[e['source_component_id']]:e for e in j if e['type']=='cad_component'}
def vec(p):return [p[k] for k in 'xyz']
def cylinder(plan,a,b,r):
 assert plan['type']=='translate' and plan['shape']['type']=='rotate';s=plan['shape']['shape'];assert s['type']=='cylinder' and s['radius']==r
 alpha,beta,gamma=plan['shape']['angles'];assert alpha==0
 direction=[math.sin(beta)*math.cos(gamma),math.sin(beta)*math.sin(gamma),math.cos(beta)]
 endpoints=[[x+sign*d*s['height']/2 for x,d in zip(plan['vector'],direction)] for sign in [-1,1]]
 assert math.dist(endpoints[0],vec(a))<1e-6 and math.dist(endpoints[1],vec(b))<1e-6
count=0
for w in h['wires']:
 e=cad['MOTOR_LEAD_PIN_'+str(w['pin'])];assert e['position']==dict(x=0,y=0,z=0) and e['rotation']==dict(x=0,y=0,z=0)
 shapes=e['model_jscad']['shape']['shapes'];path=w['path'];assert len(shapes)==len(path)-1+len(path)-2
 for shape,a,bp in zip(shapes,path,path[1:]):cylinder(shape,a,bp,.5);count+=1
 for shape,q in zip(shapes[len(path)-1:],path[1:-1]):assert shape['vector']==vec(q) and shape['shape']['radius']==.5
 cylinder(cad['WAGO_CONDUCTOR_PIN_'+str(w['pin'])]['model_jscad']['shape'],w['insulation_end'],w['visible_tip_end'],.25)
asset=R/'imports/assembly/nema14-dimensional-reference.glb';raw=asset.read_bytes();prov=json.loads((R/'imports/assembly/provenance.json').read_text());assert hashlib.sha256(raw).hexdigest()==prov['sha256']
length,kind=struct.unpack_from('<II',raw,12);gltf=json.loads(raw[20:20+length]);assert all(not n.get('matrix') and not n.get('translation') and not n.get('rotation') and not n.get('scale') for n in gltf['nodes'])
accessors=[gltf['accessors'][p['attributes']['POSITION']] for m in gltf['meshes'] for p in m['primitives']];bounds=[[min(a['min'][k] for a in accessors) for k in range(3)],[max(a['max'][k] for a in accessors) for k in range(3)]]
motor=cad['MOTOR_REFERENCE_CONCEPT'];assert motor['rotation']==dict(x=180,y=0,z=180) and motor['position']==dict(x=0,y=0,z=-35)
body_rear=-35-min(a['min'][2] for a in accessors[:5]);rear=-35-bounds[0][2];assert abs(body_rear+6.8)<1e-5;assert abs(rear+3.8)<1e-5;assert abs(bounds[1][0]-bounds[0][0]-35.2)<1e-4
report={'passed':True,'assembly_sha256':hashlib.sha256(b).hexdigest(),'all_native_JSCAD_wire_centerlines_match_fit_checked_paths':True,'insulated_cylinders_checked':count,'four_partial_conductor_tips_coaxial':True,'motor_GLB_provenance_sha256':prov['sha256'],'motor_reference_local_bounds_mm':bounds,'modeled_motor_body_rear_Z_mm':body_rear,'modeled_rear_fastener_max_Z_mm':rear,'PCB_bottom_to_motor_body_rear_gap_mm':-.8-body_rear,'PCB_bottom_to_rear_fastener_gap_mm':-.8-rear,'factory_lead_gauge_and_rear_retention_qualified':False}
(R/'artifacts/v2/assembly/model-verification.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
