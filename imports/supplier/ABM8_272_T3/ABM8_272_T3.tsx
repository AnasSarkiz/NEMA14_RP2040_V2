import React from "react"
const objPath = "https://modelcdn.tscircuit.com/easyeda_models/assets/C20625731.obj"
const stepPath = "https://modelcdn.tscircuit.com/easyeda_models/assets/C20625731.step"
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["pin1"],
  pin2: ["GND1"],
  pin3: ["pin3"],
  pin4: ["GND2"]
} as const

const pinAttributes = {
  pin2: {isPassive: true},
  pin4: {isPassive: true},
  pin1: {isPassive: true},
  pin3: {isPassive: true}
} satisfies NonNullable<ChipProps["pinAttributes"]>

export const ABM8_272_T3 = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      symbol={
        <symbol>
          <port name="pin1" pinNumber={1} aliases={["1"]} direction="left" schX={-0.6} schY={-0.2} schStemLength={0.2} />
          <port name="pin3" pinNumber={3} aliases={["3"]} direction="right" schX={0.6} schY={0.2} schStemLength={0.2} />
          <port name="pin4" pinNumber={4} aliases={["GND2"]} direction="left" schX={-0.6} schY={0.2} schStemLength={0.2} />
          <port name="pin2" pinNumber={2} aliases={["GND1"]} direction="right" schX={0.6} schY={-0.2} schStemLength={0.2} />
          <schematicrect schX={0} schY={0} width={0.8} height={0.8} strokeWidth={0.02} color="#880000" />
          <schematiccircle center={{ x: -0.3, y: -0.3 }} radius={0.03} strokeWidth={0.02} color="#880000" isFilled fillColor="#880000" />
          <schematicpath points={[{"x":-0.1,"y":-0.14},{"x":-0.1,"y":0.14}]} strokeColor="#881100" />
          <schematicpath points={[{"x":0.1,"y":-0.14},{"x":0.1,"y":0.14}]} strokeColor="#881100" />
          <schematicpath points={[{"x":-0.4,"y":-0.2},{"x":-0.2,"y":-0.2},{"x":-0.2,"y":0},{"x":-0.1,"y":0}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0.4,"y":0.2},{"x":0.2,"y":0.2},{"x":0.2,"y":0},{"x":0.1,"y":0}]} strokeColor="#880000" />
          <schematicrect schX={0} schY={0} width={0.08} height={0.28} strokeWidth={0.02} color="#880000" />
          <schematictext schX={0} schY={0.608} text="{NAME}" fontSize={0.2} anchor="bottom_center" />
        </symbol>
      }
      supplierPartNumbers={{
  "jlcpcb": [
    "C20625731"
  ]
}}
      manufacturerPartNumber="ABM8-272-T3"
      footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="-1.100074mm" pcbY="-0.850011mm" width="1.3999972mm" height="1.1999976mm" shape="rect" />
<smtpad portHints={["pin2"]} pcbX="1.100074mm" pcbY="-0.850011mm" width="1.3999972mm" height="1.1999976mm" shape="rect" />
<smtpad portHints={["pin3"]} pcbX="1.100074mm" pcbY="0.850011mm" width="1.3999972mm" height="1.1999976mm" shape="rect" />
<smtpad portHints={["pin4"]} pcbX="-1.100074mm" pcbY="0.850011mm" width="1.3999972mm" height="1.1999976mm" shape="rect" />
<silkscreenpath route={[{"x":-2.028596400000083,"y":-1.6784827999999834},{"x":-2.028596400000083,"y":1.678736800000138},{"x":2.0285963999999694,"y":1.678736800000138},{"x":2.0285963999999694,"y":-1.6784827999999834},{"x":-2.028596400000083,"y":-1.6784827999999834}]} />
<silkscreenpath route={[{"x":-2.257196399999998,"y":-0.24988519999988057},{"x":-2.257196399999998,"y":-1.9070827999998983},{"x":-0.39999920000002476,"y":-1.9070827999998983}]} />
<silkscreentext text="{NAME}" pcbX="-0.1143mm" pcbY="2.676527mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-2.0500725999999077,"y":1.7000097999999753},{"x":2.0500725999999077,"y":1.7000097999999753},{"x":2.0500725999999077,"y":-1.7000097999999753},{"x":-2.0500725999999077,"y":-1.7000097999999753},{"x":-2.0500725999999077,"y":1.7000097999999753}]} />
      </footprint>}
      cadModel={{
        objUrl: objPath,
        positionOffset: { x: (0.0) * Math.cos(Number(props.pcbRotation ?? 0) * Math.PI / 180) - (0.0) * Math.sin(Number(props.pcbRotation ?? 0) * Math.PI / 180), y: (0.0) * Math.sin(Number(props.pcbRotation ?? 0) * Math.PI / 180) + (0.0) * Math.cos(Number(props.pcbRotation ?? 0) * Math.PI / 180), z: 0 },
        stepUrl: stepPath,
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0, y: -0.000012700000070253736, z: 0 },
      }}
      {...props}
    />
  )
}