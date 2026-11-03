// V2 assembly preview: direct bare leads into the actual WAGO bore axes.
// Source: supplier STEP cylindrical surfaces, verified independently by CadQuery.
export type Point={x:number,y:number,z:number}
const v=(p:Point)=>[p.x,p.y,p.z]
const p=(x:number,y:number,z:number):Point=>({x,y,z})
const add=(a:Point,b:Point,t:number)=>p(a.x+b.x*t,a.y+b.y*t,a.z+b.z*t)
const translate=(q:Point,shape:any)=>({type:'translate',vector:v(q),shape})
function segment(a:Point,b:Point,radius:number){
 const dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z,length=Math.hypot(dx,dy,dz)
 return translate(p((a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2),{type:'rotate',angles:[0,Math.acos(dz/length),Math.atan2(dy,dx)],shape:{type:'cylinder',radius,height:length,segments:16}})
}
function smooth(control:Point[]){
 const path:Point[]=[];const put=(q:Point)=>{if(!path.length||Math.hypot(q.x-path.at(-1)!.x,q.y-path.at(-1)!.y,q.z-path.at(-1)!.z)>1e-7)path.push(q)}
 put(control[0])
 for(let i=1;i<control.length-1;i++){
  const q=control[i],a=control[i-1],b=control[i+1],before=[q.x-a.x,q.y-a.y,q.z-a.z],after=[b.x-q.x,b.y-q.y,b.z-q.z]
  const la=Math.hypot(...before),lb=Math.hypot(...after),u=before.map(x=>x/la),w=after.map(x=>x/lb),dot=Math.max(-1,Math.min(1,u.reduce((s,x,k)=>s+x*w[k],0))),angle=Math.acos(dot)
  if(angle<1e-6){put(q);continue}
  const radius=Math.min(2.4,Math.min(la,lb)*.4/Math.tan(angle/2)),trim=radius*Math.tan(angle/2),normal=w.map((x,k)=>(x-dot*u[k])/Math.sin(angle))
  const start=v(q).map((x,k)=>x-u[k]*trim),center=start.map((x,k)=>x+normal[k]*radius),steps=Math.max(3,Math.ceil(angle/(Math.PI/18)))
  for(let k=0;k<=steps;k++){const t=k/steps*angle;put(p(...center.map((x,n)=>x+radius*(-normal[n]*Math.cos(t)+u[n]*Math.sin(t))) as [number,number,number]))}
 }
 put(control.at(-1)!);return path
}
export function getV2MotorHarness(board:any[]){
 const source=board.find(e=>e.type==='source_component'&&e.name==='J_MOTOR')
 if(source?.manufacturer_part_number!=='250-204')throw Error('Expected actual V2 WAGO terminal')
 const cad=board.find(e=>e.type==='cad_component'&&e.source_component_id===source.source_component_id)
 if(cad.rotation.x||cad.rotation.y)throw Error('Unreviewed WAGO tilt')
 const angle=cad.rotation.z*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle)
 const world=(q:Point)=>p(cad.position.x+c*(q.x-cad.model_origin_position.x)-s*(q.y-cad.model_origin_position.y),cad.position.y+s*(q.x-cad.model_origin_position.x)+c*(q.y-cad.model_origin_position.y),cad.position.z+q.z-cad.model_origin_position.z)
 const direction=p(0,-.7364380935783753,.6765049403564237),axis=p(-s*direction.y,c*direction.y,direction.z)
 const columns=[-5.25,-1.75,1.75,5.25],colors=['black','green','red','blue'],rgb=[[.035,.035,.035],[.03,.45,.12],[.8,.035,.025],[.025,.18,.8]],nets=['A_PLUS','A_MINUS','B_PLUS','B_MINUS']
 const wires=columns.map((x,i)=>{
  const entry=world(p(x,-3.6440831793779864,9.787936923206546)),start=p((i-1.5)*1.4,-17.5,-10.75),end=add(entry,axis,.2)
  const path=smooth([start,p(start.x,-22,-10.75),p(entry.x,-25,-10.75),p(entry.x,-25,21),add(entry,axis,12),add(entry,axis,6),end])
  const shapes=path.slice(1).map((b,k)=>segment(path[k],b,.5));shapes.push(...path.slice(1,-1).map(q=>translate(q,{type:'sphere',radius:.5,segments:12})))
  return {pin:i+1,net:nets[i],color:colors[i],path,insulation_radius_mm:.5,conductor_radius_mm:.25,entry,axis,insulation_end:end,visible_tip_end:add(entry,axis,-1.8),
   wirePlan:{type:'colorize',color:rgb[i],shape:{type:'union',shapes}},tipPlan:{type:'colorize',color:[.72,.42,.18],shape:segment(end,add(entry,axis,-1.8),.25)}}
 })
 return {source_component_id:source.source_component_id,pcb_component_id:cad.pcb_component_id,header_mpn:'250-204',motor_termination:'permanent bare factory leads; direct to spring clamp',motor_exit_board_side:'-Y',motor_dimensions_mm:[35.2,35.2,28.2],PCB_surface_to_motor_rear_gap_mm:6,actual_factory_wire_gauge_verified:false,visual_wire_outside_diameter_mm:1,wire_range_AWG:[24,16],strip_length_requirement_mm:[8.5,9.5],full_stripped_length_or_contact_depth_modeled:false,wires}
}
