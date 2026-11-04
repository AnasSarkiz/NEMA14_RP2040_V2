# V2 review fixes — 2.0.0-dev.8

The two hardware actions from the
[independent dev.7 review](v2-independent-final-review-2026-11-04.md) are implemented.
The working ordered V1 and its package remain separate.

| Reference | Released change |
| --- | --- |
| R_ENABLE | 100 kΩ → 10 kΩ, C25744, original 0402 footprint and position |
| R_SLEEP | 100 kΩ → 10 kΩ, C25804, original 0603 footprint and position |
| C_ESD | Added 100 nF / 16 V, Samsung CL05B104KO5NNNC / C1525, top-side 0402, DATA_VBUS to ground |

C1525 is already used elsewhere in the BOM. The added bypass therefore uses an
existing part type. The evaluated 0201 alternative was listed Standard Only and
is not used. No existing component, source pin/net assignment, trace or via is
moved. The new capacitor has a **1.740 mm direct top feed** to U_ESD pin 5 and
a **0.600 mm top return** to a new 0.45/0.30 mm plated ground via.

## Placement and preservation

The C1525 supplier library, solder lands, paste and CAD body are unchanged.
For this one dense placement, the board wrapper uses **0.10 mm around the actual
land envelope** for its courtyard instead of the library's 0.25 mm margin. The
wrapper applies before core rendering, so native checks use the actual selected
courtyard. No diagnostic is suppressed to make the capacitor fit. Independent
checks verify the unchanged supplier lands, courtyard containment, ≥0.15 mm
foreign-net copper spacing and the 98 fitted supplier STEP bodies.
The targeted nominal body distances are 0.798 mm to J_DATA, 1.144 mm to U_ESD
and 0.745 mm to the adjacent RGB pull-down; see
[the placement detail](../artifacts/v2/routing/esd-placement-detail.json).

The original 664 trace records and 356 vias are exact. Two local traces and one
ground via are added. One top-side ground region gains clearance around the new
bypass. Existing inner and bottom ground pours are exact, preserving the prior
USB signal/reference geometry. The motor, WAGO, mounting holes, local driver
bulk and approved short curved leads retain their poses.

The routed board is bound to SHA-256
`b34f080b1114ee5febc3f45b73aab43332fdd9b7c91105030e03dd3d13b806f1`.

## Validation and files

- 70/70 physical nets connected; 344 physical pin/net assignments match the source.
- Zero shorts, native DRC errors/warnings, clearance violations or floating copper.
- 98 fitted components, all top; seven bare test pads and the optional bottom
  encoder are excluded from purchased assembly.
- 35 source checks, 68 placement proximity checks, native schema, source/pin/
  schematic checks, TypeScript and schematic-placement command pass.
- Six winding-current paths, four shunt-only Kelvin pickups, local bulk and
  top-only crystal checks pass. The exact existing copper is preserved.
- The startup screen checks input leakage, RP2040 reset pulls, 1% resistors and
  a ±5% logic rail. ENABLE's minimum calculated high-threshold margin is 0.237 V;
  SLEEP's leakage-only high-impedance voltage is at most 0.212 V.
- The actual four-layer native Gerber shorts check passes. The regenerated order
  package has its own independent actual-CAM audit and file-consistency receipt.
- Updated PCB/assembly viewers retain the approved wire shapes and native board.

Evidence: [routing qualification](../artifacts/v2/routing/verification.json),
[startup/local bypass](../artifacts/v2/routing/startup-and-esd-verification.json),
[exact preservation](../artifacts/v2/routing/review-fixes-preservation.json),
[body clearance](../artifacts/v2/routing/component-body-verification.json),
[actual CAM](../artifacts/v2/order-review/cam/audit.json),
[order-file consistency](../artifacts/v2/order-review/verification.json),
[viewer readback](../artifacts/v2/assembly/viewer-verification.json).

Use the [dev.8 order package](../artifacts/v2/order-review/) and its manifest;
previous downloads describe dev.7 and should be replaced.

## Remaining acceptance

The current-limit report now explicitly separates the nominal 0.351 A setting
from incomplete tolerance estimates. Its former 0.378 A result is a supply/
resistor-only model, not a guaranteed maximum. Current accuracy, sampling,
thermal behavior and transients still require first-board measurements.

Before releasing the prototype order, obtain the supplier's live part/quote,
pickup, through-hole/USB-shell, filled/capped-via and stencil approval. Confirm
actual motor-wire gauge/retention and rear mounting. PD-only USB-presence behavior
remains a power-mode test. RGB still needs DATA USB power, and AS5600 remains DNP.
Use the V2 firmware pin map; initialize the bridge disabled and ADC pads correctly.

These are prototype engineering files, not production or ESD/EMC certification.
