"""Make a single-file, read-only tscircuit preview; never exports manufacturing files."""
import argparse, base64, hashlib, html as html_escape, json, re
from pathlib import Path
from urllib.parse import urlparse, unquote

ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source',type=Path,default=ROOT/'artifacts/v2/source.circuit.json')
parser.add_argument('--output',type=Path,default=ROOT/'artifacts/v2/NEMA14-V2-viewer.html')
parser.add_argument('--notice',default='Placement draft · Unrouted · Not for ordering')
parser.add_argument('--native-drc',type=Path,help='Append hash-matched native errors to the display only')
args=parser.parse_args()
source=args.source
circuit=json.loads(source.read_text())
if args.native_drc:
    drc=json.loads(args.native_drc.read_text())
    assert drc['source_sha256']==hashlib.sha256(source.read_bytes()).hexdigest(),'DRC report does not match the preview source'
    # Preserve the raw candidate for independent checks. The viewer must show
    # its actual open-connection diagnostics rather than an empty error list.
    circuit.extend(drc['errors'])
assets={}
for element in circuit:
    if element['type']!='cad_component':continue
    obj=element.get('model_obj_url')
    if obj:
        if '/imports/supplier/' in unquote(urlparse(obj).path):
            # Resolve verified supplier assets from this checkout, including
            # saved snapshots made before the repository was separated.
            path=ROOT/('imports/supplier/'+unquote(urlparse(obj).path).split('/imports/supplier/',1)[1])
        else:
            path=Path(obj)
            if not path.is_absolute():path=ROOT/path
        path=path.resolve()
        if not path.is_relative_to(ROOT) or not path.is_file():raise ValueError('Missing local CAD: '+str(path))
        asset_key=str(path.relative_to(ROOT))
        assets[asset_key]=base64.b64encode(path.read_bytes()).decode()
        element['model_obj_url']='embedded:'+asset_key
        # Display uses the exact OBJ; STEP exchange files are unnecessary here.
        element.pop('model_step_url',None)

bundle=ROOT/'node_modules/@tscircuit/runframe/dist/standalone-preview.min.js'
version=json.loads((bundle.parent.parent/'package.json').read_text())['version']
sha=hashlib.sha256(source.read_bytes()).hexdigest()
def script_json(value):return json.dumps(value,separators=(',',':')).replace('<','\\u003c')
# Replace only remote font transport expressions in the pinned viewer bundle.
# These expressions are inside a worker-serialized function, so embed literals.
fonts=ROOT/'references/viewer/fonts'
def data_url(path,mime):return 'data:'+mime+';base64,'+base64.b64encode(path.read_bytes()).decode()
font_json={
    'codepoint-index/plane0/0-ff.json':data_url(fonts/'latin-index.json','application/json'),
    'font-meta/latin.json':data_url(fonts/'latin-meta.json','application/json'),
}
font_files={f'latin/sans-serif.normal.{w}.woff':data_url(fonts/f'latin-sans-{w}.woff','font/woff') for w in [400,700]}
raw_js=bundle.read_text()
# The pinned native PCB viewer supports Canvas and WebGPU. Canvas keeps the
# portable PCB tab usable on machines without a WebGPU adapter; CAD is unchanged.
pcb_renderer_default='renderer:o="webgpu",initialState:i,allowEditing:r=!0'
if raw_js.count(pcb_renderer_default)==1:
    raw_js=raw_js.replace(pcb_renderer_default,'renderer:o="canvas",initialState:i,allowEditing:r=!0')
else:
    # Recent native viewers read their rendering-engine default from storage.
    pattern=r'([\w$]+\([\w$]+\.RENDERING_ENGINE,)"webgpu"(\))'
    marker=raw_js.index('.RENDERING_ENGINE,"webgpu"')
    context=raw_js[max(0,marker-60):marker+80]
    match=re.search(pattern,context)
    assert match is not None,'Renderer initialization changed'
    count=raw_js.count(match.group())
    raw_js=raw_js.replace(match.group(),re.sub(pattern,r'\1"canvas"\2',match.group()),1)
    assert count==1,'PCB renderer default changed; review pinned viewer packaging'
