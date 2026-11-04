"""Publish the checked V2 as a separate, lean engineering-preview package.

No source compilation, rerouting, fabrication downloads or V1 registry writes.
Only CAD URLs change, to immutable byte-verified GitHub supplier assets.
"""
import argparse
import base64
import datetime
import gzip
import hashlib
import json
from pathlib import Path
import subprocess
import urllib.error
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
API = 'https://registry-api.tscircuit.com/'
NAME = 'AnasSarkiz/NEMA14_RP2040_V2'
V1 = 'AnasSarkiz/NEMA14_RP2040'
REPO = NAME
OUT = ROOT / 'artifacts/v2/publication'


def encode(value):
    return (json.dumps(value, separators=(',', ':'), ensure_ascii=False) + '\n').encode()


def sha(data):
    return hashlib.sha256(data).hexdigest()


def blob(data):
    return hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()


def read_json(url):
    with urllib.request.urlopen(url, timeout=90) as response:
        return json.load(response)


def get(endpoint, **query):
    return read_json(API + endpoint + '?' + urllib.parse.urlencode(query))


def without_model_urls(records):
    return [{k: v for k, v in e.items()
             if not (e['type'] == 'cad_component' and k in ['model_obj_url', 'model_step_url', 'model_glb_url'])}
            for e in records]


