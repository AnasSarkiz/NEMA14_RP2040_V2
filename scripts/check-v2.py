"""Audit generated V2 electrical topology and connector drills independently.

Passing these checks establishes a source draft, never a fabrication release.
Placement errors and missing routed copper are explicitly retained in the receipt.
"""
import hashlib, json, math, sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
path=ROOT/'artifacts/v2/source.circuit.json'
data=json.loads(path.read_text())
cs={e['source_component_id']:e for e in data if e['type']=='source_component'}
byname={e['name']:e for e in cs.values()}
ports={e['source_port_id']:e for e in data if e['type']=='source_port'}
nets={e['source_net_id']:e['name'] for e in data if e['type']=='source_net'}
connections={}
for e in data:
    if e['type']!='source_trace':continue
    ns=[nets[n] for n in e.get('connected_source_net_ids',[]) if n in nets]
    if len(set(ns))>1:raise AssertionError('Source trace shorts named nets: '+str(ns))
    if not ns:continue
    for pid in e.get('connected_source_port_ids',[]):
        p=ports[pid];key=(cs[p['source_component_id']]['name'],p['name'])
        previous=connections.setdefault(key,ns[0])
        assert previous==ns[0],(key,previous,ns)
checks=[]
def check(title, condition):
    checks.append({'check':title,'pass':bool(condition)})
def on(name,pin,net):
    if (name,pin) in connections:return connections[(name,pin)]==net
    # Supplier symbols may retain pin1/pin2/pin3 as canonical names. Resolve
    # semantic aliases to one physical port, then inspect its actual net.
    matches=[p for p in ports.values() if cs[p['source_component_id']]['name']==name and pin in p.get('port_hints',[])]
    return len(matches)==1 and connections.get((name,matches[0]['name']))==net

def mosfet_pin_map(name):
    return {p['pin_number']:next((a for a in p.get('port_hints',[]) if a in ['G','D','S']),None) for p in ports.values() if cs[p['source_component_id']]['name']==name}

board=next(e for e in data if e['type']=='pcb_board')
check('34.5 x 34.5 mm, four-layer, 1.6 mm board',board['width']==34.5 and board['height']==34.5 and board['num_layers']==4 and board['thickness']==1.6)
mounts=[e for e in data if e['type']=='pcb_hole' and not e.get('pcb_component_id')]
check('Original 26 mm motor hole pitch, four 3.2 mm holes',len(mounts)==4 and {(round(e['x'],6),round(e['y'],6),e.get('hole_diameter')) for e in mounts}=={(x,y,3.2) for x in [-13,13] for y in [-13,13]})
check('Current channels reach distinct ADC0/ADC1 pins',on('U_MCU','GPIO26','I_A_ADC') and on('U_MCU','GPIO27','I_B_ADC'))
check('Temperature bus moved to spare GPIO4/5',on('U_MCU','GPIO4','TEMP_SDA') and on('U_MCU','GPIO5','TEMP_SCL'))
check('Voltage ADC and POWER_GOOD preserved',on('U_MCU','GPIO28','VM_SENSE') and on('U_MCU','GPIO10','PD_GOOD') and on('U_MCU','GPIO29','DATA_PRESENT'))
check('Driver reset-bias resistors use strong 10 kOhm defaults',math.isclose(byname['R_ENABLE']['resistance'],10000) and math.isclose(byname['R_SLEEP']['resistance'],10000) and on('R_ENABLE','pin1','V3V3') and on('R_ENABLE','pin2','ENABLE_N') and on('R_SLEEP','pin1','SLEEP') and on('R_SLEEP','pin2','GND'))
check('USB protection has its own fitted DATA_VBUS bypass',math.isclose(byname['C_ESD']['capacitance'],100e-9) and byname['C_ESD']['max_voltage_rating']>=10 and on('C_ESD','pin1','DATA_VBUS') and on('C_ESD','pin2','GND'))
for phase,sense,out in [('A','SENSE1','OUT1A'),('B','SENSE2','OUT2A')]:
    amp='U_I'+phase;shunt='R_SHUNT_'+phase
    physical={p['pin_number']:p['name'] for p in ports.values() if p['source_component_id']==byname[amp]['source_component_id']}
    check(phase+' TSSOP INA240 identity and physical pinout',byname[amp]['manufacturer_part_number']=='INA240A1PWR' and physical=={1:'NC',2:'IN_POS',3:'IN_NEG',4:'GND',5:'VS',6:'REF2',7:'REF1',8:'OUT'})
    check(phase+' inline shunt is separate from regulation shunt',on('U_DRV',out,phase+'_DRV_PLUS') and on(shunt,'pin1',phase+'_DRV_PLUS') and on(shunt,'pin2',phase+'_PLUS') and math.isclose(byname[shunt]['resistance'],.05))
    check(phase+' current amplifier supply, polarity and midpoint',on(amp,'VS','V3V3') and on(amp,'GND','GND') and on(amp,'REF1','V3V3') and on(amp,'REF2','GND') and on(amp,'IN_POS',phase+'_DRV_PLUS') and on(amp,'IN_NEG',phase+'_PLUS'))
    check(phase+' output RC feeds ADC',on(amp,'OUT','I_'+phase+'_RAW') and on('R_I'+phase,'pin1','I_'+phase+'_RAW') and on('R_I'+phase,'pin2','I_'+phase+'_ADC') and on('C_IADC_'+phase,'pin1','I_'+phase+'_ADC') and on('C_IADC_'+phase,'pin2','GND'))
    r='R_S'+phase
    check(phase+' 0.24 ohm A4988 regulation resistor retained',on('U_DRV',sense,sense) and on(r,'pin1',sense) and on(r,'pin2','GND') and math.isclose(byname[r]['resistance'],.24))
