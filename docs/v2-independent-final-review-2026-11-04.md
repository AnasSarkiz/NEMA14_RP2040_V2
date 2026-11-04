# Independent engineering review — 4 November 2026

**Follow-up:** findings 1 and 2 are implemented in dev.8. See
[the fix evidence and current acceptance conditions](v2-review-fixes.md).
This document preserves the original dev.7 review and its evidence.

**Recommendation: address the startup-bias and USB ESD-bypass findings before
ordering the next prototype.** The copper is connected and passes the fresh
checks below, but that does not establish correct behavior at power-up or during
an ESD event. This review changes no hardware, BOM, CAM or published package.

Reviewed release: **2.0.0-dev.7**, repository commit
`20619cc336c039c4801607d6561a9a67409ed701`, routed-board SHA-256
`7adf7b27d291aa7312d1c5bec6c1d24b3fc17ea6c653c7e9eba962114c56d178`.
The working ordered V1 is outside the changes proposed here.

## Findings

### 1. Correct before ordering: ENABLE_N is not guaranteed high during reset

In `src/board.tsx`, R_ENABLE is 100 kΩ from 3.3 V to ENABLE_N/GPIO8, and
R_SLEEP is 100 kΩ from SLEEP/GPIO9 to ground. RP2040 GPIO8 resets with its
pull-down enabled, as shown in the manufacturer's
[register definition](https://raw.githubusercontent.com/raspberrypi/pico-sdk/master/src/rp2040/hardware_regs/include/hardware/regs/pads_bank0.h).
The [RP2040 electrical table](https://datasheets.raspberrypi.com/rp2040/rp2040-datasheet.pdf)
specifies 50–80 kΩ pulls. Ignoring leakage, ENABLE_N therefore sits at about
**1.10–1.47 V**. A4988 needs at least **2.31 V** for a guaranteed high at 3.3 V.

This is a confirmed failure of the intended disabled-high bias, not evidence
that every board will energize on boot. The separate SLEEP pull-down, reinforced
by GPIO9's reset pull-down, remains a safeguard.

Change **R_ENABLE and R_SLEEP to 10 kΩ** in their existing footprints. The
documented static screen includes 1% resistors, a ±5% logic rail, MCU leakage
and the driver's input-current allowance: the suggested ENABLE pull-up has at
least **0.237 V high-threshold margin**. The suggested SLEEP pull-down also
holds low when the MCU pad is high impedance. This is a DC calculation; verify
power ramps, reset and brownout on hardware. Firmware must set ENABLE_N high
before waking SLEEP. These recommendations are **not yet implemented**.

### 2. Add before ordering: local bypass on the USB protection rail

U_ESD pin 5 is correctly connected to DATA_VBUS. However, **there is no
capacitor from DATA_VBUS to ground**; C_USB is on the separate 3.3 V rail.
[ST's USBLC6-2 datasheet](https://www.st.com/resource/en/datasheet/usblc6-2.pdf),
Figure 17 on page 11, shows a **100 nF C_BUS** at the VBUS pin. Section 2.3
also calls for short connections to the protected lines, supply and ground.

Add a 100 nF ceramic, rated at least 10 V, immediately beside U_ESD between
DATA_VBUS and its local ground return. Keep its loop short. This addresses a
manufacturer layout recommendation; a missing capacitor does not prove that
ordinary USB communication fails. ESD immunity still requires physical tests.
The current U_ESD pin mapping is correct; this review found no reason to rotate it.

### 3. Resolve by design review or bench test: USB presence with PD-only power

D_DATA is reverse biased when PD powers LOGIC_IN and the data USB is unplugged.
DATA_VBUS has a 200 kΩ divider to ground, so only **20 µA** of injected leakage
would raise it to 4 V before other loads/clamps act. GPIO29 could then falsely
report a connected USB supply. RGB activity would change this load further.

The exact [CJ B5819W datasheet for C8598](https://datasheet.lcsc.com/datasheet/pdf/4ac2c059be7c462694ab0715ce987a85.pdf?productCode=C8598)
allows substantial reverse leakage at its 40 V test point. That is **not a
prediction** of actual leakage at this board's lower reverse bias. This finding
is a credible unqualified operating mode, not a measured failure or proof of
USB overvoltage damage.

Measure DATA_VBUS/GPIO29 with PD only, data USB only, both connected, and during
plug/unplug, including warm operation. If reliable VBUS presence is required,
bound the actual leakage or revise the reverse-blocking/detection circuit.
Do not assume a Schottky diode provides zero reverse current.

### 4. Current measurement is coherent; the previous maximum-current bound is incomplete

The two **INA240A1PWR TSSOP-8** devices use the correct PW pinout. This differs
from the SOIC pinout. Both 50 mΩ inline shunts have separate pickups, and the
amplifier supply/reference connections produce nominal **1.65 V zero and
1 V/A**. The winding common-mode voltage is within the amplifier's operating
range. See [TI's INA240 datasheet](https://www.ti.com/lit/ds/symlink/ina240.pdf).

The fixed A4988 regulation setting is approximately **0.351 A peak**. The
existing script's 0.378 A figure includes supply/resistor tolerances but omits
reference-input current and driver trip error. Including the former gives
about 0.391 A in that model; adding an illustrative 5% trip error gives 0.410 A.
The [A4988 specification](https://www.allegromicro.com/-/media/files/datasheets/a4988-datasheet.pdf)
quotes its trip-error limits at a different reference voltage, so this is not
a guaranteed bound for the board's 0.673 V setting.

Likewise, the nominal 0.30 mm internal-trace IPC estimate is a sizing screen,
not a temperature qualification including etch/copper tolerances. Do not claim
that the screen proves all actual currents remain below 0.4 A or guarantees a
20°C rise. Confirm peak current, winding behavior and temperatures on the first
board. No immediate trace failure was established.

The 100 Ω/10 nF output filter corner is **159 kHz**; it does not average the
chopper waveform. Configure all ADC pads for analog operation, calibrate both
channels, and choose acquisition timing/averaging appropriate to the waveform.
The channels are multiplexed, not simultaneous. Nominal 12-bit code resolution
does not establish 12-bit measurement accuracy. Firmware needs GPIO4/5 for I²C;
the V1 GPIO26/27 I²C configuration is incompatible with V2 current sensing.

### 5. Confirm feature and assembly scope

- **RGB:** supplied by DATA_VBUS, so ordinary RGB indication is unavailable on
  PD power alone. This is retained behavior; change the supply if standalone
  motor status indication is required.
- **Encoder:** U_ENCODER is intentionally DNP. Both capacitors are fitted on
  top, but the delivered assembly has no angle feedback. Rear shaft/magnet
  implementation remains unverified.
- **Motor terminal:** the WAGO has suitable electrical current capacity; actual
  factory conductor gauge/retention remains unconfirmed. The motor's published
  drawing does not establish wire CSA. Housing clearance does not establish
  access for every finger/tool or a reliable wire termination.
- **Manufacturing:** obtain explicit supplier approval for WAGO through-hole
  soldering, the eight USB shell joints, three filled/capped exposed-pad vias,
  stencil and pickup orientation. Live stock is not reserved by the catalog
  snapshot. Verify bottom pin protrusion and the real motor rear fastening.

## What passed this review

Fresh results are saved in
[`artifacts/v2/final-review-2026-11-04/`](../artifacts/v2/final-review-2026-11-04/).

| Check | Result and scope |
| --- | --- |
| Four-layer physical copper audit rerun | 70/70 nets connected, 342 pin/net assignments preserved, zero shorts, clearance violations or floating routed copper |
| Native checks rerun | Zero PCB DRC errors and warnings; only the three specifically validated grounded exposed-pad vias receive the documented process exception |
| Functional copper audit rerun | Six ≥0.30 mm winding paths, four shunt-only Kelvin pickups, top-only crystal connections without vias |
| Source/pin/schematic checks rerun | Zero diagnostics; negative control still detects an underspecified IC |
| Order-file consistency rerun | 97 fitted references agree across BOM/CPL/source; archive and actual-CAM evidence hashes agree |
| Component inventory | All 105 placed source references listed: 97 fitted, seven bare test pads, one optional DNP encoder |
| Main electrical pin/rail review | RP2040, A4988, CH224A, AP63203, INA240 and USBLC6 connections reviewed against their documented functions; findings above remain |
| Bulk capacitor | Existing local-power evidence places the 47 µF capacitor about 4–5 mm from the driver VBB pads; it is no longer the previous 30 mm placement |
| USB mechanics | Locator capsules follow each connector rotation; released board-level enlargement and round locators retained |

The actual CAM geometry and 97 supplier STEP-body checks from the preceding
qualification were inspected and their source/hash consistency rechecked; the
full CAM extraction and STEP-distance calculations were **not rerun** here.
They do not establish electrical behavior. The complete component/pin inventory
is provided for inspection; this is not a new manufacturer-authenticated
procurement/datasheet certification of every passive.

Other concerns were checked and do not justify new faults: AP63203 explicitly
permits EN tied to VIN in its
[datasheet](https://www.diodes.com/datasheet/download/AP63200-AP63201-AP63203-AP63205.pdf).
The previously resolved CH224A VBUS-rating finding remains resolved by the
manufacturer Chinese V2.1 document and its existing review; it is not a reason
to reject a 15 V design. The bootstrap capacitor voltage is evaluated between
BST and SW, not from BST to ground.

## Release decision

Make the two bias-value changes and add the local ESD bypass before paying for
the next prototype. Refresh BOM, routed checks, manufacturing exports and the
published package after those changes; the present files still describe dev.7.
Close the supplier-process and actual wire/mounting acceptance items. Treat
USB power-mode behavior, current accuracy, PD hot-plug/regeneration and thermal
behavior as explicit first-board tests. Start with current-limited power and
the bridge asleep; verify rails and USB boot before motor operation.

This review supports a controlled prototype after those actions. It does not
certify production, ESD/EMC compliance or equivalence to the working V1.
