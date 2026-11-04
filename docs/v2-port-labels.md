# Large bottom port labels — dev.9

PWR and DATA now use native knockout silkscreen: clear lettering within a white
block. Font size increases from 1.7 to 3.2 mm. PWR sits below the power USB-C;
DATA runs beside the data USB-C. The revision caption moves clear of both blocks.

The full blocks clear exposed pads and holes by at least 0.24 mm. Logo,
evaluation text, motor labels and debug labels remain readable and separate.
The underside preview mirrors the board as viewed from below.

The order exporter preserves the clear letters and enclosed white counters in
P/R/D/A. A check reparses the final bottom Gerber to verify both. All Circuit
JSON records outside these three text entries match dev.8. The BOM, CPL and
process tables are byte-identical. Drill commands match apart from generation
dates. Parsed copper, mask, outline and paste geometry is unchanged; native
Gerber timestamps/aperture numbering may differ.

- [Bottom preview](../artifacts/v2/routing/full-bottom-silkscreen.png)
- [Legend clearance check](../artifacts/v2/routing/critical-silkscreen-verification.json)
- [Final CAM and preservation check](../artifacts/v2/routing/port-label-update-verification.json)
- [Current order package](v2-prototype-order.md)

Supplier assembly acceptance and the existing wire-fit, mounting and bench
qualification items remain in the requirements checklist.
