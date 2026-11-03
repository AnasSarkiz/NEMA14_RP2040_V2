"""Pack full catalog courtyards on the 34.5 mm V2 draft.

This is a placement screen, not a copper, 3D, wire-access or manufacturing signoff.
The ordered V1 geometry is never rewritten by this script.
"""
import json, math, re, sys
from pathlib import Path
from ortools.sat.python import cp_model
from shapely.geometry import Polygon, box
from shapely.affinity import rotate, translate

ROOT = (Path(sys.argv[sys.argv.index('--work-dir')+1]).resolve() if '--work-dir' in sys.argv else Path(__file__).resolve().parents[1])
proximity_checks = []
catalog = json.loads((ROOT/'src/jlcpcb-catalog.json').read_text())
placement = json.loads((ROOT/'src/supplier-placement.json').read_text())
anchor_plan=json.loads((ROOT/'src/v2-placement-anchors.json').read_text()) if '--anchor-plan' in sys.argv else {}
placement.update(anchor_plan)
local = {}
for name,code in catalog['components'].items():
    if name == 'U_ENCODER': continue
    text = (ROOT/catalog['parts'][code]['importPath']).read_text()
    match = re.search(r'<courtyardoutline outline=\{(\[.*?\])\}',text,re.S)
    if not match: raise ValueError('Missing original courtyard: '+name)
    local[name] = Polygon([(p['x'],p['y']) for p in json.loads(match[1])])
# Physical test pads must also be respected.
for name in placement:
    if name.startswith('TP_'):
        half=.5 if name in ['TP_BOOT','TP_BOOT_GND'] else .7
        local[name] = box(-half,-half,half,half)

telemetry_bottom='--telemetry-bottom' in sys.argv
bottom_names={n+p for n in ['U_I','R_SHUNT_','C_I','R_I','C_IADC_'] for p in ['A','B']} if telemetry_bottom else set()
if telemetry_bottom:
    bottom_names.update(['C_IO1','C_IO10','C_IO22','C_IO33','C_IO42','C_IO49','C_DV23','C_DV50','C_USB','C_ADC','C_VREG_IN','C_VREG_OUT'])
bottom_names.update(n for n,v in placement.items() if n.startswith('TP_') and v.get('layer')=='bottom')
model = cp_model.CpModel()
scale = 1000
xs,ys,objective,variables,anchors = [],[],[],{},{}
bx,by=[],[]
fixed = ({'J_PD','J_DATA'} if '--move-mcu' in sys.argv else {'U_MCU','J_PD','J_DATA'}) | set(anchor_plan)
zones=json.loads((ROOT/'src/v2-placement-zones.json').read_text()) if (ROOT/'src/v2-placement-zones.json').exists() else {}
boundary = 17.25
def obstacle(xlist,ylist,x,y,w,h,name):
    xlist.append(model.new_fixed_size_interval_var(round(x*scale),math.ceil(w*scale),name+'x'))
    ylist.append(model.new_fixed_size_interval_var(round(y*scale),math.ceil(h*scale),name+'y'))
if bottom_names:
    # Retain the optional encoder IC's bottom courtyard; its capacitors are top-side.
    for name in ['U_ENCODER']:
        text=(ROOT/catalog['parts'][catalog['components'][name]]['importPath']).read_text()
        match=re.search(r'<courtyardoutline outline=\{(\[.*?\])\}',text,re.S)
        p=placement[name];poly=translate(rotate(Polygon([(v['x'],v['y']) for v in json.loads(match[1])]),p['pcbRotation'],origin=(0,0)),xoff=p['pcbX'],yoff=p['pcbY'])
        a,b,c,d=poly.bounds;obstacle(bx,by,a,b,c-a,d-b,'bottom_'+name)
    # Both USB shell stakes and locating holes go through the board.
    for name in ['J_PD','J_DATA']:
        p=placement[name]
        def usb_obstacle(x,y,w,h,label):
            poly=translate(rotate(box(x-w/2,y-h/2,x+w/2,y+h/2),p['pcbRotation'],origin=(0,0)),xoff=p['pcbX'],yoff=p['pcbY'])
            a,b,c,d=poly.bounds
            obstacle(bx,by,a,b,c-a,d-b,label)
        for x in [-3.8474968,4.1524872]:
            for y in [-1.429893,1.429893]:
                usb_obstacle(x,y,2.1,1.6,f'{name}{x}{y}')
        for x in [-3.8474968,4.1524872]:
            usb_obstacle(x,0,2,1.22,f'{name}loc{x}')
