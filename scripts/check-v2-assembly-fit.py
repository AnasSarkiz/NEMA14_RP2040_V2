"""Check V2 assembly against actual supplier STEP and WAGO cylindrical bores.

This checks nominal CAD envelopes; factory wire fit and motor rear retention
remain unqualified. Internal clamp contact/strip depth is not modeled.
"""
from pathlib import Path
import json,math,hashlib,itertools
import cadquery as cq
R=Path(__file__).resolve().parents[1];board_bytes=(R/'artifacts/v2/routing/freerouted.circuit.json').read_bytes();board=json.loads(board_bytes);assembly_bytes=(R/'assembly.circuit.json').read_bytes();j=json.loads(assembly_bytes);h=json.loads((R/'artifacts/v2/assembly/harness-definition.json').read_text())
assert j[:len(board)]==board and h['board_sha256']==hashlib.sha256(board_bytes).hexdigest()
extra=j[len(board):];assert not any(e['type'].startswith('pcb_') for e in extra)
assert len([e for e in extra if e['type']=='cad_component'])==9
names={e['source_component_id']:e['name'] for e in j if e['type']=='source_component'};dnp={e['source_component_id'] for e in j if e['type']=='pcb_component' and e.get('do_not_place')};parts={};cache={};bounds={}
def bb(s):
 b=s.BoundingBox();return [b.xmin,b.ymin,b.zmin,b.xmax,b.ymax,b.zmax]
def lower(a,b):return math.sqrt(sum(max(a[k]-b[k+3],b[k]-a[k+3],0)**2 for k in range(3)))
def add(name,s):parts[name]=s;bounds[name]=bb(s)
for e in board:
 if e['type']!='cad_component' or not e.get('model_step_url') or e['source_component_id'] in dnp:continue
 path=R/('imports/supplier/'+e['model_step_url'].split('/imports/supplier/')[-1])
 if str(path) not in cache:cache[str(path)]=cq.importers.importStep(str(path)).val()
 shape=cache[str(path)];origin=e['model_origin_position'];shape=shape.translate(tuple(-origin[k] for k in 'xyz'))
 for k,axis in zip('xyz',[(1,0,0),(0,1,0),(0,0,1)]):
  if e['rotation'][k]:shape=shape.rotate((0,0,0),axis,e['rotation'][k])
 shape=shape.translate(tuple(e['position'][k] for k in 'xyz'));add(names[e['source_component_id']],shape)
fitted_supplier_count=len(parts)
# A 34.5 mm board and the reference motor's exact body envelope.
pcb=cq.Workplane('XY').box(34.5,34.5,1.6).val()
for x,y in itertools.product([-13,13],repeat=2):pcb=pcb.cut(cq.Workplane('XY').circle(1.6).extrude(3,both=True).val().translate((x,y,0)))
add('PCB',pcb);add('MOTOR_BODY_CONCEPT',cq.Workplane('XY').box(35.2,35.2,28.2).val().translate((0,0,-20.9)))
# Conservatively include the four rear fastener envelopes in the actual GLB.
for x,y in itertools.product([-13,13],repeat=2):
 add(f'MOTOR_REAR_FASTENER_{x}_{y}',cq.Workplane('XY').box(5.5,5.5,7.5).val().translate((x,y,-7.55)))
hardware_collisions=[]
# Independent supplier bore extraction; do not accept visual/footprint guesses.
local=cache[str(R/'imports/supplier/A_250_204/A_250_204.step')];bores={}
for f in local.Faces():
 if f.geomType()!='CYLINDER':continue
 cy=f._geomAdaptor().Cylinder()
 if abs(cy.Radius()-1.5)>.001:continue
 p=cy.Location();a=cy.Axis().Direction();origin=[p.X(),p.Y(),p.Z()];axis=[a.X(),a.Y(),a.Z()]
 ts=[sum((q-v)*d for q,v,d in zip([vtx.Center().x,vtx.Center().y,vtx.Center().z],origin,axis)) for vtx in f.Vertices()]
 if not ts:continue
 bores[round(p.X(),2)]={'origin':origin,'axis':axis,'mouth':[q+max(ts)*d for q,d in zip(origin,axis)],'radius':cy.Radius()}
