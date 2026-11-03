import { readFileSync, writeFileSync } from "node:fs"
import { createHash } from "node:crypto"
import { convertCircuitJsonToExcellonDrillCommands, stringifyExcellonDrill } from "circuit-json-to-gerber"

// Diagnostic NPTH conversion only. This is not a manufacturing export.
const source=process.argv[2]??"artifacts/v2/source.circuit.json"
const json=JSON.parse(readFileSync(source,"utf8"))
const commands=convertCircuitJsonToExcellonDrillCommands({circuitJson:json,is_plated:false})
const slots=commands.filter(c=>c.command_code==="G85")
if(slots.length!==2)throw Error(`Expected one NPTH slot per USB connector, got ${slots.length}`)
// Board-level clearance adaptation; supplier import remains 1.5099792 × .7099808.
const diameter=1,length=1.7999984
for(const slot of slots){
  if(Math.abs(slot.width-diameter)>1e-6)throw Error("USB slot cutter diameter changed")
  const index=commands.indexOf(slot),start=commands[index-1] as any
  if(start.command_code!=="drill_at")throw Error("USB slot lacks its start point")
  if(Math.abs(Math.hypot(slot.x-start.x,slot.y-start.y)+diameter-length)>1e-6)throw Error("USB routed slot length changed")
}
// A correct slot count and cutter size do not prove orientation. Check each
// exported tool path against the connector's actual round-to-slotted peg axis.
const sources=new Map(json.filter((e:any)=>e.type==="source_component").map((e:any)=>[e.source_component_id,e.name]))
const connectors=json.filter((e:any)=>e.type==="pcb_component"&&["J_PD","J_DATA"].includes(sources.get(e.source_component_id) as string))
const orientations=[]
for(const component of connectors){
  const holes=json.filter((e:any)=>e.type==="pcb_hole"&&e.pcb_component_id===component.pcb_component_id)
  const round=holes.find((e:any)=>e.hole_shape==="circle")
  const slot=holes.find((e:any)=>["pill","rotated_pill"].includes(e.hole_shape))
  if(!round||!slot)throw Error("Supplier locating slot must be a capsule, not an ellipse")
  const dx=slot.x-round.x,dy=slot.y-round.y,pegDistance=Math.hypot(dx,dy)
  const theta=((slot.ccw_rotation??0)+(slot.hole_height>slot.hole_width?90:0))*Math.PI/180
  if(Math.abs(dx*Math.sin(theta)-dy*Math.cos(theta))/pegDistance>1e-6)
    throw Error("USB slot axis does not rotate with its connector: "+sources.get(component.source_component_id))
  const exported=slots.find((entry:any)=>{
    const start=commands[commands.indexOf(entry)-1] as any
    return Math.hypot((entry.x+start.x)/2-slot.x,(entry.y+start.y)/2-slot.y)<1e-6
  })
  if(!exported)throw Error("No drill tool path at the supplier slot centre")
  const start=commands[commands.indexOf(exported)-1] as any
  const ex=exported.x-start.x,ey=exported.y-start.y
  if(Math.abs(ex*dy-ey*dx)/(Math.hypot(ex,ey)*pegDistance)>1e-6)
    throw Error("Exported USB drill slot is rotated incorrectly")
  orientations.push({reference:sources.get(component.source_component_id),shape:slot.hole_shape,
    ccw_rotation_deg:slot.ccw_rotation??0,exported_tool_start_mm:[start.x,start.y],
    exported_tool_end_mm:[exported.x,exported.y],slot_axis_matches_connector:true})
}
if(orientations.length!==2)throw Error("Expected both USB connectors")
const report={purpose:"Diagnostic NPTH conversion only; not order files",usb_slot_count:slots.length,
  source,source_sha256:createHash("sha256").update(readFileSync(source)).digest("hex"),
  slot_overall_mm:[length,diameter],uses_excellon_routed_slots:true,orientations}
writeFileSync("artifacts/v2/usb-slot-export-check.json",JSON.stringify(report,null,2)+"\n")
writeFileSync("artifacts/v2/diagnostic-npth-not-for-order.drl",stringifyExcellonDrill(commands))
console.log(JSON.stringify(report))
