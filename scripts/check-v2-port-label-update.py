"""Verify enlarged port legends, translated wordmark and final bottom ink."""
import hashlib, importlib.util, json, subprocess, tempfile, zipfile
from pathlib import Path
from v2_model_assets import without_model_urls
from shapely.geometry import box, shape, LineString
from shapely.ops import unary_union

R = Path(__file__).resolve().parents[1]
BASE = '2b77c423a5d36c3843d596bb297ddc42c1b2e953'
D = R / 'artifacts/v2/routing'
board = (D / 'freerouted.circuit.json').read_bytes()
old = json.loads(subprocess.check_output(['git', 'show', BASE + ':artifacts/v2/routing/freerouted.circuit.json'], cwd=R))
new = json.loads(board)
ids = {'v2_critical_power-port', 'v2_critical_data-port', 'v2_critical_revision'}
old_markings = json.loads(subprocess.check_output(['git', 'show', BASE + ':src/bottom-markings.json'], cwd=R))
old_logo = next(g for g in old_markings['groups'] if g['name'] == 'tscircuit official wordmark')
new_logo = next(g for g in json.loads((R / 'src/bottom-markings.json').read_text())['groups'] if g['name'] == old_logo['name'])
assert old_logo['stroke_width_mm'] == new_logo['stroke_width_mm']
assert len(old_logo['routes']) == len(new_logo['routes']) == 148
dx = new_logo['routes'][0][0][0] - old_logo['routes'][0][0][0]
dy = new_logo['routes'][0][0][1] - old_logo['routes'][0][0][1]
assert abs(dx - 11.3) < 1e-8 and abs(dy + 9.2) < 1e-8
logo_ids = set()
for original, moved in zip(old_logo['routes'], new_logo['routes']):
    assert len(original) == len(moved)
    assert all(abs(x + dx - u) < 1e-8 and abs(y + dy - v) < 1e-8 for (x,y),(u,v) in zip(original,moved))
    record = next(e for e in old if e['type'] == 'pcb_silkscreen_path' and e['route'] == [{'x':x,'y':y} for x,y in original])
    current = next(e for e in new if e.get('pcb_silkscreen_path_id') == record['pcb_silkscreen_path_id'])
    assert current == {**record, 'route':[{'x':x,'y':y} for x,y in moved]}
    logo_ids.add(record['pcb_silkscreen_path_id'])
def retained(rows):
    kept = [e for e in rows if e.get('pcb_silkscreen_text_id') not in ids and e.get('pcb_silkscreen_path_id') not in logo_ids]
    keyed = {(e['type'], e.get(e['type'] + '_id')): e for e in without_model_urls(kept)}
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
wordmark = unary_union([LineString(route).buffer(new_logo['stroke_width_mm']/2) for route in new_logo['routes']])
assert wordmark.buffer(-.003).difference(final).area < .001, 'Wordmark missing from final bottom Gerber'
assert final.intersection(box(*wordmark.bounds)).difference(wordmark.buffer(.003)).area < .001, 'Unexpected ink in the wordmark region'
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
          'changed_records_only': sorted(ids | logo_ids), 'all_other_records_preserved': True,
          'unchanged_CAM_files': unchanged, 'geometrically_identical_CAM_files': equivalent,
          'BOM_CPL_and_process_tables_byte_identical': True, 'final_CAM_knockouts': labels}
report['drill_commands_identical_ignoring_generation_dates'] = True
report['wordmark_only_translation_mm'] = [round(dx, 6), round(dy, 6)]
report['translated_wordmark_path_count'] = len(logo_ids)
report['translated_wordmark_verified_in_final_CAM'] = True
(D / 'port-label-update-verification.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
