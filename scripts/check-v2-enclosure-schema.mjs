import {checkRecords} from './check-native-schema.mjs'
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
const bytes=readFileSync('enclosure-concept.circuit.json'),j=JSON.parse(bytes),errors=checkRecords(j)
const report={passed:!errors.length,enclosure_sha256:createHash('sha256').update(bytes).digest('hex'),records_checked:j.length,errors}
writeFileSync('artifacts/v2/enclosure/schema-verification.json',JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify({passed:report.passed,records_checked:j.length,errors:errors.slice(0,5)}));if(errors.length)process.exitCode=1
