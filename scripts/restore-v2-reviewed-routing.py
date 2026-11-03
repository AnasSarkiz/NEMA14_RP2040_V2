"""Load verified saved copper only for the exact unchanged V2 source."""
from pathlib import Path
import hashlib,json,sys

root=Path(__file__).resolve().parents[1]
directory=root/'artifacts/v2/routing'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
try:
    manifest=json.loads((directory/'verification.json').read_text())
    candidate=directory/'freerouted.circuit.json'
    assert sha(root/'artifacts/v2/source.circuit.json')==manifest['placement_source_sha256'],'Source changed; saved copper needs requalification'
    digest=sha(candidate)
    assert digest==manifest['routed_source_sha256'],'Saved copper changed; run the full qualification checks'
    for name in ['physical-routing-audit.json','native-drc.json','functional-routing-audit.json','phase-current-screen.json','analysis-verification.json','critical-silkscreen-verification.json','branding-verification.json']:
        report=json.loads((directory/name).read_text())
        assert report['source_sha256']==digest and report['passed'],name+' is missing a passing check for this copper'
        assert sha(directory/name)==manifest['checks'][name]['sha256'],name+' changed after verification'
        if name=='native-drc.json':
            assert not report['errors'] and not report['warnings'],'Native DRC must have zero errors and warnings'
        if name=='physical-routing-audit.json':
            assert report['nets_checked']==70 and not report['disconnected_nets'] and not report['floating_copper_islands'],'All physical nets must be connected without floating copper'
    assert manifest['gerber_shorts']['source_sha256']==digest and manifest['gerber_shorts']['exit_code']==0,'Gerber shorts check is missing'
except (OSError,KeyError,ValueError,AssertionError) as error:
    if '--if-current' in sys.argv:
        print('Saved routing not loaded:',error)
        raise SystemExit(0)
    raise SystemExit('Cannot load saved V2 routing: '+str(error))
for target in [root/'index.circuit.json',root/'artifacts/board.circuit.json']:
    target.write_bytes(candidate.read_bytes())
print('Loaded verified V2 routing: 70 net groups connected, zero shorts and native DRC errors')
