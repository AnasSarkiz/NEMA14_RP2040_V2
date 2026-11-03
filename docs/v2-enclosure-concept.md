# Separate low-profile enclosure concept

This is an optional native tscircuit assembly file in the existing V2 project: **enclosure-concept.circuit.json**. The approved PCB, motor pose and compact wire assembly are preserved record-for-record. The normal package entry and approved assembly remain unchanged. An optional non-latest preview release, **2.0.0-enclosure.1**, selects this concept; dev.6 remains the default.

The concept follows the reference photos: a clear, rounded cover, four corner supports and access openings. It includes a separate rear carrier collar and five compliant pad envelopes around the motor endcap. It uses no assumed rear motor threads and does not replace the reference motor's existing rear fasteners.

| Feature | Concept dimensions/behavior |
| --- | --- |
| Outer plan size | 39.4 × 39.4 mm; 2.5 mm outer corner radius |
| Internal square | 36.4 mm; 1.5 mm walls |
| Cover | Z −0.8 to +9.0 mm, 9.8 mm tall; 1.5 mm roof |
| Roof interior | Z +7.5 mm; above all fitted logic/passives, including the 6.301 mm bulk capacitor |
| WAGO | Exposed through a full top/front service opening; its own plastic housing provides local protection |
| USB-C | Top/edge openings over the actual vertical port mouths; checked with nominal 10 × 7 mm plug bodies |
| PCB supports | Four existing holes at 26 mm pitch; 3.0 mm concept closure clearance holes; fasteners not selected |
| Motor carrier | Z −10.0 to −0.8 mm; nominal 0.6 mm side gap around the maximum 35.2 mm body envelope |
| Grip pads | Five compliant envelopes, modeled compressed to 0.6 mm from a proposed 0.8 mm thickness; actual material and grip force unqualified |
| Air/sound | Open WAGO area, roof slots over driver region and buzzer; underside largely open |

The carrier supports the PCB from below, and the lid bosses contact the top only at the existing mounting keepouts. There is relief for the motor lead outlet and the short curved wires. The roof stays low by exposing the tall WAGO terminal, rather than enclosing it in a deeper box. The motor rear screw-head envelopes remain clear.

[Fit verification](../artifacts/v2/enclosure/fit-verification.json) checks the shell against all 97 fitted supplier STEP models, the unchanged board, motor envelope/rear heads, every modeled insulated wire segment, nominal USB plug bodies, the WAGO button area and straight 20 mm lead insertion paths. [Build preservation](../artifacts/v2/enclosure/build-verification.json) and [schema check](../artifacts/v2/enclosure/schema-verification.json) identify the exact native file. The [portable native 3D viewer](../artifacts/v2/enclosure/NEMA14-V2-enclosure-viewer.html) keeps the concept separate from the approved assembly.

STEP and STL files for the lid, rear carrier and grip pads are in [artifacts/v2/enclosure](../artifacts/v2/enclosure). They are prototype fit-study exports, not production/print signoff. Their geometry comes from the same plans as the native CAD parts. The grip-pad exports show the **compressed 0.6 mm visual envelope**, not an uncompressed printable/cut pad pattern; pad blanks must be designed after choosing the compliant material.

**Open work before a physical design is approved:** choose cover/carrier and compliant pad materials; verify real motor dimensions, pad compression/adhesion and vibration retention; select a case-closure fastening method and check head/tool clearance to the motor rear fasteners; test actual USB cable heads and WAGO operation; confirm temperature, venting and electrical insulation in service. The collar is a proposed friction/grip interface, not a demonstrated secure motor attachment. No sealing or ingress rating is claimed.
