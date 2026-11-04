# V2 routing verification

**All 70 physical net groups are connected: zero shorts, zero native DRC errors
or warnings, and zero floating copper islands.** The mistaken connector rotation
was reverted; the WAGO 250-204 faces outward. V2 now has its own GitHub repository and tscircuit package,
`AnasSarkiz/NEMA14_RP2040_V2`. The ordered V1 and original public package remain
unchanged.

[Top copper](../artifacts/v2/routing/top.svg) ·
[Inner1](../artifacts/v2/routing/inner1.svg) ·
[Inner2](../artifacts/v2/routing/inner2.svg) ·
[Bottom](../artifacts/v2/routing/bottom.svg) ·
[Standalone tscircuit viewer](../artifacts/v2/routing/NEMA14-V2-routing-viewer.html) ·
[Verification manifest](../artifacts/v2/routing/verification.json)

The saved four-layer board contains 666 trace records and 357 through vias.
Every report in the manifest is bound to the exact routed JSON SHA-256. The
independent physical audit uses the actual supplier pad, wire, plated-barrel and
pour geometry. It finds zero foreign-net clearance, board-edge, mounting-hole,
keepout or construction violations. All 344 physical pin/net assignments and
all source placement records match the reviewed source.

Native DRC, independent connectivity/clearance, schema, source, placement and
TypeScript checks pass. The functional audit verifies all six motor-current paths
at a minimum 0.30 mm width, all four amplifier pickups joining the main conductors
only at their shunt lands, and a top-only oscillator without vias. USB land
contacts were extended into the real pads; conductive connections do not rely on
port labels. Floating fragments and endpoint stubs were removed while preserving
the physical pad partitions. Copper normalization preserves real wire geometry
and every real layer-changing barrel.

The 2.0.0-dev.7 update uses tscircuit 0.0.3062 / core 0.0.2259 / CLI 0.1.2429.
Both USB locating holes are capsules from the latest import; J_DATA rotates 90°
and J_PD stays at 0°. Export checks verify the actual drill direction.
[Investigation and repro](../references/v2/usb-reimport-2026-11-03/README.md).

The dev.8 update adds the local USB ESD bypass and 10 kΩ driver reset bias.
All prior traces/vias and component poses are exact; one top GND region gains
clearance around the added bypass. Its 0402 lands/body remain the supplier
geometry, with a board-level 0.10 mm placement courtyard.

## Construction rules

Foreign-net copper clearance is at least 0.15 mm; board-edge copper clearance is
at least 0.25 mm. Ordinary vias have at least 0.45 mm pads, 0.30 mm drills and
0.075 mm annuli. Three separately validated 0.50/0.30 mm GND thermal vias occupy
the MCU, PD and driver exposed pads. Every other via is subject to the strict
native via-in-pad check.

The Ø6.4 mm screw-head envelopes apply on both external surfaces. Inner copper
may pass under the insulated FR4 surface, with at least 0.25 mm copper clearance
from each actual Ø3.2 mm mounting hole on every layer. Through vias stay outside
the head envelopes. The minimum mounting-hole copper gap is 0.2556 mm. Supplier
USB locating holes and plated lands retain their imported geometry; the separate
0.2592 mm supplier land-to-locating-hole gap is reported, not confused with a
mounting-hole waiver. NPTH copper overlaps are rejected.

The current screen uses the actual fixed VREF network: nominal current limit
0.351 A. The 0.378 A supply/resistor-only result is not a complete maximum-current
bound; the report separately models reference input current and illustrates
driver trip error. Two inner1 phase sections are 13.882
and 8.824 mm long, at least 0.30 mm wide. The 17.5 µm internal-copper / 20 °C
IPC-2221 estimate is 0.410 A. This sizing estimate does not qualify operating
temperature or authorize raising the current limit. USB ground reference,
thermal/power integrity, wire/tool access, procurement and hardware calibration
remain engineering release work. `fabrication_ready` remains false until supplier/process and physical acceptance.
A separately identified [V2 prototype CAM handoff](v2-prototype-order.md) is
available for supplier DFM/quote review; historical V1 CAM is excluded.

## Reproduce and preview

From the repository root, with Bun and the Python geometry environment installed:

```sh
npm run check:v2:source
npm run check:v2:placement
npm run typecheck
npm run check:circle
npm run check:v2:routing
npm run check:v2:routing:native
npm run check:v2:functional
npm run check:v2:phase-current
node scripts/check-native-schema.mjs artifacts/v2/routing/freerouted.circuit.json
XDG_CONFIG_HOME=/workspace/.config tsci check shorts artifacts/v2/routing/freerouted.circuit.json --mode gerber --layer all --pixels-per-mm 100
npm run route:v2
npm run dev
```

`route:v2` restores the checked saved routing to `index.circuit.json` and
`artifacts/board.circuit.json` only when source, routed copper and required proof
hashes match the manifest. `build:v2` rebuilds source previews and automatically
restores that copper only if still valid. Source-only previews remain explicitly
unrouted. The standalone routing HTML embeds its exact checked board, models,
fonts and rendering runtime; download it and open in Chrome for PCB, 3D and
schematic views.

`route:v2:freerouting` and `route:v2:native` are experimental rerouting commands;
use an isolated copy because they can replace saved copper. Repair scripts use
`artifacts/v2/routing/freerouted.circuit.json` by default. Ground fill is rebuilt
after geometry edits, then all checks must be rerun before a new manifest is
accepted. No native errors or warnings are hidden in the viewer.

## Local bulk and fabrication refinement

The 47 µF capacitor now has 4.03/5.02 mm supply-land distances to VBB2/VBB1,
with 7.80/10.37 mm conservative complete copper-path bounds. The 0.30 mm direct
top feed and two local ground returns pass the full routing checks. The buzzer,
its diode/bypass/driver and nearby passives were repacked; current shunts,
amplifiers, crystal, driver and MCU retain their baseline positions.

The negative A Kelvin pickup was restored to its separate shunt connection.
All four pickups pass the independent branch-cut check. Obsolete stubs were
removed only while preserving the actual physical-pad connectivity partitions.

The board's USB clearance slots are now 1.80 × 1.00 mm for the fabricator's CNC
capability. Their centers, axes, round locators and all solder lands are retained;
the nominal imported footprint is unchanged. See the hash-bound
[adaptation proof](../artifacts/v2/usb-fabrication-adaptation.json).

Dev.9 enlarges PWR/DATA as native bottom knockout legends and moves the revision
caption clear. All other Circuit JSON records are preserved from dev.8;
see [port-label verification](../artifacts/v2/routing/port-label-update-verification.json).
