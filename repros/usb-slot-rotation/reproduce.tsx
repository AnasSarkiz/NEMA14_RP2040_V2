import React from "react"
import { Circuit } from "tscircuit"
import { writeFileSync, readFileSync, mkdirSync } from "node:fs"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { convertCircuitJsonToExcellonDrillCommands, stringifyExcellonDrill } from "circuit-json-to-gerber"
mkdirSync("results",{recursive:true})
const c = new Circuit()
c.pcbRoutingDisabled = true
c.add(<board width={24} height={16} routingDisabled>
  {(["oval", "pill"] as const).flatMap((shape, row) => [0,90].map(rotation =>
    <chip key={`${shape}-${rotation}`} name={`J_${shape}_${rotation}`} pcbX={rotation ? 5 : -5} pcbY={row ? -4 : 4} pcbRotation={rotation}
      footprint={<footprint><hole pcbX={2} pcbY={0} shape={shape} width={1.51} height={0.71} /></footprint>} />))}
</board>)
await c.renderUntilSettled()
const json = c.getCircuitJson()
writeFileSync("results/slot-rotation-probe.circuit.json",JSON.stringify(json,null,2)+"\n")
writeFileSync("results/slot-rotation-probe.svg",convertCircuitJsonToPcbSvg(json,{layer:"top"}))
const holes=json.filter(e=>e.type==='pcb_hole')
const commands=convertCircuitJsonToExcellonDrillCommands({circuitJson:json,is_plated:false})
writeFileSync("results/slot-rotation-probe.drl", stringifyExcellonDrill(commands))
console.log(JSON.stringify({versions:Object.fromEntries(['tscircuit','@tscircuit/core','@tscircuit/cli','circuit-to-svg','circuit-json-to-gerber'].map(name=>[name,JSON.parse(readFileSync(`node_modules/${name}/package.json`,'utf8')).version])),holes,commands:commands.filter(x=>['G85','drill_at'].includes(x.command_code))},null,2))

const oval90=holes[1] as any, pill90=holes[3] as any
if(oval90.hole_shape!=="oval" || (oval90.ccw_rotation??0)!==0) throw new Error("Oval bug no longer reproduces; check the new behavior")
if(pill90.hole_shape!=="rotated_pill" || pill90.ccw_rotation!==90) throw new Error("Pill control does not rotate correctly")
console.log("REPRODUCED: oval ignores the parent 90-degree rotation; pill control is correct")
