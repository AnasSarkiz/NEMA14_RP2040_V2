"""Clear existing ground pours around foreign copper after local dev.8 work."""
import json
from shapely.geometry import Polygon,LineString,Point
from shapely.ops import unary_union
from shapely.geometry.polygon import orient
from v2_route_io import g
ground=next(k for k,v in g.nets.items() if v=='GND')
cap_id=next(e['pcb_component_id'] for e in g.j if e['type']=='pcb_component' and g.src[e['source_component_id']]=='C_ESD')
records=[];changes=[]
for e in g.j:
    if e['type']!='pcb_copper_pour':records.append(e);continue
    assert g.key(e)==ground
    b=e['brep_shape'];coords=lambda r:[(p['x'],p['y']) for p in r['vertices']]
    original=Polygon(coords(b['outer_ring']),[coords(r) for r in b.get('inner_rings',[])])
    cuts=[]
    for other in g.j:
        if g.key(other) in [None,ground]:continue
        t=other['type'];layer=e['layer']
        # The seed preserves every original trace/via and existing land. Only
        # the newly added bypass can require a new ground-plane clearance.
        if not ((t=='pcb_smtpad' and other['pcb_component_id']==cap_id) or
                (t=='pcb_trace' and other['pcb_trace_id'].startswith('review_ESD_'))):continue
        if t in ['pcb_smtpad','pcb_plated_hole'] and layer in other.get('layers',[other.get('layer','top')]):cuts.append(g.geometry(other).buffer(.16))
        elif t=='pcb_via' and layer in other['layers']:cuts.append(Point(other['x'],other['y']).buffer(other['outer_diameter']/2+.16))
        elif t=='pcb_trace':
            for a,c in zip(other['route'],other['route'][1:]):
                if a['route_type']==c['route_type']=='wire' and a['layer']==c['layer']==layer:cuts.append(LineString([(a['x'],a['y']),(c['x'],c['y'])]).buffer(max(a['width'],c['width'])/2+.16))
    cut=unary_union(cuts)
    # Ignore numerical edge touch on unchanged planes; preserve their exact bytes.
    if original.intersection(cut).area<1e-9:records.append(e);continue
    result=original.difference(cut);polys=[result] if result.geom_type=='Polygon' else list(result.geoms)
    for i,p in enumerate(polys):
        if p.is_empty:continue
        p=orient(p,sign=-1);vertices=lambda ring:[{'x':x,'y':y} for x,y in list(ring.coords)[:-1]]
        records.append({**e,'pcb_copper_pour_id':e['pcb_copper_pour_id']+'_review_'+str(i),'brep_shape':{'outer_ring':{'vertices':vertices(p.exterior)},'inner_rings':[{'vertices':vertices(r)} for r in p.interiors]}})
    changes.append({'pour':e['pcb_copper_pour_id'],'removed_area_mm2':original.area-result.area})
g.path.write_text(json.dumps(records,indent=2)+'\n')
(g.ROOT/'artifacts/v2/routing/review-plane-clearance.json').write_text(json.dumps(changes,indent=2)+'\n')
print('Updated clearance in',len(changes),'ground regions')
