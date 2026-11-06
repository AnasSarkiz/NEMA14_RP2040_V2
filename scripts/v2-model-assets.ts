import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {createHash} from 'node:crypto'
import manifest from '../src/model-cdn-manifest.json'

export function localModelAsset(url:string):string|undefined {
 const found=Object.entries(manifest.assets).find(([,asset])=>asset.url===url)
 if(!found)return undefined
 const [relative,asset]=found,path=resolve(relative)
 if(createHash('sha256').update(readFileSync(path)).digest('hex')!==asset.sha256)throw Error('CAD asset differs: '+relative)
 return path
}

// Core adds a viewer-origin cache buster. Export the exact verified CDN URLs.
export function normalizeV2ModelUrls(rows:any[]) {
 const known=new Set(Object.values(manifest.assets).map(a=>a.url))
 for(const e of rows){
  if(e.type!=='cad_component')continue
  for(const key of ['model_obj_url','model_step_url','model_glb_url']){
   if(!e[key])continue
   const url=new URL(e[key]);url.searchParams.delete('cachebust_origin')
   const canonical=url.toString()
   if(!known.has(canonical))throw Error('Unverified V2 model URL: '+canonical)
   e[key]=canonical
  }
 }
 return rows
}
