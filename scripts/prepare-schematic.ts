/** Functional A4 drawings. Electrical, PCB and CAD records are immutable inputs. */
import { symbols } from 'schematic-symbols'
type P={x:number,y:number}
type Placement={name:string,x:number,y:number,section:string,symbol?:string,box?:[number,number],left?:string[],right?:string[],top?:string[],bottom?:string[],spacing?:number}
export function prepareSchematic(json:any[]) {
 const source=new Map<string,any>(json.filter(e=>e.type==='source_component').map(e=>[e.source_component_id,e]))
 const ports=json.filter(e=>e.type==='source_port');const byName=new Map<string,any>([...source.values()].map(e=>[e.name,e]))
 const oldComponents=new Map<string,any>(json.filter(e=>e.type==='schematic_component').map(e=>[source.get(e.source_component_id).name,e]))
 const oldPorts=new Map<string,any>(json.filter(e=>e.type==='schematic_port').map(e=>[e.source_port_id,e]))
 const nets=new Map<string,any>(json.filter(e=>e.type==='source_net').map(e=>[e.subcircuit_connectivity_map_key,e]))
 const groups=new Map<string,any[]>()
 for(const p of ports)if(p.subcircuit_connectivity_map_key){const k=p.subcircuit_connectivity_map_key;groups.set(k,[...(groups.get(k)??[]),p])}
 for(const [key,ps]of groups)if(!nets.has(key)&&ps.length>1)nets.set(key,{name:ps.find(p=>!/^pin\d/.test(p.name))?.name??ps[0].name,subcircuit_connectivity_map_key:key})
 const rp=byName.get('U_MCU').manufacturer_part_number==='RP2040';const project=rp?'RP2040':'CH32X035'
 const out=json.filter(e=>!e.type.startsWith('schematic_'));let seq=0,sheet='';const placed=new Map<string,any>();const sections=new Map<string,any[]>();const connected=new Set<string>();const annotated=new Set<string>();const netAnnotated=new Set<string>();const localComplete=new Set<string>()
 const point=(x:number,y:number)=>({x,y});const text=(value:string,x:number,y:number,size=.23,anchor='left',component?:string)=>out.push({type:'schematic_text',schematic_text_id:`pro_text_${seq++}`,schematic_sheet_id:sheet,text:value,position:point(x,y),rotation:0,font_size:size,anchor,color:'#17465b',...(component?{schematic_component_id:component}:{})})
 const line=(a:P,b:P,color='#85929b',dashed=false)=>out.push({type:'schematic_line',schematic_line_id:`pro_line_${seq++}`,schematic_sheet_id:sheet,x1:a.x,y1:a.y,x2:b.x,y2:b.y,stroke_width:.012,color,is_dashed:dashed})
 const label=(p:any,end:P,side:string,power=false)=>{
  const n=nets.get(p.subcircuit_connectivity_map_key);if(!n?.source_net_id)return
  const id=n.source_net_id??`direct_${n.name}`
  // Direct networks retain their source connectivity key; no fabricated source-net records.
  out.push({type:'schematic_net_label',schematic_net_label_id:`pro_net_${seq++}`,schematic_sheet_id:sheet,...(n.source_net_id?{source_net_id:id}:{}),subcircuit_connectivity_map_key:n.subcircuit_connectivity_map_key,text:n.name,anchor_position:end,center:power?point(end.x,end.y+(n.name==='GND'?-.09:.09)):end,anchor_side:power?side:(side==='top'||side==='bottom'?'left':side),...(power?{symbol_name:n.name==='GND'?'rail_down':'rail_up'}:{})});annotated.add(p.source_port_id);netAnnotated.add(p.section+'|'+p.subcircuit_connectivity_map_key)
 }
 const wire=(ps:P[],p:any,pids:string[]=[])=>{
  const clean=ps.filter((v,i)=>!i||Math.abs(v.x-ps[i-1].x)+Math.abs(v.y-ps[i-1].y)>1e-7);if(clean.length<2)return
  const st=json.find(e=>e.type==='source_trace'&&e.subcircuit_connectivity_map_key===p.subcircuit_connectivity_map_key&&e.connected_source_port_ids?.includes(p.source_port_id))
  out.push({type:'schematic_trace',schematic_trace_id:`pro_trace_${seq++}`,schematic_sheet_id:sheet,source_trace_id:st?.source_trace_id,subcircuit_connectivity_map_key:p.subcircuit_connectivity_map_key,edges:clean.slice(1).map((v,i)=>({from:clean[i],to:v,...(i===0&&pids[0]?{from_schematic_port_id:oldPorts.get(pids[0])?.schematic_port_id}:{}),...(i===clean.length-2&&pids[1]?{to_schematic_port_id:oldPorts.get(pids[1])?.schematic_port_id}:{})})),junctions:[]})
 }
 const part=(v:Placement)=>{
  if(!byName.has(v.name))return
  const s=byName.get(v.name),old=oldComponents.get(v.name);if(!old)throw Error('Missing native symbol '+v.name)
  const physical=ports.filter(p=>p.source_component_id===s.source_component_id).sort((a,b)=>a.pin_number-b.pin_number)
  const duplicates:Record<string,string>={GND3:'GND1',GND4:'GND2',VBUS3:'VBUS1',VBUS4:'VBUS2'}
  const ps=physical.filter(p=>{
   if(oldPorts.has(p.source_port_id))return true
   if(s.standard==='usb_c'&&duplicates[p.name]){
    const canonical=physical.find(q=>q.name===duplicates[p.name])
    if(!canonical||!oldPorts.has(canonical.source_port_id)||!p.subcircuit_connectivity_map_key||p.subcircuit_connectivity_map_key!==canonical.subcircuit_connectivity_map_key)throw Error('Unsafe USB power-contact aggregation '+v.name+'.'+p.name)
    return false
   }
   if(v.name==='J_MOTOR'&&['MOUNT1','MOUNT2'].includes(p.name)&&!p.subcircuit_connectivity_map_key)return false
   throw Error('Missing native schematic pin '+v.name+'.'+p.name)
  })
  const center=point(v.x,v.y);const nativeUsb=s.standard==='usb_c';let symbol=v.symbol
  if(v.name.startsWith('TP_'))symbol='testpoint_right'
  if(!symbol&&/^[CR]_/.test(v.name))symbol=v.name.startsWith('C_')?'capacitor_down':'boxresistor_down'
  if(!symbol&&v.name==='L_BUCK')symbol='inductor_right'
  const def=symbol?(symbols as any)[symbol]:undefined;if(symbol&&!def)throw Error('Unknown symbol '+symbol)
  const scale=1.25;const size=nativeUsb?{width:2.2,height:3.6}:def?{width:def.size.width*scale,height:def.size.height*scale}:{width:v.box?.[0]??3.2,height:v.box?.[1]??Math.max(2,Math.ceil(ps.length/2)*.43+.8)}
  const groupId=`pro_group_${sheet}_${v.section}`;
  if(!out.some(e=>e.type==='schematic_group'&&e.schematic_group_id===groupId))out.push({type:'schematic_group',schematic_group_id:groupId,name:v.section,source_group_id:json.find(e=>e.type==='source_group')?.source_group_id,center:point(0,0),width:0,height:0,schematic_component_ids:[],show_as_schematic_box:false});
  const comp={...old,schematic_group_id:groupId,center,size,schematic_sheet_id:sheet,...(nativeUsb?{}:{is_box_with_pins:true,pin_spacing:.43}),...(def?{symbol_name:symbol,symbol_display_value:s.display_resistance??s.display_capacitance??s.display_inductance??(v.name==='Y_MCU'?'12 MHz':s.manufacturer_part_number)}:{})};if(!def&&!nativeUsb)delete comp.symbol_name;out.push(comp)
  if(v.name.startsWith('J_MOTOR')&&s.manufacturer_part_number==='1770953')text('Two PCB contacts per pole; pairs joined on board',v.x-size.width/2,v.y-size.height/2-.8,.17)
  if(!def){text(v.name,v.x-size.width/2,v.y+size.height/2+.38,.27,'left',comp.schematic_component_id);text(s.manufacturer_part_number??'PCB contacts',v.name==='BZ1'?v.x+2:nativeUsb?v.x+size.width/2+1.8:v.x-size.width/2,v.name==='BZ1'?v.y+.9:nativeUsb?v.y-size.height/2-.15:v.y-size.height/2-.38,.21,'left',comp.schematic_component_id)}
  let left=v.left??ps.slice(0,Math.ceil(ps.length/2)).map(p=>p.name);let right=v.right??ps.filter(p=>!left.includes(p.name)).map(p=>p.name)
  if(v.left||v.right){const remaining=ps.filter(p=>!left.includes(p.name)&&!right.includes(p.name)).map(p=>p.name);right=[...right,...remaining.filter(n=>!v.top?.includes(n)&&!v.bottom?.includes(n))]}
  const boxSpacing=v.spacing??Math.min(.46,(size.height-.65)/Math.max(left.length,right.length,1));const newps:any[]=[]
  for(const p of ps){const op=oldPorts.get(p.source_port_id);if(!op)throw Error('Missing source port '+v.name+'.'+p.name);let local:P,direction:string
   if(nativeUsb){direction=op.facing_direction;local=point(op.center.x-old.center.x+(direction==='right'?(size.width-old.size.width)/2:direction==='left'?-(size.width-old.size.width)/2:0),op.center.y-old.center.y+(direction==='up'?(size.height-old.size.height)/2:direction==='down'?-(size.height-old.size.height)/2:0))}
   else if(def){
    let target=p.name;let lp:any
    if(/^Q_STATUS/.test(v.name))target=({G:'gate',D:'drain',S:'source',pin1:'gate',pin2:'drain',pin3:'source'} as any)[p.name]
    else if(v.name==='Q_BUZZER')target=({G:'gate',D:'drain',S:'source',pin1:'gate',pin2:'drain',pin3:'source'} as any)[p.name]
    else if(v.name.startsWith('TP_'))target='1'
    else if(v.name.startsWith('D_'))target=/cathode|NEG/.test(p.name)?'cathode':/anode|POS/.test(p.name)?'anode':p.pin_number===1?'anode':'cathode'
    lp=def.ports.find((a:any)=>a.labels.includes(target))??def.ports.find((a:any)=>a.labels.includes(String(p.pin_number)))
    if(!lp)throw Error('Symbol pin mapping '+v.name+'.'+p.name)
    local=point((lp.x-def.center.x)*scale,(lp.y-def.center.y)*scale)
    const vertical=Math.abs(local.y)>Math.abs(local.x);direction=vertical?(local.y>0?'up':'down'):(local.x>0?'right':'left')
   }else{const isTop=v.top?.includes(p.name),isBottom=v.bottom?.includes(p.name);if(isTop||isBottom){const arr=isTop?v.top!:v.bottom!,i=arr.indexOf(p.name);local=point((i-(arr.length-1)/2)*.5,(isTop?1:-1)*(size.height/2+.35));direction=isTop?'up':'down'}else{const isLeft=left.includes(p.name),arr=isLeft?left:right;const i=arr.indexOf(p.name);local=point((isLeft?-1:1)*(size.width/2+.35),((arr.length-1)/2-i)*boxSpacing);direction=isLeft?'left':'right'}}
   // Native USB pins retain their actual edge offset when the box is resized.
   const sp={...op,center:point(center.x+local.x,center.y+local.y),schematic_sheet_id:sheet,facing_direction:direction,side_of_component:direction==='up'?'top':direction==='down'?'bottom':direction,display_pin_label:p.name,display_pin_label_font_size:.21,distance_from_component_edge:def?0:nativeUsb?Number((Math.abs(direction==='left'||direction==='right'?local.x:local.y)-(direction==='left'||direction==='right'?size.width:size.height)/2).toFixed(9)):.35};out.push(sp);newps.push({...p,sch:sp,part:v.name,section:v.section})
  }
  placed.set(v.name,{comp,ports:newps,section:v.section});sections.set(v.section,[...(sections.get(v.section)??[]),...newps])
 }
 const port=(ref:string)=>{const [n,p]=ref.split('.');const found=placed.get(n)?.ports.find((v:any)=>v.name===p||String(v.pin_number)===p);if(!found)throw Error('Pin '+ref);return found}
 const connect=(refs:string[],points:P[]=[])=>{
  const ps=refs.map(port),key=ps[0].subcircuit_connectivity_map_key;if(!key||ps.some(p=>p.subcircuit_connectivity_map_key!==key))throw Error('Schematic net mismatch '+refs.join(' '))
  for(let i=1;i<ps.length;i++){const raw=[ps[0].sch.center,...points,ps[i].sch.center],orth:P[]=[raw[0]];for(const q of raw.slice(1)){const a=orth[orth.length-1];if(Math.abs(a.x-q.x)>1e-7&&Math.abs(a.y-q.y)>1e-7)orth.push(point(a.x,q.y));orth.push(q)}wire(orth,ps[0],[ps[0].source_port_id,ps[i].source_port_id])};for(const p of ps)connected.add(p.source_port_id);localComplete.add(ps[0].section+'|'+key)
 }
 const capBank=(names:string[],x:number,y:number,positive:string)=>{
  const present=names.filter(n=>byName.has(n));present.forEach((name,i)=>part({name,x:x+i*2.1,y,section:'bank_'+names[0]}));if(!present.length)return
  const a=present.map(n=>port(n+'.1')),b=present.map(n=>port(n+'.2'));const top=y+1.05,bottom=y-1.05
  for(const ps of [a,b]){const yy=ps===a?top:bottom;for(const p of ps){wire([p.sch.center,point(p.sch.center.x,yy)],p,[p.source_port_id]);connected.add(p.source_port_id)}wire([point(ps[0].sch.center.x,yy),point(ps[ps.length-1].sch.center.x,yy)],ps[0]);label(ps[0],point(ps[0].sch.center.x,yy),ps===a?'bottom':'top',true);localComplete.add(ps[0].section+'|'+ps[0].subcircuit_connectivity_map_key)}
 }
 const strap=(name:string)=>{
  const v=placed.get(name);if(!v)return
  const shell=v.ports.filter((p:any)=>p.sch.facing_direction==='down'&&nets.get(p.subcircuit_connectivity_map_key)?.name==='GND')
  if(shell.length>1){
   const y=Math.min(...shell.map((p:any)=>p.sch.center.y))-.8;const xs=shell.map((p:any)=>p.sch.center.x);const x=(Math.min(...xs)+Math.max(...xs))/2
   for(const p of shell){wire([p.sch.center,point(p.sch.center.x,y)],p,[p.source_port_id]);connected.add(p.source_port_id);annotated.add(p.source_port_id)}
   wire([point(Math.min(...xs),y),point(Math.max(...xs),y)],shell[0]);wire([point(x,y),point(x,y-.4)],shell[0]);label(shell[0],point(x,y-.4),'top',true);localComplete.add(shell[0].section+'|'+shell[0].subcircuit_connectivity_map_key)
  }
  const groupsBySide=new Map<string,any[]>();for(const p of v.ports){const n=nets.get(p.subcircuit_connectivity_map_key);if(!n||!['GND','V3V3','V1V1','PD_VBUS','DATA_VBUS','PD_VHV'].includes(n.name)||!['left','right'].includes(p.sch.facing_direction))continue;const k=p.subcircuit_connectivity_map_key+'|'+p.sch.facing_direction;groupsBySide.set(k,[...(groupsBySide.get(k)??[]),p])}
  for(const ps of groupsBySide.values()){
   if(ps.length<2)continue;const ymin=Math.min(...ps.map(p=>p.sch.center.y)),ymax=Math.max(...ps.map(p=>p.sch.center.y));if(v.ports.some((p:any)=>p.sch.facing_direction===ps[0].sch.facing_direction&&p.sch.center.y>=ymin&&p.sch.center.y<=ymax&&p.subcircuit_connectivity_map_key!==ps[0].subcircuit_connectivity_map_key))continue
   const x=ps[0].sch.center.x+(ps[0].sch.facing_direction==='left'?-.65:.65)
   for(const p of ps){wire([p.sch.center,point(x,p.sch.center.y)],p,[p.source_port_id]);connected.add(p.source_port_id)}wire([point(x,ymin),point(x,ymax)],ps[0]);const n=nets.get(ps[0].subcircuit_connectivity_map_key);if(n.name==='GND'){const y=ymin-.5;wire([point(x,ymin),point(x,y)],ps[0]);label(ps[0],point(x,y),'top',true)}else{const mid=(ymin+ymax)/2,xx=x+(ps[0].sch.facing_direction==='left'?-.7:.7);wire([point(x,mid),point(xx,mid),point(xx,mid+.35)],ps[0]);label(ps[0],point(xx,mid+.35),'bottom',true)};localComplete.add(ps[0].section+'|'+ps[0].subcircuit_connectivity_map_key)
  }
 }
 const caption=(title:string,note:string,x:number,y:number)=>{text(title,x,y,.31);text(note,x,y-.55,.21)}
 const start=(index:number,name:string,subtitle:string)=>{
  sheet=`schematic_sheet_${index-1}`;placed.clear();sections.clear();connected.clear();annotated.clear();netAnnotated.clear();localComplete.clear()
  out.push({type:'schematic_sheet',schematic_sheet_id:sheet,name:`${String(index).padStart(2,'0')} ${name}`,display_name:name,sheet_index:index,sheet_size:'a4',sheet_width:297,sheet_height:210,center:point(16,11)})
  text('NEMA14 / '+project+' V2',1.2,21.1,.44);text(name,12.3,21.1,.40);text(subtitle,1.2,20.35,.24);line(point(.8,19.8),point(31.2,19.8));line(point(.8,1.7),point(31.2,1.7));text('AnasSarkiz  /  '+project+' motor controller',1.2,1.05,.23);text(`Sheet ${index} / 7   •   A4   •   Rev V2 prototype`,21,1.05,.23);text('34.5 × 34.5 mm  |  4-layer PCB  |  Prototype: use hash-bound V2 order package',1.2,.65,.20)
 }
 // Route local signal networks orthogonally; shared power and ground use rail symbols.
 const finish=()=>{
  for(const name of ['J_PD','J_DATA','U_PD','U_MCU','U_DRV'])strap(name)
  const power=new Set(['GND','V3V3','V1V1','PD_VBUS','DATA_VBUS','LOGIC_IN','PD_VHV'])
  const boxes=[...placed.values()].map(v=>({minX:v.comp.center.x-v.comp.size.width/2-.14,maxX:v.comp.center.x+v.comp.size.width/2+.14,minY:v.comp.center.y-v.comp.size.height/2-.14,maxY:v.comp.center.y+v.comp.size.height/2+.14}))
  const usedEdges:any[]=[]
  const blocked=(p:P,key:string)=>boxes.some(b=>p.x>b.minX&&p.x<b.maxX&&p.y>b.minY&&p.y<b.maxY)||usedEdges.some(e=>e.key!==key&&((Math.abs(e.a.x-e.b.x)<1e-5&&Math.abs(p.x-e.a.x)<.13&&p.y>=Math.min(e.a.y,e.b.y)-.13&&p.y<=Math.max(e.a.y,e.b.y)+.13)||(Math.abs(e.a.y-e.b.y)<1e-5&&Math.abs(p.y-e.a.y)<.13&&p.x>=Math.min(e.a.x,e.b.x)-.13&&p.x<=Math.max(e.a.x,e.b.x)+.13)))
  const vec=(p:any)=>p.sch.facing_direction==='left'?point(-1,0):p.sch.facing_direction==='right'?point(1,0):p.sch.facing_direction==='up'?point(0,1):point(0,-1)
  const route=(a:any,b:any)=>{
   const va=vec(a),vb=vec(b),aa=point(a.sch.center.x+va.x*.5,a.sch.center.y+va.y*.5),bb=point(b.sch.center.x+vb.x*.5,b.sch.center.y+vb.y*.5),key=a.subcircuit_connectivity_map_key
   const paths=[[aa,point(bb.x,aa.y),bb],[aa,point(aa.x,bb.y),bb]]
   for(let d=.6;d<=3.6;d+=.6)paths.push([aa,point(aa.x,aa.y+d),point(bb.x,aa.y+d),bb],[aa,point(aa.x,aa.y-d),point(bb.x,aa.y-d),bb],[aa,point(aa.x+d,aa.y),point(aa.x+d,bb.y),bb],[aa,point(aa.x-d,aa.y),point(aa.x-d,bb.y),bb])
   for(const path of paths){let ok=true;for(let i=1;i<path.length&&ok;i++){const p=path[i-1],q=path[i],steps=Math.max(1,Math.ceil((Math.abs(p.x-q.x)+Math.abs(p.y-q.y))/.08));for(let k=0;k<=steps;k++){const t=point(p.x+(q.x-p.x)*k/steps,p.y+(q.y-p.y)*k/steps);if(t.x<.2||t.x>31.8||t.y<2.1||t.y>19.3||blocked(t,key)){ok=false;break}}}if(ok){const all=[a.sch.center,...path,b.sch.center];wire(all,a,[a.source_port_id,b.source_port_id]);all.slice(1).forEach((p,i)=>usedEdges.push({a:all[i],b:p,key}));connected.add(a.source_port_id);connected.add(b.source_port_id);return true}}
   return false
  }
  for(const ps of sections.values()){
   const local=new Map<string,any[]>();for(const p of ps){const key=p.subcircuit_connectivity_map_key;if(key&&!power.has(nets.get(key)?.name)&&!connected.has(p.source_port_id))local.set(key,[...(local.get(key)??[]),p])}
   for(const [key,pins]of local){if(pins.length<2)continue;let complete=true;const tree=[pins[0]],remaining=pins.slice(1)
    while(remaining.length){let pair:any=null;for(const a of tree)for(const b of remaining){const dist=Math.abs(a.sch.center.x-b.sch.center.x)+Math.abs(a.sch.center.y-b.sch.center.y);if(!pair||dist<pair.dist)pair={a,b,dist}}if(!route(pair.a,pair.b)){complete=false;remaining.splice(remaining.indexOf(pair.b),1);tree.push(pair.b);continue}remaining.splice(remaining.indexOf(pair.b),1);tree.push(pair.b)}
    if(complete)localComplete.add(pins[0].section+'|'+key)
   }
  }
  for(const v of placed.values())for(const p of v.ports){
   const n=nets.get(p.subcircuit_connectivity_map_key),d=vec(p),end=point(p.sch.center.x+d.x*.65,p.sch.center.y+d.y*.65)
   if(!n){const c=p.sch.center;out.push({type:'schematic_path',schematic_path_id:`pro_nc_${seq++}`,schematic_sheet_id:sheet,schematic_component_id:v.comp.schematic_component_id,points:[point(c.x-.075,c.y-.075),point(c.x+.075,c.y+.075)],stroke_width:.018,is_filled:false});out.push({type:'schematic_path',schematic_path_id:`pro_nc_${seq++}`,schematic_sheet_id:sheet,schematic_component_id:v.comp.schematic_component_id,points:[point(c.x-.075,c.y+.075),point(c.x+.075,c.y-.075)],stroke_width:.018,is_filled:false});continue}
   if(annotated.has(p.source_port_id))continue
   if(connected.has(p.source_port_id)){const complete=localComplete.has(p.section+'|'+p.subcircuit_connectivity_map_key);const onlyLocal=complete&&(groups.get(p.subcircuit_connectivity_map_key)??[]).every(v=>placed.get(source.get(v.source_component_id)?.name)?.section===p.section);if(onlyLocal)continue;if(!complete||!netAnnotated.has(p.section+'|'+p.subcircuit_connectivity_map_key)){wire([p.sch.center,end],p,[p.source_port_id]);label(p,end,d.x<0?'right':d.x>0?'left':d.y>0?'bottom':'top',power.has(n.name)&&d.y!==0)}continue}
   wire([p.sch.center,end],p,[p.source_port_id]);label(p,end,d.x<0?'right':d.x>0?'left':d.y>0?'bottom':'top',power.has(n.name)&&(d.y!==0))
  }
 }
 start(1,'Power & USB-PD','Motor supply negotiation, reverse-blocked logic power and 3.3 V conversion')
 caption('USB-C motor power','Fixed 15 V request; data and SBU contacts unused',.6,19)
 part({name:'J_PD',x:4,y:14.8,section:'pd',box:[3.3,5.6],left:['EH1','EH2','EH3','EH4','GND1','GND2','SBU1','SBU2'],right:['VBUS1','VBUS2','CC1','CC2','DP1','DP2','DM1','DM2']})
 text('CH224A: 56 kΩ CFG1-to-GND selects 15 V; CFG2/3 NC.',.6,6.2,.21);
 text('C_PD: 1 µF / 50 V (C15849); R_PD: 0 Ω (C21189).',.6,5.7,.21);
 part({name:'U_PD',x:11,y:15.72,section:'pd',box:[3.2,4.0],left:['VBUS','VHV','CC1','CC2'],right:['CFG2','CFG3','PG','CFG1','GND','DP','DM']})
 part({name:'R_PD_CFG',x:15.9,y:10.2,section:'pd'});
 part({name:'R_PD',x:9.8,y:10.2,section:'pd',symbol:'boxresistor_down'});part({name:'C_PD',x:12.7,y:10.2,section:'pd'});part({name:'R_PG',x:14.5,y:15.5,section:'pd'});part({name:'D_TVS',x:4,y:9.2,section:'pd',symbol:'avalanche_diode_up'})
 caption('3.3 V logic supply','AP63203 fixed-output buck; USB power is diode-isolated',17,19)
 part({name:'D_PD',x:19.2,y:16.8,section:'buck',symbol:'diode_right'});part({name:'D_DATA',x:19.2,y:14.5,section:'buck',symbol:'diode_right'})
 part({name:'U_BUCK',x:24,y:13.2,section:'buck',box:[1.76,1.8],left:['VIN','EN','GND'],right:['BST','SW','FB']});part({name:'L_BUCK',x:28.2,y:13.2,section:'buck',symbol:'inductor_right'});part({name:'C_BOOTSTRAP',x:26.5,y:15.2,section:'buck',symbol:'capacitor_up'})
 part({name:'C_BUCK_IN',x:21,y:9.5,section:'buck'});capBank(['C_BUCK_OUT1','C_BUCK_OUT2'],27,9.5,'V3V3');connect(['J_PD.VBUS1','U_PD.VBUS']);
 connect(['R_PD.2','C_PD.1'],[point(9.8,9.1),point(11.2,9.1),point(11.2,10.575)]);label(port('R_PD.2'),point(11.2,9.1),'left');
 connect(['D_PD.cathode','D_DATA.cathode'],[point(21.4,16.8),point(21.4,14.5)]);
 connect(['D_DATA.cathode','U_BUCK.VIN'],[point(21.4,14.5),point(21.4,13.66)]);
 connect(['U_BUCK.VIN','U_BUCK.EN'],[point(22.2,13.66),point(22.2,13.2)]);
 connect(['D_DATA.cathode','C_BUCK_IN.1'],[point(21.4,14.5),point(21.4,10.2),point(21,10.2)]);
 connect(['U_BUCK.SW','L_BUCK.1']);
 connect(['U_BUCK.BST','C_BOOTSTRAP.1'],[point(26,13.66),point(26,14.825)]);
 connect(['C_BOOTSTRAP.2','L_BUCK.1'],[point(26.5,16.2),point(27.1,16.2),point(27.1,13.2033)]);
 connect(['L_BUCK.2','U_BUCK.FB'],[point(29.6,13.1967),point(29.6,12.1),point(26,12.1),point(26,12.74)]);
 connect(['U_BUCK.FB','C_BUCK_OUT2.1'],[point(26,12.74),point(26,12.1),point(29.6,12.1),point(29.6,10.55),point(29.1,10.55)]);
 text('VIN range and transients require bench qualification.',17,5.1,.22);text('PD_VBUS = motor rail    DATA_VBUS = programming USB 5 V',.6,5.1,.22);finish()
 start(2,'Programming & USB','Programming USB-C, data-line protection and nonvolatile boot interfaces')
 caption('USB-C data port','Separate 5.1 kΩ CC pull-downs; duplicated D+/D− contacts',.6,19)
 part({name:'J_DATA',x:4,y:14.1,section:'usb',box:[3.3,5.6],left:['EH1','EH2','EH3','EH4','GND1','GND2','SBU1','SBU2'],right:['VBUS1','VBUS2','CC1','CC2','DP1','DP2','DM1','DM2']})
 part({name:'R_CC1',x:8.3,y:16.4,section:'usb'});part({name:'R_CC2',x:11,y:16.4,section:'usb'});part({name:'U_ESD',x:10,y:11.3,section:'usb',box:[1.76,2.2],left:['DP1','DM1'],right:['DP2','DM2'],top:['VBUS'],bottom:['GND'],spacing:1.1})
 part({name:'R_DP',x:15.4,y:11.85,section:'usb',symbol:'boxresistor_left'});part({name:'R_DM',x:15.4,y:10.75,section:'usb',symbol:'boxresistor_left'})
 caption('USB presence','Resistive divider to MCU; fixed 5 V input only',.6,8.6)
 part({name:'R_USB_SENSE_H',x:4,y:6.2,section:'sense'});part({name:'R_USB_SENSE_L',x:4,y:3.8,section:'sense'});connect(['R_USB_SENSE_H.2','R_USB_SENSE_L.1'])
 if(rp){caption('QSPI flash & boot selection','GD25Q16E; BOOT contact asserts the boot input',20,19);part({name:'U_FLASH',x:24.5,y:14.6,section:'flash',box:[1.76,3.2],left:['CS','CLK','IO0','IO1','IO2','IO3'],right:['VCC','GND','EP']});part({name:'C_FLASH',x:29.8,y:14.8,section:'flash'});part({name:'R_FLASH_CS',x:20,y:11.5,section:'flash'});part({name:'R_BOOT',x:23.5,y:7,section:'boot',symbol:'boxresistor_right'});part({name:'TP_BOOT',x:27,y:7,section:'boot'});part({name:'TP_BOOT_GND',x:27,y:5.5,section:'boot'})}
 else{caption('Boot & debug access','Boot contact and WCH DCK/DIO are retained',20,19);part({name:'R_USB_BOOT',x:23,y:15,section:'boot'});part({name:'TP_BOOT',x:27,y:12.5,section:'boot'});part({name:'TP_BOOT_USB_DP',x:25.5,y:10.5,section:'boot'});text('USB full-speed D+/D− route directly to CH32X035.',20,8.3,.24);text('Debug interface is shown on Controller sheet 03.',20,7.5,.23)}finish()
 start(3,'Controller & clocks','MCU interfaces, reset/debug access, power decoupling and clock support')
 if(rp){
  const used=ports.filter(p=>p.source_component_id===byName.get('U_MCU').source_component_id&&p.subcircuit_connectivity_map_key&&p.name.startsWith('GPIO')).map(p=>p.name);const nc=ports.filter(p=>p.source_component_id===byName.get('U_MCU').source_component_id&&!p.subcircuit_connectivity_map_key&&p.name.startsWith('GPIO')).map(p=>p.name)
  part({name:'U_MCU',x:9.5,y:11.5,section:'mcu',box:[5.4,11.3],left:[...used,...nc],right:['QSPI_SS','QSPI_SCLK','QSPI_SD0','QSPI_SD1','QSPI_SD2','QSPI_SD3','USB_DP','USB_DM','SWCLK','SWDIO','RUN','XIN','XOUT','IOVDD1','IOVDD10','IOVDD22','IOVDD33','IOVDD42','IOVDD49','ADC_AVDD','VREG_IN','USB_VDD','DVDD23','DVDD50','VREG_OUT','TESTEN','GND']})
  caption('12 MHz crystal','Native 4-pin crystal; load capacitors and series resistor',18,19)
  part({name:'Y_MCU',x:23,y:16.5,section:'clock',symbol:'crystal_4pin_right'});part({name:'R_XOUT',x:27.5,y:16.4875,section:'clock',symbol:'boxresistor_left'});part({name:'C_XIN',x:19.5,y:16,section:'clock'});part({name:'C_XOUT',x:25.5,y:16,section:'clock'})
  caption('3.3 V bypass','IOVDD, ADC and USB decoupling',17.5,14);capBank(['C_IO1','C_IO10','C_IO22','C_IO33','C_IO42','C_IO49'],17.3,11.5,'V3V3');capBank(['C_ADC','C_USB','C_VREG_IN'],17.3,7.8,'V3V3')
  caption('1.1 V core','On-chip VREG_OUT feeds DVDD',17.5,5.8);capBank(['C_VREG_OUT','C_DV23','C_DV50'],17.3,3.5,'V1V1');part({name:'R_RUN',x:3,y:10.1,section:'reset'});[['TP_3V3',2,6.5],['TP_GND',4.5,6.5],['TP_SWCLK',2,5],['TP_SWDIO',2,3.5],['TP_RUN',4.5,3.5]].forEach(([name,x,y])=>part({name:String(name),x:Number(x),y:Number(y),section:'debug'}))
 }else{
  part({name:'U_MCU',x:10,y:12.7,section:'mcu',box:[5.4,8.2]});caption('3.3 V bypass','Place bypass capacitors close to VDD',20,18.5);capBank(['C_MCU','C_LOGIC'],21,15.5,'V3V3');[['TP_3V3',21,12.24],['TP_GND',25,12.24],['TP_DCK',21,10],['TP_DIO',25,10]].forEach(([name,x,y])=>part({name:String(name),x:Number(x),y:Number(y),section:'mcu'}));text('TMP102 uses software I²C: PB7 SDA / PB6 SCL.',20,5.8,.25);text('Buzzer: PA6 TIM3_CH1. RGB: PA5 / PA7 / PB0.',20,4.9,.25);text('Unused GPIO and USB-C CC pins are explicitly NC.',.6,4.2,.23)
 }finish()
 start(4,'Stepper motor driver','A4988 phase outputs, charge pump, current limit and motor-voltage measurement')
 part({name:'U_DRV',x:15.5,y:12.3,section:'driver',box:[4.4,7.9],left:['STEP','DIR','ENABLE_N','SLEEP','REF','VDD','MS1','MS2','MS3','RESET_N','ROSC','GND','GND18','EP'],right:['VBB1','VBB2','OUT1A','OUT1B','OUT2A','OUT2B','SENSE1','SENSE2','CP1','CP2','VCP','VREG','NC7','NC20','NC25']})
 if(byName.get('J_MOTOR')?.manufacturer_part_number==='250-204'){part({name:'J_MOTOR',x:28,y:14.6,section:'driver',box:[1.75,2.2],left:['A_PLUS','A_MINUS','B_PLUS','B_MINUS'],right:[]})}else{part({name:'J_MOTOR_A',x:28,y:15.3,section:'driver',box:[1.9,1.25],left:['PLUS','MINUS'],right:[]});part({name:'J_MOTOR_B',x:28,y:12.4,section:'driver',box:[1.9,1.25],left:['PLUS','MINUS'],right:[]});}part({name:'R_SA',x:22,y:10.9,section:'driver'});part({name:'R_SB',x:25.8,y:10.9,section:'driver'});part({name:'C_CP',x:23,y:8.4,section:'pump',symbol:'capacitor_right'});part({name:'C_VCP',x:27.5,y:8.4,section:'pump'});part({name:'C_VREG',x:29.5,y:5.2,section:'pump'})
 caption('Driver supplies','Local bulk and high-frequency bypass',.6,19);capBank(['C_VM','C_BULK'],3,16.5,'PD_VBUS');capBank(['C_DRV_LOGIC'],8.5,16.5,'V3V3')
 caption('Current reference','VREF / (8 × RSENSE) = 0.351 A nominal',.6,13.2);part({name:'R_REF_H',x:3,y:11,section:'reference'});part({name:'R_REF_L',x:3,y:8.6,section:'reference'});part({name:'C_REF',x:6.8,y:8.6,section:'reference'});connect(['R_REF_H.2','R_REF_L.1','C_REF.1'],[point(3,9.8)])
 part({name:'R_ENABLE',x:9,y:11.8,section:'driver'});part({name:'R_SLEEP',x:9,y:8.8,section:'driver'})
 caption('Motor voltage monitor','100 kΩ / 10 kΩ divider; 10 nF filter',.6,7);part({name:'R_VM_H',x:3,y:4.9,section:'monitor'});part({name:'R_VM_L',x:7,y:4.9,section:'monitor'});part({name:'C_VM_SENSE',x:10.5,y:4.9,section:'monitor'})
 text(byName.get('J_MOTOR')?.manufacturer_part_number==='250-204'?'WAGO 250-204: 1 A+ / 2 A− / 3 B+ / 4 B−':'Spring terminal: A+ / A− / B+ / B−; 2 contacts per pole',18,18.7,.21);finish()
 start(5,'Temperature & feedback','I²C temperature telemetry, RGB status outputs and PWM magnetic buzzer')
 caption('TMP102 temperature','ADD0 grounded: address 0x48; ALERT unused',.6,19)
 part({name:'U_TEMP',x:5.2,y:15.5,section:'temp',box:[3.3,2.4],left:['SDA','SCL','ALERT'],right:['V_POS','ADD0','GND']});part({name:'C_TEMP',x:10.8,y:15.5,section:'temp'});part({name:'R_TEMP_SDA',x:2.3,y:11.5,section:'temp',symbol:'boxresistor_up'});part({name:'R_TEMP_SCL',x:6.3,y:11.5,section:'temp',symbol:'boxresistor_up'})
 caption('RGB status indicator','Common anode uses programming USB 5 V',16,19)
 part({name:'D_STATUS',x:25.3,y:17.3,section:'rgb',box:[7.8,2.2],left:['_POS'],right:['R_NEG','G_NEG','B_NEG']})
 const rgb=placed.get('D_STATUS');rgb.comp.is_box_with_pins=false
 // A single package with three LED dies and one shared anode; retain all four physical pin identities.
 for(const e of out.filter(e=>e.type==='schematic_text'&&e.schematic_component_id===rgb.comp.schematic_component_id))e.font_size=.20
 for(const p of rgb.ports){const colorIndex=['R_NEG','G_NEG','B_NEG'].indexOf(p.name);p.sch.center=colorIndex<0?point(25.3,18.5):point(22+colorIndex*3.3,16.1);p.sch.facing_direction=colorIndex<0?'up':'down';p.sch.side_of_component=colorIndex<0?'top':'bottom'}
 const primitive=(points:P[],filled=false)=>out.push({type:'schematic_path',schematic_path_id:`pro_rgb_${seq++}`,schematic_sheet_id:sheet,schematic_component_id:rgb.comp.schematic_component_id,points,stroke_width:.02,is_filled:filled,color:'#840000'})
 primitive([point(25.3,18.5),point(25.3,18.05),point(22,18.05),point(28.6,18.05)])
 for(const [i,color]of ['R','G','B'].entries()){
  const x=22+i*3.3;primitive([point(x,18.05),point(x,17.6)]);primitive([point(x-.25,17.6),point(x+.25,17.6),point(x,17),point(x-.25,17.6)]);primitive([point(x-.3,17),point(x+.3,17)]);primitive([point(x,17),point(x,16.1)]);primitive([point(x+.35,17.5),point(x+.75,17.85)]);primitive([point(x+.55,17.3),point(x+.95,17.65)]);text(color,x-.05,16.55,.19,'center',rgb.comp.schematic_component_id)
  part({name:'R_STATUS_'+color,x,y:14.8,section:'rgb',symbol:'boxresistor_down'});part({name:'Q_STATUS_'+color,x:x-.3625,y:12.7,section:'rgb',symbol:'n_channel_e_mosfet_transistor_gate_left_drain_top'});part({name:'R_STATUS_PD_'+color,x:x-1.1,y:10.4,section:'rgb'})
 }
 text('3.3 V gates; 10k external pull-downs keep RGB off during reset.',16,9.0,.22)
 caption('PWM buzzer','100 mA magnetic load; 4 kHz target; MOSFET and flyback diode',.6,9.3)
 part({name:'BZ1',x:9.4,y:6.5,section:'buzzer',box:[2.5,2.3],left:['_POS','_NEG'],right:['NC']});part({name:'Q_BUZZER',x:8.5,y:3.8,section:'buzzer',symbol:'n_channel_e_mosfet_transistor_gate_left_drain_top'});part({name:'R_BUZZER_GATE',x:3.8,y:4.6,section:'buzzer',symbol:'boxresistor_right'});part({name:'R_BUZZER_PD',x:5.8,y:3.6,section:'buzzer'});part({name:'D_BUZZER',x:14,y:6.5,section:'buzzer',symbol:'diode_up'});part({name:'C_BUZZER',x:17,y:6.5,section:'buzzer'})
 caption('Power indication','3.3 V rail present; RGB/buzzer require firmware',22,8.6);part({name:'R_PWR_LED',x:25,y:6.2,section:'power_led'});part({name:'D_PWR',x:25,y:3.8,section:'power_led',symbol:'led_down'});finish()
 start(6,'Optional encoder (DNP)','AS5600 optional on bottom; 100 nF and 1 µF supply capacitors fitted on top')
 caption('Future magnetic shaft position','Nominal sensor centre (0, 0); rear shaft/magnet geometry remains unverified',.6,19)
 part({name:'U_ENCODER',x:9,y:13,section:'encoder',box:[4.5,2.2],left:['VDD5V','VDD3V3','SDA','SCL'],right:['OUT','PGO'],bottom:['GND','DIR']})
 capBank(['C_ENCODER','C_ENCODER_BULK'],19,13,'V3V3')
 text('U_ENCODER: bottom / DO NOT PLACE. Both supply capacitors: top / FITTED.',.6,7.2,.28)
 text('3.3 V mode: VDD5V + VDD3V3 tied together; DIR grounded; OUT/PGO NC.',.6,6.2,.25)
 text('Shared existing temperature I²C bus: AS5600 0x36 / TMP102 0x48.',.6,5.2,.25)
 text('Existing 4.7 kΩ top-side pull-ups retained. Encoder firmware is required.',.6,4.2,.25)
 text('A diametrically magnetized shaft magnet and motor fit must be validated.',.6,3.2,.25)
 finish()

 start(7,'Winding current telemetry','Signed current in both windings; independent of A4988 regulation shunts')
 text('TEMP I²C: GPIO4 SDA / GPIO5 SCL. Current: GPIO26 ADC0 / GPIO27 ADC1.',.6,19,.25)
 for(const [i,phase] of ['A','B'].entries()){
  const x=7+i*16,section='current_'+phase
  part({name:'R_SHUNT_'+phase,x:x-3.8,y:12.46,section,symbol:'boxresistor_down'})
  part({name:'U_I'+phase,x,y:12,section,box:[4.5,3.8],left:['IN_POS','IN_NEG','REF1','REF2'],right:['OUT','NC'],top:['VS'],bottom:['GND']})
  part({name:'C_I'+phase,x:x+6,y:12,section})
  part({name:'R_I'+phase,x:x+4,y:10,section,symbol:'boxresistor_right'})
  part({name:'C_IADC_'+phase,x:x+7,y:10,section})
  for(const [pin,input] of [['1','IN_POS'],['2','IN_NEG']]){
    const a=port('R_SHUNT_'+phase+'.'+pin).sch.center,b=port('U_I'+phase+'.'+input).sch.center
    connect(['R_SHUNT_'+phase+'.'+pin,'U_I'+phase+'.'+input],[point(x-2.8,a.y),point(x-2.8,b.y)])
  }
  const coil=port('R_SHUNT_'+phase+'.2'),coilLabel=point(coil.sch.center.x-.65,coil.sch.center.y)
  wire([coil.sch.center,coilLabel],coil,[coil.source_port_id]);label(coil,coilLabel,'right')
  // Keep the output/filter wiring below the ground rail and away from supply
  // pins so crossings cannot look like output-to-ground/supply connections.
  const op=port('U_I'+phase+'.OUT').sch.center,ri=port('R_I'+phase+'.1').sch.center
  connect(['U_I'+phase+'.OUT','R_I'+phase+'.1'],[point(op.x+.6,op.y),point(op.x+.6,ri.y)])
  const ro=port('R_I'+phase+'.2').sch.center,ci=port('C_IADC_'+phase+'.1').sch.center
  connect(['R_I'+phase+'.2','C_IADC_'+phase+'.1'],[point(ro.x+.4,ro.y),point(ro.x+.4,ci.y+.15),point(ci.x,ci.y+.15)])
 }
 text('INLINE SHUNTS: A_DRV_PLUS → 50 mΩ → A_PLUS; B_DRV_PLUS → 50 mΩ → B_PLUS.',.6,4.6,.23)
 text('INA240A1: gain 20 V/V. REF1=3.3 V, REF2=GND. VOUT = 1.65 V + I × 1 V/A.',.6,3.7,.23)
 text('100 Ω / 10 nF output filters. Kelvin routing and switching-transient checks are required.',.6,2.8,.23)
 text('V2 ENGINEERING DRAFT — placement, routing, terminal wire fit and CAM not yet qualified.',.6,1.9,.23)
 finish()

 const traces=out.filter(e=>e.type==='schematic_trace');const allEdges=traces.flatMap(t=>t.edges.map((e:any)=>({t,e})));const bridges=new Map<any,P[]>();const candidates=new Map<string,{p:P,t:any}>()
 const on=(p:P,e:any)=>Math.abs((e.to.x-e.from.x)*(p.y-e.from.y)-(e.to.y-e.from.y)*(p.x-e.from.x))<1e-6&&p.x>=Math.min(e.from.x,e.to.x)-1e-6&&p.x<=Math.max(e.from.x,e.to.x)+1e-6&&p.y>=Math.min(e.from.y,e.to.y)-1e-6&&p.y<=Math.max(e.from.y,e.to.y)+1e-6
 const endpoint=(p:P,e:any)=>[e.from,e.to].some(v=>Math.hypot(v.x-p.x,v.y-p.y)<1e-5)
 for(const {t,e}of allEdges)for(const p of [e.from,e.to])candidates.set(t.schematic_sheet_id+'|'+t.subcircuit_connectivity_map_key+'|'+p.x.toFixed(6)+','+p.y.toFixed(6),{p,t})
 for(let i=0;i<allEdges.length;i++)for(let k=i+1;k<allEdges.length;k++){
  const a=allEdges[i],b=allEdges[k];if(a.t.schematic_sheet_id!==b.t.schematic_sheet_id)continue;const ah=Math.abs(a.e.from.y-a.e.to.y)<1e-6,bh=Math.abs(b.e.from.y-b.e.to.y)<1e-6;if(ah===bh)continue
  const h=ah?a:b,v=ah?b:a,p=point(v.e.from.x,h.e.from.y);if(!on(p,a.e)||!on(p,b.e))continue
  if(a.t.subcircuit_connectivity_map_key===b.t.subcircuit_connectivity_map_key)candidates.set(a.t.schematic_sheet_id+'|'+a.t.subcircuit_connectivity_map_key+'|'+p.x.toFixed(6)+','+p.y.toFixed(6),{p,t:a.t})
  else if(!endpoint(p,a.e)&&!endpoint(p,b.e))bridges.set(h.e,[...(bridges.get(h.e)??[]),p])
 }
 for(const {p,t}of candidates.values()){
  const rays=new Set<string>();for(const a of allEdges)if(a.t.schematic_sheet_id===t.schematic_sheet_id&&a.t.subcircuit_connectivity_map_key===t.subcircuit_connectivity_map_key&&on(p,a.e))for(const q of [a.e.from,a.e.to])if(Math.hypot(q.x-p.x,q.y-p.y)>1e-5)rays.add(Math.abs(q.x-p.x)>Math.abs(q.y-p.y)?(q.x>p.x?'R':'L'):(q.y>p.y?'U':'D'))
  if(rays.size>=3)t.junctions.push(p)
 }
 for(const t of traces)t.edges=t.edges.flatMap((e:any)=>{
  const points=bridges.get(e);if(!points?.length)return[e];const dx=e.to.x-e.from.x,sign=dx>0?1:-1;let current=e.from;const result:any[]=[]
  for(const p of points.sort((a,b)=>(a.x-b.x)*sign)){const r=Math.min(.08,Math.abs(p.x-e.from.x)/3,Math.abs(e.to.x-p.x)/3),a=point(p.x-sign*r,p.y),b=point(p.x+sign*r,p.y);if(Math.abs(a.x-current.x)>1e-6)result.push({from:current,to:a});result.push({from:a,to:b,is_crossing:true});current=b}
  if(Math.abs(e.to.x-current.x)>1e-6)result.push({from:current,to:e.to});return result
 })
 const comps=out.filter(e=>e.type==='schematic_component');if(comps.length!==oldComponents.size||new Set(comps.map(e=>e.source_component_id)).size!==oldComponents.size)throw Error('Functional sheet coverage changed')
 const sheetCount=out.filter(e=>e.type==="schematic_sheet").length
 for(const e of out)if(e.type==="schematic_text"&&/^Sheet \d+ \//.test(e.text))e.text=e.text.replace(/^(Sheet \d+ \/) \d+/,`$1 ${sheetCount}`)
 return out
}
