# Essential V2 printed labels

V2 **2.0.0-dev.4** replaces crowded footprint reference captions and tiny wiring text with an explicit set of 14 essential legends. Electrical reference names remain in the schematic, BOM, assembly and component records. Supplier pads, holes, outlines and assembly polarity graphics are unchanged.

- **PWR** identifies the top-edge PD power USB-C; **DATA** follows the left-edge data USB-C.
- **MOTOR**, **A+ / A− / B+ / B−** identify the four WAGO wire columns. Each column is checked against the physical pin and named net, including the mirrored underside view.
- **3V3, GND, RUN, CLK, DIO** identify the five underside debug pads. CLK and DIO mean SWCLK and SWDIO.
- **BOOT TOP** identifies the location of the two boot-short pads on the opposite, top face. Their physical pads stay on top. There is no clear top-side space for a full-size text caption without moving hardware.
- **N14 V2** identifies the board revision.

These legends are printed on the underside so fitted top-side housings do not cover them. Read them while wiring or servicing the unmounted PCB; visibility after mounting to the motor is not established. The logo and evaluation statement are retained separately.

PWR/DATA now use 3.2 mm native knockout text (0.288 mm letter strokes) in white blocks. The other essential legends use 1.7 mm native text with a **0.153 mm stroke**. The nominal font setting is not the measured capital-letter height. The audit checks actual exported Gerber ink, including the complete knockout blocks, requires 0.20 mm clearance from exposed pad copper and holes, 0.25 mm from the board edge, separation from other essential labels and existing warning/logo strokes, and no overlap with fitted body courtyards or screw-head envelopes. Tented vias are not exposed-pad obstacles. This is a focused legend check, not full CAM approval.

[Readable underside SVG](../artifacts/v2/routing/critical-silkscreen-bottom.svg) shows the actual Gerber ink, pads and body/head envelopes, mirrored as viewed from underneath. It intentionally shows the essential legends only. [Verification](../artifacts/v2/routing/critical-silkscreen-verification.json) and [current preservation evidence](../artifacts/v2/routing/port-label-update-verification.json) record the exact saved candidate.

The earlier DATA-location finding is closed. The [current full artwork check](../artifacts/v2/routing/branding-verification.json) clears the wordmark and evaluation statement from pads. Dev.10 moves the wordmark into empty middle-left underside space; see [port labels and wordmark](v2-port-labels.md).
