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

Final result: **2.0.0-dev.11** published as release
`d2d5cb42-e81f-49ce-8943-77a2035a0429`. The new angled render succeeded on
2026-11-06 at 20:24:21 UTC using this release's `dist/index/circuit.json`.
The PNG was downloaded and visually inspected. See the
[render](../artifacts/v2/model-hosting/photorealistic-angled.png) and
[render receipt](../artifacts/v2/model-hosting/photorealistic-render-verification.json).

All 87 external assets return HTTP 200 without redirects, with browser CORS
access, and match original SHA-256 digests. The entire rebuilt assembly GLB is
also byte-identical to dev.10 (`8212af7995fdd115930aa80ac0f44495c734ea9e22650343f0656b4d70292728`).
The real Board Blend validator passes on the downloaded published file, and the
refreshed checks retain 70 connected nets, zero shorts, zero native DRC errors or
warnings and a passing manufacturing audit. There is no remaining model-hosting
or render-verification blocker. Existing mechanical and electrical prototype
qualification limits remain outside this URL-only repair.
