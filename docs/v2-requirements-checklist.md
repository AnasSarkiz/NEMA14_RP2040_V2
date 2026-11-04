# V2 requirements and review checklist

Reviewed against **NEMA14_RP2040_V2 2.0.0-dev.10**, with routed-board SHA-256
`e5bc01df4c1de53ab8aa459546d5a6552320c93c960945f3966feffa8d444f4a`.
The requirements below combine the original NEMA14 requests, the initial V2
request and later accepted changes. The separate NEMA11 discussion is outside
this board's scope.

A checked item states its verified CAD/source scope. Firmware, physical assembly,
procurement and bench acceptance have their own unchecked items. Current routing
passes; the complete board is **not yet signed off for a V2 order**.

The [4 November independent review](v2-independent-final-review-2026-11-04.md)
is addressed by the following actions; checked items retain their stated
CAD scope:

- [x] Strengthen ENABLE_N/SLEEP hardware bias to 10 kΩ and regenerate the BOM.
- [x] Add local 100 nF DATA_VBUS-to-ground bypass beside U_ESD and requalify CAD/CAM.
- [ ] Qualify PD-only USB-presence detection against reverse diode leakage.
- [ ] Validate actual current/temperature; the 0.378 A calculation is
  a supply/resistor-only model, not a complete maximum-current guarantee.

## Original NEMA14 requirements retained

- [x] **RP2040 controller:** RP2040 C2040, external 2 MB QSPI flash, reset/BOOT
  recovery and SWD access are retained in the source and connected copper.
- [x] **NEMA14 bipolar motor drive:** A4988, STEP/DIR, enable/sleep, two winding
  outputs and fixed 1/16 microstepping are retained. Target motor remains
  14HM11-0404S, rated 0.4 A/phase. The actual default current limit is about
  **0.351 A nominal**, not an assumed 0.4 A.
- [x] **USB-C data and separate PD power:** both upright GCT USB4145 sockets,
  programming/control data, CH224A C42459160 with a 56 kΩ 15 V request, 3.3 V
  buck supply and the diode power-OR connections are retained.
- [x] **PD-voltage ADC:** R_VM_H/R_VM_L are 100 kΩ/10 kΩ, connected to the actual
  PD_VBUS net and GPIO28/ADC2. Nominal voltage conversion is ×11.
- [x] **POWER_GOOD readable:** PD_GOOD reaches GPIO10 with a 10 kΩ 3.3 V pull-up.
- [x] **USB data protection:** USBLC6-2SC6, both data lines, 27 Ω series
  resistors, grounds and the DATA_VBUS reference connection are retained.
- [x] **RGB LED:** RGB device, three current-limit resistors, three GPIO-driven
  switching transistors and reset pull-downs are present. See the power-mode
  behavior below before accepting all operating modes.
- [x] **Buzzer and temperature:** the compact magnetic buzzer, driver, flyback
  diode and decoupling are present; TMP102 and its I²C pull-ups are retained.
- [x] **Crystal and bypass components:** 12 MHz crystal, two 15 pF load
  capacitors, XOUT resistor, MCU/flash/driver power decoupling and bulk capacitor
  are retained. The routed oscillator stays on top without vias.
- [x] **Mounting geometry:** four Ø3.2 mm holes on a 26 mm square, with Ø6.4 mm
  screw-head envelopes on both outer surfaces, are retained in CAD.
- [x] **Seven schematic sheets:** every component is represented; the current
  native schematic-placement command exits successfully. Visual approval of
  clarity, labels and port presentation remains separate.
- [x] **Native tscircuit PCB/schematic/3D views:** the exact checked board is
  published, and the standalone native viewer passed its PCB/3D/schematic smoke check.
- [x] **V2 native motor-and-wire CAD preview:** the default preview now includes the motor reference, four direct WAGO leads; mounting hardware is omitted pending rear-interface confirmation. Physical rear retention, factory wire fit and tool/USB operating access remain open under MECH-01.
- [x] **Bottom logo and exact evaluation disclaimer, CAD scope:** all 532 vector paths read correctly from below, remain inside the board and pass ink-to-pad/hole/edge/head and label checks. Final manufacturing CAM remains part of RELEASE-01.
- [ ] **All components available and affordable at JLCPCB:** a complete current
  live-stock, Economic/Standard eligibility and assembly-price confirmation is
  still needed. Dated catalog/mirror snapshots are not purchasing acceptance.

