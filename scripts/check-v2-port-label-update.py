"""Verify dev.9 changes only the three intended legends and final bottom ink."""
import hashlib, importlib.util, json, subprocess, tempfile, zipfile
from pathlib import Path
from shapely.geometry import box, shape

R = Path(__file__).resolve().parents[1]
BASE = '2b77c423a5d36c3843d596bb297ddc42c1b2e953'
D = R / 'artifacts/v2/routing'
board = (D / 'freerouted.circuit.json').read_bytes()
old = json.loads(subprocess.check_output(['git', 'show', BASE + ':artifacts/v2/routing/freerouted.circuit.json'], cwd=R))
new = json.loads(board)
ids = {'v2_critical_power-port', 'v2_critical_data-port', 'v2_critical_revision'}
def retained(rows):
    kept = [e for e in rows if e.get('pcb_silkscreen_text_id') not in ids]
    keyed = {(e['type'], e.get(e['type'] + '_id')): e for e in kept}
    assert len(keyed) == len(kept), 'Duplicate record identity'
    return keyed
assert retained(old) == retained(new), 'Unexpected change outside three silkscreen legends'
for id in ids:
    assert next(e for e in old if e.get('pcb_silkscreen_text_id') == id) != next(e for e in new if e.get('pcb_silkscreen_text_id') == id)
spec = importlib.util.spec_from_file_location('port_label_cam', R / 'scripts/audit-manufacturing.py')
cam = importlib.util.module_from_spec(spec); spec.loader.exec_module(cam)
out = R / 'artifacts/v2/order-review'
ink = json.loads(Path('/tmp/nema14-critical-ink.json').read_text())
assert ink['source_sha256'] == hashlib.sha256(board).hexdigest()
final = cam.gerber(out / 'cam/B_SilkScreen.gbr')[0]
labels = []
for label in ink['labels']:
    if not label.get('is_knockout'): continue
    wanted = shape(label['geometry']); region = box(*wanted.bounds)
    missing = wanted.buffer(-.002).difference(final).area
    filled = region.difference(wanted).buffer(-.002).intersection(final).area
    assert missing < .002 and filled < .002, (label['text'], missing, filled)
    labels.append({'text': label['text'], 'printed_background_and_counters_retained': True, 'letter_voids_clear': True})
assert len(labels) == 2
old_zip = subprocess.check_output(['git', 'show', BASE + ':artifacts/v2/order-review/NEMA14_RP2040_V2-Gerbers.zip'], cwd=R)
unchanged = []; equivalent = []
with tempfile.TemporaryDirectory() as tmp:
    tmp = Path(tmp); (tmp / 'baseline.zip').write_bytes(old_zip)
    with zipfile.ZipFile(tmp / 'baseline.zip') as z, zipfile.ZipFile(out / 'NEMA14_RP2040_V2-Gerbers.zip') as current:
        assert set(z.namelist()) == set(current.namelist())
        for name in z.namelist():
            if name == 'B_SilkScreen.gbr': continue
            a, b = z.read(name), current.read(name)
            if a == b: unchanged.append(name); continue
            if name.endswith('.drl'):
                def without_dates(data):
                    return [line for line in data.decode().splitlines()
                            if not line.startswith(('; DRILL file {tscircuit} date ', '; #@! TF.CreationDate,'))]
                assert without_dates(a) == without_dates(b), 'Drill commands changed: ' + name
                equivalent.append(name); continue
            # Native Gerbers include timestamps and allocate aperture IDs in
            # record traversal order. Compare the actual parsed artwork when
            # those serialization details differ.
            assert name.endswith('.gbr'), 'Unexpected non-Gerber change: ' + name
            pa, pb = tmp / ('old-' + name), tmp / ('new-' + name)
            pa.write_bytes(a); pb.write_bytes(b)
            delta = cam.gerber(pa)[0].symmetric_difference(cam.gerber(pb)[0]).area
            assert delta < 1e-7, (name, delta)
            equivalent.append(name)
for name in ['NEMA14_RP2040_V2-BOM.csv', 'NEMA14_RP2040_V2-CPL.csv', 'Through-Hole-Joints.csv', 'Thermal-Via-Process.csv']:
    assert (out / name).read_bytes() == subprocess.check_output(['git', 'show', BASE + ':artifacts/v2/order-review/' + name], cwd=R), name
report = {'passed': True, 'source_sha256': hashlib.sha256(board).hexdigest(), 'baseline_revision': BASE,
          'changed_records_only': sorted(ids), 'all_other_records_preserved': True,
          'unchanged_CAM_files': unchanged, 'geometrically_identical_CAM_files': equivalent,
          'BOM_CPL_and_process_tables_byte_identical': True, 'final_CAM_knockouts': labels}
report['drill_commands_identical_ignoring_generation_dates'] = True
(D / 'port-label-update-verification.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
