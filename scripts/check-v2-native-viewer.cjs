const {chromium}=require('/opt/codex/runtimes/cua/lib/node_modules/playwright');
const fs=require('fs'),http=require('http'),crypto=require('crypto');
(async()=>{
 const root=require('path').resolve(__dirname,'..'),html=fs.readFileSync(root+'/artifacts/v2/assembly/NEMA14-V2-assembly-viewer.html'),errors=[],external=[],logs=[];
 const server=http.createServer((req,res)=>{if(req.url!=='/'){res.writeHead(204);return res.end()}res.writeHead(200,{'content-type':'text/html; charset=utf-8'});res.end(html)});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;let browser;
 try{
  browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader','--use-angle=swiftshader','--enable-unsafe-webgpu']});
  const page=await browser.newPage({viewport:{width:1440,height:1100}});page.setDefaultTimeout(180000);page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')logs.push(m.text())});
  await page.route(/^https?:\/\//,route=>{if(route.request().url().startsWith(origin+'/'))return route.continue();external.push(route.request().url());return route.abort()});
  await page.goto(origin+'/',{waitUntil:'domcontentloaded',timeout:120000});await page.locator('canvas').last().waitFor({state:'visible'});await page.waitForTimeout(35000);
  await page.mouse.move(1200,250);await page.mouse.wheel(0,550);await page.waitForTimeout(1500);
  console.log('3D loaded',await page.locator('body').innerText().then(t=>t.slice(0,450)));
  await page.screenshot({path:root+'/artifacts/v2/assembly/assembly-wago-connection.png'});
  const circuit=await page.evaluate(()=>{const j=window.CIRCUIT_JSON,s=Object.fromEntries(j.filter(e=>e.type==='source_component').map(e=>[e.source_component_id,e.name]));return {traces:j.filter(e=>e.type==='pcb_trace').length,cad:j.filter(e=>e.type==='cad_component').length,errors:j.filter(e=>e.type.endsWith('_error')).length,motor:j.find(e=>e.type==='cad_component'&&s[e.source_component_id]==='MOTOR_REFERENCE_CONCEPT'),leads:j.filter(e=>e.type==='source_component'&&e.name.startsWith('MOTOR_LEAD_PIN_')).map(e=>e.name),legacyJstPlug:j.some(e=>e.type==='source_component'&&e.name==='JST_SHR_04V_S_PLUG')}});
  await page.getByRole('tab',{name:'PCB',exact:true}).click();await page.waitForTimeout(2500);await page.screenshot({path:root+'/artifacts/v2/assembly/assembly-pcb.png'});
  const expected=JSON.parse(fs.readFileSync(root+'/assembly.circuit.json'));
  const sameNativeRecords=await page.evaluate(expected=>{const clean=rows=>rows.map(e=>Object.fromEntries(Object.entries(e).filter(([k])=>e.type!=='cad_component'||!['model_obj_url','model_glb_url','model_step_url'].includes(k))));return JSON.stringify(clean(window.CIRCUIT_JSON))===JSON.stringify(clean(expected))},expected);
  await page.getByRole('tab',{name:'Schematic',exact:true}).click();await page.waitForTimeout(1500);
  const source=fs.readFileSync(root+'/assembly.circuit.json'),report={passed:errors.length===0&&external.length===0&&circuit.traces===expected.filter(e=>e.type==='pcb_trace').length&&sameNativeRecords&&circuit.cad===106&&circuit.errors===0&&circuit.leads.length===4&&!circuit.legacyJstPlug,assembly_sha256:crypto.createHash('sha256').update(source).digest('hex'),html_sha256:crypto.createHash('sha256').update(html).digest('hex'),tested_at:new Date().toISOString(),views_tested:['3D','PCB','Schematic'],native_records_preserved_except_embedded_model_URLs:sameNativeRecords,browser_page_errors:errors,console_errors:logs,external_requests:external,circuit,scope:'Native viewer smoke and visual capture; rear retention and actual wire fit not qualified'};
  fs.writeFileSync(root+'/artifacts/v2/assembly/viewer-verification.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));if(!report.passed)process.exitCode=1;
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1});
