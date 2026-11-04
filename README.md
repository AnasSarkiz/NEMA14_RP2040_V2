# NEMA14 RP2040 V2

V2 has its own [GitHub repository](https://github.com/AnasSarkiz/NEMA14_RP2040_V2)
and [tscircuit package](https://tscircuit.com/AnasSarkiz/NEMA14_RP2040_V2#3d).
This revision is **2.0.0-dev.10**. The working ordered V1 remains separate and unchanged.

**Wordmark:** moved into the empty middle-left underside area, preserving its
original scale and strokes and clearing all pads and holes.

**Port labels:** large bottom PWR/DATA knockout blocks, checked in the final Gerbers.
[Artwork and preservation evidence](docs/v2-port-labels.md).

**4 November electrical review fixes:** ENABLE/SLEEP now use 10 kΩ defaults and C_ESD adds
local 100 nF bypass at USBLC6 VBUS. Existing components, traces and vias retain
their positions. [Implementation and acceptance](docs/v2-review-fixes.md).

[Prototype order files](artifacts/v2/order-review/) · [Order/process instructions](docs/v2-prototype-order.md) ·
[Requirements checklist](docs/v2-requirements-checklist.md) · [Verification](artifacts/v2/routing/verification.json)

The existing 47 µF / 35 V bulk capacitor is now beside the driver. Its positive
land is 4.03/5.02 mm from the two VBB pins; the conservative complete copper-path
bounds are 7.80/10.37 mm. Two nearby ground returns connect it to the driver
and planes. The buzzer and nearby passives were repacked. There are now 98 fitted
parts, all on top. Only the two driver-bias resistor values change; the new
bypass reuses C1525 already in the BOM. Both encoder capacitors remain on top.

**70/70 physical nets connected; zero shorts, zero native PCB DRC errors or
warnings, and zero floating copper.** Independent checks preserve all 344
physical pin/net assignments, verify six ≥0.30 mm winding-current paths, all
four shunt-only Kelvin pickups, and a top-only crystal circuit without vias.
The current routing contains 666 trace records and 357 through vias.
All 98 fitted supplier STEP bodies pass the component-clearance screen.
Source/pin/schematic diagnostics are zero; 35 source checks and 68 placement
proximity checks pass. These are CAD screens, not tested V2 hardware.

34.5 × 34.5 × 1.6 mm, four layers, WAGO 250-204 / C2765063, separate upright
USB-C data and 15 V PD power, RP2040, A4988, two winding-current ADC channels,
RGB LED, buzzer, temperature sensor, flash and crystal. GPIO4/5 now carry I²C0;
GPIO26/27 are current ADC inputs. [Firmware interface](docs/firmware-interface.md).
RGB remains off with PD-only power because its supply is DATA_VBUS.

Both USB locating capsules follow the connector rotations. A board-level
clearance adaptation widens them from the nominal supplier 1.51 × 0.71 mm to
1.80 × 1.00 mm for JLCPCB's CNC-slot capability, preserving the tool centerlines,
round locators and every solder land. [Fabrication proof](artifacts/v2/usb-fabrication-adaptation.json).
The latest reimport and original converter repro remain in
[the USB investigation](references/v2/usb-reimport-2026-11-03/README.md).
Toolchain: tscircuit 0.0.3062, core 0.0.2259, CLI 0.1.2429.

[Top PCB SVG](artifacts/v2/routing/top.svg) ·
[Portable PCB viewer](artifacts/v2/routing/NEMA14-V2-routing-viewer.html) ·
[Portable motor/wire viewer](artifacts/v2/assembly/NEMA14-V2-assembly-viewer.html) ·
[Readable underside artwork](artifacts/v2/routing/full-bottom-silkscreen.svg).
The approved short, smoothly curved leads are retained. Rear mounting and actual
factory-wire retention remain unverified; this is a dimensional assembly preview.

Use only the V2-named Gerber/BOM/CPL files in the order folder. Supplier stock,
quote, pickup orientation, through-hole/USB-shell soldering and exposed-pad
filled/capped-via process acceptance remain pending. WAGO accepts bare stranded
24–16 AWG; the current official motor page and drawing do not publish wire gauge.
Firmware, current calibration and first-board electrical/thermal checks follow
the prototype build. The tscircuit package contains eight preview/metadata files;
manufacturing files, datasheets and history stay in GitHub.

**Sections and artifacts below describe historical V1 work.**

## Bottom silkscreen and lean publication — 1.13.2 (V1 history)

Registry uploads contain only previews and manufacturing downloads. Full source,
datasheets and engineering history stay in GitHub. See [publishing policy](docs/tscircuit-publishing-policy.md).

The bottom layer now carries the official tscircuit wordmark and “For evaluation only; not FCC approved for resale.” Copper, pads, drills, placements, nets and schematic records are preserved. See [artwork details](docs/bottom-silkscreen.md), [fabrication preview](artifacts/bottom-markings/bottom-silkscreen.png) and [verification](artifacts/bottom-markings/verification.json).

## CH224A migration — 1.13.0 (hardware prototype)

**Order review, 17 October 2026: hold the assembled-board order.** The final review identifies regulator/driver layout corrections, screws that cannot reach the motor with the proposed stack, and feature/process decisions to resolve. See [the final order review](docs/final-order-review-2026-10-17.md). The passing short/DRC checks remain valid for their geometric scope.

U_PD is now CH224A C42459160. A 56 kΩ CFG1 resistor preserves the fixed 15 V request; R_PD is 0 Ω and C_PD remains 1 µF / 50 V. Existing placements, mounts, USB positions and the ESSOP10 pads are retained. See [electrical changes, validation and remaining limits](docs/ch224a-migration.md) and [current BOM](artifacts/jlcpcb-review/JLCPCB-BOM.csv).

The sections below describe the earlier baseline. Their byte-preservation claims and historical qualification receipts do not certify this migration. Use the current migration test receipts before manufacturing review.

## Schematic pin alignment — 1.12.2

The USB connector pin stems now meet their symbol boxes in both functional sheets. Only schematic display lengths changed; pin endpoints, wires, source connectivity, PCB geometry and the motor assembly geometry remain identical to 1.12.1. [Correction and preservation evidence](artifacts/schematic-pin-alignment/verification.json) · [Updated A4 schematic](artifacts/schematic-a4.pdf).

## Motor and hardware assembly preview

The 1.12.1 assembly rotates the motor’s fixed-wire outlet toward the board’s JST edge. Four colored leads take a short loop through insulated splices to a 28-AWG JST-SH pigtail. The SHR-04V-S plug seats in the BM04B-SRSS-TB header at the catalog’s 6.3 mm mated height. Pin order is black A+, green A−, red B+, blue B−. There is no motor-side socket.

[Assembly details](docs/top-assembly.md) · [Full assembly](artifacts/top-assembly/assembly-complete.png) · [JST connection](artifacts/top-assembly/assembly-jst-connection.png) · [Top view](artifacts/top-assembly/assembly-top.png) · [Native assembly JSON](assembly.circuit.json).

PCB geometry and fabrication files are preserved from 1.12.0; schematic pin display lengths were corrected in 1.12.2. Nominal CAD checks pass for conductor separation, component clearance and plug alignment. Rear motor retention and physical crimp/latch fit remain unverified.

# NEMA14_RP2040 — hardware prototype

**CAD qualified for hardware-prototype publication and JLCPCB engineering/order review.** All 63 physical nets are connected; native DRC has zero errors and warnings. Fresh default and order-review CAM audits pass. Native passive-orientation advice retains its actual command status and requires supplier pickup confirmation.

35 × 35 × 1.6 mm, four layers. Actual JSON and drills verify four Ø3.2 mm mounts at (±13, ±13) and minimum via drill/pad Ø0.30/Ø0.45 mm. Upright USB-C sockets occupy opposite edges, leaving 23.300 mm between the defined 10 mm plug housings. The nominal model screens maximum Ø6 × 3 mm heads within a Ø6.4 mm envelope and an Ø6 mm tool path.

All 81 fitted parts are TOP SMT; seven bare top test pads and three BOTTOM encoder/DNP parts are excluded from factory placement/paste. USB/PD, JST-SH A+/A−/B+/B−, TMP102, LEDs, buzzer, driver, flash and the short TOP oscillator are retained. Exact electrical source arrays and all 13 oscillator geometries match the GitHub baseline.

[Current evidence and blockers](docs/opposite-edge-review.md) · [23-check receipt](artifacts/resume-validation.json) · [Connectivity](artifacts/physical-connectivity.json) · [JLCPCB package](artifacts/jlcpcb-review/JLCPCB-OrderReview.zip) · [Six-sheet schematic](artifacts/schematic-a4.pdf).

Supplier/process/pickup approval, physical cable/screw/harness checks and firmware/electrical/thermal bench testing remain outstanding. Rear motor fit and encoder shaft/magnet/air gap are unverified. No order or payment was submitted.

Saved 1.12.0 board SHA-256: `f45cf8eac9c29d17873cfb8719b3996c870c2552bf8077f68041e46fed1c5e4d`.
