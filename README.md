# NEMA14 RP2040 V2 — independent V2 project

V2 has its own repository and registry package:

- GitHub: https://github.com/AnasSarkiz/NEMA14_RP2040_V2
- tscircuit: https://tscircuit.com/AnasSarkiz/NEMA14_RP2040_V2
- V1 remains at `AnasSarkiz/NEMA14_RP2040`.

The separate tscircuit preview is **2.0.0-dev.5**.
[Publication details and verification](docs/v2-publication.md).

Latest update: the default native preview includes the motor and four direct WAGO leads. The tscircuit wordmark and evaluation statement are repositioned clear of pads and read correctly from underneath. [Assembly and limits](docs/v2-motor-assembly.md) · [Full underside artwork](artifacts/v2/routing/full-bottom-silkscreen.svg).

The 22 prior analysis warnings are resolved; fresh source, pin and schematic checks report zero diagnostics. [Analysis evidence](docs/v2-analysis-warnings.md).

USB-C locating capsules rotate correctly with their connectors.
Tested with tscircuit **0.0.3062**, core **0.0.2259** and CLI **0.1.2429**.
[Root cause and reimport evidence](references/v2/usb-reimport-2026-11-03/README.md) ·
[Minimal oval-rotation repro](repros/usb-slot-rotation/README.md).

[Old + new requirements checklist and open findings](docs/v2-requirements-checklist.md).

**All 70 physical net groups are connected. Zero shorts, zero native DRC errors
or warnings, and zero floating copper islands.** The independent audit checks the
actual supplier pads, traces, plated barrels and pours on all four copper layers.
All 342 physical pin/net assignments and source placement records are preserved.

[Checks and engineering limits](docs/v2-routing.md) ·
[Top PCB SVG](artifacts/v2/routing/top.svg) ·
[Standalone tscircuit viewer](artifacts/v2/routing/NEMA14-V2-routing-viewer.html) ·
[Verification manifest](artifacts/v2/routing/verification.json)

34.5 × 34.5 × 1.6 mm, four layers, one outward-facing **WAGO 250-204 /
C2765063** four-pole spring terminal. Data USB-C is left, PD USB-C is top,
and motor wires exit at the bottom. Both coil-current ADC channels, RGB LED,
buzzer, temperature sensor, flash and crystal are retained. Both encoder
capacitors are on top; the optional encoder is bottom/DNP and five bare debug
pads are underneath. Both USB sockets retain their supplier locating holes.

The saved routing has 639 trace records and 359 through vias. Source checks,
65 placement-proximity checks, schema and typechecking pass. Functional routing
checks confirm six full-width motor-current paths, four shunt-only Kelvin pickups
and a top-only oscillator. `npm run route:v2` restores the checked copper only
when the source and all required proof hashes match. The main JSON preview shows
this checked routing. Download the standalone HTML and open it in Chrome for
PCB, schematic and 3D views; all models and rendering assets are embedded.

**Passing routing checks are not manufacturing release.** USB reference and
thermal/power integrity, factory motor-wire fit, procurement and hardware
current-sense calibration remain unqualified. Manufacturing export remains blocked. The separate tscircuit package is a
read-only engineering preview, with no manufacturing downloads. See [V2 design details](docs/v2-design.md) and
[WAGO changes](docs/v2-wago-repack.md).

**The ordered V1 board and public tscircuit package are unchanged.**
Sections and artifacts below describe historical V1 work.

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