def avoid_heads(name,ax,ay,gx,bounds,enabled):
    # A rectangle is clear when one of 32 supporting lines separates its entire
    # courtyard from the head circle. Integer normals use their actual length:
    # this conservatively excludes the complete circle, never an inscribed one.
    # Finite directions may reject a valid near-tangent corner (<0.016 mm), but
    # avoid the large per-X lookup encoding. Native geometry is audited again.
    a,b,c,d=bounds
    lo_x,hi_x=math.floor(a*scale),math.ceil(c*scale)
    lo_y,hi_y=math.floor(b*scale),math.ceil(d*scale)
    for hx in [-13*scale,13*scale]:
        for hy in [-13*scale,13*scale]:
            choices=[]
            for i in range(32):
                theta=2*math.pi*i/32;nx=round(1000*math.cos(theta));ny=round(1000*math.sin(theta))
                side=model.new_bool_var(f'{name}_head_{hx}_{hy}_{i}');choices.append(side)
                offset=min(nx*lo_x,nx*hi_x)+min(ny*lo_y,ny*hi_y)
                limit=math.ceil(3.2*scale*math.hypot(nx,ny))
                model.add(nx*(ax-hx)+ny*(ay-hy)+offset>=limit).only_enforce_if([enabled,side])
            model.add_bool_or(choices).only_enforce_if(enabled)

for name,poly in local.items():
    p=placement[name]; ox,oy,pr=p['pcbX'],p['pcbY'],p['pcbRotation']
    if name in fixed:
        a,b,c,d=translate(rotate(poly,pr,origin=(0,0)),xoff=ox,yoff=oy).bounds
        if min(a,b)<-boundary-1e-6 or max(c,d)>boundary+1e-6:
            raise ValueError('Fixed supplier courtyard outside board: '+name)
        target_x,target_y=(bx,by) if name in bottom_names else (xs,ys)
        target_x.append(model.new_fixed_size_interval_var(math.floor(a*scale),math.ceil(c*scale)-math.floor(a*scale),name+'fx'))
        target_y.append(model.new_fixed_size_interval_var(math.floor(b*scale),math.ceil(d*scale)-math.floor(b*scale),name+'fy'))
        for hx in [-13,13]:
            for hy in [-13,13]:
                gap=math.hypot(max(a-hx,0,hx-c),max(b-hy,0,hy-d))
                if gap<3.2-1e-6:raise ValueError(f'Fixed courtyard {name} intersects screw-head envelope at {(hx,hy)}: {gap:.6f} mm')
        anchors[name]=(round(ox*scale),round(oy*scale));continue
    zone=zones.get(name,[-17.25,17.25,-17.25,17.25])
    ax=model.new_int_var(round(zone[0]*scale),round(zone[1]*scale),name+'ax');ay=model.new_int_var(round(zone[2]*scale),round(zone[3]*scale),name+'ay')
    gx=model.new_int_var(-690,690,name+'gridx');gy=model.new_int_var(-690,690,name+'gridy')
    model.add(ax==25*gx);model.add(ay==25*gy)
    options=[]; active=[]
    for r in ([(pr+i)%360 for i in [0,90,180,270]] if name in ['U_MCU','U_IA','U_IB','U_BUCK','U_FLASH','Y_MCU','U_DRV'] else [pr,(pr+90)%360]):
        a,b,c,d=rotate(poly,r,origin=(0,0)).bounds
        enabled=model.new_bool_var(name+str(r));active.append(enabled)
        left=model.new_int_var(-17250,17250,name+str(r)+'left');bottom=model.new_int_var(-17250,17250,name+str(r)+'bottom')
        w=math.ceil(c*scale)-math.floor(a*scale);h=math.ceil(d*scale)-math.floor(b*scale)
        model.add(left==ax+math.floor(a*scale));model.add(bottom==ay+math.floor(b*scale))
        model.add(left>=round(-boundary*scale)).only_enforce_if(enabled)
        model.add(bottom>=round(-boundary*scale)).only_enforce_if(enabled)
        model.add(left+w<=round(boundary*scale)).only_enforce_if(enabled)
        model.add(bottom+h<=round(boundary*scale)).only_enforce_if(enabled)
        avoid_heads(name+str(r),ax,ay,gx,(a,b,c,d),enabled)
        tx,ty=(bx,by) if name in bottom_names else (xs,ys)
        tx.append(model.new_optional_fixed_size_interval_var(left,w,enabled,name+str(r)+'x'))
        ty.append(model.new_optional_fixed_size_interval_var(bottom,h,enabled,name+str(r)+'y'))
        objective.append(enabled*(0 if r==pr else 20));options.append(r)
    model.add_exactly_one(active)
    dx=model.new_int_var(0,40000,name+'dx');dy=model.new_int_var(0,40000,name+'dy')
    model.add_abs_equality(dx,ax-round(ox*scale));model.add_abs_equality(dy,ay-round(oy*scale))
    objective.extend([dx,dy]);variables[name]=(ax,ay,active,options);anchors[name]=(ax,ay)
