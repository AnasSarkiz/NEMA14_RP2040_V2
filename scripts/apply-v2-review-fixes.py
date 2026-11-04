"""Seed dev.8 from the checked dev.7 copper, preserving unrelated routes.

The source build supplies the two new resistor identities and added bypass.
The small bypass fits without moving any existing component. Every original
trace/via is retained. Full qualification is still required afterward.
"""
import hashlib,json,subprocess
from pathlib import Path

R=Path(__file__).resolve().parents[1]
baseline_revision='5526add'
baseline=subprocess.check_output(['git','show',baseline_revision+':artifacts/v2/routing/freerouted.circuit.json'],cwd=R)
assert hashlib.sha256(baseline).hexdigest()=='7adf7b27d291aa7312d1c5bec6c1d24b3fc17ea6c653c7e9eba962114c56d178'
old=json.loads(baseline);source=json.loads((R/'artifacts/v2/source.circuit.json').read_text())
names={e['source_component_id']:e['name'] for e in source if e['type']=='source_component'}
components={e['pcb_component_id']:names[e['source_component_id']] for e in source if e['type']=='pcb_component'}
ports={e['pcb_port_id']:e for e in source if e['type']=='pcb_port'}
sp={e['source_port_id']:e for e in source if e['type']=='source_port'}
nets={e['name']:e for e in source if e['type']=='source_net'}
def terminal(ref,pin):
    return next(e for e in ports.values() if components[e['pcb_component_id']]==ref and sp[e['source_port_id']]['pin_number']==pin)
removed=[];copper=[]
for e in old:
    if e['type'] not in ['pcb_trace','pcb_via','pcb_copper_pour']:continue
    copper.append(e)
next(e for e in source if e['type']=='pcb_board')['is_via_in_pad_allowed']=True
j=source+copper
def trace(uid,net,points,start,end=None):
    n=nets[net];st=next(e for e in source if e['type']=='source_trace' and start['source_port_id'] in e.get('connected_source_port_ids',[]) and e.get('subcircuit_connectivity_map_key')==n['subcircuit_connectivity_map_key'])
    route=[{'route_type':'wire','x':x,'y':y,'width':.2,'layer':'top'} for x,y in points]
    route[0]['start_pcb_port_id']=start['pcb_port_id']
    if end:route[-1]['end_pcb_port_id']=end['pcb_port_id']
    j.append({'type':'pcb_trace','pcb_trace_id':uid,'route':route,'source_net_id':n['source_net_id'],'source_trace_id':st['source_trace_id'],'subcircuit_connectivity_map_key':n['subcircuit_connectivity_map_key'],'subcircuit_id':'subcircuit_source_group_0','pcb_port_ids':[start['pcb_port_id']]+([end['pcb_port_id']] if end else [])})
cap=terminal('C_ESD',1);esd=terminal('U_ESD',5)
trace('review_ESD_VBUS_local','DATA_VBUS',[(cap['x'],cap['y']),(esd['x'],esd['y'])],cap,esd)
capg=terminal('C_ESD',2);via=(-16.1,-.75);g=nets['GND']
j.append({'type':'pcb_via','pcb_via_id':'review_ESD_ground_via','x':via[0],'y':via[1],'outer_diameter':.45,'hole_diameter':.3,'layers':['top','inner1','inner2','bottom'],'from_layer':'top','to_layer':'bottom','source_net_id':g['source_net_id'],'subcircuit_connectivity_map_key':g['subcircuit_connectivity_map_key'],'subcircuit_id':'subcircuit_source_group_0'})
trace('review_ESD_ground_local','GND',[(capg['x'],capg['y']),via],capg)
out=R/'artifacts/v2/routing/review-fixes-candidate.circuit.json';out.write_text(json.dumps(j,indent=2)+'\n')
(out.parent/'review-fixes-seed.json').write_text(json.dumps({'baseline_revision':baseline_revision,'baseline_sha256':hashlib.sha256(baseline).hexdigest(),'source_sha256':hashlib.sha256((R/'artifacts/v2/source.circuit.json').read_bytes()).hexdigest(),'old_trace_or_via_records_removed':removed,'added_capacitor':'C_ESD, 100 nF/16 V C1525, 0402, top; 0.10 mm board-level placement courtyard','existing_thermal_via_process_exception_preserved':True,'stage':'Routing seed; not qualification'},indent=2)+'\n')
print('Review-fix seed written:',out)
