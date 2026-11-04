"""Bind the saved V2 preview only to current, passing verification receipts."""
import datetime,hashlib,json
from pathlib import Path
R=Path(__file__).resolve().parents[1];D=R/'artifacts/v2/routing'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
digest=sha(D/'freerouted.circuit.json');source=sha(R/'artifacts/v2/source.circuit.json')
checks={}
for name in ['physical-routing-audit.json','native-drc.json','functional-routing-audit.json',
             'phase-current-screen.json','startup-and-esd-verification.json','review-fixes-preservation.json','analysis-verification.json','local-power-verification.json','component-body-verification.json',
             'critical-silkscreen-verification.json','branding-verification.json']:
    p=D/name;r=json.loads(p.read_text());assert r['source_sha256']==digest and r['passed'],name
    checks[name]={'passed':True,'sha256':sha(p),'source_sha256':digest}
physical=json.loads((D/'physical-routing-audit.json').read_text())
native=json.loads((D/'native-drc.json').read_text())
assert physical['nets_checked']==70 and not physical['disconnected_nets'] and not physical['floating_copper_islands']
assert not native['errors'] and not native['warnings']
for name in ['source-review.json','placement-verification.json','usb-fabrication-adaptation.json']:
    p=R/'artifacts/v2'/name;r=json.loads(p.read_text());assert r.get('source_sha256',r.get('sha256'))==source,name
    assert r['failed']==0 if name=='source-review.json' else r['passed']
    checks[name]={'passed':True,'sha256':sha(p),'source_sha256':source}
schema=json.loads((D/'schema-verification.json').read_text());assert schema['passed'] and schema['source_sha256']==digest
drills=json.loads((D/'usb-slot-export-check.json').read_text())
assert drills['source_sha256']==digest and drills['usb_slot_count']==2
assert all(o['slot_axis_matches_connector'] for o in drills['orientations'])
for name in ['schema-verification.json','usb-slot-export-check.json']:
    checks[name]={'passed':True,'sha256':sha(D/name),'source_sha256':digest}
gerber=json.loads((D/'gerber-shorts-verification.json').read_text());assert gerber['passed'] and gerber['source_sha256']==digest
version=json.loads((R/'package.json').read_text())['version']
m={'passed':True,'version':version,'stage':'V2 large bottom knockout port legends; completed routing, supplier acceptance remains separate',
   'verified_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),
   'placement_source_sha256':source,'routed_source_sha256':digest,
   'nets_checked':70,'connected_net_groups':70,'shorts':0,'native_errors':0,'native_warnings':0,
   'floating_copper_islands':0,'physical_pin_nets_preserved':physical['physical_pin_nets_checked'],
   'checks':checks,'gerber_shorts':gerber,'fabrication_ready':False,
   'remaining':['JLCPCB actual quote, stock, pickup and soldering/via/stencil process acceptance',
                'Factory motor wire gauge/retention and real rear assembly verification',
                'V2 firmware and first-board electrical/thermal/current-calibration checks']}
(D/'verification.json').write_text(json.dumps(m,indent=2)+'\n')
print('Qualified current V2 routing',digest,flush=True)
