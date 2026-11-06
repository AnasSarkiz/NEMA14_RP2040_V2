# V2 model hosting repair (2.0.0-dev.11)

Board Blend rejects the raw.githubusercontent.com model references exported by
dev.10. Both board and motor-assembly entrypoints now use modelcdn.tscircuit.com.
No Board Blend policy change is required.

The existing [modelcdn workflow](https://github.com/tscircuit/modelcdn) fetches and
stores supplier assets at `/easyeda_models/assets/<part>.obj` and `.step`.
We resolved all 43 active supplier model pairs through this workflow and compared
every response with the checked-in original bytes. TMP102 C99269's default cached
body differs, and C154728 cannot currently resolve by part number alone. For these
two models the documented `?uuid=` parameter selects their authentic EasyEDA
SVGNODE model UUIDs; see `artifacts/v2/model-hosting/uuid-provenance.json`.
The dimensional motor GLB already records its exact original modelcdn JSCAD URL
in `imports/assembly/provenance.json`. Its bytes also match. The eight wire and
conductor shapes remain inline JSCAD, unchanged.

`src/model-cdn-manifest.json` maps all 87 active model files to verified CDN URLs,
SHA-256 digests and sizes. Supplier part selection is independent of the model
source part: existing shared model aliases retain their original electrical BOM.
Historical V1 and review snapshots remain unchanged.

The source builder removes core's `cachebust_origin` query parameter only after
checking the resulting URL against the manifest. The publisher preserves these
URLs and refuses unverified assets instead of rewriting them to GitHub. Offline
CAD checks and portable previews resolve the same manifest to the original local
files, checking their hashes first.

Validation:

- `python3 scripts/migrate-v2-model-hosting.py --apply`: use the documented CDN
  cache workflow; reject redirects or any byte difference before applying URLs.
- `python3 scripts/check-v2-model-hosting.py`: compare board, rebuilt source and
  assembly against immutable dev.10 commit 23fcd14. Only the three CAD URL fields
  may differ; all geometry, transforms, scale, supplier choices and wires match.
- `BOARD_BLEND_ROOT=<checkout> bun scripts/check-v2-board-blend.ts`: run the real
  unmodified service validator. The published dev.10 fixture must reproduce the
  host error, new exports must pass, and a GitHub URL negative control must fail.
  Validator revision and file hashes are retained in the verification receipt.
- The existing source/schema, physical routing, native DRC, Gerber shorts,
  manufacturing, component-body, harness and native-viewer checks are refreshed.
- `python3 scripts/verify-v2-photorealistic-render.py --release-id <dev.11 UUID>`:
  require a newly created registry render for `dist/index/circuit.json`, poll its
  status and download its PNG. This does not retry an old release's saved input.

Evidence and final render status are in `artifacts/v2/model-hosting/`.
