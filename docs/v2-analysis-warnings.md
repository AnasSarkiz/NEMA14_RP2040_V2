# V2 schematic analysis warnings

Version **2.0.0-dev.3** corrects the definitions that generated 22 source-analysis warnings in dev.2. No traces, vias, pours, pads, holes, connector positions or physical pin/net connections changed.

| Saved warning | Count | Correction |
| --- | ---: | --- |
| Reference designator convention | 5 | Define the crystal and four MOSFETs using their native electrical primitives before source analysis. |
| Missing power-pin specification | 6 | The crystal, TVS and four MOSFETs are passive/discrete parts, rather than generic ICs. |
| Missing ground-pin specification | 3 | Define the TVS correctly; use custom pinouts for the four-terminal RGB LED and buzzer. |
| Underspecified component pins | 1 | Declare the TVS grounded anode and passive cathode. |
| Missing manufacturer part number | 7 | Mark seven bare debug/test pads as do-not-place. Their physical copper remains on the PCB. |

Imported symbols, footprints and fitted CAD models are preserved. Native crystal and MOSFET pin aliases are added without changing physical pin numbers or nets. Crystal load-capacitance metadata is expressed in farads (`10e-12`); the two physical 15 pF oscillator capacitors are unchanged.

The original generic-chip warnings were created before the later source-classification pass. Correcting definitions before analysis removes their cause. The checks remain enabled: an intentionally underspecified IC still produces missing-power, missing-ground and underspecified-pin warnings.

Fresh source and pin checks report zero diagnostics. The exported seven schematic sheets also pass fresh schematic checks with zero diagnostics. Provisional sheet-boundary warnings from core's initial single-sheet layout are superseded by the regenerated seven-sheet layout and checked again; they are not accepted as evidence of correct final placement.

[Analysis receipt](../artifacts/v2/routing/analysis-verification.json) and [physical preservation receipt](../artifacts/v2/routing/analysis-cleanup-preservation.json) record the dev.3 analysis correction. Later text-only changes carry their own [preservation receipt](../artifacts/v2/routing/silkscreen-preservation.json). All 1,058 copper records and all 97 fitted CAD models and transforms match dev.2. The seven bare-pad placeholder boxes are removed from the assembly view.

This closes the analysis-warning finding only. The [requirements checklist](v2-requirements-checklist.md) still records artwork corrections, wire fit, procurement, electrical review and bench acceptance. V2 is an engineering preview, not a fabrication release.
