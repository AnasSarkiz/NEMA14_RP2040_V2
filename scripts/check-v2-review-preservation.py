"""Bind the local review fixes to the previously reviewed dev.7 hardware."""
import hashlib,json,subprocess
from pathlib import Path
R=Path(__file__).resolve().parents[1];p=R/'artifacts/v2/routing/freerouted.circuit.json'
old=json.loads(subprocess.check_output(['git','show','5526add:artifacts/v2/routing/freerouted.circuit.json'],cwd=R));new=json.loads(p.read_bytes())
identity=lambda e:(e['type'],e.get(e['type']+'_id'))
before={identity(e):e for e in old};after={identity(e):e for e in new}
checks=[]
def check(name,ok,**extra):checks.append({'check':name,'passed':bool(ok),**extra})
types={'pcb_trace','pcb_via','pcb_component','pcb_port','pcb_smtpad','pcb_plated_hole','pcb_hole','pcb_keepout','pcb_courtyard_outline','source_port','source_trace','source_net'}
changed=[{'type':k[0],'id':k[1]} for k,e in before.items() if k[0] in types and after.get(k)!=e]
check('Every existing trace, via, terminal, placement and electrical connection is preserved',not changed,changed_records=changed)
inner=[k for k,e in before.items() if e['type']=='pcb_copper_pour' and e['layer'] in ['inner1','inner2','bottom']]
check('Existing inner ground reference and bottom copper pours are exact',all(before[k]==after.get(k) for k in inner),pours_checked=len(inner))
changes=[]
for k,e in before.items():
 if e['type']!='source_component':continue
 n=after.get(k)
 if n!=e:changes.append({'reference':e['name'],'before_MPN':e.get('manufacturer_part_number'),'after_MPN':n.get('manufacturer_part_number') if n else None})
check('Only the two intended existing resistor identities/values change',{c['reference'] for c in changes}=={'R_ENABLE','R_SLEEP'},changes=changes)
additions=[e for k,e in after.items() if k not in before and e['type']=='source_component']
check('The only added source component is the USB bypass',[e['name'] for e in additions]==['C_ESD'])
for k,e in before.items():
 if e['type']!='cad_component':continue
 n=after.get(k);assert n is not None
 check('Existing CAD transform '+str(k[1]),all(e.get(f)==n.get(f) for f in ['position','rotation','model_origin_position','model_unit_to_mm_scale_factor']))
report={'passed':all(c['passed'] for c in checks),'source_sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'baseline_revision':'5526add','checks':checks,'scope':'Exact preservation of existing routed hardware, poses and source connections; top ground clearance adapts only around the added bypass','fabrication_ready':False}
(p.parent/'review-fixes-preservation.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'passed':report['passed'],'source_sha256':report['source_sha256'],'checks':len(checks),'failures':[c for c in checks if not c['passed']]},indent=2));raise SystemExit(not report['passed'])
