# NEMA14 RP2040 V2 prototype design

V2 starts from ordered V1 source commit `b6e2de5`. It is not a manufacturing
release. The ordered board, its public tscircuit package and its JLCPCB order
remain V1. Old files under `artifacts/` are historical unless under `artifacts/v2/`.

## Requested changes

| Item | V2 source implementation |
|---|---|
| Outline | 34.5 × 34.5 × 1.6 mm, four layers; remove 0.25 mm from each original 35 mm edge. Mounting holes remain Ø3.2 mm on a 26 mm square. |
| Both winding currents | Two inline 50 mΩ shunts and INA240A1 amplifiers; outputs reach RP2040 ADC0/ADC1 through 100 Ω / 10 nF filters. |
| Motor terminal | One WAGO 250-204 / C2765063 four-pole spring terminal. Exact supplier footprint/CAD imported; housing within the outline. Procurement and factory lead fit remain unresolved. |
| Buzzer | Compact MLT-5020 / C94598, 5.2 × 5.2 mm, passive magnetic, 2–4 V / 100 mA, 4 kHz; smaller DMN2300UFB4 MOSFET and B5819WS flyback diode. Sound level differs from the original. |
| RGB drivers | Three DMN2300UFB4-7B MOSFETs replace the larger pre-biased BJTs. Existing 1 kΩ LED limiters remain; new 10 kΩ gate pull-downs keep the LEDs off during reset. |
| Debug pads | Five bare copper probe pads on bottom; both 0.8 mm BOOT recovery pads remain top. No bottom fitted assembly is added. |
| Encoder capacitors | C_ENCODER (100 nF) and C_ENCODER_BULK (1 µF) fitted on top; optional AS5600 IC remains bottom/DNP. |
| USB locating holes | Both USB4145 footprints retain the original round NPTH and now include the supplier's oval NPTH. All four soldered shell tabs remain. |

## Electrical design

The A4988's existing 0.24 Ω SENSE1/SENSE2 regulation resistors are unchanged.
They control the driver's approximately 0.351 A nominal peak phase current.
They are not substituted for the telemetry shunts.

Each new 0.05 Ω shunt is in series with one winding output, before the motor
terminal. This allows bidirectional winding-current sensing during driven and
recirculating current, subject to the amplifier's common-mode/transient limits.
The driver side connects to IN_POS; the terminal side connects to IN_NEG.
Dedicated Kelvin branches must join at the shunt pads, outside load-current
branches. Input common mode switches with the A4988 bridge.

The compact draft uses **INA240A1PWR / C93965 (TSSOP-8)** to save space.
Its pinout is 1 NC, 2 IN_POS, 3 IN_NEG, 4 GND, 5 VS, 6 REF2, 7 REF1, 8 OUT.
NC is explicitly unconnected. The physical pin map is independently checked in
the generated source; it differs from the larger SOIC INA240A1DR package.

The target remains a single top assembly side. The pictured KEFA terminal was
also evaluated with underside circuitry, without a verified fit in the bounded
searches. It is not the selected footprint in this compact draft. The smaller
INA240 package has a higher catalog price (about $2.15 single-part versus about
$1.02 for SOIC); these are snapshots, not a JLCPCB quote or guaranteed stock.

With VS and REF1 on 3.3 V and REF2 grounded, the nominal zero-current output
is 1.65 V. Gain is 20 V/V, giving **1 V/A** across a 50 mΩ shunt:

`I = (V_ADC - V_ZERO) / (20 × 0.05 Ω)`

At ±0.4 A, nominal output is 1.25–2.05 V. Shunt dissipation is 8 mW at 0.4 A.
Use measured zero offset and gain calibration rather than assuming exactly
3.300 V. The RP2040 channels are multiplexed, not sampled simultaneously.
Firmware must choose sample timing/filtering appropriate to PWM and microsteps;
the RC network is not a substitute for switching-transient validation.

| RP2040 pin | Function |
|---|---|
| GPIO26 / ADC0 | Winding A current |
| GPIO27 / ADC1 | Winding B current |
| GPIO28 / ADC2 | PD motor-supply voltage, existing 100 kΩ / 10 kΩ divider |
| GPIO29 / ADC3 | Existing programming-USB voltage/presence divider |
| GPIO4 / GPIO5 | Temperature/optional encoder I²C0 SDA/SCL, moved from GPIO26/27 on I²C1 |
| GPIO10 | Existing POWER_GOOD input |

RGB LED, buzzer, temperature sensor, flash, crystal, USB data and optional DNP
encoder are retained. Firmware must adopt GPIO4/5 and hardware I²C0 instead of the former I²C1 bus.

The optional encoder's **100 nF C_ENCODER** and **1 µF C_ENCODER_BULK** are
fitted on the top assembly side, across V3V3 and GND. Their top courtyards are
reserved in the placement search. U_ENCODER remains bottom/DNP; five bare probe pads also use bottom copper without a placement operation. Final
routing must keep the supply and ground paths short through vias to the bottom
sensor. The saved board now has fully checked copper; actual encoder operation
requires a fitted sensor, magnet and bench checks.

## USB footprint evidence

**Updated 3 November 2026:** the fresh exact-footprint reimport with latest
CLI 0.1.2429 and tscircuit 0.0.3062 now includes the capsule NPTH correctly.
The previous manual restoration used `oval`, which does not inherit a connector's
rotation; `pill` does. J_DATA now has a vertical rotated capsule at 90°, while
J_PD retains a horizontal capsule at 0°. All supplier pad positions, the reviewed
footprint origin and CAD alignment are preserved.

See [reimport evidence and root cause](../references/v2/usb-reimport-2026-11-03/README.md)
and the [minimal core oval-rotation repro](../repros/usb-slot-rotation/README.md).
The source/drill regression now checks direction as well as hole count and size.
No existing physical V1 board should be drilled to add these holes.

## Prototype order handoff update

The existing bulk capacitor is now beside both driver supply pins, with short
feeds and two local ground returns. All 97 fitted part identities/values and V2
pin assignments are preserved. The final copper is fully connected with zero
shorts and native DRC errors/warnings. Manufacturing exports and independent
actual-CAM checks are separate from the source checks.

Nominal supplier USB capsules remain in the import. This board widens their
clearance envelope to 1.80 × 1.00 mm for JLCPCB's minimum 1.0 mm NPTH CNC slot,
without changing centers, tool centerlines, rotation or solder lands.

See [the V2 order instructions](v2-prototype-order.md) for the exact files,
stencil, filled/capped exposed-pad vias, through-hole processes, firmware and
remaining factory-wire/supplier acceptance.
