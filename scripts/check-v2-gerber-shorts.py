"""Retain a hash-bound receipt for the real four-layer Gerber shorts command."""
import datetime,hashlib,json,os,subprocess
from pathlib import Path
R=Path(__file__).resolve().parents[1];p=R/'artifacts/v2/routing/freerouted.circuit.json'
before=p.read_bytes();digest=hashlib.sha256(before).hexdigest()
env=dict(os.environ);env['PATH']=str(R/'node_modules/.bin')+':'+env['PATH'];env['XDG_CONFIG_HOME']='/workspace/.config'
cmd=['tsci','check','shorts',str(p),'--mode','gerber','--layer','all','--pixels-per-mm','100']
run=subprocess.run(cmd,cwd=R,env=env,capture_output=True,text=True)
output=run.stdout+run.stderr;print(output,end='',flush=True)
passed=run.returncode==0 and 'No shorts detected' in output and p.read_bytes()==before
receipt={'passed':passed,'source_sha256':digest,'command':cmd,'exit_code':run.returncode,
         'checked_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),
         'layers':['top','inner1','inner2','bottom'],'pixels_per_mm':100,'output':output,
         'scope':'Actual native Gerber-mode shorts check; no supplier approval implied'}
(p.parent/'gerber-shorts-verification.json').write_text(json.dumps(receipt,indent=2)+'\n')
raise SystemExit(not passed)
