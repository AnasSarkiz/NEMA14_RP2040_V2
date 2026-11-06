"""Resolve verified modelcdn assets to the unchanged checked-in CAD bytes."""
import hashlib, json
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parents[1]
FIELDS = {'model_obj_url', 'model_step_url', 'model_glb_url'}

def manifest():
    p=ROOT/'src/model-cdn-manifest.json'
    return json.loads(p.read_text())['assets'] if p.exists() else {}

def local_model(value):
    for relative, asset in manifest().items():
        if value == asset['url']:
            path=ROOT/relative
            assert hashlib.sha256(path.read_bytes()).hexdigest()==asset['sha256'], relative
            return path
    decoded=unquote(urlparse(value).path)
    for prefix in ['imports/supplier/', 'imports/assembly/']:
        if '/'+prefix in decoded:
            return ROOT/(prefix+decoded.split('/'+prefix,1)[1])
    raise ValueError('Unknown model asset: '+value)

def without_model_urls(records):
    return [{k:v for k,v in e.items() if not (e['type']=='cad_component' and k in FIELDS)} for e in records]
