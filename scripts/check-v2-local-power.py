"""Check the actual local bulk capacitor's pin distances and copper paths.

Whole intersecting wire-segment lengths are charged to the path. This is a
conservative routing-length screen, not an inductance or transient simulation.
"""
import hashlib, heapq, json, math
from collections import defaultdict
from shapely.geometry import Point, LineString, Polygon
from shapely.strtree import STRtree
from v2_route_io import g

def ref(e):return g.src[g.comp[e['pcb_component_id']]['source_component_id']]
def pad(name,pin):
    return next(e for e in g.j if e['type']=='pcb_smtpad' and ref(e)==name and g.sp[g.ports[e['pcb_port_id']]['source_port_id']]['pin_number']==pin)

positive=pad('C_BULK',1);negative=pad('C_BULK',2)
key=g.key(positive);elements,roots=g.groups(key)
graph=defaultdict(set);shapes={};weights={};layers=['top','inner1','inner2','bottom']
for i,e in enumerate(elements):
    t=e['type']
    if t=='pcb_trace':
        a,b=e['route'];shape=LineString([(a['x'],a['y']),(b['x'],b['y'])]).buffer(max(a['width'],b['width'])/2)
        ls=[a['layer']];weight=math.hypot(a['x']-b['x'],a['y']-b['y'])
    elif t=='pcb_via':shape=Point(e['x'],e['y']).buffer(e['outer_diameter']/2);ls=e['layers'];weight=1.6
    elif t in ['pcb_smtpad','pcb_plated_hole']:
        shape=g.geometry(e);ls=e.get('layers',[e.get('layer','top')]);a,b,c,d=shape.bounds;weight=math.hypot(c-a,d-b)
    else:raise ValueError('Unexpected PD rail pour: geodesic qualification required')
    shapes[i]=(shape,ls);weights[i]=weight
for layer in layers:
    ids=[i for i,(s,ls) in shapes.items() if layer in ls];geometries=[shapes[i][0] for i in ids];tree=STRtree(geometries)
    for a,shape in enumerate(geometries):
        for b in tree.query(shape,predicate='intersects'):
            if a!=b:graph[ids[a]].add(ids[b])
start=next(i for i,e in enumerate(elements) if e.get('pcb_port_id')==positive['pcb_port_id'])
def shortest(target):
    goal=next(i for i,e in enumerate(elements) if e.get('pcb_port_id')==target['pcb_port_id']);queue=[(weights[start],start,[])];seen=set()
    while queue:
        distance,i,path=heapq.heappop(queue)
        if i in seen:continue
        seen.add(i)
        if i==goal:return distance,path+[i]
        for n in graph[i]-seen:heapq.heappush(queue,(distance+weights[n],n,path+[i]))
    return None,[]
rows=[]
for pin in [22,28]:
    target=pad('U_DRV',pin);distance,path=shortest(target);straight=math.hypot(positive['x']-target['x'],positive['y']-target['y'])
    rows.append({'driver_pin':pin,'pad_center_distance_mm':straight,'whole_segment_path_bound_mm':distance,
                 'path_copper_ids':[elements[i].get(elements[i]['type']+'_id') for i in path],
                 'passed':straight<8 and distance is not None and distance<15})
ground,ground_roots=g.groups(g.key(negative));gr={e.get('pcb_port_id'):r for e,r in zip(ground,ground_roots) if e.get('pcb_port_id')}
origin=gr.get(negative['pcb_port_id'])
ground_ok=origin is not None and all(gr.get(pad('U_DRV',pin)['pcb_port_id'])==origin for pin in [3,18,29])
report={'passed':all(r['passed'] for r in rows) and ground_ok,'source_sha256':hashlib.sha256(g.path.read_bytes()).hexdigest(),
        'bulk_capacitor':'47 uF / 35 V EEEFT1V470AR','driver_supply_paths':rows,'bulk_negative_and_all_driver_ground_pads_connected':ground_ok,
        'scope':'Geometric local bulk and copper-path screen; transient, thermal and bench operation remain separate'}
(g.ROOT/'artifacts/v2/routing/local-power-verification.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2));raise SystemExit(not report['passed'])