motor_ports={p['pin_number']:p['name'] for p in ports.values() if cs[p['source_component_id']]['name']=='J_MOTOR'}
check('Four-pole WAGO 250-204 identity and physical pole numbering',byname['J_MOTOR']['manufacturer_part_number']=='250-204' and motor_ports=={1:'A_PLUS',2:'A_MINUS',3:'B_PLUS',4:'B_MINUS'})
check('WAGO motor poles retain both winding polarities after inline shunts',all(on('J_MOTOR',phase+'_'+polarity,phase+'_'+polarity) for phase in ['A','B'] for polarity in ['PLUS','MINUS']))
check('Compact magnetic buzzer retains the 3.3 V MOSFET/flyback circuit',byname['BZ1']['manufacturer_part_number']=='MLT-5020' and on('BZ1','_POS','V3V3') and on('BZ1','_NEG','BUZZER_SINK') and on('Q_BUZZER','D','BUZZER_SINK') and on('D_BUZZER','anode','BUZZER_SINK') and on('D_BUZZER','cathode','V3V3'))
fet_ports=mosfet_pin_map('Q_BUZZER')
check('Compact buzzer MOSFET identity, physical pinout and grounded source',byname['Q_BUZZER']['manufacturer_part_number']=='DMN2300UFB4-7B' and fet_ports=={1:'G',2:'D',3:'S'} and on('Q_BUZZER','G','BUZZER_GATE') and on('Q_BUZZER','D','BUZZER_SINK') and on('Q_BUZZER','S','GND'))
for color in 'RGB':
    name='Q_STATUS_'+color;pd='R_STATUS_PD_'+color
    physical=mosfet_pin_map(name)
    check(color+' compact RGB MOSFET, current limiter and reset pull-down',byname[name]['manufacturer_part_number']=='DMN2300UFB4-7B' and physical=={1:'G',2:'D',3:'S'} and on(name,'G','LED_'+color) and on(name,'S','GND') and on(name,'D','STATUS_'+color+'_C') and on('R_STATUS_'+color,'pin1','STATUS_'+color+'_K') and on('R_STATUS_'+color,'pin2','STATUS_'+color+'_C') and math.isclose(byname['R_STATUS_'+color]['resistance'],1000) and on(pd,'pin1','LED_'+color) and on(pd,'pin2','GND') and math.isclose(byname[pd]['resistance'],10000))
