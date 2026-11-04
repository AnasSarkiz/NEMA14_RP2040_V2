"""Produce an identity-bound V2 prototype/DFM handoff, never historical V1 CAM.

The output is for supplier review. Procurement, pickup convention and process
acceptance remain explicit supplier decisions; bench qualification follows the
prototype build. A clean CAD check is not a claim of tested hardware.
"""
import csv, hashlib, importlib.util, json, math, os, subprocess, zipfile
from pathlib import Path
from collections import defaultdict
from shapely.geometry import Polygon, LineString, Point, box, shape as geometry_from_mapping
from shapely.affinity import scale, rotate
from shapely.ops import unary_union

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'artifacts/v2/order-review'
BOARD = ROOT / 'artifacts/v2/routing/freerouted.circuit.json'
sha = lambda b: hashlib.sha256(b).hexdigest()

def csv_file(path, fields, rows):
    with path.open('w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader(); writer.writerows(rows)

def gerber_regions(path, geometry, preserve_enclosed_islands=False):
    lines = ['G04 NEMA14 RP2040 V2 prototype DFM handoff; see manifest.json*',
             '%FSLAX46Y46*%', '%MOMM*%', '%ADD10C,0.010000*%', 'D10*']
    pieces = [geometry] if geometry.geom_type == 'Polygon' else list(geometry.geoms)
    # Print containing regions before any islands inside their clear holes.
    # This preserves the enclosed counters in knockout P/R/D/A lettering.
    if preserve_enclosed_islands:
        pieces = sorted(pieces,key=lambda p:Polygon(p.exterior).area,reverse=True)
    for polygon in pieces:
        if polygon.is_empty or polygon.area < 1e-10: continue
        assert polygon.geom_type == 'Polygon'
        for ring, polarity in [(polygon.exterior, 'D')] + [(r, 'C') for r in polygon.interiors]:
            lines.extend(['%LP' + polarity + '*%', 'G36*'])
            for i, (x, y) in enumerate(ring.coords):
                lines.append(f'X{round(x*1e6)}Y{round(y*1e6)}D{2 if i==0 else 1:02}*')
            lines.append('G37*')
    lines.extend(['%LPD*%', 'M02*']); path.write_text('\n'.join(lines)+'\n')

def main():
    frozen = BOARD.read_bytes(); digest = sha(frozen); j = json.loads(frozen)
    qualification=json.loads((BOARD.parent/'verification.json').read_text())
    assert qualification['passed'] and qualification['routed_source_sha256']==digest, 'Qualify this exact board before exporting'
    assert qualification['placement_source_sha256']==sha((ROOT/'artifacts/v2/source.circuit.json').read_bytes())
    assert qualification['gerber_shorts']['passed'] and qualification['gerber_shorts']['source_sha256']==digest
    checks = {}
    for name in ['physical-routing-audit.json','native-drc.json','functional-routing-audit.json',
                 'phase-current-screen.json','startup-and-esd-verification.json','review-fixes-preservation.json','analysis-verification.json','local-power-verification.json','component-body-verification.json',
                 'critical-silkscreen-verification.json','branding-verification.json']:
        p = ROOT/'artifacts/v2/routing'/name; report=json.loads(p.read_text())
        assert report['passed'] and report['source_sha256']==digest, 'Stale/failing check: '+name
        checks[name] = sha(p.read_bytes())
    physical=json.loads((ROOT/'artifacts/v2/routing/physical-routing-audit.json').read_text())
    assert not physical['disconnected_nets'] and not physical['floating_copper_islands']
    native=json.loads((ROOT/'artifacts/v2/routing/native-drc.json').read_text())
    assert not native['errors'] and not native['warnings']
    assert (ROOT/'index.circuit.json').read_bytes()==frozen, 'Preview differs from order board'
    OUT.mkdir(exist_ok=True); cam=OUT/'cam';cam.mkdir(exist_ok=True)
    env=dict(os.environ);env['PATH']=str(ROOT/'node_modules/.bin')+':'+env['PATH'];env['XDG_CONFIG_HOME']='/workspace/.config'
    upstream=OUT/'upstream-native-gerbers.zip'
    subprocess.run(['tsci','export',str(BOARD),'-f','gerbers','-o',str(upstream)],cwd=ROOT,env=env,check=True)
    with zipfile.ZipFile(upstream) as z:
        members={Path(n).name:z.read(n) for n in z.namelist() if not n.endswith('/')}
    for p in cam.iterdir():
        if p.is_file():p.unlink()
    for name,b in members.items():
        if name.endswith(('.gbr','.drl')):(cam/name).write_bytes(b)
    spec=importlib.util.spec_from_file_location('v2_cam_geometry',ROOT/'scripts/audit-manufacturing.py')
    audit=importlib.util.module_from_spec(spec);spec.loader.exec_module(audit)
    sources={e['source_component_id']:e for e in j if e['type']=='source_component'}
    components={e['pcb_component_id']:e for e in j if e['type']=='pcb_component'}
    ports={e['pcb_port_id']:e for e in j if e['type']=='pcb_port'}
    source_ports={e['source_port_id']:e for e in j if e['type']=='source_port'}
    fitted={i:c for i,c in components.items() if not c.get('do_not_place') and sources[c['source_component_id']]['ftype']!='simple_test_point'}
    assert len(fitted)==98 and all(c['layer']=='top' for c in fitted.values())
    # Screen every actual aperture at 100 um. Supplier must approve this stencil
    # and the filled/capped exposed-pad vias listed separately below.
    thickness=.10; paste=[]; aperture_checks=[]; paste_records=[]
    for e in j:
        if e['type']!='pcb_smtpad' or e['pcb_component_id'] not in fitted:continue
        ref=sources[components[e['pcb_component_id']]['source_component_id']]['name']
        copper=audit.shape(e); windows=[]
        if ref in {'U_MCU','U_PD','U_DRV'} and e.get('width',0)>2 and e.get('height',0)>2:
            w,h=e['width'],e['height'];aw=w*math.sqrt(.6)/2;ah=h*math.sqrt(.6)/2
            for dx in [-1,1]:
                for dy in [-1,1]:
                    x,y=e['x']+dx*w/4,e['y']+dy*h/4
                    windows.append(rotate(box(x-aw/2,y-ah/2,x+aw/2,y+ah/2),e.get('ccw_rotation',0),origin=(e['x'],e['y'])))
        else:
            factor=.70
            while factor<=1.00001:
                window=scale(copper,xfact=factor,yfact=factor,origin='centroid')
                rectangle=list(window.minimum_rotated_rectangle.exterior.coords)
                minimum=min(math.dist(a,b) for a,b in zip(rectangle,rectangle[1:]))
                if minimum>=.15 and window.area/(window.length*thickness)>=.66:break
                factor+=.025
            assert factor<=1.00001, 'Stencil release screen failed: '+ref
            windows=[window]
        for window in windows:
            ratio=window.area/(window.length*thickness)
            assert ratio>=.66 and copper.buffer(.00001).covers(window)
            paste.append(window);aperture_checks.append({'reference':ref,'pad':e['pcb_smtpad_id'],'area_ratio':ratio,'area_mm2':window.area})
            paste_records.append({'type':'pcb_solder_paste','pcb_solder_paste_id':'v2_order_paste_'+str(len(paste_records)),
                                  'pcb_component_id':e['pcb_component_id'],'pcb_smtpad_id':e['pcb_smtpad_id'],
                                  'shape':'polygon','layer':e['layer'],
                                  'points':[{'x':x,'y':y} for x,y in window.exterior.coords]})
    gerber_regions(cam/'F_Paste.gbr',unary_union(paste))
    gerber_regions(cam/'B_Paste.gbr',Polygon())
    # Native critical legends and wordmark have already passed ink clearance.
    # Clip only obstructing footprint outline ink, preserving all protected ink.
    protected=[]
    ink=json.loads(Path('/tmp/nema14-critical-ink.json').read_text())
    assert ink['source_sha256']==digest
    for label in ink['labels']:
        protected.append(geometry_from_mapping(label['geometry']))
    branding=json.loads((ROOT/'src/bottom-markings.json').read_text())
    protected.extend(unary_union([LineString(r).buffer(g['stroke_width_mm']/2) for r in g['routes']]) for g in branding['groups'])
    # Covered via barrels are intentionally tented and may carry underside ink.
    # Exposed plated lands are already excluded by the mask-opening guard.
    # Only actual NPTH openings need this additional mechanical drill guard.
    holes=audit.drill(cam/'drill_npth.drl')[0]
    silk_checks=[]
    for prefix in ['F','B']:
        original=audit.gerber(cam/f'{prefix}_SilkScreen.gbr')[0];mask=audit.gerber(cam/f'{prefix}_Mask.gbr')[0]
        safe=box(-17,-17,17,17).difference(mask.buffer(.15)).difference(holes.buffer(.10))
        clipped=original.intersection(safe)
        if prefix=='B':
            for p in protected:
                assert p.difference(clipped.buffer(.003)).area<.001, 'Protected bottom legend would be clipped'
            for label in ink['labels']:
                if not label.get('is_knockout'):continue
                wanted=geometry_from_mapping(label['geometry'])
                clear_letters=box(*wanted.bounds).difference(wanted).buffer(-.01)
                assert clear_letters.intersection(clipped).area<.002, 'Knockout lettering would be filled'
        gerber_regions(cam/f'{prefix}_SilkScreen.gbr',clipped,preserve_enclosed_islands=prefix=='B')
        silk_checks.append({'layer':prefix,'original_area_mm2':original.area,'clipped_area_mm2':clipped.area})
    original_bom={q['Designator']:q for q in csv.DictReader(members['bom.csv'].decode().splitlines())}
    bom=[];cpl=[];orientations=[];joints=[]; detailed_bom=[]; numeric_cpl=[]
    for cid,c in fitted.items():
        s=sources[c['source_component_id']];ref=s['name'];ids=s['supplier_part_numbers']['jlcpcb'];assert len(ids)==1
        bom.append({'Comment':s['manufacturer_part_number'],'Designator':ref,'Footprint':original_bom[ref]['Footprint'],'LCSC Part #':ids[0]})
        detailed_bom.append({'Designator':ref,'Comment':s['manufacturer_part_number'],
                             'Value':s.get('display_resistance',s.get('display_capacitance',s['manufacturer_part_number'])),
                             'Footprint':original_bom[ref]['Footprint'],'JLCPCB Part #':ids[0],
                             'Manufacturer Part Number':s['manufacturer_part_number']})
        cpl.append({'Designator':ref,'Mid X':f"{c['center']['x']:.6f}",'Mid Y':f"{c['center']['y']:.6f}",'Layer':'Top','Rotation':c['rotation']})
        numeric_cpl.append({'Designator':ref,'Mid X':c['center']['x'],'Mid Y':c['center']['y'],'Layer':'top','Rotation':c['rotation']})
        pads=[]
        for p in j:
            if p['type'] not in {'pcb_smtpad','pcb_plated_hole'} or p.get('pcb_component_id')!=cid:continue
            pin=source_ports[ports[p['pcb_port_id']]['source_port_id']]
            pads.append({'pin':pin['pin_number'],'name':pin['name'],'x_mm':p['x'],'y_mm':p['y']})
            if p['type']=='pcb_plated_hole':joints.append({'Designator':ref,'Pin':pin['pin_number'],'X mm':p['x'],'Y mm':p['y'],'Process':'Top secondary soldering of USB shell tab' if ref.startswith('J_') and ref!='J_MOTOR' else 'WAGO through-hole soldering; quote separately'})
        orientations.append({'reference':ref,'MPN':s['manufacturer_part_number'],'part':ids[0],'center':c['center'],'rotation_deg':c['rotation'],'physical_pads':pads,'supplier_pickup_approved':False})
    grouped=defaultdict(list)
    for row in bom:grouped[(row['Comment'],row['Footprint'],row['LCSC Part #'])].append(row['Designator'])
    csv_file(OUT/'NEMA14_RP2040_V2-BOM.csv',list(bom[0]),[{'Comment':k[0],'Designator':','.join(v),'Footprint':k[1],'LCSC Part #':k[2]} for k,v in grouped.items()])
    csv_file(OUT/'NEMA14_RP2040_V2-CPL.csv',list(cpl[0]),cpl)
    csv_file(OUT/'Through-Hole-Joints.csv',list(joints[0]),joints)
    csv_file(cam/'bom.csv',list(detailed_bom[0]),detailed_bom)
    csv_file(cam/'pick_and_place.csv',list(numeric_cpl[0]),numeric_cpl)
    (OUT/'placement-orientation-review.json').write_text(json.dumps(orientations,indent=2)+'\n')
    thermal=[]
    for e in j:
        if e['type']=='pcb_via' and e['pcb_via_id'].startswith('v2_thermal_'):
            thermal.append({'Via':e['pcb_via_id'],'X mm':e['x'],'Y mm':e['y'],'Drill mm':e['hole_diameter'],'Required process':'Fill, copper cap and planarize exposed-pad via; supplier approval required'})
    assert len(thermal)==3
    csv_file(OUT/'Thermal-Via-Process.csv',list(thermal[0]),thermal)
    unchanged={n:sha(b) for n,b in members.items() if n.endswith(('.drl','_Cu.gbr','_Mask.gbr')) or n=='Edge_Cuts.gbr'}
    assert all((cam/n).read_bytes()==members[n] for n in unchanged)
    order_source=[e for e in j if e['type']!='pcb_solder_paste']+paste_records
    assert [e for e in order_source if e['type']!='pcb_solder_paste']==[e for e in j if e['type']!='pcb_solder_paste']
    source_path=OUT/'order-source.circuit.json';source_path.write_text(json.dumps(order_source,indent=2)+'\n')
    archive=OUT/'NEMA14_RP2040_V2-Gerbers.zip'
    with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
        for p in sorted(cam.iterdir()):
            if p.suffix in {'.gbr','.drl'} and p.name not in {'F_Fab.gbr','B_Fab.gbr'}:z.write(p,p.name)
    with zipfile.ZipFile(OUT/'review-cam.zip','w',zipfile.ZIP_DEFLATED) as z:
        for p in sorted(cam.iterdir()):
            if p.suffix in {'.gbr','.drl','.csv'}:z.write(p,p.name)
    assert BOARD.read_bytes()==frozen
    manifest={'board_sha256':digest,'version':json.loads((ROOT/'package.json').read_text())['version'],'stage':'V2 prototype supplier DFM/quote handoff',
              'fabrication_ready':False,'supplier_process_stock_pickup_approval':False,'checks':checks,
              'fitted_components':len(fitted),'unique_BOM_lines':len(grouped),'bare_probe_pads_excluded':7,'optional_encoder_excluded':True,
              'order_source_sha256':sha(source_path.read_bytes()),
              'stencil_thickness_mm':thickness,'minimum_aperture_area_ratio':min(q['area_ratio'] for q in aperture_checks),
              'aperture_checks':aperture_checks,'silkscreen':silk_checks,'unchanged_native_copper_mask_outline_drill':unchanged,
              'files':{p.name:sha(p.read_bytes()) for p in OUT.iterdir() if p.is_file() and p.name in {'NEMA14_RP2040_V2-Gerbers.zip','NEMA14_RP2040_V2-BOM.csv','NEMA14_RP2040_V2-CPL.csv','Thermal-Via-Process.csv','Through-Hole-Joints.csv'}},
              'open_acceptance':['JLCPCB live stock/quote and exact pickup rotation approval','WAGO wire gauge/retention and process acceptance','Exposed-pad filled/capped-via and 100 um stencil process acceptance','Physical rear mounting and first-board firmware/bench validation']}
    (OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
    print(json.dumps({k:v for k,v in manifest.items() if k not in {'aperture_checks','checks','files','unchanged_native_copper_mask_outline_drill'}},indent=2))

if __name__=='__main__':main()