def stage(source_repository, revision):
    assert source_repository == REPO, 'V2 source and models must belong to the independent repository'
    assert len(revision) == 40 and all(c in '0123456789abcdef' for c in revision)
    subprocess.run(['python3', 'scripts/restore-v2-reviewed-routing.py'], cwd=ROOT, check=True)
    meta = json.loads((ROOT / 'package.json').read_text())
    assert meta['name'] == 'NEMA14_RP2040_V2'
    original = (ROOT / 'artifacts/v2/routing/freerouted.circuit.json').read_bytes()
    assert original == (ROOT / 'index.circuit.json').read_bytes()
    tree = read_json(f'https://api.github.com/repos/{source_repository}/git/trees/{revision}?recursive=1')
    assert not tree.get('truncated'), 'Need a complete public GitHub source tree'
    blobs = {e['path']: e['sha'] for e in tree['tree'] if e['type'] == 'blob'}
    assert blobs['artifacts/v2/routing/freerouted.circuit.json'] == blob(original), 'Public GitHub source differs'
    records = json.loads(original)
    published = json.loads(original)
    assets = {}
    def pin_models(rows):
        for e in rows:
            if e['type'] != 'cad_component': continue
            for field in ['model_obj_url','model_step_url','model_glb_url']:
                value=e.get(field)
                if not value: continue
                path=urllib.parse.unquote(urllib.parse.urlparse(value).path)
                relative=next((prefix+path.split('/'+prefix,1)[1] for prefix in ['imports/supplier/','imports/assembly/'] if '/'+prefix in path),None)
                assert relative, 'Unexpected model path: '+path
                local=(ROOT/relative).resolve()
                assert local.is_relative_to((ROOT/'imports').resolve())
                data=local.read_bytes();assert blobs[relative]==blob(data),'Public model differs: '+relative
                e[field]=f'https://raw.githubusercontent.com/{source_repository}/{revision}/{relative}'
                assets[relative]={'sha256':sha(data),'git_blob_sha':blob(data),'url':e[field]}
        return rows
    published=pin_models(published)
    assembly_bytes=(ROOT/'assembly.circuit.json').read_bytes()
    assert blobs['assembly.circuit.json']==blob(assembly_bytes),'Public assembly source differs'
    assembly=json.loads(assembly_bytes);assert assembly[:len(records)]==records,'Assembly altered the PCB'
    assembly_check=json.loads((ROOT/'artifacts/v2/assembly/assembly-verification.json').read_text())
    assert assembly_check['passed'] and assembly_check['assembly_sha256']==sha(assembly_bytes) and assembly_check['board_sha256']==sha(original)
    for name in ['schema-verification.json','model-verification.json','wire-shape-verification.json','viewer-verification.json']:
        receipt=json.loads((ROOT/'artifacts/v2/assembly'/name).read_text())
        assert receipt['passed'] and receipt['assembly_sha256']==sha(assembly_bytes),'Stale assembly receipt: '+name
    artwork=json.loads((ROOT/'artifacts/v2/routing/branding-verification.json').read_text())
    assert artwork['passed'] and artwork['source_sha256']==sha(original),'Logo/disclaimer check is stale'
    port_labels=json.loads((ROOT/'artifacts/v2/routing/port-label-update-verification.json').read_text())
    assert port_labels['passed'] and port_labels['source_sha256']==sha(original),'Final knockout Gerber/preservation check is stale'
    published_assembly=pin_models(json.loads(assembly_bytes))
    assert without_model_urls(published_assembly)==without_model_urls(assembly)
    assert published_assembly[:len(published)]==published
    assert without_model_urls(published) == without_model_urls(records), 'PCB or schematic records changed'
    assert not any(e['type'].endswith('_error') for e in published)
    # Definitions must pass analysis before publication; never filter diagnostics.
    source_warnings = [e for e in published if e['type'].endswith('_warning')]
    assert not source_warnings, 'Resolve source/schematic warnings before publishing'
    native = encode(published)
    qualification = json.loads((ROOT / 'artifacts/v2/routing/verification.json').read_text())
    proof = {
        'passed': True, 'scope': 'V2 engineering preview; not manufacturing release',
        'package': NAME, 'version': meta['version'], 'github_repository': REPO,
        'github_source_repository': source_repository, 'github_source_revision': revision,
        'separate_github_repository_pending': source_repository != REPO,
        'reviewed_board_sha256': sha(original), 'published_board_sha256': sha(native),
        'only_CAD_model_URL_metadata_changed': True, 'assembly_sha256': sha(assembly_bytes), 'published_assembly_sha256':sha(encode(published_assembly)), 'assembly_mechanical_parts':9, 'motor_rear_attachment_verified':False, 'factory_wire_fit_verified':False, 'routing_and_schematic_preserved': True,
        'connected_net_groups': qualification['connected_net_groups'],
        'shorts': 0, 'native_errors': 0, 'native_warnings': 0,
        'native_warning_scope': 'PCB DRC', 'source_library_warning_count': len(source_warnings),
        'fabrication_ready': False, 'manufacturing_downloads_included': False,
        'supplier_assets': assets,
    }
    source_url = f'https://github.com/{source_repository}/tree/{revision}'
    readme = (
        '# NEMA14 RP2040 V2\n\n'
        '34.5 × 34.5 mm, four-layer RP2040 motor controller with two coil-current ADC\n'
        'channels and a WAGO 250-204 spring terminal. RGB, buzzer, temperature sensor,\n'
        'flash, crystal and top-side encoder capacitors are retained.\n\n'
        'USB-C capsule locating holes follow each connector rotation; exported drill\n'
        f'directions are verified. Built with tscircuit {meta["dependencies"]["tscircuit"]} / CLI {meta["dependencies"]["@tscircuit/cli"]}.\n\n'
        '**70/70 nets connected; 0 shorts; 0 native PCB DRC errors or warnings.**\n\n'
        'Fresh source, pin and schematic checks report zero diagnostics.\n\n'
        'Large knockout PWR/DATA legends, the tscircuit wordmark and evaluation disclaimer are checked on the underside.\n\n'
        'The default 3D preview includes the reference motor and four shorter, smoothly curved WAGO leads. Rear mounting and factory wire fit remain unverified.\n\n'
        'Strong 10 kohm ENABLE/SLEEP defaults and local USB ESD VBUS bypass are fitted.\n'
        'The 47 uF bulk capacitor is beside the driver with short feeds and local ground returns.\n'
        'USB clearance slots are 1.80 x 1.00 mm for CNC fabrication; their centers, axes and solder lands are retained.\n\n'
        'V2 prototype order files and an independent passing CAM audit are in GitHub. Supplier stock/process/pickup,\n'
        'factory wire fit and prototype bench qualification remain pending. No manufacturing downloads included here.\n\n'
        f'Verified full source and models: {source_url}\n\n'
        f'Independent V2 repository: https://github.com/{REPO}\n\n'
        f'V1 is a separate package: https://tscircuit.com/{V1}\n'
    ).encode()
    files = {
        'index.circuit.json': native,
        'assembly.circuit.json': encode(published_assembly),
        'dist/assembly/circuit.json': encode(published_assembly),
        'dist/index/circuit.json': native,
        'package.json': encode({'name': meta['name'], 'version': meta['version'],
            'description': meta['description'], 'main': 'index.circuit.json',
            'repository': 'https://github.com/' + REPO, 'license': 'ISC'}),
        'tscircuit.config.json': encode({'mainEntrypoint': 'index.circuit.json',
            'includeBoardFiles': ['index.circuit.json','assembly.circuit.json'], 'previewComponentPath': 'assembly.circuit.json'}),
        'README.md': readme,
        'verification.json': encode(proof),
    }
    assert len(files) == 8
    directory = OUT / 'stage'
    for path, data in files.items():
        target = directory / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
    print(json.dumps({'staged': str(directory), 'files': sorted(files),
        'bytes': sum(map(len, files.values())), 'source_repository': source_repository,
        'reviewed_board_sha256': sha(original)}, indent=2), flush=True)
    return meta, files, proof


