"""Publish only a non-latest enclosure concept; protect both approved defaults."""
from pathlib import Path
import json,hashlib,subprocess,urllib.request,urllib.parse,urllib.error,base64,gzip,datetime
R=Path(__file__).resolve().parents[1];NAME='AnasSarkiz/NEMA14_RP2040_V2';V1='AnasSarkiz/NEMA14_RP2040';VERSION='2.0.0-enclosure.1';TARGET=NAME+'@'+VERSION;API='https://registry-api.tscircuit.com/'
def encode(o):return (json.dumps(o,separators=(',',':'),ensure_ascii=False)+'\n').encode()
def sha(b):return hashlib.sha256(b).hexdigest()
def blob(b):return hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
def get(endpoint,**params):
 with urllib.request.urlopen(API+endpoint+'?'+urllib.parse.urlencode(params),timeout=120) as r:return json.load(r)
def read(url):
 with urllib.request.urlopen(url,timeout=90) as r:return json.load(r)
def strip(rows):return [{k:v for k,v in e.items() if not(e['type']=='cad_component' and k in ['model_obj_url','model_step_url','model_glb_url'])} for e in rows]
if __name__=='__main__':
 rev=subprocess.check_output(['git','rev-parse','HEAD'],cwd=R,text=True).strip();tree=read('https://api.github.com/repos/'+NAME+'/git/trees/'+rev+'?recursive=1');assert not tree.get('truncated');blobs={e['path']:e['sha'] for e in tree['tree'] if e['type']=='blob'}
 raw={name:(R/name).read_bytes() for name in ['index.circuit.json','assembly.circuit.json','enclosure-concept.circuit.json']};rows={name:json.loads(b) for name,b in raw.items()}
 assert rows['enclosure-concept.circuit.json'][:len(rows['assembly.circuit.json'])]==rows['assembly.circuit.json']
 assert rows['assembly.circuit.json'][:len(rows['index.circuit.json'])]==rows['index.circuit.json']
 for name,b in raw.items():assert blobs[name]==blob(b),'Push the exact source before publication: '+name
 for name in ['build-verification.json','fit-verification.json','schema-verification.json','viewer-verification.json']:
  report=json.loads((R/'artifacts/v2/enclosure'/name).read_text());assert report['passed'] and report['enclosure_sha256']==sha(raw['enclosure-concept.circuit.json']),name+' stale'
 protected=['package_id','latest_package_release_id','latest_version','latest_package_release_fs_sha'];snapshots={}
 for n in [NAME,V1]:
  current=get('packages/get',name=n)['package'];snapshots[n]={k:current[k] for k in protected}
 approved_remote=get('package_files/get',package_release_id=snapshots[NAME]['latest_package_release_id'],file_path='assembly.circuit.json')['package_file']['content_text']
 assert strip(json.loads(approved_remote))==strip(rows['assembly.circuit.json']),'Local base differs from approved default assembly'
 assets={};published={}
 for name,records in rows.items():
  out=json.loads(raw[name])
  for e in out:
   if e['type']!='cad_component':continue
   for field in ['model_obj_url','model_step_url','model_glb_url']:
    value=e.get(field)
    if not value:continue
    path=urllib.parse.unquote(urllib.parse.urlparse(value).path);relative=next((p+path.split('/'+p,1)[1] for p in ['imports/supplier/','imports/assembly/'] if '/'+p in path),None);assert relative,'Unexpected model path'
    local=(R/relative).resolve();assert local.is_relative_to((R/'imports').resolve());data=local.read_bytes();assert blobs[relative]==blob(data)
    e[field]=f'https://raw.githubusercontent.com/{NAME}/{rev}/{relative}';assets[relative]={'sha256':sha(data),'url':e[field]}
  assert strip(out)==strip(records);published[name]=out
 assert published['enclosure-concept.circuit.json'][:len(published['assembly.circuit.json'])]==published['assembly.circuit.json']
 proof={'passed':True,'scope':'Optional enclosure concept; not production or print signoff','version':VERSION,'package':NAME,'github_source_revision':rev,'enclosure_sha256':sha(raw['enclosure-concept.circuit.json']),'published_enclosure_sha256':sha(encode(published['enclosure-concept.circuit.json'])),'approved_PCB_and_assembly_preserved':True,'is_latest':False,'retention_and_fastening_and_thermal_qualified':False,'supplier_assets':assets}
 files={}
 for name,data in published.items():files[name]=encode(data);files['dist/'+name.removesuffix('.circuit.json')+'/circuit.json']=encode(data)
 files['package.json']=encode({'name':'NEMA14_RP2040_V2','version':VERSION,'main':'index.circuit.json','repository':'https://github.com/'+NAME,'description':'Separate clear-cover and motor-carrier concept; approved assembly unchanged','license':'ISC'})
 files['tscircuit.config.json']=encode({'mainEntrypoint':'index.circuit.json','includeBoardFiles':list(published),'previewComponentPath':'enclosure-concept.circuit.json'})
 files['README.md']=('# Optional enclosure concept\n\n39.4 mm square clear cover and rear motor carrier; WAGO exposed for operation, USB openings and vents.\n\nApproved PCB, motor and wires remain unchanged. This is a fit-study prototype: friction-pad retention, closure hardware, real cable heads, material, temperature and print tolerances require testing.\n\nThe approved dev.6 remains the default package release.\n\nFull source and prototype STEP/STL exports: https://github.com/'+NAME+'/tree/'+rev+'/artifacts/v2/enclosure\n').encode();files['verification.json']=encode(proof);assert len(files)==10
 token=json.loads(Path('/workspace/.config/tscircuit-nodejs/config.json').read_text())['sessionToken']
 def post(endpoint,body):
  if 'package_name_with_version' in body:assert body['package_name_with_version']==TARGET
  if 'is_latest' in body:assert body['is_latest'] is False,'Never replace the approved default'
  req=urllib.request.Request(API+endpoint,data=encode(body),headers={'Authorization':'Bearer '+token,'Content-Type':'application/json'})
  with urllib.request.urlopen(req,timeout=120) as r:return json.load(r)
 try:release=post('package_releases/get',{'package_name_with_version':TARGET})['package_release']
 except urllib.error.HTTPError as e:
  if e.code!=404:raise
  release=post('package_releases/create',{'package_name_with_version':TARGET,'is_latest':False,'ready_to_build':False})['package_release']
 assert not release['is_latest'];rid=release['package_release_id'];existing=get('package_files/list',package_release_id=rid)['package_files'];assert {e['file_path'] for e in existing}<=set(files)
 for name,data in files.items():
  archive=base64.b64encode(gzip.compress(encode({'files':[{'file_path':name,'content_text':data.decode()}]}),compresslevel=9)).decode();assert len(archive)<3_000_000
  post('package_files/upload_archive',{'package_name_with_version':TARGET,'archive_base64':archive});print('Uploaded enclosure preview:',name,flush=True)
 post('package_releases/update',{'package_name_with_version':TARGET,'is_latest':False,'ready_to_build':True,'license':'ISC'})
 verified=[]
 for name,expected in files.items():
  remote=get('package_files/get',package_release_id=rid,file_path=name)['package_file']['content_text'].encode()
  assert (json.loads(remote)==json.loads(expected)) if name.endswith('.json') else remote==expected
  verified.append({'file':name,'sha256':sha(remote)})
 preview=get('package_releases/get_preview_circuit_json',package_release_id=rid)['preview_circuit_json_response'];assert preview['circuit_json_found'] and preview['component_path']=='enclosure-concept.circuit.json' and preview['circuit_json']==published['enclosure-concept.circuit.json']
 for name,snapshot in snapshots.items():
  after=get('packages/get',name=name)['package'];assert all(after[k]==snapshot[k] for k in protected),'Approved default changed: '+name
 release=post('package_releases/get',{'package_name_with_version':TARGET})['package_release'];assert not release['is_latest']
 receipt={**proof,'release_id':rid,'verified_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'registry_files_verified':verified,'public_native_enclosure_preview_verified':True,'approved_V2_default_unchanged':True,'V1_unchanged':True,'default_snapshots':snapshots,'preview_url':release.get('preview_url')}
 (R/'artifacts/v2/enclosure/registry-verification.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps({k:v for k,v in receipt.items() if k!='supplier_assets'},indent=2),flush=True)
