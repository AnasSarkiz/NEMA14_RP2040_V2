# NEMA14 RP2040 V2 — prototype supplier review

This is V2 2.0.0-dev.7. Use these three files for JLCPCB DFM/quote review:

- `NEMA14_RP2040_V2-Gerbers.zip` — four-layer copper, outline, both drill files, masks, silk and screened stencil.
- `NEMA14_RP2040_V2-BOM.csv` — 45 part-number lines, 97 fitted parts.
- `NEMA14_RP2040_V2-CPL.csv` — 97 top placements; board-centre millimetres, no mirroring.

The exact source and file hashes are in `verification.json` and `manifest.json`.
The independent actual-CAM audit is `cam/audit.json`. It passes with no issues.
`review-cam.zip` and `upstream-native-gerbers.zip` are diagnostic audit inputs,
not alternative order packages. Historical V1 CAM elsewhere is not V2.

Choose 34.5 × 34.5 mm, four layers, 1.6 mm, ENIG, green mask, 1 oz outer/
0.5 oz inner copper. USB clearance slots are 1.80 × 1.00 mm, correctly oriented.
The screen assumes a 100 µm stencil and 60% exposed-pad window coverage.

Before releasing assembly, obtain JLCPCB's stock/quote and pickup/polarity
approval. Send `Through-Hole-Joints.csv` and `Thermal-Via-Process.csv`: WAGO
requires through-hole soldering, the USB shell stakes need top secondary
soldering, and three exposed-pad vias require approved filling/capping and
planarization. Confirm the stencil/process eligibility and price.

The WAGO accepts bare stranded 24–16 AWG, stripped 8.5–9.5 mm. The official
14HM11-0404S page and drawing do not publish factory wire gauge; actual fit and
retention remain unverified. Rear fastening and plug/button/tool access also
need physical confirmation. A clean CAD/CAM audit is not tested V2 hardware.

GPIO4/5 are I²C0; GPIO26/27 are coil-current ADC inputs. Update V1 firmware and
perform current calibration and first-board power/USB/thermal checks.

[Complete process and test instructions](https://github.com/AnasSarkiz/NEMA14_RP2040_V2/blob/main/docs/v2-prototype-order.md).