model.add_no_overlap_2d(xs,ys)
if bottom_names:
    # Preserve the supplier's physical terminal drills. Unlike the former
    # Phoenix-specific pattern, this also handles single four-pole terminals.
    for name in [n for n in anchors if n.startswith('J_MOTOR')]:
        mx,my=anchors[name]
        text=(ROOT/catalog['parts'][catalog['components'][name]]['importPath']).read_text()
        holes=[]
        for tag in re.findall(r'<platedhole\b[^>]+>',text):
            def attr(key):
                match=re.search(key+r'="([\d.eE+-]+)mm"',tag) or re.search(key+r'=\{([\d.eE+-]+)\}',tag)
                if not match:raise ValueError('Unsupported supplier drill attribute: '+key)
                return float(match[1])
            holes.append((attr('pcbX'),attr('pcbY'),attr('outerDiameter')/2+.15))
        if name in variables:_,_,ma,mr=variables[name]
        else:ma,mr=[model.new_constant(1)],[placement[name]['pcbRotation']]
        for r,en in zip(mr,ma):
            for i,(x,y,radius) in enumerate(holes):
                angle=math.radians(r);dx=x*math.cos(angle)-y*math.sin(angle);dy=x*math.sin(angle)+y*math.cos(angle)
                ix=model.new_int_var(-25000,25000,f'{name}{i}{r}x');iy=model.new_int_var(-25000,25000,f'{name}{i}{r}y')
                model.add(ix==mx+math.floor((dx-radius)*scale));model.add(iy==my+math.floor((dy-radius)*scale))
                size=math.ceil(2*radius*scale)+1
                bx.append(model.new_optional_fixed_size_interval_var(ix,size,en,f'{name}{i}{r}bx'))
                by.append(model.new_optional_fixed_size_interval_var(iy,size,en,f'{name}{i}{r}by'))
    model.add_no_overlap_2d(bx,by)

assumptions={}
def require(name):
    literal=model.new_bool_var('require_'+name)
    if '--geometry-only' in sys.argv:model.add(literal==0)
    elif '--explain-infeasible' in sys.argv:model.add_assumption(literal)
    else:model.add(literal==1)
    assumptions[literal.index]=name
    return literal

def local_to(name, x, y, limit, weight=2):
    proximity_checks.append({'type':'point','child':name,'x':x,'y':y,'limit_mm':limit})
    ax,ay=anchors[name];dx=model.new_int_var(0,70000,name+'localx'+str(x));dy=model.new_int_var(0,70000,name+'localy'+str(y))
    model.add_abs_equality(dx,ax-round(x*scale));model.add_abs_equality(dy,ay-round(y*scale))
    model.add(dx+dy<=round(limit*scale)).only_enforce_if(require(name+'_local'));objective.extend([dx*weight,dy*weight])

def together(a,b,limit,weight=2):
    proximity_checks.append({'type':'pair','child':a,'parent':b,'limit_mm':limit})
    xa,ya=anchors[a];xb,yb=anchors[b]
    dx=model.new_int_var(0,70000,a+b+'x');dy=model.new_int_var(0,70000,a+b+'y')
    model.add_abs_equality(dx,xa-xb);model.add_abs_equality(dy,ya-yb)
    model.add(dx+dy<=round(limit*scale)).only_enforce_if(require(a+'_'+b));objective.extend([dx*weight,dy*weight])

together('TP_BOOT','TP_BOOT_GND',1.8)
for a,b,l in [('U_BUCK','C_BOOTSTRAP',3.5),('U_BUCK','L_BUCK',7),('U_BUCK','C_BUCK_IN',7),('L_BUCK','C_BUCK_OUT1',6),('L_BUCK','C_BUCK_OUT2',6),('U_TEMP','U_DRV',12),('U_FLASH','U_MCU',10),('Q_BUZZER','BZ1',10),('BZ1','D_BUZZER',7)]:
    together(a,b,l)
