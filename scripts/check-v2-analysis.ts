import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { runAllPinSpecificationChecks, runAllSchematicChecks } from '@tscircuit/checks'

const path=process.argv[2]??'artifacts/v2/routing/freerouted.circuit.json'
const bytes=readFileSync(path),json=JSON.parse(bytes.toString())
const raw=JSON.parse(readFileSync('artifacts/v2/raw.circuit.json','utf8'))
const saved=json.filter((e:any)=>e.type.endsWith('_warning')||e.type.endsWith('_error'))
const rawSource=raw.filter((e:any)=>e.type.startsWith('source_')&&(e.type.endsWith('_warning')||e.type.endsWith('_error')))
const schematic=await runAllSchematicChecks(json)
const pins=await runAllPinSpecificationChecks(json)

// A real underspecified IC must still be diagnosed. Clearing import warnings
// must not disable source analysis or remove its warnings globally.
const negativeControl:any[]=[
 {type:'source_component',source_component_id:'control_ic',ftype:'simple_chip',name:'U_UNSPECIFIED'},
 {type:'source_port',source_port_id:'control_vdd',source_component_id:'control_ic',pin_number:1,name:'VDD'},
 {type:'source_port',source_port_id:'control_gnd',source_component_id:'control_ic',pin_number:2,name:'GND'},
]
const control=await runAllPinSpecificationChecks(negativeControl)
const expected=['source_no_power_pin_defined_warning','source_no_ground_pin_defined_warning','source_component_pins_underspecified_warning']
const controlWorks=expected.every(type=>control.some(e=>e.type===type))
const padComponents=json.filter((e:any)=>e.type==='source_component'&&e.ftype==='simple_test_point')
const barePadsRetained=padComponents.length===7&&padComponents.every((source:any)=>{
 const component=json.find((e:any)=>e.type==='pcb_component'&&e.source_component_id===source.source_component_id)
 return component?.do_not_place&&json.some((e:any)=>e.type==='pcb_smtpad'&&e.pcb_component_id===component.pcb_component_id)
})
const report={passed:saved.length===0&&rawSource.length===0&&schematic.length===0&&pins.length===0&&controlWorks&&barePadsRetained,
 source_sha256:createHash('sha256').update(bytes).digest('hex'),
 saved_diagnostics:saved,raw_source_diagnostics:rawSource,schematic_diagnostics:schematic,pin_diagnostics:pins,
 negative_control_detects_missing_pin_specifications:controlWorks,
 negative_control_warning_types:control.map(e=>e.type),seven_bare_pads_retained_and_excluded_from_assembly:barePadsRetained,
 scope:'Fresh source/pin/schematic diagnostics; physical copper and manufacturing acceptance are checked separately.'}
writeFileSync('artifacts/v2/routing/analysis-verification.json',JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify(report,null,2))
if(!report.passed)process.exitCode=1
