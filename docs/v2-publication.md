# Independent V2 publication

V2 is published separately from the ordered V1:

| Project | GitHub | tscircuit |
| --- | --- | --- |
| V1 | [NEMA14_RP2040](https://github.com/AnasSarkiz/NEMA14_RP2040) | [NEMA14_RP2040](https://tscircuit.com/AnasSarkiz/NEMA14_RP2040) |
| V2 | [NEMA14_RP2040_V2](https://github.com/AnasSarkiz/NEMA14_RP2040_V2) | [NEMA14_RP2040_V2](https://tscircuit.com/AnasSarkiz/NEMA14_RP2040_V2#3d) |

The first separate V2 registry release is **2.0.0-dev.1**. Its full source and
all 88 OBJ/STEP assets are pinned to immutable commit
`4172993aa0839ba5e95ba84d5c212aae240e8a7f` in the new repository. Only CAD URL
metadata changes between the reviewed board and registry preview. All source,
schematic, PCB, pin/net, trace, via, hole and pour records are preserved.

The registry contains exactly six files: native PCB JSON, its compiled preview
copy, package metadata, viewer configuration, README and verification receipt.
No V1 assembly, datasheets, supplier model files or manufacturing downloads are
included. The public native-preview API matches the uploaded board. The package
page and a public WAGO model URL return HTTP 200; that model matches its recorded
SHA-256. Full source, models, history and engineering evidence remain in GitHub.

[Publication receipt](../artifacts/v2/publication/registry-verification.json)
records every uploaded file's hash and confirms V1 remains at 1.13.2 with the same
package/release/filesystem IDs. The saved routing remains 70/70 connected, zero
shorts and zero native PCB DRC errors or warnings. The 22 pre-existing source
library advisories are retained; they are not PCB DRC results. Manufacturing
qualification remains separate.

Publication uses bounded native registry uploads. Automatic GitHub synchronization
is not enabled: the tscircuit GitHub integration reports that the new repository
is not accessible to its installation. This does not affect the published files,
preview, package metadata or immutable model URLs. Enabling automatic synchronization
would require granting the tscircuit GitHub app access separately.

To stage or publish future V2 previews after pushing source to the new GitHub
repository:

```sh
npm run publish:v2:stage
npm run publish:tscircuit
```

To verify this exact first release without writing to the registry:

```sh
python3 scripts/publish-v2-tscircuit.py --verify-only --source-revision 4172993aa0839ba5e95ba84d5c212aae240e8a7f
```

The V2 publisher cannot write to the original V1 package. It verifies the saved
routing manifest and the public source/model Git blobs, uploads only the allowlist,
and reads back every file and native preview before reporting success.
