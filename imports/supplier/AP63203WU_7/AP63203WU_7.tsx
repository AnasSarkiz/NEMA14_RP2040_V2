import React from "react"
const objPath = "https://modelcdn.tscircuit.com/easyeda_models/assets/C780769.obj"
const stepPath = "https://modelcdn.tscircuit.com/easyeda_models/assets/C780769.step"
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["FB"],
  pin2: ["EN"],
  pin3: ["VIN"],
  pin4: ["GND"],
  pin5: ["SW"],
  pin6: ["BST"]
} as const

const pinAttributes = {
  pin3: {requiresPower: true},
  pin4: {requiresGround: true}
} as const

export const AP63203WU_7 = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C780769"
  ]
}}
      manufacturerPartNumber="AP63203WU-7"
      footprint={<footprint>
        <smtpad portHints={["pin6"]} pcbX="-0.94996mm" pcbY="1.199896mm" width="0.5500116mm" height="1.0999978mm" shape="rect" />
<smtpad portHints={["pin5"]} pcbX="0mm" pcbY="1.199896mm" width="0.5500116mm" height="1.0999978mm" shape="rect" />
<smtpad portHints={["pin4"]} pcbX="0.94996mm" pcbY="1.199896mm" width="0.5500116mm" height="1.0999978mm" shape="rect" />
<smtpad portHints={["pin3"]} pcbX="0.94996mm" pcbY="-1.199896mm" width="0.5500116mm" height="1.0999978mm" shape="rect" />
<smtpad portHints={["pin2"]} pcbX="0mm" pcbY="-1.199896mm" width="0.5500116mm" height="1.0999978mm" shape="rect" />
<smtpad portHints={["pin1"]} pcbX="-0.94996mm" pcbY="-1.199896mm" width="0.5500116mm" height="1.0999978mm" shape="rect" />
<silkscreenpath route={[{"x":1.4999969999998939,"y":-0.5718555999999353},{"x":1.4999969999998939,"y":-0.7999984000000495},{"x":1.4291055999999571,"y":-0.7999984000000495}]} />
<silkscreenpath route={[{"x":1.4999969999998939,"y":0.571855600000049},{"x":1.4999969999998939,"y":0.7999984000000495},{"x":1.4291055999999571,"y":0.7999984000000495}]} />
<silkscreenpath route={[{"x":-1.4999970000000076,"y":-0.5720588000000362},{"x":-1.4999970000000076,"y":-0.7999984000000495},{"x":-1.4291056000000708,"y":-0.7999984000000495}]} />
<silkscreenpath route={[{"x":-1.4999970000000076,"y":0.572262000000137},{"x":-1.4999970000000076,"y":0.7999984000000495},{"x":-1.4291056000000708,"y":0.7999984000000495}]} />
<silkscreenpath route={[{"x":1.4999969999998939,"y":0.571855600000049},{"x":1.4999969999998939,"y":-0.5718555999999353}]} />
<silkscreenpath route={[{"x":-1.4999970000000076,"y":-0.5720588000000362},{"x":-1.4999970000000076,"y":0.572262000000137}]} />
<silkscreentext text="{NAME}" pcbX="0mm" pcbY="2.7526mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-1.700009800000089,"y":1.999894900000072},{"x":1.6999843999999484,"y":1.999894900000072},{"x":1.6999843999999484,"y":-1.9998948999999584},{"x":-1.700009800000089,"y":-1.9998948999999584},{"x":-1.700009800000089,"y":1.999894900000072}]} />
      </footprint>}
      cadModel={{
        objUrl: objPath,
        positionOffset: { x: (0.0) * Math.cos(Number(props.pcbRotation ?? 0) * Math.PI / 180) - (-0.0) * Math.sin(Number(props.pcbRotation ?? 0) * Math.PI / 180), y: (0.0) * Math.sin(Number(props.pcbRotation ?? 0) * Math.PI / 180) + (-0.0) * Math.cos(Number(props.pcbRotation ?? 0) * Math.PI / 180), z: 0 },
        stepUrl: stepPath,
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0.000012700000070253736, y: 0, z: -0.62 },
      }}
      {...props}
    />
  )
}