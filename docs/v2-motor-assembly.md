# V2 motor and WAGO assembly preview

The default V2 registry preview now opens **assembly.circuit.json**. It contains the exact reviewed PCB as its unchanged prefix, plus nine mechanical CAD parts: the dimensional motor reference, four insulated leads and four partial conductor tips. The separate index.circuit.json remains the PCB design.

The motor is the same **14HM11-0404S dimensional reference** used for V1: 35.2 × 35.2 × 28.2 mm, 26 mm front mounting pitch, 5 mm shaft and 24 mm shaft length. The native tscircuit-generated motor model is stored with its original hash and provenance in imports/assembly. The PCB underside is 6 mm above the reference rear surface. Motor orientation places its conceptual fixed-lead outlet on board −Y, the WAGO side.

The motor drawing specifies permanent bare leads: black A+, green A−, red B+, blue B−. Four direct leads enter **WAGO 250-204**, with no JST plug, pigtail or splice. Each mouth and approach direction is extracted independently from the actual supplier STEP's four 1.5 mm-radius angled bores and matched to the physical terminal pin and net. The native wire-cylinder transforms are also checked against those paths.

[Assembly verification](../artifacts/v2/assembly/assembly-verification.json), [native CAD/model verification](../artifacts/v2/assembly/model-verification.json), [schema verification](../artifacts/v2/assembly/schema-verification.json) and [viewer verification](../artifacts/v2/assembly/viewer-verification.json) identify the exact saved assembly. The nominal fit screen checks insulated wires against all 97 fitted supplier STEP models, PCB, motor body and four reference rear-fastener envelopes, plus conductor-to-conductor separation. The short modeled conductor tips are coaxial with the entry bores.

**This is a dimensional assembly concept.** The motor drawing establishes front threads, not rear retention. The reference GLB includes rear fastener heads at the proposed spacer centres. Separate mounting hardware is deliberately omitted until the real rear interface is qualified; the nominal PCB separation is a presentation concept. Factory lead gauge and insulation diameter are unconfirmed; the 1 mm modeled outside diameter is a visual envelope. Confirm actual motor leads meet the terminal's 0.2–1.5 mm² / 24–16 AWG range and pass retention testing. Follow WAGO's 8.5–9.5 mm strip specification; the full hidden stripped length and clamp contact are not modeled. USB plug and button/tool access still need physical checks. No physical assembly or rear shaft/encoder magnet fit is claimed.

The [full underside artwork](../artifacts/v2/routing/full-bottom-silkscreen.svg) includes the retained official tscircuit wordmark and exact statement:

> For evaluation only;  
> not FCC approved for resale.

Both lines now read upright from underneath and clear the USB and optional encoder pads. The native vector ink, essential labels, exposed pads/holes, board edge and mounting-head envelopes are checked together.
