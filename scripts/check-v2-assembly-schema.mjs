import {checkRecords} from './check-native-schema.mjs'
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
const bytes=readFileSync('assembly.circuit.json'),j=JSON.parse(bytes),errors=checkRecords(j)
const report={passed:errors.length===0,assembly_sha256:createHash('sha256').update(bytes).digest('hex'),records_checked:j.length,errors}
writeFileSync('artifacts/v2/assembly/schema-verification.json',JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify({passed:report.passed,records_checked:report.records_checked,errors:report.errors.slice(0,5)}))
if(errors.length)process.exitCode=1
