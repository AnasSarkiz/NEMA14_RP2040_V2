"""Verify a URL-only migration against the immutable ordered dev.10 source."""
import hashlib,json,subprocess,urllib.parse
from pathlib import Path
from v2_model_assets import without_model_urls
R=Path(__file__).resolve().parents[1];OUT=R/'artifacts/v2/model-hosting'; BASE='23fcd146dc8d56445e79f04d57a1587bfda97569'
sha=lambda b:hashlib.sha256(b).hexdigest()
manifest=json.loads((R/'src/model-cdn-manifest.json').read_text())
assets=manifest['assets'];by_url={a['url']:(p,a) for p,a in assets.items()}
for path,asset in assets.items():
 data=(R/path).read_bytes()
 assert sha(data)==asset['sha256'] and data==subprocess.check_output(['git','show',BASE+':'+path],cwd=R),path
proof={'passed':True,'baseline_revision':BASE,'assets':len(assets),'files':{}}
for file,key in [('artifacts/v2/routing/freerouted.circuit.json','board_sha256'),('artifacts/v2/source.circuit.json','source_sha256'),('assembly.circuit.json','assembly_sha256')]:
 current=(R/file).read_bytes();baseline=subprocess.check_output(['git','show',BASE+':'+file],cwd=R)
 rows=json.loads(current);old=json.loads(baseline)
 assert without_model_urls(rows)==without_model_urls(old), 'Non-URL records changed: '+file
 refs=0
 for e in rows:
  if e['type']!='cad_component':continue
  for field in ('model_obj_url','model_step_url','model_glb_url'):
   url=e.get(field)
   if not url:continue
   u=urllib.parse.urlparse(url)
   assert u.scheme=='https' and u.hostname=='modelcdn.tscircuit.com' and not u.port and not u.username,url
   assert url in by_url, 'URL absent from verified model manifest: '+url
   refs+=1
 proof[key]=sha(current);proof['files'][file]={'model_url_references':refs,'all_other_records_exactly_unchanged':True}
receipt=json.loads((OUT/'assets-verification.json').read_text())
assert receipt['passed'] and receipt['unique_assets']==len(assets)==87
assert receipt['manifest_sha256']==sha((R/'src/model-cdn-manifest.json').read_bytes())
assert all(a['http_status']==200 and a['no_redirect'] for a in assets.values())
proof['geometry_transforms_scale_supplier_choices_and_wires_preserved']=True
(OUT/'preservation-verification.json').write_text(json.dumps(proof,indent=2)+'\n')
print(json.dumps(proof,indent=2))
