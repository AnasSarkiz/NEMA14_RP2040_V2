import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs"
import { createHash } from "node:crypto"
import { execFileSync } from "node:child_process"
import { convertCircuitJsonToGltf } from "circuit-json-to-gltf"
const assemblyOut=process.argv.includes("--v2")?"artifacts/v2/assembly":"artifacts/top-assembly"
const root=process.cwd(), cache="/tmp/nema14-assembly-model-cache"
mkdirSync(cache,{recursive:true})
const nativeFetch=globalThis.fetch
const modelDownloads:any[]=[]
globalThis.fetch=(async(input:any,init:any)=>{
 const url=String(input instanceof Request?input.url:input)
 let local=url.startsWith(root+"/")?url:undefined
 const marker="/imports/supplier/",at=url.indexOf(marker)
 if(at>=0) local=root+url.slice(at)
 if(local && existsSync(local)) return new Response(readFileSync(local),{status:200})
 if(url.startsWith("https://modelcdn.tscircuit.com/")){
  const dest=cache+"/"+createHash("sha256").update(url).digest("hex")
  if(!existsSync(dest)){
   execFileSync("python3",["-c","import urllib.request,sys;open(sys.argv[2],'wb').write(urllib.request.urlopen(sys.argv[1],timeout=90).read())",url,dest])
  }
  const bytes=readFileSync(dest);modelDownloads.push({url,sha256:createHash("sha256").update(bytes).digest("hex"),bytes:bytes.length})
  return new Response(bytes,{status:200})
 }
 return nativeFetch(input,init)
}) as typeof fetch
const j=JSON.parse(readFileSync("assembly.circuit.json","utf8"))
const result=await convertCircuitJsonToGltf(j,{format:"glb",boardTextureResolution:1600,includeModels:true})
writeFileSync(`${assemblyOut}/assembled.glb`,Buffer.from(result as ArrayBuffer))
writeFileSync(`${assemblyOut}/model-downloads.json`,JSON.stringify(modelDownloads,null,2)+"\n")
console.log(JSON.stringify({exported:`${assemblyOut}/assembled.glb`,bytes:(result as ArrayBuffer).byteLength,models:modelDownloads.length}))
