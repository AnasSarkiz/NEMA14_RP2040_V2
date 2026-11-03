"""Build a separate, reversible enclosure concept from one native CAD plan."""
from pathlib import Path
import json,hashlib,math
import cadquery as cq
R=Path(__file__).resolve().parents[1];cfg=json.loads((R/'src/v2-enclosure.json').read_text());OUT=R/'artifacts/v2/enclosure';OUT.mkdir(parents=True,exist_ok=True)

def shift(x,y,z,shape):return {'type':'translate','vector':[x,y,z],'shape':shape}
def cube(x,y,z,w,d,h):return shift(x,y,z,{'type':'cuboid','size':[w,d,h]})
def cylinder(x,y,z,r,h):return shift(x,y,z,{'type':'cylinder','radius':r,'height':h,'segments':48})
def union(parts):return {'type':'union','shapes':parts}
def subtract(s,*cuts):return {'type':'subtract','shapes':[s,*cuts]}
def rounded(w,d,r,z0,z1):
 h=z1-z0;z=(z0+z1)/2
 return union([cube(0,0,z,w-2*r,d,h),cube(0,0,z,w,d-2*r,h)]+[cylinder(x,y,z,r,h) for x in [-w/2+r,w/2-r] for y in [-d/2+r,d/2-r]])
def ring(z0,z1):return subtract(rounded(cfg['outer_width_mm'],cfg['outer_depth_mm'],cfg['outer_corner_radius_mm'],z0,z1),rounded(cfg['inner_width_mm'],cfg['inner_width_mm'],cfg['inner_corner_radius_mm'],z0-.1,z1+.1))

def from_plan(p):
 t=p['type']
 if t=='translate':return from_plan(p['shape']).translate(tuple(p['vector']))
 if t=='cuboid':return cq.Workplane('XY').box(*p['size']).val()
 if t=='cylinder':return cq.Workplane('XY').circle(p['radius']).extrude(p['height']).val().translate((0,0,-p['height']/2))
 if t in ['union','subtract']:
  parts=[from_plan(q) for q in p['shapes']];s=parts[0]
  for p in parts[1:]:s=s.fuse(p) if t=='union' else s.cut(p)
  return s.clean()
 raise AssertionError(t)

def build():
 bosses=[];supports=[];bridges=[];holes=[]
 for x in cfg['mount_centres_mm']:
  for y in cfg['mount_centres_mm']:
   bosses.append(cylinder(x,y,(.8+cfg['roof_inside_Z_mm'])/2,cfg['boss_outer_diameter_mm']/2,cfg['roof_inside_Z_mm']-.8))
   supports.append(cylinder(x,y,-1.6,cfg['boss_outer_diameter_mm']/2,1.6))
   bridges.append(cube(math.copysign(16.35,x),y,-1.6,6.7,4.4,1.6))
   holes.append(cylinder(x,y,0,cfg['case_fastener_clearance_diameter_mm']/2,30))
 # The WAGO stays exposed through the roof so its buttons and wire approach
 # remain usable. USB-C cutouts follow the real vertical connector mouths.
 wago=cube(.2,-12,4.5,17.5,17,11)
 pd=cube(.6,15.6,8.0,10.5,9.5,5)
 data=cube(-15.6,4.65,8.0,9.5,10.5,5)
 lid=subtract(union([ring(cfg['lid_bottom_Z_mm'],cfg['roof_top_Z_mm']),rounded(cfg['outer_width_mm'],cfg['outer_depth_mm'],cfg['outer_corner_radius_mm'],cfg['roof_inside_Z_mm'],cfg['roof_top_Z_mm']),*bosses]),wago,pd,data,*holes)
 vents=[cube(x,-6,8.25,1.2,6.5,2) for x in [10.0,12.0,14.0,16.0]]
 vents += [cube(13.7,y,8.25,6.5,1.0,2) for y in [-1.6,0,1.6]]
 lid=subtract(lid,*vents)
 wire_notch=cube(.45,-19, -5,14.5,5.0,12)
 carrier=subtract(union([ring(cfg['carrier_bottom_Z_mm'],cfg['carrier_top_Z_mm']),*supports,*bridges]),wire_notch,*holes)
 pads=[]
 # Compressed pad envelopes only; this does not establish grip force or material.
 pads.append(('GRIP_LEFT',cube(-17.9,0,-8.3,.6,8,2.6)))
 pads.append(('GRIP_RIGHT',cube(17.9,0,-8.3,.6,8,2.6)))
 pads.append(('GRIP_REAR',cube(0,17.9,-8.3,8,.6,2.6)))
 pads.append(('GRIP_FRONT_LEFT',cube(-10.5,-17.9,-8.3,4,.6,2.6)))
 pads.append(('GRIP_FRONT_RIGHT',cube(10.5,-17.9,-8.3,4,.6,2.6)))
 return [('LID',lid),('REAR_CARRIER',carrier),*pads]

if __name__=='__main__':
 assembly_bytes=(R/'assembly.circuit.json').read_bytes();baseline=json.loads(assembly_bytes);extras=[];plans={}
 for name,plan in build():
  plans[name]=plan;solid=from_plan(plan)
  assert solid.isValid() and len(solid.Solids())==1,(name,'Case piece must be one connected solid')
  cq.exporters.export(solid,str(OUT/(name.lower()+'.step')))
  cq.exporters.export(solid,str(OUT/(name.lower()+'.stl')),tolerance=.05,angularTolerance=.1)
  sid='enclosure_concept_source_'+name
  extras.extend([{'type':'source_component','source_component_id':sid,'ftype':'subassembly','name':'ENCLOSURE_'+name+'_CONCEPT','display_name':'Enclosure concept; fit and retention unverified'},
   {'type':'cad_component','cad_component_id':'enclosure_concept_cad_'+name,'source_component_id':sid,'position':{'x':0,'y':0,'z':0},'rotation':{'x':0,'y':0,'z':0},'layer':'top','model_origin_position':{'x':0,'y':0,'z':0},'model_unit_to_mm_scale_factor':1,'model_object_fit':'contain_within_bounds','anchor_alignment':'center','show_as_translucent_model':name in ['LID','REAR_CARRIER'],'model_jscad':{'type':'colorize','color':([.72,.87,.92,.28] if name=='LID' else [.58,.73,.79,.35] if name=='REAR_CARRIER' else [.13,.14,.15,1]),'shape':plan}}])
 j=[*baseline,*extras];assert j[:len(baseline)]==baseline
 (R/'enclosure-concept.circuit.json').write_text(json.dumps(j,indent=2)+'\n')
 (OUT/'native-case-plans.json').write_text(json.dumps(plans,indent=2)+'\n')
 proof={'passed':True,'base_assembly_sha256':hashlib.sha256(assembly_bytes).hexdigest(),'enclosure_sha256':hashlib.sha256((R/'enclosure-concept.circuit.json').read_bytes()).hexdigest(),'approved_assembly_records_preserved':True,'enclosure_parts':list(plans),'PCB_or_motor_or_wire_changes':False,'prototype_exports_only':True,'fabrication_ready':False}
 (OUT/'build-verification.json').write_text(json.dumps(proof,indent=2)+'\n');print(json.dumps(proof,indent=2))
