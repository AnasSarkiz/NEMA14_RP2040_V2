# USB reimport and root-cause investigation

On 3 November 2026, a clean isolated install successfully used the latest npm
**tscircuit 0.0.3062 / core 0.0.2259 / CLI 0.1.2429**. The exact reimport command was:

```sh
tsci import C5815189 --jlcpcb --use-exact-footprint --download --exclude-pin-attributes
```

The unmodified output is `raw-latest-import.tsx.txt`. The importer now restores
supplier `SOLIDREGION` NPTH `gge931` as a **pill/capsule**, 1.5099792 × 0.7099808 mm.
The earlier CLI omitted it; our previous manual repair incorrectly chose `oval`.
That shape still fails to inherit parent rotation in the latest core. Thus J_DATA's
hole centre rotated 90°, but its long axis stayed horizontal. Its diagnostic
Excellon drill orientation was wrong too. J_PD at 0° concealed the same primitive
limitation. The current importer is fixed and its pill output is the correct path.

The fresh footprint uses a different local datum: its pad/hole X coordinates
are 0.3524948 mm lower than the existing reviewed footprint. All supplier lands
are the same geometry after this translation; the downloaded OBJ is byte-identical
(SHA-256 `39f20ea318cd7eb64a56cd55d4d793922c83ebfdb6ce5314f968fcda7aee196e`).
We retained the reviewed footprint origin and CAD alignment and adopted the fresh
capsule shape. No signal pads, plated tabs, connector poses, ports or mounting
keepouts moved.

The complete V2 source was rebuilt with the latest core. `source-preservation.json`
compares every physical placement record: only the two slot shape/rotation records
change, plus new non-geometric footprint-origin and pin-1 metadata. J_PD is a pill
at 0°; J_DATA is a rotated pill at 90°.

`npm run check:v2:source` now checks both slot axes against each connector's actual
round-to-slotted peg axis and the exported G85 direction. The previous check counted
two slots and checked their sizes but missed orientation. Ground pours are rebuilt
around the corrected NPTH geometry; connectivity, clearance, native DRC and Gerber
shorts are rechecked on the final routed board.

A self-contained core repro, requiring no supplier data or models, is in
[`repros/usb-slot-rotation`](../../../repros/usb-slot-rotation). V1 remains unchanged.
