"""Create a fresh registry render for this release, then verify its PNG.

The registry snapshots release input. Never retry a render from an old release.
Uses the established CLI session without persisting or logging credentials.
"""
import argparse,datetime,hashlib,json,time,urllib.request,urllib.parse
from pathlib import Path
R=Path(__file__).resolve().parents[1];OUT=R/'artifacts/v2/model-hosting';API='https://registry-api.tscircuit.com/'
parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--release-id',required=True);args=parser.parse_args()
publication=json.loads((R/'artifacts/v2/publication/registry-verification.json').read_text())
assert publication['version']=='2.0.0-dev.11' and publication['release_id']==args.release_id
rid=args.release_id;token=json.loads(Path('/workspace/.config/tscircuit-nodejs/config.json').read_text())['sessionToken']
def request(endpoint,body=None,query=None):
 url=API+endpoint+('?' + urllib.parse.urlencode(query) if query else '')
 req=urllib.request.Request(url,data=json.dumps(body).encode() if body is not None else None,headers={'Authorization':'Bearer '+token,'Content-Type':'application/json'})
 with urllib.request.urlopen(req,timeout=120) as response:return response.status,response.read()
_,data=request('package_files/get',query={'package_release_id':rid,'file_path':'dist/index/circuit.json'})
rows=json.loads(json.loads(data)['package_file']['content_text']);local=json.loads((R/'artifacts/v2/routing/freerouted.circuit.json').read_text());assert rows==local
for e in rows:
 for key,value in e.items():
  if key in ('model_obj_url','model_step_url','model_glb_url'):assert urllib.parse.urlparse(value).hostname=='modelcdn.tscircuit.com'
status,data=request('package_releases/create_render_image',{'package_release_id':rid,'angle':'angled','circuit_json_file_path':'dist/index/circuit.json'})
assert status==202, 'Expected a fresh release/render, refusing to reuse an old snapshot'
record=json.loads(data)['render_image'];history=[]
for _ in range(360):
 _,data=request('package_releases/get_render_image',query={'package_release_id':rid,'angle':'angled'});record=json.loads(data)['render_image']
 if not history or history[-1]['status']!=record['status']:
  history.append({'status':record['status'],'observed_at':datetime.datetime.now(datetime.timezone.utc).isoformat()});print(json.dumps(history[-1]),flush=True)
 receipt={'passed':record['status']=='succeeded','version':publication['version'],'release_id':rid,'fresh_render_created':True,'create_http_status':status,'input_path':'dist/index/circuit.json','board_sha256':hashlib.sha256((R/'artifacts/v2/routing/freerouted.circuit.json').read_bytes()).hexdigest(),'render_image':record,'status_history':history}
 (OUT/'photorealistic-render-verification.json').write_text(json.dumps(receipt,indent=2)+'\n')
 if record['status'] in ('succeeded','failed'):break
 time.sleep(8)
assert record['status']=='succeeded', 'Fresh registry render did not succeed: '+str(record.get('error',record['status']))
_,png=request('package_releases/get_render_image_file',query={'package_release_id':rid,'angle':'angled'})
assert png.startswith(b'\x89PNG\r\n\x1a\n') and len(png)>10000
(OUT/'photorealistic-angled.png').write_bytes(png)
receipt.update(image_sha256=hashlib.sha256(png).hexdigest(),image_bytes=len(png));(OUT/'photorealistic-render-verification.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps({'passed':True,'release_id':rid,'image_bytes':len(png)}),flush=True)
