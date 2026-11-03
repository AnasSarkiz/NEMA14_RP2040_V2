"""Keep the modeled leads short and smoothly curved, with a straight bore entry."""
import json,math,hashlib
from pathlib import Path
R=Path(__file__).resolve().parents[1];h=json.loads((R/'artifacts/v2/assembly/harness-definition.json').read_text());rows=[];errors=[]
def point(p):return [p[k] for k in 'xyz']
def sub(a,b):return [x-y for x,y in zip(a,b)]
def cross(a,b):return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
def norm(v):return math.sqrt(sum(x*x for x in v))
for w in h['wires']:
 pts=list(map(point,w['path']));length=sum(math.dist(a,b) for a,b in zip(pts,pts[1:]));radii=[]
 for a,b,c in zip(pts,pts[1:],pts[2:]):
  area2=norm(cross(sub(b,a),sub(c,a)))
  if area2>1e-9:radii.append(math.dist(a,b)*math.dist(b,c)*math.dist(c,a)/(2*area2))
 minimum=min(radii);peak=max(p[2] for p in pts);outer=min(p[1] for p in pts)
 incoming=sub(pts[-1],pts[-2]);direction=point(w['axis']);aligned=norm(cross(incoming,direction))/norm(incoming)<1e-7 and sum(a*b for a,b in zip(incoming,direction))<0
 passed=length<=38 and minimum>=2.9 and peak<=15 and outer>=-22 and aligned
 if not passed:errors.append(w['pin'])
 rows.append({'pin':w['pin'],'color':w['color'],'length_mm':length,'minimum_sampled_centerline_bend_radius_mm':minimum,'maximum_Z_mm':peak,'outermost_Y_mm':outer,'straight_bore_entry_tangent_preserved':aligned})
report={'passed':not errors,'assembly_sha256':hashlib.sha256((R/'assembly.circuit.json').read_bytes()).hexdigest(),'routing_style':h['routing_style'],'nominal_insulation_OD_mm':1,'limits':{'maximum_length_mm':38,'minimum_sampled_bend_radius_mm':2.9,'maximum_Z_mm':15,'minimum_Y_mm':-22},'wires':rows,'errors':errors,'scope':'CAD shape and compactness screen; actual lead diameter and manufacturer bend rating remain unverified'}
(R/'artifacts/v2/assembly/wire-shape-verification.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2));raise SystemExit(bool(errors))