check('Compact flyback diode retains cathode-to-3.3 V polarity',byname['D_BUZZER']['manufacturer_part_number']=='B5819WS' and on('D_BUZZER','cathode','V3V3') and on('D_BUZZER','anode','BUZZER_SINK'))
pcs={e['pcb_component_id']:cs[e['source_component_id']]['name'] for e in data if e['type']=='pcb_component'}
fitted=[e for e in data if e['type']=='pcb_component' and not e.get('do_not_place') and cs[e['source_component_id']]['ftype']!='simple_test_point']
check('All fitted components remain on the top assembly side',all(e['layer']=='top' for e in fitted))
pcb_byname={pcs[e['pcb_component_id']]:e for e in data if e['type']=='pcb_component'}
check('Encoder supply capacitors are fitted on top',all(pcb_byname[n]['layer']=='top' and not pcb_byname[n].get('do_not_place') for n in ['C_ENCODER','C_ENCODER_BULK']))
check('Encoder bypass values and 3.3 V connections preserved',all(math.isclose(byname[n]['capacitance'],value) and on(n,'pin1','V3V3') and on(n,'pin2','GND') for n,value in [('C_ENCODER',100e-9),('C_ENCODER_BULK',1e-6)]))
check('Optional encoder IC remains bottom and DNP',pcb_byname['U_ENCODER']['layer']=='bottom' and pcb_byname['U_ENCODER'].get('do_not_place'))

for connector in ['J_PD','J_DATA']:
    holes=[e for e in data if e['type']=='pcb_hole' and pcs.get(e.get('pcb_component_id'))==connector]
    round_holes=[e for e in holes if e['hole_shape']=='circle']
    slots=[e for e in holes if e['hole_shape'] in ['pill','rotated_pill']]
    # Retain the supplier centers and slot axis; widen only the board clearance
    # capsule to the fabricator's 1.0 mm non-plated CNC-slot minimum.
    check(connector+' retains both locating centers with a 1.0 mm fabrication slot',len(round_holes)==1 and len(slots)==1 and math.isclose(round_holes[0]['hole_diameter'],.7099808,abs_tol=1e-6) and math.isclose(max(slots[0]['hole_width'],slots[0]['hole_height']),1.7999984,abs_tol=3e-5) and math.isclose(min(slots[0]['hole_width'],slots[0]['hole_height']),1,abs_tol=1e-6) and math.isclose(math.hypot(slots[0]['x']-round_holes[0]['x'],slots[0]['y']-round_holes[0]['y']),8,abs_tol=5e-5))
    tabs=[e for e in data if e['type']=='pcb_plated_hole' and pcs.get(e.get('pcb_component_id'))==connector]
    check(connector+' retains all four soldered shell tabs',len(tabs)==4)
check('RGB, buzzer, temperature, flash and crystal retained',all(n in byname for n in ['D_STATUS','BZ1','U_TEMP','U_FLASH','Y_MCU']))
check('Schematic includes every component',len([e for e in data if e['type']=='schematic_component'])==len(cs))
errors=[e for e in data if e['type'].endswith('_error')]
receipt={'stage':'source and placement engineering checks; routing reviewed separately','fabrication_ready':False,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),
         'checks':checks,'passed':sum(e['pass'] for e in checks),'failed':sum(not e['pass'] for e in checks),
         'native_error_count':len(errors),'native_errors':errors,'routed_trace_count':sum(e['type']=='pcb_trace' for e in data),
         'remaining':['USB reference and thermal/power integrity engineering review','Exact motor lead gauge, wire/tool access and terminal procurement confirmation','Current calibration, ADC sampling and motor-switching bench checks']}
(ROOT/'artifacts/v2/source-review.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps({k:v for k,v in receipt.items() if k not in ['native_errors','checks']},indent=2))
for e in checks:
    if not e['pass']:print('FAIL:',e['check'])
if receipt['failed']:raise SystemExit(1)
if '--require-release' in sys.argv:
    print('BLOCKED: V2 manufacturing release requires USB reference, thermal/power, sourcing, wire-fit and hardware qualification; routing evidence is separate.')
    raise SystemExit(1)
