> Historical placement/procurement snapshot from 2 November 2026. Current routing
> and remaining acceptance items are in the [requirements checklist](v2-requirements-checklist.md)
> and [routing verification](v2-routing.md). Statements about an unrouted seed or
> unpublished package below describe that earlier snapshot.

# WAGO 250-204 V2 placement — 2 November 2026

V2 now has a **34.5 × 34.5 mm placement seed using one WAGO 250-204 /
C2765063**, with its housing inside the outline and all fitted parts on top.
The motor terminal faces the bottom edge, data USB-C is on the left, and power
USB-C is at the top. The four Ø3.2 mm mounting holes remain on a 26 mm square;
their Ø6.4 mm screw-head envelopes are retained.

The ordered V1 board, its manufacturing files and its public tscircuit package
are unchanged. The placement seed is unrouted; an isolated initial routing
candidate is now available in [the routing review](v2-routing.md). Neither is a release.

## Terminal and retained functions

| Item | Active V2 implementation |
|---|---|
| Terminal | [WAGO 250-204 / C2765063](https://jlcpcb.com/partdetail/WAGO_INNOVATIVECONNECTIONS-250204/C2765063), exact supplier footprint, OBJ and STEP |
| Body | 15.5 × 12 mm; 13.1 mm installed height; full courtyard about 16 × 12.5 mm |
| Physical pin order | 1 A+, 2 A−, 3 B+, 4 B−; one solder pin per pole |
| Wire connection | Push-button spring clamp, 45° entry; bare stranded 0.2–1.5 mm² / 24–16 AWG; strip 8.5–9.5 mm |
| Current rating | Manufacturer IEC 8 A rating exceeds the target motor’s 0.4 A/phase |
| Current telemetry | Both 50 mΩ inline winding shunts, INA240A1 amplifiers, 100 Ω / 10 nF filters and RP2040 ADC0/ADC1 retained |
| Other functions | RGB, buzzer, temperature sensor, USB data, PD-voltage ADC, POWER_GOOD, flash and crystal retained |
| Encoder | Both 100 nF and 1 µF capacitors fitted on top; optional AS5600 remains bottom/DNP |
| Debug | Five bare bottom probe pads; BOOT/GND recovery pads on top |

The [manufacturer-authored terminal datasheet](https://datasheet.octopart.com/250-204-WAGO-datasheet-164888061.pdf)
provides these mechanical and wire limits. The factory 14HM11-0404S drawing does
not establish its wire CSA/insulation diameter, so actual lead fit remains open.

## Component changes needed for space

Values and net assignments are preserved outside the motor-connector replacement.
Exact supplier footprints and CAD were imported; no supplier courtyard was
reduced to obtain the fit.

| References | Replacement | Electrical basis |
|---|---|---|
| C_BULK | Panasonic EEEFT1V470AR / C193627, 5 mm body | Same 47 µF / 35 V; 240 mA ripple at 100 kHz; 360 mΩ maximum ESR; 6.1 mm maximum seated height |
| R_SHUNT_A/B | Panasonic ERJL06KF50MV / C713441, 0805 | Same 50 mΩ, ±1%; 0.25 W rating versus 8 mW at 0.4 A; amplifier gain remains 1 V/A |
| R_SA/SB | KOA SR731JTTDR240F / C186557, 0603 | Same 0.24 Ω, ±1%; 0.25 W catalog rating versus 38.4 mW at 0.4 A; nominal A4988 current setting remains about 0.351 A |
| C_REF | Samsung CL05B103KB5NNNC / C15195, 0402 | Same 10 nF; reuses the existing ADC-filter capacitor part |

Power ratings require the manufacturer’s temperature derating in the final
thermal review. Primary references:
[Panasonic bulk capacitor](https://na.industrial.panasonic.com/products/capacitors/aluminum-electrolytic-capacitors/series/88931/model/89270),
[Panasonic 50 mΩ shunt](https://industrial.panasonic.com/tw/products/pt/current-sensing-chip-resistors/models/ERJL06KF50MV),
[KOA catalog](https://www.koaspeer.com/pdfs/KOA_2026FullCatalog_Linked.pdf).

The 100 Ω output resistors are now placed near the INA240 outputs, isolating
the amplifier from the ADC trace/capacitive load. The 10 nF capacitors remain
near the ADC pins. The placement budgets are 4.5 mm from resistor centre to
amplifier OUT, 3 mm from filter-capacitor centre to the ADC pin, and at most
12 mm between the resistor and capacitor centres. These are Manhattan placement
distances, not routed trace lengths; quiet ground-referenced routing and bench
validation remain necessary. See the [INA240 datasheet](https://www.ti.com/lit/ds/symlink/ina240.pdf).

The PD bypass capacitor is beside the PD controller, and the rotated buzzer’s
positive pad faces its local supply capacitor. The native audit checks these
positions using the active supplier pin geometry, rather than V1 package offsets.

## Verification and limits

- `npm run build:v2`: native circuit generation, PCB previews and seven schematic sheets.
- `npm run check:v2:source`: 33 electrical/source checks, native schema and both restored USB locating slots.
- `npm run check:v2:placement`: 99 top and six bottom courtyards, board bounds, screw-head envelopes, terminal drills, pad-to-edge clearance and 65 proximity checks.
- `npm run check:v2:schematic`: native schematic placement check for V2.
- [Physical pin/net preservation](../artifacts/v2/net-preservation.json): all 338 non-motor connected pin assignments match V2 baseline `682481f`.

The placement audit reports zero native and independent errors. The minimum
courtyard gap is about 0.005 mm between complete courtyard margins; this is not
a copper-gap measurement. Actual pad envelopes meet the configured 0.25 mm
board-edge minimum. This is a dense placement, with little spare edge margin.

The placement seed has **zero routed traces**. The initial copper candidate and
its unresolved opens are documented in [the routing review](v2-routing.md).
USB series resistors, QSPI, voltage-divider
filters, Kelvin branches, driver return paths and power/ground loops require
review against actual routing, which may require moving parts. Wire/button/tool
access, assembled-motor clearance and supplier drill tolerances need mechanical
qualification. Passing the placement checks does not establish no-shorts/DRC or
manufacturing readiness. Release/export/publication remain blocked.

## Procurement status

These are catalog snapshots, **not live JLCPCB reservations or a quote**:

| Part | Latest checked evidence | Status |
|---|---|---|
| WAGO C2765063 | Prior JLCPCB and mirror stock/price snapshots disagree | Confirm live stock and assembly quote |
| Bulk C193627 | Unofficial JLCsearch mirror: 4,032, $0.2786 at quantity 1–49 | Confirm with JLCPCB |
| Inline shunts C713441 | Mirror: 0; an older JLCPCB page showed stock | Sourcing open |
| Regulation shunts C186557 | Import/LCSC part exists; absent from the checked mirror | Confirm JLCPCB sourcing or qualify an equivalent |

The new shunts therefore remain procurement blockers for a future order.
No new order or public tscircuit upload was made.
