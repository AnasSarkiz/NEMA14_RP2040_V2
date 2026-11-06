"""Resolve active assets through modelcdn's documented cache and verify bytes.

The modelcdn repository documents GET /easyeda_models/assets/<part>.<format>
as the fetch-and-store workflow. The custom dimensional motor already records
its exact /jscad_models/ origin in imports/assembly/provenance.json. Never
construct an arbitrary upload URL or silently accept a different model.
"""
import argparse, concurrent.futures, datetime, hashlib, json, re, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FIELDS = ('model_obj_url', 'model_step_url', 'model_glb_url')
MANIFEST = ROOT / 'src/model-cdn-manifest.json'
OUT = ROOT / 'artifacts/v2/model-hosting'

def local_relative(value):
    path = urllib.parse.unquote(urllib.parse.urlparse(value).path)
    for prefix in ('imports/supplier/', 'imports/assembly/'):
        if '/' + prefix in path:
            return prefix + path.split('/' + prefix, 1)[1]
    raise ValueError('Unrecognized original model URL: ' + value)

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        raise ValueError('Model CDN redirect rejected')

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true', help='Update active TSX references and frozen CAD URL metadata')
    parser.add_argument('--resume', action='store_true', help='Reuse matching successful HTTP checks from an interrupted migration')
    args = parser.parse_args()
    existing = json.loads(MANIFEST.read_text())['assets'] if MANIFEST.exists() else {}
    reverse = {a['url']: p for p,a in existing.items()}
    circuit = json.loads((ROOT / 'assembly.circuit.json').read_text())
    plan = {}
    for e in circuit:
        if e['type'] != 'cad_component': continue
        for field in FIELDS:
            value = e.get(field)
            if not value: continue
            relative = reverse.get(value) or local_relative(value)
            path = ROOT / relative
            if relative.startswith('imports/assembly/'):
                url = json.loads((ROOT / 'imports/assembly/provenance.json').read_text())['url']
                part = None
            else:
                tsx = path.parent / (path.parent.name + '.tsx')
                match = re.search(r'"jlcpcb"\s*:\s*\[\s*"(C\d+)"', tsx.read_text())
                assert match, relative
                part = match[1]
                url = 'https://modelcdn.tscircuit.com/easyeda_models/assets/' + part + path.suffix
                # Authentic SVGNODE UUIDs retained in uuid-provenance.json.
                # TMP102's default cache differs; DMN2300's part resolver fails.
                if part == 'C99269': url += '?uuid=ec2270bac0544bf5afe06b24e8356512'
                if part == 'C154728': url += '?uuid=c4a72fda97734ddfadf5f796f604199d'
            assert urllib.parse.urlparse(url).hostname == 'modelcdn.tscircuit.com'
            plan.setdefault(relative, {'url':url, 'model_source_part':part, 'references':[]})['references'].append(value)
    OUT.mkdir(parents=True, exist_ok=True)
    cache = Path('/tmp/nema14-modelcdn-verified'); cache.mkdir(exist_ok=True)
    def resolve(item):
        relative, info = item
        original = (ROOT / relative).read_bytes(); expected = hashlib.sha256(original).hexdigest()
        request = urllib.request.Request(info['url'], headers={'User-Agent':'NEMA14-RP2040-V2-model-migration'})
        with urllib.request.build_opener(NoRedirect).open(request, timeout=120) as response:
            assert response.status == 200 and response.url == info['url']
            data = response.read(64 * 1024 * 1024 + 1)
            assert len(data) <= 64 * 1024 * 1024
            headers = {'content_type':response.headers.get('Content-Type'), 'access_control_allow_origin':response.headers.get('Access-Control-Allow-Origin')}
        actual = hashlib.sha256(data).hexdigest()
        assert data == original, f'Model differs: {relative}: {expected} != {actual}'
        (cache / (expected + Path(relative).suffix)).write_bytes(data)
        print('Verified', relative, len(data), flush=True)
        return relative, {'url':info['url'], 'sha256':expected, 'bytes':len(data), 'model_source_part':info['model_source_part'], 'http_status':200, 'no_redirect':True, **headers}
    partial=cache/'resolved-assets.json'
    previous=json.loads(partial.read_text()) if args.resume and partial.exists() else {}
    assets={};failures=[]
    def checked(item):
        relative,info=item
        if relative in previous and previous[relative]['url']==info['url'] and previous[relative]['sha256']==hashlib.sha256((ROOT/relative).read_bytes()).hexdigest():
            return relative,previous[relative]
        return resolve(item)
    with concurrent.futures.ThreadPoolExecutor(4) as executor:
        pending={executor.submit(checked,item):item[0] for item in plan.items()}
        for future in concurrent.futures.as_completed(pending):
            try:
                relative,info=future.result();assets[relative]=info
                partial.write_text(json.dumps(assets,indent=2)+'\n')
            except Exception as error:
                failures.append({'path':pending[future],'error':str(error),'url':plan[pending[future]]['url']})
    (cache/'migration-errors.json').write_text(json.dumps(failures,indent=2)+'\n')
    assert not failures, json.dumps(failures)

    manifest = {'workflow':'modelcdn documented fetch-and-cache; motor URL from original provenance', 'assets':dict(sorted(assets.items()))}
    MANIFEST.write_text(json.dumps(manifest, indent=2) + '\n')
    receipt = {'passed':True, 'verified_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),
               'unique_assets':len(assets), 'all_model_bytes_unchanged':True, 'all_urls_modelcdn':True,
               'manifest_sha256':hashlib.sha256(MANIFEST.read_bytes()).hexdigest(), 'assets':manifest['assets']}
    (OUT / 'assets-verification.json').write_text(json.dumps(receipt, indent=2) + '\n')
    if not args.apply: return
    # Generated supplier source uses either local imports or pinned GitHub URLs.
    # Replace only the path constants, retaining every CAD transform and pin map.
    for relative, entry in assets.items():
        path = ROOT / relative
        if not relative.startswith('imports/supplier/'): continue
        source = path.parent / (path.parent.name + '.tsx')
        name = 'objPath' if path.suffix == '.obj' else 'stepPath'
        text = source.read_text()
        pattern = rf'(?m)^(?:import {name} from [^\n]+|const {name} = [^\n]+)$'
        text, count = re.subn(pattern, f'const {name} = {json.dumps(entry["url"])}', text)
        assert count == 1, source
        source.write_text(text)
    # Some value-specific supplier wrappers reuse another part's CAD. Update
    # those aliases too, without changing their electrical supplier selection.
    for source in (ROOT/'imports/supplier').glob('*/*.tsx'):
        text=source.read_text()
        def alias(match):
            name,value=match.groups()
            try: relative=local_relative(value)
            except ValueError: return match.group()
            return f'const {name} = {json.dumps(assets[relative]["url"])}' if relative in assets else match.group()
        text=re.sub(r'(?m)^const (objPath|stepPath) = "([^"]+)";?$',alias,text)
        source.write_text(text)
    mapping = {value:assets[relative]['url'] for relative,info in plan.items() for value in info['references']}
    for file in ['artifacts/v2/routing/freerouted.circuit.json']:
        p=ROOT/file; records=json.loads(p.read_text())
        for e in records:
            if e['type']=='cad_component':
                for field in FIELDS:
                    if e.get(field): e[field]=mapping[e[field]]
        p.write_text(json.dumps(records,indent=2)+'\n')

if __name__ == '__main__': main()
