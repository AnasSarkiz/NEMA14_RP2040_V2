import { readFileSync,writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { convertCircuitJsonToGerberCommands } from 'circuit-json-to-gerber'
import { prepareV2Silkscreen } from './prepare-v2-silkscreen'
const path=process.argv[2]??'artifacts/v2/routing/freerouted.circuit.json'
const bytes=readFileSync(path),original=JSON.parse(bytes.toString())
const j=process.argv.includes("--proposed")?prepareV2Silkscreen(original):original
if(!j.some((e:any)=>e.pcb_silkscreen_text_id==='v2_critical_power-port'))throw Error("Critical markings missing from actual board")
const board=j.find((e:any)=>e.type==='pcb_board')
const exports=j.filter((e:any)=>e.type==='pcb_silkscreen_text'&&e.pcb_silkscreen_text_id.startsWith('v2_critical_')).map((text:any)=>{
 const cmds=convertCircuitJsonToGerberCommands([board,text] as any)[text.layer==='top'?'F_SilkScreen':'B_SilkScreen']
 const apertures=new Map<number,number>();let diameter=0,point:any;const segments:any[]=[]
 for(const c of cmds as any[]){
  if(c.command_code==='ADD')apertures.set(c.aperture_number,c.diameter)
  if(c.command_code==='D')diameter=apertures.get(c.aperture_number)??0
  if(c.command_code==='D01'){segments.push({a:point,b:{x:c.x,y:c.y},width:diameter});point={x:c.x,y:c.y}}
  if(c.command_code==='D02')point={x:c.x,y:c.y}
 }
 return {id:text.pcb_silkscreen_text_id,text:text.text,layer:text.layer,anchor:text.anchor_position,rotation:text.ccw_rotation,font_size:text.font_size,segments}
})
writeFileSync('/tmp/nema14-critical-ink.json',JSON.stringify({source_sha256:createHash('sha256').update(bytes).digest('hex'),labels:exports},null,2)+'\n')
console.log('Exported actual Gerber ink:',exports.length,'critical labels')
