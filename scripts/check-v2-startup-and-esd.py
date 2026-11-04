"""Check hardware reset bias and the real local ESD bypass copper.

Threshold/current assumptions follow the manufacturer RP2040/A4988 tables in
the independent review. This is not a ramp, EMC or measured ESD qualification.
"""
import hashlib,itertools,json,math
from pathlib import Path
from shapely.geometry import Point,LineString,Polygon
from v2_route_io import g
parts={e['name']:e for e in g.j if e['type']=='source_component'}
def pad(ref,pin):
    return next(e for e in g.j if e['type']=='pcb_smtpad' and g.src[g.comp[e['pcb_component_id']]['source_component_id']]==ref and g.sp[g.ports[e['pcb_port_id']]['source_port_id']]['pin_number']==pin)
checks=[]
def check(name,ok,**data):checks.append({'check':name,'passed':bool(ok),**data})
pull=parts['R_ENABLE']['resistance'];samples=[]
for vdd,rpu,rpd,leak in itertools.product([3.135,3.465],[pull*.99,pull*1.01],[50000,80000],[-21e-6,21e-6]):
    voltage=(vdd/rpu-leak)/(1/rpu+1/rpd)
    samples.append(voltage-.7*vdd)
check('ENABLE hardware bias exceeds A4988 high threshold with RP2040 reset pull-down',min(samples)>0,minimum_high_margin_V=min(samples))
sleep=parts['R_SLEEP']['resistance'];low=21e-6*sleep*1.01
check('SLEEP remains low with MCU high impedance and input leakage',low<.3*3.135,maximum_leakage_voltage_V=low)
cap,ground,esd=pad('C_ESD',1),pad('C_ESD',2),pad('U_ESD',5)
check('100 nF bypass is fitted on top across the USB protection supply',math.isclose(parts['C_ESD']['capacitance'],100e-9) and cap['layer']=='top' and g.key(cap)==g.key(esd) and g.nets[g.key(ground)]=='GND' and parts['C_ESD']['manufacturer_part_number']=='CL05B104KO5NNNC')
court=next(e for e in g.j if e['type']=='pcb_courtyard_outline' and e['pcb_component_id']==cap['pcb_component_id'])
envelope=Polygon([(p['x'],p['y']) for p in court['outline']])
check('Dense placement courtyard retains 0.10 mm around both unchanged supplier lands',all(envelope.buffer(1e-8).covers(g.geometry(pad('C_ESD',pin)).buffer(.1)) for pin in [1,2]))
check('Bypass copper lands match the existing exact C1525 supplier import',all(all(math.isclose(pad('C_ESD',pin).get(field,0),pad('C_IO1',pin).get(field,0),abs_tol=1e-8) for field in ['width','height','ccw_rotation']) for pin in [1,2]))
feed=next(e for e in g.j if e.get('pcb_trace_id')=='review_ESD_VBUS_local')
segments=[(a,b) for a,b in zip(feed['route'],feed['route'][1:]) if a['route_type']==b['route_type']=='wire' and a['layer']==b['layer']=='top']
length=sum(math.hypot(a['x']-b['x'],a['y']-b['y']) for a,b in segments)
ends={p.get(k) for p in feed['route'] for k in ['start_pcb_port_id','end_pcb_port_id']}
check('Bypass has a direct top feed shorter than 2 mm to U_ESD VBUS',len(segments)==len(feed['route'])-1 and {cap['pcb_port_id'],esd['pcb_port_id']}<=ends and length<2,trace_length_mm=length)
via=next(e for e in g.j if e.get('pcb_via_id')=='review_ESD_ground_via')
return_feed=next(e for e in g.j if e.get('pcb_trace_id')=='review_ESD_ground_local')
line=LineString([(p['x'],p['y']) for p in return_feed['route']])
check('Bypass ground has a local plated return outside its pad',g.key(via)==g.key(ground) and line.distance(Point(via['x'],via['y']))<1e-8 and line.intersects(g.geometry(ground)) and line.length<1 and not g.geometry(ground).intersects(Point(via['x'],via['y']).buffer(via['hole_diameter']/2)),top_return_length_mm=line.length)
elements,roots=g.groups(g.key(ground));groups={e.get('pcb_port_id'):r for e,r in zip(elements,roots) if e.get('pcb_port_id')}
check('Bypass and ESD ground share a physical copper group',groups.get(ground['pcb_port_id']) is not None and groups.get(ground['pcb_port_id'])==groups.get(pad('U_ESD',2)['pcb_port_id']))
report={'passed':all(c['passed'] for c in checks),'source_sha256':hashlib.sha256(g.path.read_bytes()).hexdigest(),'checks':checks,'scope':'Static reset-bias and actual local bypass copper; dynamic power, ESD and thermal validation remain bench work','fabrication_ready':False}
(g.ROOT/'artifacts/v2/routing/startup-and-esd-verification.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2));raise SystemExit(not report['passed'])