## Initial V2 requirements and later accepted choices

- [x] **Large bottom USB labels:** 3.2 mm PWR/DATA knockout blocks, checked
  against pads, holes, artwork and the final exported Gerber. All records
  outside these two labels, the revision caption and the translated wordmark
  are preserved from dev.8.
- [x] **Measure both coil currents with the RP2040:** independent 50 mΩ inline
  shunts, INA240A1PWR amplifiers and 100 Ω/10 nF output filters reach GPIO26/ADC0
  and GPIO27/ADC1. They are separate from the A4988 regulation shunts.
- [x] **Correct sensor routing:** all four Kelvin pickups join the load-current
  conductors only at their shunt pads. Six motor-current path sections have
  connected copper at least 0.30 mm wide. This is a routing check; calibration,
  chopper-transient behavior and sampled-current accuracy need bench acceptance.
- [x] **Replace JST with a spring clamp:** one four-pole WAGO **250-204 /
  C2765063**, with poles 1 A+, 2 A−, 3 B+, 4 B−, replaces the JST/two-terminal
  alternatives. Its supplier housing/courtyard fits the final CAD layout.
- [ ] **Factory motor leads fit the clamp:** WAGO's documented bare stranded
  range is 0.2–1.5 mm² / 24–16 AWG with 8.5–9.5 mm stripping. The motor drawing
  does not establish factory lead CSA/insulation diameter. Verify actual leads,
  retention, button access and repeated connection with samples.
- [x] **Smaller board:** final accepted dimensions are **34.5 × 34.5 × 1.6 mm**,
  four layers. This removes 0.25 mm per side from V1's 35 mm board. The earlier
  request for 0.5 mm per side was superseded by the accepted 34.5 mm outline.
- [x] **Top assembly:** all fitted components are on top. Five bare debug pads
  are on bottom; they do not require bottom component placement. Through-hole
  solder joints still need supplier process approval.
- [x] **Both encoder capacitors on top:** C_ENCODER is 100 nF and C_ENCODER_BULK
  is 1 µF, both fitted on top across 3.3 V/GND.
- [x] **Optional encoder retained:** AS5600 is bottom/DNP, connected to the
  shared I²C bus. Installing it and verifying rear shaft, magnet and air gap
  are separate mechanical/functional work; an operating encoder is not proven.
- [x] **Temperature/encoder I²C moved to spare pins:** GPIO4/5 on I²C0 leave
  GPIO26/27 free for current ADC inputs. Firmware must use the V2 pin map.
- [x] **USB footprints reimported:** checked with tscircuit 0.0.3062,
  core 0.0.2259 and CLI 0.1.2429. Both locating holes and four shell tabs per
  connector are retained; no signal lands or connector poses moved.
- [x] **USB slot rotation fixed:** J_DATA's capsule is at 90°, J_PD's at 0°.
  Both native geometry and exported G85 tool paths pass the orientation check.
  Board clearance capsules are widened to 1.80 × 1.00 mm for CNC capability;
  centers, axes, round locators and solder lands remain unchanged.
  A minimal repro documents the remaining core `oval` rotation bug.
- [x] **Routing completed:** all 70 physical net groups connected, zero shorts,
  zero PCB DRC errors/warnings, zero floating islands, zero foreign-copper,
  board-edge, mounting-hole or construction violations in the current audit.
- [x] **Via sizes/clearances checked:** ordinary minimum pad/drill is
  Ø0.45/Ø0.30 mm, annulus ≥0.075 mm. Three explicitly checked Ø0.50/Ø0.30 mm
  exposed-pad GND thermal vias are retained. Actual supplier drills/slots and
  the defined mounting clearances are included in the checks.
- [x] **Separate GitHub repository and tscircuit package:** both use
  AnasSarkiz/NEMA14_RP2040_V2. Source and evidence were pushed; the registry
  contains only eight preview/metadata files. V1's package remains unchanged.
- [x] **Keep datasheets/history in GitHub:** the public V2 package excludes V1
  assembly, datasheets, supplier model files and manufacturing downloads. Model
  URLs point to verified immutable assets in the new V2 GitHub repository.

## Findings and remaining acceptance

