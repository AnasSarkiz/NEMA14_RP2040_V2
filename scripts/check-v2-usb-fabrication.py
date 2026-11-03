"""Verify the CNC-slot adaptation preserves both imported USB footprints."""
import hashlib,json,math,subprocess
from pathlib import Path
from shapely.geometry import LineString
from shapely.affinity import rotate
from v2_route_io import g
R=Path(__file__).resolve().parents[1];p=R/'artifacts/v2/source.circuit.json';after=json.loads(p.read_text())
before=json.loads(subprocess.check_output(['git','show','241d252:artifacts/v2/source.circuit.json'],cwd=R))
def footprint(records,name):
    sid=next(e['source_component_id'] for e in records if e['type']=='source_component' and e['name']==name)
    cid=next(e['pcb_component_id'] for e in records if e['type']=='pcb_component' and e['source_component_id']==sid)
    return {e[e['type']+'_id']:e for e in records if e['type'] in {'pcb_component','pcb_port','pcb_smtpad','pcb_plated_hole'} and e.get('pcb_component_id')==cid},[e for e in records if e['type']=='pcb_hole' and e.get('pcb_component_id')==cid]
def capsule(e):
    w,h=e['hole_width'],e['hole_height'];dx,dy=((w-h)/2,0) if w>=h else (0,(h-w)/2)
    return rotate(LineString([(e['x']-dx,e['y']-dy),(e['x']+dx,e['y']+dy)]).buffer(min(w,h)/2,quad_segs=64),e.get('ccw_rotation',0),origin=(e['x'],e['y']))
rows=[]
for name in ['J_PD','J_DATA']:
    old,oldholes=footprint(before,name);new,newholes=footprint(after,name);assert old==new, 'USB placement or solder lands changed'
    original=next(e for e in oldholes if e['hole_shape']!='circle');adapted=next(e for e in newholes if e['hole_shape']!='circle')
    strip=lambda e:{k:v for k,v in e.items() if k not in {'hole_width','hole_height'}}
    assert strip(original)==strip(adapted)
    assert [e for e in oldholes if e['hole_shape']=='circle']==[e for e in newholes if e['hole_shape']=='circle']
    assert math.isclose(original['hole_width']-original['hole_height'],adapted['hole_width']-adapted['hole_height'],abs_tol=1e-10)
    assert min(adapted['hole_width'],adapted['hole_height'])>=1
    envelope=capsule(adapted);assert capsule(original).difference(envelope).area<1e-10
    gap=min(envelope.distance(g.geometry(e)) for e in after if e['type'] in {'pcb_smtpad','pcb_plated_hole'})
    assert gap>=.35
    rows.append({'connector':name,'supplier_slot_mm':[original['hole_width'],original['hole_height']],
                 'board_clearance_slot_mm':[adapted['hole_width'],adapted['hole_height']],
                 'additional_radial_clearance_mm':(adapted['hole_height']-original['hole_height'])/2,
                 'supplier_capsule_contained':True,'unchanged_tool_centerline_and_rotation':True,
                 'minimum_clearance_to_fixed_solder_land_mm':gap,'all_solder_lands_and_placement_preserved':True})
report={'passed':True,'source_sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'nominal_import_baseline':'241d252',
        'fabricator_capability_url':'https://jlcpcb.com/capabilities/pcb-capabilities/','capability_checked_date':'2026-11-03',
        'minimum_NPTH_CNC_slot_width_mm':1,'connectors':rows,
        'scope':'Board clearance adaptation only; imported footprint, connector pose, 8 mm peg spacing, round locator and eight soldered shell stakes retained. Final CAM and supplier acceptance remain separate.'}
(R/'artifacts/v2/usb-fabrication-adaptation.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
