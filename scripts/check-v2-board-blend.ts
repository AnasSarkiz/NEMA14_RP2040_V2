/** Run the real unmodified Board Blend validator, including the dev.10 regression. */
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {execFileSync} from 'node:child_process'
import {resolve} from 'node:path'
const root=process.env.BOARD_BLEND_ROOT
if(!root)throw Error('Set BOARD_BLEND_ROOT to a checkout of tscircuit/board-blend')
const revision=execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8'}).trim()
const {validate}=await import(resolve(root,'service/src/validation.ts'))
const old=JSON.parse(readFileSync(process.argv[2]??'/tmp/nema14-dev10-published.json','utf8'))
let previousError=''
try{validate(old)}catch(e){previousError=(e as Error).message}
if(previousError!=='Model resource host is not allowed.')throw Error('dev.10 must reproduce the diagnosed error: '+previousError)
const checked=[]
for(const path of process.argv.slice(3).length?process.argv.slice(3):['artifacts/v2/routing/freerouted.circuit.json','artifacts/v2/source.circuit.json','assembly.circuit.json']){
 const bytes=readFileSync(path),rows=JSON.parse(bytes.toString());validate(rows)
 const negative=structuredClone(rows),cad=negative.find((e:any)=>e.type==='cad_component'&&e.model_obj_url)
 cad.model_obj_url='https://raw.githubusercontent.com/AnasSarkiz/NEMA14_RP2040_V2/main/model.obj'
 let rejected=false;try{validate(negative)}catch(e){rejected=(e as Error).message===previousError}
 if(!rejected)throw Error('Negative host control failed')
 checked.push({path,sha256:createHash('sha256').update(bytes).digest('hex'),passed:true,github_negative_control_rejected:true})
}
const proof={passed:true,validator_repository:'https://github.com/tscircuit/board-blend',validator_revision:revision,validator_sha256:createHash('sha256').update(readFileSync(resolve(root,'service/src/validation.ts'))).digest('hex'),dev10_reproduced_error:previousError,checked}
writeFileSync('artifacts/v2/model-hosting/board-blend-verification.json',JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify(proof,null,2))
