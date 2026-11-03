import React from "react"
import objPath from "./USB4145_03_0070_C.obj"
import stepPath from "./USB4145_03_0070_C.step"
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["GND1","A1"],
  pin2: ["DP1","A6"],
  pin3: ["VBUS1","A4"],
  pin4: ["CC1","A5"],
  pin5: ["GND2","A12"],
  pin6: ["DN1","A7"],
  pin7: ["SBU1","A8"],
  pin8: ["VBUS2","A9"],
  pin9: ["GND3","B12"],
  pin10: ["DN2","B7"],
  pin11: ["VBUS3","B9"],
  pin12: ["SBU2","B8"],
  pin13: ["GND4","B1"],
  pin14: ["DP2","B6"],
  pin15: ["CC2","B5"],
  pin16: ["VBUS4","B4"],
  pin17: ["SHELL"]
} as const

export const USB4145_03_0070_C = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      supplierPartNumbers={{
  "jlcpcb": [
    "C5815189"
  ]
}}
      manufacturerPartNumber="USB4145-03-0070-C"
      footprint={<footprint>
        {/* Latest CLI 0.1.2429 reimport emits a capsule (pill), not an oval.
            Retain the reviewed origin, lands and CAD; pill inherits connector rotation. */}
        <hole name="LOCATING_SLOT" pcbX="4.1524872mm" pcbY="0.000127mm" shape="pill" width="1.5099792mm" height="0.7099808mm" />
        <hole pcbX="-3.8474968mm" pcbY="0.000127mm" diameter="0.7099808mm" />
<platedhole  portHints={["pin17"]} pcbX="-3.8474968mm" pcbY="1.429893mm" holeWidth="0.5999988mm" holeHeight="1.0999978mm" outerWidth="1.0999978mm" outerHeight="1.5999968mm" pcbRotation="90deg" shape="pill" />
<platedhole  portHints={["pin17"]} pcbX="-3.8474968mm" pcbY="-1.429893mm" holeWidth="0.5999988mm" holeHeight="1.0999978mm" outerWidth="1.0999978mm" outerHeight="1.5999968mm" pcbRotation="90deg" shape="pill" />
<platedhole  portHints={["pin17"]} pcbX="4.1524872mm" pcbY="-1.429893mm" holeWidth="0.5999988mm" holeHeight="1.0999978mm" outerWidth="1.0999978mm" outerHeight="1.5999968mm" pcbRotation="90deg" shape="pill" />
<platedhole  portHints={["pin17"]} pcbX="4.1524872mm" pcbY="1.429893mm" holeWidth="0.5999988mm" holeHeight="1.0999978mm" outerWidth="1.0999978mm" outerHeight="1.5999968mm" pcbRotation="90deg" shape="pill" />
<smtpad portHints={["pin1"]} pcbX="-2.5975628mm" pcbY="1.479931mm" width="0.2999994mm" height="1.1500104mm" shape="rect" />
<smtpad portHints={["pin2"]} pcbX="-0.0974408mm" pcbY="1.479931mm" width="0.2999994mm" height="1.1500104mm" shape="rect" />
<smtpad portHints={["pin3"]} pcbX="-1.0974388mm" pcbY="1.479931mm" width="0.2999994mm" height="1.1500104mm" shape="rect" />
<smtpad portHints={["pin4"]} pcbX="-0.5975668mm" pcbY="1.479931mm" width="0.2999994mm" height="1.1500104mm" shape="rect" />
<smtpad portHints={["pin5"]} pcbX="2.9025532mm" pcbY="1.479931mm" width="0.2999994mm" height="1.1500104mm" shape="rect" />
<smtpad portHints={["pin6"]} pcbX="0.4024312mm" pcbY="1.479931mm" width="0.2999994mm" height="1.1500104mm" shape="rect" />
<smtpad portHints={["pin7"]} pcbX="0.9025572mm" pcbY="1.479931mm" width="0.2999994mm" height="1.1500104mm" shape="rect" />
<smtpad portHints={["pin8"]} pcbX="1.4024292mm" pcbY="1.479931mm" width="0.2999994mm" height="1.1500104mm" shape="rect" />
<smtpad portHints={["pin9"]} pcbX="-2.5973088mm" pcbY="-1.479931mm" width="0.2999994mm" height="1.1500104mm" shape="rect" />
<smtpad portHints={["pin10"]} pcbX="-0.0974408mm" pcbY="-1.479931mm" width="0.2999994mm" height="1.1500104mm" shape="rect" />
<smtpad portHints={["pin11"]} pcbX="-1.0974388mm" pcbY="-1.479931mm" width="0.2999994mm" height="1.1500104mm" shape="rect" />
<smtpad portHints={["pin12"]} pcbX="-0.5975668mm" pcbY="-1.479931mm" width="0.2999994mm" height="1.1500104mm" shape="rect" />
<smtpad portHints={["pin13"]} pcbX="2.9025532mm" pcbY="-1.479931mm" width="0.2999994mm" height="1.1500104mm" shape="rect" />
<smtpad portHints={["pin14"]} pcbX="0.4024312mm" pcbY="-1.479931mm" width="0.2999994mm" height="1.1500104mm" shape="rect" />
<smtpad portHints={["pin15"]} pcbX="0.9025572mm" pcbY="-1.479931mm" width="0.2999994mm" height="1.1500104mm" shape="rect" />
<smtpad portHints={["pin16"]} pcbX="1.4024292mm" pcbY="-1.479931mm" width="0.2999994mm" height="1.1500104mm" shape="rect" />
<silkscreenpath route={[{"x":-4.317498399999977,"y":0.7295895999998265},{"x":-4.317498399999977,"y":-0.7293356000001268}]} />
<silkscreenpath route={[{"x":1.7835816000001614,"y":-1.5798800000001165},{"x":2.521426200000178,"y":-1.5798800000001165}]} />
<silkscreenpath route={[{"x":-2.216156399999818,"y":-1.5798800000001165},{"x":-1.4785657999999557,"y":-1.5798800000001165}]} />
<silkscreenpath route={[{"x":4.632496400000036,"y":0.7346187999999074},{"x":4.632496400000036,"y":-0.734364800000094}]} />
<silkscreenpath route={[{"x":1.7835816000001614,"y":1.58013399999993},{"x":2.521426200000178,"y":1.58013399999993}]} />
<silkscreenpath route={[{"x":-2.2164103999999725,"y":1.58013399999993},{"x":-1.4785657999999557,"y":1.58013399999993}]} />
<silkscreentext text="{NAME}" pcbX="0.2238692mm" pcbY="3.046351mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-4.89749519999998,"y":2.3049361999998155},{"x":5.2024856000000455,"y":2.3049361999998155},{"x":5.2024856000000455,"y":-2.304936199999929},{"x":-4.89749519999998,"y":-2.304936199999929},{"x":-4.89749519999998,"y":2.3049361999998155}]} />
      </footprint>}
      cadModel={{
        objUrl: objPath,
        stepUrl: stepPath,
        pcbRotationOffset: 0,
        modelOriginPosition: { x: -0.00251620000004598, y: 3.4270054999999795, z: -4.5927207999999995 },
      }}
      {...props}
    />
  )
}
