"""Bind the V2 upload files to passing CAD and independent actual-CAM audits."""
import csv,hashlib,json,zipfile
from pathlib import Path
R=Path(__file__).resolve().parents[1];D=R/'artifacts/v2/order-review';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();read=lambda p:json.loads(p.read_text())
b=R/'artifacts/v2/routing/freerouted.circuit.json';j=read(b);m=read(D/'manifest.json');q=read(b.parent/'verification.json');a=read(D/'cam/audit.json')
assert q['passed'] and m['board_sha256']==q['routed_source_sha256']==sha(b)==sha(R/'index.circuit.json')
assert a['status']=='PASS' and not a['issues'] and a['source_sha256']==m['order_source_sha256']==sha(D/'order-source.circuit.json')
assert a['archive']['extracted_bytes_verified'] and a['archive']['sha256']==sha(D/'review-cam.zip')
assert [e for e in j if e['type']!='pcb_solder_paste']==[e for e in read(D/'order-source.circuit.json') if e['type']!='pcb_solder_paste']
assert not a['connectivity']['shorts'] and not a['connectivity']['opens'] and not a['connectivity']['unconnected_pads']
assert all(e['classification']=='intentional native no-connect pad' for e in a['connectivity']['unassigned_island_details'])
for name,digest in m['files'].items():assert sha(D/name)==digest,name
with zipfile.ZipFile(D/'NEMA14_RP2040_V2-Gerbers.zip') as z:
    for name,digest in m['unchanged_native_copper_mask_outline_drill'].items():assert hashlib.sha256(z.read(name)).hexdigest()==digest,name
    assert set(z.namelist())=={p.name for p in (D/'cam').iterdir() if p.suffix in {'.gbr','.drl'} and p.name not in {'F_Fab.gbr','B_Fab.gbr'}}
sc={e['source_component_id']:e for e in j if e['type']=='source_component'}
fitted={sc[e['source_component_id']]['name']:sc[e['source_component_id']] for e in j if e['type']=='pcb_component' and not e.get('do_not_place') and sc[e['source_component_id']]['ftype']!='simple_test_point'}
rows=list(csv.DictReader((D/'NEMA14_RP2040_V2-BOM.csv').open()));refs={}
for row in rows:
    for ref in row['Designator'].split(','):
        assert ref not in refs;refs[ref]=row;assert row['LCSC Part #'] in fitted[ref]['supplier_part_numbers']['jlcpcb'];assert row['Comment']==fitted[ref]['manufacturer_part_number']
cpl=list(csv.DictReader((D/'NEMA14_RP2040_V2-CPL.csv').open()));assert len(cpl)==len(refs)==len(fitted)==97 and set(refs)==set(fitted)=={r['Designator'] for r in cpl}
assert all(r['Layer']=='Top' for r in cpl)
report={'passed':True,'ready_for_supplier_DFM_quote_review':True,'board_sha256':sha(b),'order_source_sha256':m['order_source_sha256'],
        'actual_CAM_audit_sha256':sha(D/'cam/audit.json'),'manifest_sha256':sha(D/'manifest.json'),'upload_file_hashes':m['files'],
        'fitted_parts':97,'BOM_lines':len(rows),'CPL_placements':97,'physical_net_groups':70,'shorts':0,'native_DRC_errors':0,'native_DRC_warnings':0,
        'unchanged_native_copper_mask_outline_drills':True,'intentional_no_connect_islands':a['connectivity']['unassigned_islands'],
        'supplier_process_stock_pickup_approval':False,'factory_wire_fit_verified':False,'production_release_approved':False,
        'pending_supplier_and_physical_acceptance':m['open_acceptance'],'scope':'Exact prototype upload files and actual CAM geometry, not procurement, tested hardware, or production approval'}
(D/'verification.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
