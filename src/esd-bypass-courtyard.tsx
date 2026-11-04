import React from "react"

/** Dense board placement envelope; preserve every supplier land and CAD body.
 * Apply before core renders so its actual courtyard check sees this envelope.
 * Independent routed-pad and supplier STEP-body checks remain mandatory.
 */
export function withEsdBypassCourtyard(imported:React.ReactElement<any>){
 const footprint=imported.props.footprint as React.ReactElement<any>
 if(!React.isValidElement<any>(footprint)||footprint.type!=='footprint')throw Error('Expected supplier bypass footprint')
 const children=React.Children.toArray(footprint.props.children)
 const pads=children.filter((e):e is React.ReactElement<any>=>React.isValidElement<any>(e)&&e.type==='smtpad')
 if(pads.length!==2)throw Error('Expected two supplier bypass lands')
 const number=(value:unknown)=>Number.parseFloat(String(value))
 const left=Math.min(...pads.map(p=>number(p.props.pcbX)-number(p.props.width)/2))-.1
 const right=Math.max(...pads.map(p=>number(p.props.pcbX)+number(p.props.width)/2))+.1
 const bottom=Math.min(...pads.map(p=>number(p.props.pcbY)-number(p.props.height)/2))-.1
 const top=Math.max(...pads.map(p=>number(p.props.pcbY)+number(p.props.height)/2))+.1
 if(![left,right,bottom,top].every(Number.isFinite))throw Error('Invalid bypass land dimensions')
 const outline=[{x:left,y:bottom},{x:right,y:bottom},{x:right,y:top},{x:left,y:top},{x:left,y:bottom}]
 let changed=0
 const replacement=React.cloneElement<any>(footprint,{},children.map(e=>{
  if(!React.isValidElement<any>(e)||e.type!=='courtyardoutline')return e
  changed++;return React.cloneElement<any>(e,{outline})
 }))
 if(changed!==1)throw Error('Expected one supplier bypass courtyard')
 return React.cloneElement(imported,{footprint:replacement})
}
