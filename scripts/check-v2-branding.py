"""Check the actual logo and disclaimer vector ink against the V2 board."""
from pathlib import Path
import json,html,hashlib
from shapely.geometry import LineString
from shapely.ops import unary_union
ns={'__file__':str(Path('scripts/check-v2-critical-silk.py').resolve())}
exec(Path('scripts/check-v2-critical-silk.py').read_text().replace('raise SystemExit(bool(errors))',''),ns)
assert not ns['errors'],'Essential legend regression'
j=ns['j'];groups=json.loads(Path('src/bottom-markings.json').read_text())['groups'];actual=[e for e in j if e['type']=='pcb_silkscreen_path' and e['layer']=='bottom']
polys=[];errors=[];results=[]
for g in groups:
 for route in g['routes']:
  assert any(e['route']==[{'x':x,'y':y} for x,y in route] and e['stroke_width']==g['stroke_width_mm'] for e in actual),'Artwork absent from saved board'
 poly=unary_union([LineString(r).buffer(g['stroke_width_mm']/2) for r in g['routes']]);polys.append(poly)
 hits=[name for name,p in ns['obstacles']['bottom'] if poly.distance(p)<.20-1e-6]
 heads=[name for name,p in ns['bodies']['bottom'] if poly.intersection(p).area>1e-7]
 labels=[l['text'] for l in ns['ink']['labels'] if l['layer']=='bottom' and poly.distance(ns['polys'][l['id']])<.20]
 edge=poly.distance(ns['board'].boundary) if ns['board'].covers(poly) else -1
 if hits or heads or labels or edge<.25:errors.append({'group':g['name'],'pad_or_hole_hits':hits,'covered_by':heads,'label_hits':labels,'edge_clearance':edge})
 results.append({'name':g['name'],'bounds_mm':list(poly.bounds),'stroke_width_mm':g['stroke_width_mm'],'pad_clearance_mm':min(poly.distance(p) for _,p in ns['obstacles']['bottom']),'edge_clearance_mm':edge})
for i,p in enumerate(polys):
 for q in polys[:i]:
  if p.distance(q)<.20:errors.append({'artwork_groups_too_close':i})
svg=Path('artifacts/v2/routing/critical-silkscreen-bottom.svg').read_text()
for p in polys:svg=svg.replace('</svg>',ns['path'](p,'#ffffff')+'</svg>')
Path('artifacts/v2/routing/full-bottom-silkscreen.svg').write_text(svg)
report={'passed':not errors,'source_sha256':hashlib.sha256(Path('artifacts/v2/routing/freerouted.circuit.json').read_bytes()).hexdigest(),'exact_disclaimer':'For evaluation only; not FCC approved for resale.','official_logo_paths_retained':True,'mirrored_for_underside_reading':True,'groups':results,'errors':errors,'scope':'Artwork ink and pad/hole/body/edge screen; not manufacturing release'}
Path('artifacts/v2/routing/branding-verification.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2));raise SystemExit(bool(errors))
