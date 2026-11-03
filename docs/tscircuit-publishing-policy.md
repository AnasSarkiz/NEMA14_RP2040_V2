# V2 tscircuit publication

V2 uses **AnasSarkiz/NEMA14_RP2040_V2** on GitHub and tscircuit. The original
**AnasSarkiz/NEMA14_RP2040** package is never modified by the V2 publisher.

`npm run publish:v2:stage` prepares exactly six preview files: checked native
PCB JSON, its compiled viewer copy, package/config metadata, README and a
verification receipt. `npm run publish:tscircuit` uploads and reads back every
file and the native preview. Every PCB record is preserved, except CAD model
URLs are pinned to verified immutable GitHub assets. Local paths, V1 assembly,
datasheets, models, histories and manufacturing downloads are excluded.

The source, full engineering evidence and supplier assets stay in GitHub.
Publication verifies the routed-source hash, exact physical/native/functional
proofs and the source commit's public GitHub tree. Geometry is not rebuilt or
rerouted during publication. This engineering-preview path does not approve
fabrication; the existing manufacturing gate stays blocked.

## Historical V1 publication policy

# Lean tscircuit publication

Publish only 13 files: native PCB and assembly Circuit JSON, their two compiled
viewer copies, Gerbers, JLCPCB BOM and CPL, the schematic PDF, the bottom
silkscreen preview, README, package/viewer configuration and a short verification
record. The compiled copies are required by tscircuit's preview API.

Keep the complete project, supplier models, datasheets, full qualification
receipts, routing tools and historical reports in GitHub. Native CAD models use
the existing byte-verified GitHub URLs; the registry does not need model copies.

`npm run publish:tscircuit -- --stage-only` shows the exact payload. Local
qualification gates remain mandatory. Publishing and `--prune` require a verified
full GitHub source snapshot before any registry file removal. Pruning affects only
the current package version and never deletes workspace or GitHub files.
