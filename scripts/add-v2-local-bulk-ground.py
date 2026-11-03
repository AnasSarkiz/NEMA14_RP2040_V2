"""Place two checked ground returns immediately beside the bulk negative pad.

No foreign copper is removed. The complete native/physical checks must follow.
"""
import hashlib,json,math
from shapely.geometry import Point,LineString
from v2_route_io import g

source=next(e for e in g.j if e['type']=='source_component' and e['name']=='C_BULK')
port=next(e for e in g.sp.values() if e['source_component_id']==source['source_component_id'] and e['pin_number']==2)
pcb_port=next(e for e in g.ports.values() if e['source_port_id']==port['source_port_id'])
key=port['subcircuit_connectivity_map_key'];net=next(e for e in g.j if e['type']=='source_net' and e['subcircuit_connectivity_map_key']==key)
assert g.nets[key]=='GND'
assert not any(e.get('pcb_via_id','').startswith('reviewed_local_bulk_ground_') for e in g.j), 'Local returns already placed'
foreign=[];lands=[];drills=[]
for e in g.j:
    t=e['type']
    if t in ['pcb_smtpad','pcb_plated_hole']:
        p=g.geometry(e)
        if t=='pcb_smtpad':lands.append(p)
        if g.key(e)!=key:foreign.append(p)
    elif t=='pcb_via':
        drills.append((e['x'],e['y'],e['hole_diameter']))
        if g.key(e)!=key:foreign.append(Point(e['x'],e['y']).buffer(e['outer_diameter']/2))
    elif t=='pcb_trace' and g.key(e)!=key:
        for a,b in zip(e['route'],e['route'][1:]):
            if a['route_type']==b['route_type']=='wire' and a['layer']==b['layer']:
                foreign.append(LineString([(a['x'],a['y']),(b['x'],b['y'])]).buffer(max(a['width'],b['width'])/2))
def clear(x,y):
    p=Point(x,y).buffer(.25)
    if abs(x)>16.74 or abs(y)>16.74:return False
    if any(p.distance(q)<.155 for q in foreign):return False
    if any(p.intersects(q.buffer(.01)) for q in lands):return False
    if any(math.hypot(x-u,y-v)-(.3+d)/2<.205 for u,v,d in drills):return False
    return True
before=hashlib.sha256(g.path.read_bytes()).hexdigest();chosen=[]
for sign in [1,-1]:
    candidates=[]
    for iy in range(34,73):
        for ix in range(-40,41):
            x=round(pcb_port['x']+ix*.025,6);y=round(pcb_port['y']+sign*iy*.025,6)
            distance=math.hypot(x-pcb_port['x'],y-pcb_port['y'])
            if distance<=2:candidates.append((distance,x,y))
    site=next(((x,y) for _,x,y in sorted(candidates) if clear(x,y)),None)
    assert site is not None, 'No clear local bulk ground site; repacking required'
    x,y=site;drills.append((x,y,.3));chosen.append(site)
    g.j.append({'type':'pcb_via','pcb_via_id':'reviewed_local_bulk_ground_'+str(len(chosen)),
                'x':x,'y':y,'outer_diameter':.5,'hole_diameter':.3,
                'layers':['top','inner1','inner2','bottom'],'from_layer':'top','to_layer':'bottom',
                'source_net_id':net['source_net_id'],'subcircuit_connectivity_map_key':key,
                'subcircuit_id':'subcircuit_source_group_0','tented_on_top':True,'tented_on_bottom':True})
g.path.write_text(json.dumps(g.j,indent=2)+'\n')
report={'before_sha256':before,'after_sha256':hashlib.sha256(g.path.read_bytes()).hexdigest(),
        'sites_mm':chosen,'negative_pad_mm':[pcb_port['x'],pcb_port['y']],
        'minimum_foreign_copper_clearance_mm':.155,'drill_mm':.3,'pad_mm':.5,
        'scope':'Deterministic placement screen; requires subsequent pours, full native DRC and physical connectivity checks'}
(g.path.parent/'local-bulk-ground-plan.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