| ID | Status | Acceptance required |
| --- | --- | --- |
| ART-01 | Resolved in CAD | Official wordmark and both evaluation lines read correctly from below and pass actual vector-ink pad/hole/edge checks. See [full artwork and assembly](v2-motor-assembly.md). |
| ART-02 | Resolved | DATA follows the left-edge data connector. Essential legends pass the [actual Gerber ink review](v2-critical-silkscreen.md). |
| BEHAVIOR-01 | Needs acceptance or a design change | RGB's common anode is DATA_VBUS powered. It does not light with PD power alone; the 3.3 V power LED remains available. Confirm whether standalone PD operation requires RGB status. |
| MECH-01 | Open | Confirm factory wire gauge/CSA, clamp retention, button/tool/wire access and actual motor/PCB/fastener assembly. |
| BUY-01 | Open | Verify live JLCPCB stock/quote for the complete fitted BOM, especially WAGO C2765063, inline shunts C713441, regulation shunts C186557 and bulk capacitor C193627. |
| ASSY-01 | Open | Confirm Economic assembly eligibility and cost, WAGO through-hole soldering and USB shell-joint process, plus supplier pickup/rotation approval for V2. |
| ELEC-01 | Local bulk geometry corrected; bench/stackup acceptance open | Bulk is now beside the driver, with short feeds and nearby ground returns. Full motor-current and Kelvin checks pass. USB behavior, transients and temperature remain prototype bench checks. |
| FW-01 | Open | Implement/adapt firmware for the V2 pin map, PD-good/voltage interlocks, boot/USB behavior, ADC sampling/zero-gain calibration and motor switching. No application firmware is present in this repository. |
| BENCH-01 | Open | Verify PD negotiation, 3.3 V regulation, USB boot/enumeration, crystal startup, signed coil-current accuracy, temperatures, motor load behavior, RGB/buzzer and I²C/encoder operation as fitted. |
| DOC-01 | Resolved | The 22 source-library advisories are corrected at their definitions. Fresh source, pin and schematic diagnostics are zero; a negative-control IC still triggers genuine warnings. See [analysis evidence](v2-analysis-warnings.md). |
| SCH-01 | Open visual approval | Native placement passes. Review the seven schematic pages for readability and the original box/port-gap concern before final signoff. |
| RELEASE-01 | V2 files prepared; supplier acceptance pending | Use only the V2 order-review folder and its independent CAM audit. Obtain stock/quote, pickup, stencil, filled/capped-via and solder-process acceptance. Historical V1 manufacturing artifacts are not V2 files. |

## Evidence

- [Current hash-bound routing/source/placement checks](../artifacts/v2/routing/verification.json).
- [Independent physical copper and pin/net audit](../artifacts/v2/routing/physical-routing-audit.json).
- [Current-path and Kelvin checks](../artifacts/v2/routing/functional-routing-audit.json).
- [USB drill-direction check](../artifacts/v2/routing/usb-slot-export-check.json).
- [Current read-only requirements/artwork inspection](../artifacts/v2/requirements-review.json).
- [Actual publication readback and V1-preservation receipt](../artifacts/v2/publication/registry-verification.json).
- [V2 design and ADC details](v2-design.md), [current firmware pin map](firmware-interface.md),
  [terminal/assembly constraints](v2-wago-repack.md),
  [USB reimport and repro](../references/v2/usb-reimport-2026-11-03/README.md).

The 2.0.0-dev.7 update intentionally repacks the bulk capacitor, buzzer and nearby passives. All fitted identities/values and V2 physical pin/net assignments remain checked; the short wire shapes and motor/terminal poses are retained.
The dev.8 review fixes add C_ESD and change only R_ENABLE/R_SLEEP values;
all existing component positions, traces and vias are preserved. See
[the implementation proof](v2-review-fixes.md).
Unchecked items stay open until their stated evidence is available.

- [x] **Driver bulk capacitor placement corrected:** 47 µF / 35 V retained,
  supply-land distances 4.03/5.02 mm, conservative copper-path bounds
  7.80/10.37 mm, two nearby GND returns; local ceramic remains fitted.
- [x] **Fabricator-compatible locating-slot width:** native and exported
  capsules are 1.00 mm wide while preserving the imported tool centerlines.
- [x] **No component-body collisions in the nominal CAD screen:** all 98
  fitted supplier STEP bodies checked at 0.10 mm separation.

[Prototype order handoff and remaining process/physical acceptance](v2-prototype-order.md).