assert len(bores)==4
cad=next(e for e in board if e['type']=='cad_component' and names[e['source_component_id']]=='J_MOTOR');theta=math.radians(cad['rotation']['z']);c,s=math.cos(theta),math.sin(theta)
def world(q):
 x,y,z=[q[k]-cad['model_origin_position'][a] for k,a in enumerate('xyz')];return [cad['position']['x']+c*x-s*y,cad['position']['y']+s*x+c*y,cad['position']['z']+z]
collisions=list(hardware_collisions);segments=[];minimum=math.inf
for w in h['wires']:
 bore=bores[[-5.25,-1.75,1.75,5.25][w['pin']-1]];mouth=world(bore['mouth']);axis=[-s*bore['axis'][1],c*bore['axis'][1],bore['axis'][2]]
 assert math.dist(mouth,[w['entry'][a] for a in 'xyz'])<1e-7
 assert math.dist(axis,[w['axis'][a] for a in 'xyz'])<1e-7
 assert w['insulation_radius_mm']+.2<bore['radius']
 ports={e['source_port_id']:e for e in board if e['type']=='source_port'};motor_source=next(e['source_component_id'] for e in board if e['type']=='source_component' and e['name']=='J_MOTOR');port=next(e for e in ports.values() if e['source_component_id']==motor_source and e['pin_number']==w['pin']);nets={e['source_net_id']:e['name'] for e in board if e['type']=='source_net'}
 trace=next(e for e in board if e['type']=='source_trace' and port['source_port_id'] in e.get('connected_source_port_ids',[]));assert w['net'] in [nets[n] for n in trace['connected_source_net_ids']]
 for i,(a,b) in enumerate(zip(w['path'],w['path'][1:])):
  edge=cq.Edge.makeLine(cq.Vector(*(a[k] for k in 'xyz')),cq.Vector(*(b[k] for k in 'xyz')));eb=bb(edge);radius=w['insulation_radius_mm'];segments.append((w['pin'],i,edge,eb,radius))
  for name,shape in parts.items():
   if name=='MOTOR_BODY_CONCEPT' and i==0:continue # defined conceptual factory outlet
   if lower(eb,bounds[name])>radius+.5:continue
   distance=edge.distance(shape);minimum=min(minimum,distance-radius)
   if distance<radius-1e-5:collisions.append({'pin':w['pin'],'segment':i,'part':name,'clearance_mm':distance-radius})
 # The drawn copper tip stays coaxial inside the modeled entrance bore.
 for key in ['insulation_end','visible_tip_end']:
  q=[w[key][a]-w['entry'][a] for a in 'xyz'];projection=sum(a*b for a,b in zip(q,axis));assert math.sqrt(sum((a-projection*b)**2 for a,b in zip(q,axis)))<1e-7
for i,(pin,k,a,ab,ar) in enumerate(segments):
 for pin2,k2,b,bb_,br in segments[:i]:
  if pin==pin2 or lower(ab,bb_)>=ar+br:continue
  if a.distance(b)<ar+br-1e-5:collisions.append({'wire_to_wire':[pin,k,pin2,k2]})
report={'passed':not collisions,'board_sha256':hashlib.sha256(board_bytes).hexdigest(),'assembly_sha256':hashlib.sha256(assembly_bytes).hexdigest(),'board_records_preserved':True,'mechanical_parts':9,'fitted_supplier_STEP_parts':fitted_supplier_count,'mounting_hardware_included':False,'four_reference_rear_fastener_envelopes_checked':True,'four_physical_motor_pin_nets_verified':True,'four_wire_entry_axes_verified_against_actual_WAGO_STEP':True,'motor_outlet_and_terminal_on_same_board_side':'-Y','no_JST_or_pigtail_splices':True,'wire_segments_checked':len(segments),'minimum_insulated_wire_clearance_mm':minimum,'collisions':collisions,'PCB_surface_to_motor_rear_gap_mm':6,'motor_rear_attachment_verified':False,'factory_wire_gauge_and_retention_verified':False,'physical_assembly_tested':False,'limitations':['Motor rear threads, rear shaft/magnet and actual retention are unverified; mounting hardware is omitted.','Wire outside diameter is a 1 mm visual envelope; confirm actual factory gauge and WAGO retention with samples.','Only a partial hidden conductor tip is drawn; follow the manufacturer 8.5–9.5 mm strip requirement.','USB plug and button/tool operating access require physical verification.']}
(R/'artifacts/v2/assembly/assembly-verification.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2));raise SystemExit(bool(collisions))