fetches=list(re.finditer(r'fetch\(([\w$]+)\+"/"\+([\w$]+)\)',raw_js))
font_marker=raw_js.index('+"/font-files/"')
font_context=raw_js[max(0,font_marker-60):font_marker+220]
fonts_expr=list(re.finditer(r'([\w$]+)\+"/font-files/"\+([\w$]+)\.id\+"/"\+([\w$]+)\+"\."\+([\w$]+)\+"\."\+([\w$]+)\+"\.woff"',font_context))
assert len(fetches)==len(fonts_expr)==1,'Viewer font transport changed; review packaging'
fetch_match=fetches[0];host,key=fetch_match.groups()
raw_js=raw_js.replace(fetch_match.group(),f'fetch(({script_json(font_json)})[{key}]||{host}+"/"+{key})',1)
font_match=fonts_expr[0];host,face,family,style,weight=font_match.groups()
font_key=f'{face}.id+"/"+{family}+"."+{style}+"."+{weight}+".woff"'
raw_js=raw_js.replace(font_match.group(),f'(({script_json(font_files)})[{font_key}]||{font_match.group()})',1)
js=re.sub(r'</script',lambda m:'<\\/script',raw_js,flags=re.I)
manifold=ROOT/'references/viewer/manifold-3.2.1'
loader=re.sub(r'</script',lambda m:'<\\/script',(manifold/'manifold.js').read_text(),flags=re.I)
wasm=base64.b64encode((manifold/'manifold.wasm').read_bytes()).decode()
preload=loader+"\nconst embeddedManifoldWasm="+json.dumps(wasm)+";\nwindow.ManifoldModule=()=>Module({wasmBinary:Uint8Array.from(atob(embeddedManifoldWasm),c=>c.charCodeAt(0))});\n"
html='''<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>NEMA14 RP2040 V2 — board preview</title>
<style>html,body{margin:0;height:100%;font:14px system-ui;background:#f8fafc;color:#172b35}#draft{height:42px;box-sizing:border-box;padding:11px 16px;background:#fff2cb;border-bottom:1px solid #b99c50}#root{height:calc(100% - 42px);width:100%}.loading{padding:32px}</style>
</head><body><div id="draft"><strong>V2 · 34.5 × 34.5 mm</strong> — Placement draft · Unrouted · Not for ordering</div>
<div id="root"><div class="loading">Loading tscircuit viewer…</div></div>
<script>
const embeddedAssets=ASSETS;
const assetUrls=Object.fromEntries(Object.entries(embeddedAssets).map(([key,data])=>[key,URL.createObjectURL(new Blob([Uint8Array.from(atob(data),c=>c.charCodeAt(0))],{type:'text/plain'}))]));
window.CIRCUIT_JSON=CIRCUIT;
for(const item of window.CIRCUIT_JSON){if(item.type==='cad_component'&&item.model_obj_url?.startsWith('embedded:'))item.model_obj_url=assetUrls[item.model_obj_url.slice(9)];}
window.CIRCUIT_JSON_PREVIEW_PROPS={defaultActiveTab:'pcb',showRightHeaderContent:true,readOnly:true,showFileMenu:false,showImportAndFormatButtons:false,allowSelectingVersion:false,availableTabs:['pcb','schematic','cad']};
window.addEventListener('error',e=>{console.error('Viewer error:',e.message)});
</script><script type="module">BUNDLE</script></body></html>'''
html=html.replace('ASSETS;',script_json(assets)+';',1).replace('CIRCUIT;',script_json(circuit)+';',1).replace('BUNDLE</script>',preload+js+'</script>',1)
html=html.replace('Placement draft · Unrouted · Not for ordering',html_escape.escape(args.notice),1)
html=html.replace('<title>',f'<!-- Source SHA256: {sha}; runframe {version}; models embedded, no manufacturing export. -->\n<title>',1)
output=args.output
output.parent.mkdir(parents=True,exist_ok=True)
output.write_text(html)
print(json.dumps({'path':str(output),'bytes':output.stat().st_size,'source_sha256':sha,'runframe_version':version,'embedded_obj_models':len(assets),'pcb_renderer':'native Canvas'}))