def local_port_offset(name,pin):
    # Read the active supplier footprint, not an older ordered-board package.
    # In particular, V2 uses a smaller buzzer with different physical pad offsets.
    text=(ROOT/catalog['parts'][catalog['components'][name]]['importPath']).read_text()
    tags=[]
    for tag in re.findall(r'<smtpad\b[^>]+>',text):
        hints=re.search(r'portHints=\{\[([^\]]+)\]\}',tag)
        if hints and ('"pin'+str(pin)+'"') in hints[1]:tags.append(tag)
    if len(tags)!=1:raise ValueError(f'Expected one supplier pad for {name} pin {pin}; found {len(tags)}')
    def attr(key):
        m=re.search(key+r'="([\d.eE+-]+)mm"',tags[0]) or re.search(key+r'=\{([\d.eE+-]+)\}',tags[0])
        if not m:raise ValueError('Unsupported pad coordinate: '+name+' '+key)
        return float(m[1])
    return attr('pcbX'),attr('pcbY')

def near_pin(child,parent,pin,limit,child_pin=None):
    # A supply capacitor may be checked from its actual connected pad instead
    # of its centre. Record that choice for the generated-geometry audit.
    lx,ly=local_port_offset(parent,pin)
    proximity_checks.append({'type':'pin','child':child,'parent':parent,'pin':pin,'local_x':lx,'local_y':ly,'limit_mm':limit,**({'child_pin':child_pin} if child_pin is not None else {})})
    cx,cy=anchors[child];px,py=anchors[parent]
    child_dx,child_dy=0,0
    if child_pin is not None:
        clx,cly=local_port_offset(child,child_pin)
        child_dx=model.new_int_var(-30000,30000,child+'portdx');child_dy=model.new_int_var(-30000,30000,child+'portdy')
        if child in variables:_,_,ca,cr=variables[child]
        else:ca,cr=[model.new_constant(1)],[placement[child]['pcbRotation']]
        for ce,rotation in zip(ca,cr):
            a=math.radians(rotation)
            model.add(child_dx==round(scale*(clx*math.cos(a)-cly*math.sin(a)))).only_enforce_if(ce)
            model.add(child_dy==round(scale*(clx*math.sin(a)+cly*math.cos(a)))).only_enforce_if(ce)
    if parent in variables:_,_,active,options=variables[parent]
    else:active,options=[model.new_constant(1)],[placement[parent]['pcbRotation']]
    required=require(child+'_near_'+parent+'_pin'+str(pin))
    for i,(en,r) in enumerate(zip(active,options)):
        theta=math.radians(r);ox=round(scale*(lx*math.cos(theta)-ly*math.sin(theta)));oy=round(scale*(lx*math.sin(theta)+ly*math.cos(theta)))
        dx=model.new_int_var(0,70000,f'{child}pin{i}dx');dy=model.new_int_var(0,70000,f'{child}pin{i}dy')
        model.add_abs_equality(dx,cx+child_dx-px-ox);model.add_abs_equality(dy,cy+child_dy-py-oy)
        model.add(dx+dy<=round(limit*scale)).only_enforce_if([required,en])
        cost=model.new_int_var(0,140000,f'{child}pin{i}cost');model.add(cost==dx+dy).only_enforce_if(en);model.add(cost==0).only_enforce_if(en.negated());objective.append(cost*5)
for name,pin in {'C_IO1':1,'C_IO10':10,'C_IO22':22,'C_IO33':33,'C_IO42':42,'C_IO49':49,'C_DV23':23,'C_DV50':50,'C_USB':48,'C_ADC':43,'C_VREG_IN':44,'C_VREG_OUT':45}.items():
    near_pin(name,'U_MCU',pin,6 if name=='C_VREG_IN' else 4.5)