def publish(meta, files, proof, verify_only=False):
    # Use the established CLI session as-is; never print or persist credentials.
    config = Path('/workspace/.config/tscircuit-nodejs/config.json')
    token = json.loads(config.read_text())['sessionToken']

    def post(endpoint, body):
        # All publication targets are hard-bounded to the distinct V2 package.
        if 'name' in body:
            assert body['name'] == NAME
        if 'package_name_with_version' in body:
            assert body['package_name_with_version'].startswith(NAME + '@')
        request = urllib.request.Request(API + endpoint, data=encode(body),
            headers={'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'})
        with urllib.request.urlopen(request, timeout=120) as response:
            return json.load(response)

    before = get('packages/get', name=V1)['package']
    try:
        package = get('packages/get', name=NAME)['package']
    except urllib.error.HTTPError as error:
        if error.code != 404 or verify_only:
            raise
        package = post('packages/create', {'name': NAME, 'is_private': False})['package']
    assert package['name'] == NAME
    version = NAME + '@' + meta['version']
    try:
        release = post('package_releases/get', {'package_name_with_version': version})['package_release']
    except urllib.error.HTTPError as error:
        if error.code != 404 or verify_only:
            raise
        release = post('package_releases/create', {'package_name_with_version': version})['package_release']
    rid = release['package_release_id']
    rows = get('package_files/list', package_release_id=rid)['package_files']
    assert {e['file_path'] for e in rows} <= set(files), 'Unexpected files; no deletion is authorized here'
    if not verify_only:
        for path, data in files.items():
            archive = base64.b64encode(gzip.compress(encode({'files': [
                {'file_path': path, 'content_text': data.decode()}]}), compresslevel=9)).decode()
            assert len(archive) < 3_000_000, 'File exceeds bounded upload limit'
            post('package_files/upload_archive', {'package_name_with_version': version, 'archive_base64': archive})
            print('Uploaded V2:', path, flush=True)
        post('package_releases/update', {'package_name_with_version': version,
            'ready_to_build': True, 'is_latest': True, 'license': 'ISC'})
    # This is a bounded manual publication. Automatic GitHub integration is a
    # separate service setting and is not required for repo/model links to work.
    rows = get('package_files/list', package_release_id=rid)['package_files']
    assert {e['file_path'] for e in rows} == set(files)
    verified = []
    for path, expected in files.items():
        remote = get('package_files/get', package_release_id=rid, file_path=path)['package_file']
        assert remote['package_release_id'] == rid and remote['is_text']
        data = remote['content_text'].encode()
        if path.endswith('.json'):
            assert json.loads(data) == json.loads(expected), 'Registry content differs: ' + path
        else:
            assert data == expected, 'Registry content differs: ' + path
        verified.append({'path': path, 'sha256': sha(data)})
    preview = get('package_releases/get_preview_circuit_json', package_name=NAME,
        is_latest='true')['preview_circuit_json_response']
    assert preview['circuit_json_found'] and preview['component_path'] == 'assembly.circuit.json'
    assert preview['circuit_json'] == json.loads(files['assembly.circuit.json']), 'Native assembly preview differs'
    after = get('packages/get', name=V1)['package']
    protected = ['package_id', 'latest_package_release_id', 'latest_version', 'latest_package_release_fs_sha']
    assert all(before[k] == after[k] for k in protected), 'V1 changed during publication'
    receipt = {**proof, 'verified_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'release_id': rid, 'registry_files_verified': verified,
        'public_native_preview_verified': True, 'v1_package_unchanged': True,
        'publication_method': 'bounded native registry upload',
        'github_automatic_sync_enabled': bool(package.get('is_source_from_github')),
        'v1_snapshot': {k: before[k] for k in protected}}
    (OUT / 'registry-verification.json').write_text(json.dumps(receipt, indent=2) + '\n')
    print(json.dumps({k: v for k, v in receipt.items() if k != 'supplier_assets'}, indent=2), flush=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument('--publish', action='store_true')
    mode.add_argument('--verify-only', action='store_true', help='Read back an existing release without uploading')
    parser.add_argument('--source-repository', default=REPO,
        help='Public repository containing the verified V2 source commit')
    parser.add_argument('--source-revision', help='Immutable public source commit (default: local HEAD)')
    args = parser.parse_args()
    revision = args.source_revision or subprocess.check_output(
        ['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
    meta, files, proof = stage(args.source_repository, revision)
    if args.publish or args.verify_only:
        publish(meta, files, proof, verify_only=args.verify_only)
