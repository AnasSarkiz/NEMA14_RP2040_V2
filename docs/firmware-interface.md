# Current V2 firmware interface — 2.0.0-dev.8

This table describes the active V2 source. The older V1 contract is retained below.
No application firmware is implemented in this repository. See the
[requirements and acceptance checklist](v2-requirements-checklist.md).

| Function | RP2040 connection |
| --- | --- |
| Coil A current | GPIO26 / ADC0 / physical pin 38 |
| Coil B current | GPIO27 / ADC1 / physical pin 39 |
| PD_VBUS voltage | GPIO28 / ADC2 / physical pin 40; 100 kΩ / 10 kΩ divider, nominal ×11 |
| DATA USB voltage/presence | GPIO29 / ADC3 / physical pin 41; 100 kΩ / 100 kΩ divider, nominal ×2 |
| TMP102 / optional AS5600 I²C0 | GPIO4 SDA / pin 6; GPIO5 SCL / pin 7 |
| POWER_GOOD | GPIO10 / physical pin 13, retained active-low contract and 3.3 V pull-up; verify actual levels on bench |
| STEP / DIR | GPIO6 / pin 8; GPIO7 / pin 9 |
| ENABLE_N / SLEEP | GPIO8 / pin 11; GPIO9 / pin 12 |
| RGB R / G / B gates | GPIO25 / pin 37; GPIO2 / pin 4; GPIO3 / pin 5 |
| Buzzer PWM | GPIO16 / physical pin 27 |
| SWCLK / SWDIO / RUN | Physical pins 24 / 25 / 26 |

Nominal current conversion is `I_A = (V_ADC - V_ZERO) / (20 × 0.05 Ω)` for each
channel, with approximately 1.65 V zero-current output and 1 V/A gain. Calibrate
zero and gain and choose sampling/filtering for the switching bridges; the ADC
channels are multiplexed. The fixed motor-current limit is about 0.351 A nominal.

Hardware defaults now use 10 kΩ ENABLE_N pull-up and 10 kΩ SLEEP pull-down.
Initialize GPIO8 high before waking GPIO9. Configure GPIO26–29 with the SDK ADC
pad initialization so digital pulls/input buffers do not load measurements.

Initialize the driver disabled. Verify PD_GOOD and the measured supply before
motor enable, and validate supply-loss shutdown, boot and USB-presence behavior.
RGB uses the DATA USB 5 V rail and is unavailable with PD power alone.

TP_3V3, TP_GND, TP_SWCLK, TP_SWDIO and TP_RUN are bare bottom probe pads.
TP_BOOT and TP_BOOT_GND remain top recovery pads. The optional bottom AS5600 is
DNP; its two supply capacitors are fitted on top.

## Historical V1 contract

> Historical baseline document: this predates the opposite-edge v1.11.0 draft. See [current draft and blockers](opposite-edge-review.md) for current evidence.

# RP2040 firmware contract

Use the Pico SDK RP2040 target with 12 MHz XOSC and 2 MB flash. Select the generic JEDEC-compatible boot stage for GD25Q16E; do not assume a Winbond-specific quad-enable sequence. Flash boot and UF2 USB ROM boot require hardware validation.

| Function | RP2040 GPIO / physical pin |
| --- | --- |
| STEP | GPIO6 / 8 |
| DIR | GPIO7 / 9 |
| ENABLE_N | GPIO8 / 11 |
| SLEEP | GPIO9 / 12 |
| PD_GOOD (active low) | GPIO10 / 13 |
| VM_SENSE | ADC2 / GPIO28 / 40 |
| DATA_PRESENT | ADC3 / GPIO29 / 41 |
| SWCLK / SWDIO | 24 / 25 |
| RUN | 26 |
| USB DM / DP | 46 / 47, through 27 Ω resistors |

On reset, pull-ups/pull-downs disable the A4988. Initialize outputs disabled; require PG and measured VM within an accepted 15 V window, then wake the driver and respect its timing before enabling. Monitor supply loss and shut down immediately. Keep USB pull-up disconnected without DATA_PRESENT. Start with low speed; the 24 mH motor inductance and actual torque/load set speed limits.

Full steps: 400/revolution. Configured 1/16 microsteps: 6400/revolution. No USB protocol/application firmware is implemented.

The separate bare top-side pads are TP_3V3, TP_GND, TP_SWCLK, TP_SWDIO, TP_RUN, TP_BOOT and TP_BOOT_GND. Short TP_BOOT to TP_BOOT_GND to pull flash CS low through 1 kΩ; hold the short while asserting/releasing TP_RUN to enter ROM USB boot. Never leave the short during ordinary flash operation. The former J_DEBUG/J_BOOT strips are absent from v1.8.2.

For factory ROM USB boot entry, see [USB programming](usb-programming.md). This hardware contract does not supply a motor-control application.

Motor voltage conversion: `VM_V = VM_SENSE_V × 11` for the reviewed 100 kΩ/10 kΩ divider. Update/calibrate firmware accordingly; the former ×(122/22) conversion is obsolete.
