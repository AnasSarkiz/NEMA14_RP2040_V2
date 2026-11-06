import React from "react"
const objPath = "https://modelcdn.tscircuit.com/easyeda_models/assets/C2986331.obj"
const stepPath = "https://modelcdn.tscircuit.com/easyeda_models/assets/C2986331.step"
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["N_CS"],
  pin2: ["SO_IO1"],
  pin3: ["WP__IO2"],
  pin4: ["VSS"],
  pin5: ["SI_IO0"],
  pin6: ["SCLK"],
  pin7: ["HOLD__IO3"],
  pin8: ["VCC"],
  pin9: ["EP"]
} as const

const pinAttributes = {
  pin4: {requiresGround: true},
  pin8: {requiresPower: true}
} as const

export const GD25Q16EEIGR = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C2986331"
  ]
}}
      manufacturerPartNumber="GD25Q16EEIGR"
      footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="-0.75003025mm" pcbY="-1.4732mm" width="0.2999994mm" height="0.6999986mm" shape="rect" />
<smtpad portHints={["pin2"]} pcbX="-0.24965025mm" pcbY="-1.4732mm" width="0.2999994mm" height="0.6999986mm" shape="rect" />
<smtpad portHints={["pin3"]} pcbX="0.25022175mm" pcbY="-1.4732mm" width="0.2999994mm" height="0.6999986mm" shape="rect" />
<smtpad portHints={["pin4"]} pcbX="0.74983975mm" pcbY="-1.4732mm" width="0.2999994mm" height="0.6999986mm" shape="rect" />
<smtpad portHints={["pin5"]} pcbX="0.74983975mm" pcbY="1.4732mm" width="0.2999994mm" height="0.6999986mm" shape="rect" />
<smtpad portHints={["pin6"]} pcbX="0.25022175mm" pcbY="1.4732mm" width="0.2999994mm" height="0.6999986mm" shape="rect" />
<smtpad portHints={["pin7"]} pcbX="-0.24965025mm" pcbY="1.4732mm" width="0.2999994mm" height="0.6999986mm" shape="rect" />
<smtpad portHints={["pin8"]} pcbX="-0.75003025mm" pcbY="1.4732mm" width="0.2999994mm" height="0.6999986mm" shape="rect" />
<smtpad portHints={["pin9"]} pcbX="0.00003175mm" pcbY="-0mm" width="1.7999964mm" height="0.3999992mm" shape="rect" />
<silkscreenpath route={[{"x":-1.1000930499999981,"y":-1.5999968000000138},{"x":-1.1000930499999981,"y":1.5999967999999996}]} />
<silkscreenpath route={[{"x":1.099902549999996,"y":-1.5999968000000138},{"x":1.099902549999996,"y":1.5999967999999996}]} />
<silkscreenpath route={[{"x":-1.19851804999999,"y":-1.9023584000000113},{"x":-1.19851804999999,"y":-1.9023584000000113}]} />
<silkscreentext text="{NAME}" pcbX="-0.05102225mm" pcbY="2.830578mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-1.2550970500000034,"y":2.0731992999999846},{"x":1.2548811499999886,"y":2.0731992999999846},{"x":1.2548811499999886,"y":-2.073199299999999},{"x":-1.2550970500000034,"y":-2.073199299999999},{"x":-1.2550970500000034,"y":2.0731992999999846}]} />
      </footprint>}
      cadModel={{
        objUrl: objPath,
        positionOffset: { x: (0.0) * Math.cos(Number(props.pcbRotation ?? 0) * Math.PI / 180) - (0.0) * Math.sin(Number(props.pcbRotation ?? 0) * Math.PI / 180), y: (0.0) * Math.sin(Number(props.pcbRotation ?? 0) * Math.PI / 180) + (0.0) * Math.cos(Number(props.pcbRotation ?? 0) * Math.PI / 180), z: 0 },
        stepUrl: stepPath,
        pcbRotationOffset: 90,
        modelOriginPosition: { x: 0, y: -0.005107950000000305, z: -0.02 },
      }}
      {...props}
    />
  )
}