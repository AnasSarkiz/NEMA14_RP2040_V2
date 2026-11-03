"""Readable placement-only SVG generated from native PCB courtyards and holes."""
import json,html,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];data=json.loads((ROOT/'artifacts/v2/source.circuit.json').read_text())
src={e['source_component_id']:e for e in data if e['type']=='source_component'}
pcs={e['pcb_component_id']:e for e in data if e['type']=='pcb_component'}
board=next(e for e in data if e['type']=='pcb_board');w,h=board['width'],board['height']
source_hash=hashlib.sha256((ROOT/'artifacts/v2/source.circuit.json').read_bytes()).hexdigest()
svg=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-19 -21 38 43" width="1140" height="1290"><metadata>source.circuit.json SHA256: {source_hash}; placement only; copper shown in separately verified routing view</metadata><rect x="-19" y="-21" width="38" height="43" fill="#f5f7fa"/><text x="0" y="-19.4" text-anchor="middle" font-family="sans-serif" font-size=".85" fill="#18343b">NEMA14 RP2040 V2 · {w} × {h} mm · TOP</text><text x="0" y="-18.2" text-anchor="middle" font-family="sans-serif" font-size=".58" fill="#8a4600">PLACEMENT ONLY · USE VERIFIED ORDER FILES</text><g transform="scale(1,-1)"><rect x="{-w/2}" y="{-h/2}" width="{w}" height="{h}" fill="#e8f1eb" stroke="#234c3b" stroke-width=".12"/>']
colors={'J_':'#96d5cc','U_':'#cad3df','C_':'#f5db9a','R_':'#e4c9b6','Q_':'#c8bddc','D_':'#e6bbcd','TP_':'#b7ddab','L_':'#e2bf87','Y_':'#b7d7e8','BZ':'#b5d0d1'}
for e in data:
 if e['type']!='pcb_courtyard_outline' or e['layer']!='top':continue
 c=pcs[e['pcb_component_id']];n=src[c['source_component_id']]['name'];mpn=src[c['source_component_id']].get('manufacturer_part_number','test point');points=e['outline'];xs=[p['x'] for p in points];ys=[p['y'] for p in points];x=(min(xs)+max(xs))/2;y=(min(ys)+max(ys))/2;ww=max(xs)-min(xs);hh=max(ys)-min(ys);rot=90 if hh>ww*1.5 else 0
 color=next((v for k,v in colors.items() if n.startswith(k)),'#ddd');title=html.escape(n+' · '+mpn)
 svg.append(f'<g><title>{title}</title><polygon points="'+ ' '.join(f"{p['x']},{p['y']}" for p in points)+f'" fill="{color}" stroke="#45535d" stroke-width=".055"/>')
 font=min(.56,(max(ww,hh)-.15)/(len(n)*.62),min(ww,hh)*.65)
 svg.append(f'<g transform="translate({x},{y}) rotate({rot}) scale(1,-1)"><text text-anchor="middle" dominant-baseline="central" font-family="sans-serif" font-size="{font}" fill="#102d37">{html.escape(n)}</text></g></g>')
for x in [-13,13]:
 for y in [-13,13]:svg.append(f'<circle cx="{x}" cy="{y}" r="3.2" fill="none" stroke="#a06954" stroke-dasharray=".24,.15" stroke-width=".08"/><circle cx="{x}" cy="{y}" r="1.6" fill="#f5f7fa" stroke="#65776e" stroke-width=".08"/>')
svg.append('</g><text x="0" y="19" text-anchor="middle" font-family="sans-serif" font-size=".58" fill="#274d41">Dashed circles: screw-head envelopes · Blocks: full component courtyards</text><text x="0" y="20.2" text-anchor="middle" font-family="sans-serif" font-size=".58" fill="#274d41">Encoder capacitors fitted on top · Optional encoder IC on bottom</text><text x="0" y="21.3" text-anchor="middle" font-family="sans-serif" font-size=".58" fill="#274d41">Five bare debug pads underneath · BOOT recovery pads on top</text></svg>')
(ROOT/'artifacts/v2/placement.svg').write_text('\n'.join(svg)+'\n')
