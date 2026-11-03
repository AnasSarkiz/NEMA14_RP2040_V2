# Repro: oval NPTH ignores parent rotation

Tested with the latest npm releases on 3 November 2026: **tscircuit 0.0.3062,
@tscircuit/core 0.0.2259, circuit-to-svg 0.0.454, circuit-json-to-gerber 0.0.122**.

```sh
npm install
npm run reproduce
```

`reproduce.tsx` places the same 1.51 × 0.71 mm hole in components rotated 0° and
90°, comparing `shape="oval"` against `shape="pill"` as the control. It saves native
Circuit JSON, an SVG and diagnostic Excellon commands under `results/`.

Expected: rotating a component 90° rotates its hole centre and its long axis.

Actual: the oval's centre rotates, but its width/height remain horizontal and
no `ccw_rotation` is emitted. Its Excellon G85 slot is also horizontal. The pill
control correctly emits `hole_shape="rotated_pill", ccw_rotation:90` and a vertical
G85 tool path. This affects drill geometry as well as the drawing.

Root: `Hole.doInitialPcbPrimitiveRender()` computes the complete parent/global
transform for `shape="pill"`, while its oval branch inserts the local width/height
without a rotation field. No viewer or converter patch is used in this repro.

The actual USB importer is now correct: CLI **0.1.2429** imports C5815189's supplier
NPTH as `shape="pill"`. The production V2 correction uses that capsule shape and
retains the reviewed land coordinates and CAD alignment. This repro concerns the
remaining core oval primitive behavior, not a fresh importer failure.

A successful run prints `REPRODUCED` when it observes the oval bug and the working
pill control. If upstream fixes oval rotation, the script reports that the old
bug no longer reproduces instead of claiming success.
