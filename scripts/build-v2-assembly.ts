import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {getV2MotorHarness} from '../src/v2-motor-harness'
const bytes=readFileSync('artifacts/v2/routing/freerouted.circuit.json'),board=JSON.parse(bytes.toString()),baseline=JSON.parse(readFileSync('artifacts/v1-ordered/assembly.circuit.json','utf8'))
const sources=new Map(baseline.filter((e:any)=>e.type==='source_component').map((e:any)=>[e.source_component_id,e]))
const extras:any[]=[]
const add=(name:string,cad:any,ftype='subassembly',display_name=name)=>{
 const id='v2_assembly_source_'+name
 extras.push({type:'source_component',source_component_id:id,ftype,name,display_name},{...cad,type:'cad_component',cad_component_id:'v2_assembly_cad_'+name,source_component_id:id})
}
const original=(name:string)=>structuredClone(baseline.find((e:any)=>e.type==='cad_component'&&(sources.get(e.source_component_id) as any)?.name===name))
const motor=original('MOTOR_REFERENCE_CONCEPT');motor.model_glb_url=JSON.parse(readFileSync('imports/assembly/provenance.json','utf8')).url;motor.rotation.z=180
add('MOTOR_REFERENCE_CONCEPT',motor,'motor','14HM11-0404S dimensional reference; rear retention and outlet detail unverified')
// Rear fasteners in the reference model occupy the proposed spacer centres.
// Omit mounting hardware until the real rear interface is qualified.
const h=getV2MotorHarness(board)
const cadBase={position:{x:0,y:0,z:0},rotation:{x:0,y:0,z:0},layer:'top',model_origin_position:{x:0,y:0,z:0},model_unit_to_mm_scale_factor:1,model_object_fit:'contain_within_bounds',anchor_alignment:'center',show_as_translucent_model:false}
for(const w of h.wires){
 add('MOTOR_LEAD_PIN_'+w.pin,{...cadBase,model_jscad:w.wirePlan},'subassembly',`${w.color} ${w.net}: direct bare lead into WAGO pin ${w.pin}`)
 add('WAGO_CONDUCTOR_PIN_'+w.pin,{...cadBase,model_jscad:w.tipPlan},'subassembly','Partial visible conductor; full strip depth not modeled')
}
const output=[...board,...extras];if(JSON.stringify(output.slice(0,board.length))!==JSON.stringify(board))throw Error('PCB changed')
mkdirSync('artifacts/v2/assembly',{recursive:true})
writeFileSync('assembly.circuit.json',JSON.stringify(output,null,2)+'\n')
const definition={...h,wires:h.wires.map(({wirePlan,tipPlan,...w})=>w),board_sha256:createHash('sha256').update(bytes).digest('hex')}
writeFileSync('artifacts/v2/assembly/harness-definition.json',JSON.stringify(definition,null,2)+'\n')
console.log(JSON.stringify({mechanical_parts:extras.length/2,PCB_records_preserved:true,board_sha256:definition.board_sha256}))
