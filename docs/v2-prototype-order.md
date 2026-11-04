# V2 prototype order handoff

**Current order package: 2.0.0-dev.10.** It relocates the wordmark to empty underside space and retains large
bottom PWR/DATA knockout legends; the BOM, CPL and electrical layout are unchanged from dev.8.
[Silkscreen update](v2-port-labels.md).

**Dev.8 closed the two electrical-review fixes:** strong 10 kΩ
ENABLE/SLEEP bias and local USB ESD bypass. Read the
[implementation and remaining acceptance](v2-review-fixes.md).

Use only `artifacts/v2/order-review/` for this revision. Files elsewhere under
`artifacts/` include historical V1 exports and must not be ordered as V2.
The handoff manifest identifies the exact routed Circuit JSON and CAM hashes.
`scripts/export-v2-order.py` refuses stale or failing routing checks.

## Changes since the working V1

- 34.5 × 34.5 mm, four layers, 1.6 mm board thickness; original 26 mm mounting pitch.
- WAGO 250-204 / C2765063, poles 1 A+, 2 A−, 3 B+, 4 B−.
- Two 50 mΩ inline shunts and INA240A1 amplifiers for signed winding telemetry.
- Both encoder capacitors fitted on top; optional AS5600 remains bottom/DNP.
- Correct USB locating holes and capsule directions; all eight shell joints retained.
  Nominal supplier capsules are 1.51 × 0.71 mm. The board widens them to
  1.80 × 1.00 mm to meet [JLCPCB's NPTH CNC-slot minimum](https://jlcpcb.com/capabilities/pcb-capabilities/),
  preserving peg centers, tool centerlines and connector pads. The round locator
  stays Ø0.71 mm. Use green solder mask; the stencil and mask-web screens assume it.
- Existing 47 µF / 35 V capacitor moved beside the driver, with explicit short
  feeds to both VBB pins. The 100 nF local ceramic remains fitted.
- Buzzer, flyback diode, local bypass and nearby low-power passives repacked.
  Driver regulation shunts, crystal and current amplifiers retain their locations.
- Original RGB, buzzer, temperature, PD-good and voltage sensing are retained.
  RGB still uses DATA_VBUS and is off when only PD power is connected.

The 100 Ω / 10 nF ADC output filters retain their 159 kHz corner. They suppress
fast interference; firmware must sample/average the switching current. They
do not create an averaged DC current measurement by themselves.

The added C_ESD uses the existing Basic C1525 100 nF/16 V 0402 part. Its
board-level placement courtyard is 0.10 mm around the unchanged supplier land
envelope; copper and supplier body clearance are independently checked. All
existing component positions and traces are preserved.

## JLCPCB handoff

After generation, upload `NEMA14_RP2040_V2-Gerbers.zip`, `NEMA14_RP2040_V2-BOM.csv` and
`NEMA14_RP2040_V2-CPL.csv`. Keep the manifest and placement-orientation review with them.
These are a prototype/DFM handoff, not a supplier stock reservation or an order.

Request four layers, 34.5 × 34.5 mm, 1.6 mm, ENIG, at least 35 µm outer copper
and 17.5 µm inner copper. Layer order is F_Cu / In1_Cu / In2_Cu / B_Cu.
Include both plated and non-plated drill files, including the USB locating slots.
The four mounting holes are Ø3.2 mm at (±13, ±13), with board-centre origin.
Do not mirror CPL coordinates. All 98 fitted parts are on top; seven bare probe
pads and the optional bottom encoder are excluded from purchased assembly.

The stencil screen uses 100 µm thickness and checks each actual aperture's area
ratio. MCU, PD and driver exposed pads use four windows at 60% total coverage.
`Thermal-Via-Process.csv` identifies three exposed-pad vias requiring a quoted,
approved filling/capping/planarization process. Obtain supplier approval before
releasing assembly; a low-cost SMT quote must not be assumed to include it.

`Through-Hole-Joints.csv` lists four WAGO pins and eight USB shell tabs.
The WAGO needs through-hole soldering. The USB shell stakes need top-side
secondary soldering: do not assume their short stakes can be bottom-wave soldered
through the 1.6 mm PCB. Ask JLCPCB to confirm assembly eligibility and price.

Check every polarized part and pin 1 in the supplier placement preview against
`placement-orientation-review.json`, especially U_ESD, U_MCU, U_BUCK, U_PD,
U_DRV, U_IA/U_IB, flash, RGB LED, bulk capacitor and both USB sockets.
The native footprint rotation does not by itself prove the supplier pickup convention.

## Motor leads and mounting

WAGO's documented bare fine-stranded range is 0.2–1.5 mm² (24–16 AWG), with
8.5–9.5 mm stripping. The current [official motor page](https://www.omc-stepperonline.com/nema-14-bipolar-0-9deg-11ncm-15-58oz-in-0-4a-10v-35x35x28mm-4-wires-14hm11-0404s)
and [full datasheet](https://files.omc-stepperonline.com/14HM11-0404S_Full_Datasheet.pdf)
were checked online on 3 November 2026. They specify colours, 300 mm lead length
and 0.4 A per phase, but do not specify wire gauge.
Factory-wire compatibility therefore remains unverified. Do not approve it
based on the 3D wire diameter or assume that a smaller conductor will be retained.
Obtain the motor maker's specification or check the actual conductors and retention.

The preview is a dimensional reference, not a qualified rear fastening design.
Check the actual V1 mounting arrangement, WAGO pin protrusion, motor end-cap
screws, shaft/magnet clearance and button/tool access before final assembly.

## Firmware and first-board checks

Use GPIO4/5 on I²C0. GPIO26/27 are now current ADC inputs; GPIO28 remains the
PD-voltage ADC and GPIO29 the USB-voltage/presence ADC. See
[the complete pin map](firmware-interface.md). Do not flash V1 firmware that
still drives I²C on GPIO26/27.

Keep the bridge disabled during power-up and initial ADC zero calibration.
Start with current-limited power, verify 3.3 V/PD negotiation/PG and USB boot,
then test signed current against an external meter and establish sampling/gain
calibration before load testing. The fixed regulation network sets about 0.351 A
nominal; telemetry does not replace the A4988's current regulation.
Check driver/buck temperatures, motor behavior, RGB/buzzer and I²C operation.
Working V1 hardware is useful evidence, but these changed circuits/layout need
their own prototype bench checks.
