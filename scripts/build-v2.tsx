import React from "react"
import { Circuit } from "tscircuit"
import { mkdirSync, writeFileSync, readFileSync } from "node:fs"
import { convertCircuitJsonToPcbSvg, convertCircuitJsonToSchematicSvg } from "circuit-to-svg"
import { execFileSync } from "node:child_process"
import { Resvg } from "@resvg/resvg-js"
const cleanSvg=(svg:string)=>svg.replace(/[ \t]+$/gm,"")
import Board from "../src/board"
import { classifySource } from "./classify-source"
import { prepareSchematic } from "./prepare-schematic"
import { normalizeMetadata } from "./normalize-metadata"
import { prepareV2Silkscreen } from "./prepare-v2-silkscreen"
import { prepareV2UsbDrills } from "./prepare-v2-usb-drills"

// V2 is deliberately separate from the qualified V1 CAM and publication scripts.
// A source preview has no routed copper and cannot be submitted for fabrication.
const circuit = new Circuit()
circuit.pcbRoutingDisabled = true
circuit._featureMspSchematicTraceRouting = false
circuit.add(<Board routingDisabled />)
await circuit.renderUntilSettled()
const raw = prepareV2Silkscreen(prepareV2UsbDrills(normalizeMetadata(classifySource(circuit.getCircuitJson()))))
mkdirSync("artifacts/v2", {recursive:true})
writeFileSync("artifacts/v2/raw.circuit.json", JSON.stringify(raw,null,2)+"\n")
const json = prepareSchematic(raw)
writeFileSync("artifacts/v2/source.circuit.json", JSON.stringify(json,null,2)+"\n")
writeFileSync("index.circuit.json", JSON.stringify(json,null,2)+"\n")
writeFileSync("artifacts/board.circuit.json", JSON.stringify(json,null,2)+"\n")
if (!process.argv.includes("--geometry-only")) {
writeFileSync("artifacts/v2/top.svg", cleanSvg(convertCircuitJsonToPcbSvg(json,{layer:"top"})))
writeFileSync("artifacts/v2/bottom.svg", cleanSvg(convertCircuitJsonToPcbSvg(json,{layer:"bottom"})))
for(const sheet of json.filter(e=>e.type==="schematic_sheet")){
  const svg=cleanSvg(convertCircuitJsonToSchematicSvg(json,{width:2970,height:2100,schematicSheetId:sheet.schematic_sheet_id}))
  const suffix=String(sheet.sheet_index).padStart(2,"0")
  writeFileSync(`artifacts/v2/schematic-${suffix}.svg`,svg)
  if(sheet.sheet_index===7)writeFileSync("artifacts/v2/current-sensing.png",new Resvg(svg,{fitTo:{mode:"width",value:1800}}).render().asPng())
}
for(const layer of ["top","bottom"]){
  const svg=convertCircuitJsonToPcbSvg(json,{layer:layer as "top"|"bottom"})
  writeFileSync(`artifacts/v2/${layer}.png`,new Resvg(svg,{fitTo:{mode:"width",value:1200}}).render().asPng())
}
execFileSync("python3",["scripts/render-v2-placement.py"],{stdio:"inherit"})
writeFileSync("artifacts/v2/placement.png",new Resvg(readFileSync("artifacts/v2/placement.svg","utf8"),{fitTo:{mode:"width",value:1500}}).render().asPng())
}
const errors = raw.filter(e=>e.type.endsWith("_error"))
console.log(JSON.stringify({stage:"unrouted engineering draft",elements:json.length,errors},null,2))
if(errors.length) process.exitCode=1
else execFileSync("python3",["scripts/restore-v2-reviewed-routing.py","--if-current"],{stdio:"inherit"})