near_pin('C_XIN','Y_MCU',1,2.5)
near_pin('C_XOUT','Y_MCU',3,2.5)
near_pin('R_XOUT','U_MCU',21,3.5)
near_pin('C_FLASH','U_FLASH',8,2.5,child_pin=1)
near_pin('C_PD','U_PD',1,6.5)
near_pin('C_BUZZER','BZ1',1,3.5)
# Audit the real supply terminals rather than the small-package centre.
near_pin('C_TEMP','U_TEMP',5,3.5,child_pin=1)
# Local bulk is required at both independent driver bridge supply pads.
near_pin('C_BULK','U_DRV',22,8,child_pin=1)
near_pin('C_BULK','U_DRV',28,8,child_pin=1)
near_pin('R_DM','U_MCU',46,4.5)
near_pin('R_DP','U_MCU',47,4.5)
together('R_DM','R_DP',2.5)
for phase in ['A','B']:
    # Isolate the INA240 output before the ADC trace and capacitive load.
    near_pin('R_I'+phase,'U_I'+phase,8,4.5)
    together('R_I'+phase,'C_IADC_'+phase,12,4)
    near_pin('C_I'+phase,'U_I'+phase,5,2.5)
    near_pin('R_SHUNT_'+phase,'U_I'+phase,2,4)
    near_pin('R_SHUNT_'+phase,'U_I'+phase,3,4)
    near_pin('C_IADC_'+phase,'U_MCU',38 if phase=='A' else 39,3)
for name in ['C_CP','C_VCP','C_VREG','C_DRV_LOGIC','R_SA','R_SB','C_REF','R_REF_H','R_REF_L','C_VM']:
    together('U_DRV',name,15 if name.startswith('R_REF_') else 12 if name in ['R_SA','R_SB'] else 9,3)
for child,pin,limit in [('C_CP',4,3.5),('C_CP',5,3.5),('C_VCP',6,4.5),('C_VREG',8,4.5),('C_DRV_LOGIC',15,4.5),('C_REF',17,4.5),('C_VM',22,3.5),('R_SA',23,8),('R_SB',27,8)]:
    near_pin(child,'U_DRV',pin,limit)
local_to('C_ENCODER',1.905,-2.7051,6)
local_to('C_ENCODER_BULK',.635,-2.7051,6)

model.minimize(sum(objective))
if "--feasibility-only" in sys.argv:model.clear_objective()
for name,(ax,ay,active,options) in variables.items():
    p=placement[name]
    model.add_hint(ax,round(p['pcbX']*scale));model.add_hint(ay,round(p['pcbY']*scale))
    for r,v in zip(options,active):model.add_hint(v,int(r==p['pcbRotation']))
solver=cp_model.CpSolver();solver.parameters.max_time_in_seconds=float(sys.argv[sys.argv.index('--max-seconds')+1]) if '--max-seconds' in sys.argv else 180;solver.parameters.num_search_workers=int(sys.argv[sys.argv.index('--workers')+1]) if '--workers' in sys.argv else 8
solver.parameters.stop_after_first_solution='--geometry-only' not in sys.argv
solver.parameters.repair_hint=False
solver.parameters.log_search_progress=True
model.export_to_file("/tmp/nema14-v2-placement-model.pbtxt")
status=solver.solve(model)
result={'solver':'CP-SAT','status':solver.status_name(status),'placement_grid_mm':.025,'coordinate_quantum_mm':1/scale,'board_mm':[34.5,34.5],
        'preserved_full_catalog_courtyards':True,'conservative_head_circle_diameter_mm':6.4,
        'head_check':'32 conservative supporting-line directions versus full rectangles; fixed anchors checked against exact circle',
        'telemetry_bottom':telemetry_bottom,
        'fixed_anchor_plan':bool(anchor_plan),'placement_zones':zones,'proximity_checks':proximity_checks,
        'bottom_components':sorted(bottom_names),
        'local_placement_constraints_enforced':'--geometry-only' not in sys.argv,
        'scope':'2D placement only; not routing or 3D/wire-access qualification'}
if status==cp_model.INFEASIBLE:
    result['infeasibility_core']=[assumptions.get(i,str(i)) for i in solver.sufficient_assumptions_for_infeasibility()]
if status in [cp_model.OPTIMAL,cp_model.FEASIBLE]:
    for name,(ax,ay,active,options) in variables.items():
        placement[name]={'pcbX':solver.value(ax)/scale,'pcbY':solver.value(ay)/scale,
                         'pcbRotation':next(r for r,v in zip(options,active) if solver.value(v))}
        if name in bottom_names:placement[name]['layer']='bottom'
    (ROOT/'src/supplier-placement.json').write_text(json.dumps(placement,indent=2)+'\n')
    result['placements']=placement
(ROOT/'artifacts/v2/placement-screen.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items() if k not in ['placements','proximity_checks']}),flush=True)
if status not in [cp_model.OPTIMAL,cp_model.FEASIBLE]:raise SystemExit(1)
