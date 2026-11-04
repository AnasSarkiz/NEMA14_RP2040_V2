import markings from '../src/critical-markings.json'

/** Deliberate artwork selection, independent of electrical/source diagnostics. */
export function prepareV2Silkscreen(records:any[]){
 const names=new Set(records.filter(e=>e.type==='source_component').map(e=>e.name))
 const legacy=new Set(['NEMA14 RP2040 V2','MOTOR','1 A+','2 A-','3 B+','4 B-','PWR','DATA'])
 // Source designators remain in the BOM, schematic and assembly records. Only
 // their crowded printed footprint captions are omitted from this small PCB.
 const result=records.filter(e=>!(e.type==='pcb_silkscreen_text'&&(names.has(e.text)||legacy.has(e.text)||e.pcb_silkscreen_text_id?.startsWith("v2_critical_"))))
 const owner=records.find(e=>e.type==='pcb_component'&&e.source_component_id===records.find(e=>e.type==='source_component'&&e.name==='U_MCU')?.source_component_id)
 for(const m of markings)result.push({type:'pcb_silkscreen_text',pcb_silkscreen_text_id:'v2_critical_'+m.id,
  anchor_alignment:'center',anchor_position:{x:m.x,y:m.y},font:'tscircuit2024',font_size:m.font_size,
  layer:m.layer,text:m.text,ccw_rotation:m.rotation,pcb_component_id:owner.pcb_component_id,subcircuit_id:owner.subcircuit_id,
  ...('is_knockout' in m&&m.is_knockout?{is_knockout:true,knockout_padding:m.knockout_padding}:{})})
 return result
}
