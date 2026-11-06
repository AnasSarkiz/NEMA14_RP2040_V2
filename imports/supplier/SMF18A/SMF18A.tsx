import React from "react"
const objPath = "https://modelcdn.tscircuit.com/easyeda_models/assets/C19077512.obj"
const stepPath = "https://modelcdn.tscircuit.com/easyeda_models/assets/C19077512.step"
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["A"],
  pin2: ["K"]
} as const

export const SMF18A = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      symbol={
        <symbol>
          <schematicpath svgPath="M 0.1 0.14 L -0.1 0 L 0.1 -0.14 Z" strokeColor="#880000" />
          <schematicpath points={[{"x":-0.1,"y":0},{"x":-0.2,"y":0}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0.2,"y":0},{"x":0.1,"y":0}]} strokeColor="#880000" />
          <schematicpath points={[{"x":-0.14,"y":0.14},{"x":-0.1,"y":0.1},{"x":-0.1,"y":-0.1},{"x":-0.06,"y":-0.14}]} strokeColor="#880000" />
          <port name="pin2" pinNumber={2} aliases={["K"]} direction="left" schX={-0.4} schY={0} schStemLength={0.2} />
          <port name="pin1" pinNumber={1} aliases={["A"]} direction="right" schX={0.4} schY={0} schStemLength={0.2} />
          <schematictext schX={0} schY={0.34} text="{NAME}" fontSize={0.2} anchor="bottom_center" />
        </symbol>
      }
      supplierPartNumbers={{
  "jlcpcb": [
    "C19077512"
  ]
}}
      manufacturerPartNumber="SMF18A"
      footprint={<footprint>
        <smtpad portHints={["pin2"]} pcbX="-1.649984mm" pcbY="0mm" width="1.2999974mm" height="1.1999976mm" shape="rect" />
<smtpad portHints={["pin1"]} pcbX="1.649984mm" pcbY="0mm" width="1.2999974mm" height="1.1999976mm" shape="rect" />
<silkscreenpath route={[{"x":-0.2739898000000949,"y":0.5080000000000382},{"x":-0.2739898000000949,"y":-0.5080000000000382}]} />
<silkscreenpath route={[{"x":0.23401019999994332,"y":-0.5080000000000382},{"x":0.23401019999994332,"y":0.5080000000000382}]} />
<silkscreenpath route={[{"x":-0.2739898000000949,"y":0},{"x":0.23401019999994332,"y":0.5080000000000382}]} />
<silkscreenpath route={[{"x":-0.2739898000000949,"y":0},{"x":0.23401019999994332,"y":-0.5080000000000382}]} />
<silkscreenpath route={[{"x":-0.2739898000000949,"y":-0.2539999999999054},{"x":-0.2739898000000949,"y":0.2540000000000191}]} />
<silkscreenpath route={[{"x":-0.7819898000000194,"y":0},{"x":0.7420101999998678,"y":0}]} />
<silkscreenpath route={[{"x":1.3761211999999432,"y":0.8762238000001616},{"x":1.3748765999998795,"y":0.7350251999999955}]} />
<silkscreenpath route={[{"x":1.3761211999999432,"y":-0.876223800000048},{"x":1.3748765999998795,"y":-0.7350251999998818}]} />
<silkscreenpath route={[{"x":-1.376324400000044,"y":0.8762238000001616},{"x":1.3761211999999432,"y":0.8762238000001616}]} />
<silkscreenpath route={[{"x":-1.376324400000044,"y":-0.876223800000048},{"x":1.3761211999999432,"y":-0.876223800000048}]} />
<silkscreentext text="{NAME}" pcbX="0.005334mm" pcbY="1.9398mm" anchorAlignment="center" fontSize="1mm" />
<fabricationnotepath route={[{"x":1.65089839999996,"y":0.6349999999999909},{"x":1.65089839999996,"y":-0.6450075999999854},{"x":1.4588997999999265,"y":-0.6450075999999854},{"x":1.4588997999999265,"y":0.6349999999999909},{"x":1.65089839999996,"y":0.6349999999999909}]} strokeWidth="0.254mm" />
<fabricationnotepath route={[{"x":1.9048983999998654,"y":0.1270000000000664},{"x":1.9048983999998654,"y":-0.06502399999988029},{"x":1.1369039999999586,"y":-0.06502399999988029},{"x":1.1369039999999586,"y":0.1270000000000664},{"x":1.9048983999998654,"y":0.1270000000000664}]} strokeWidth="0.254mm" />
<fabricationnotepath route={[{"x":-1.90510160000008,"y":0.1270000000000664},{"x":-1.90510160000008,"y":-0.06502399999988029},{"x":-1.1371071999999458,"y":-0.06502399999988029},{"x":-1.1371071999999458,"y":0.1270000000000664},{"x":-1.90510160000008,"y":0.1270000000000664}]} strokeWidth="0.254mm" />
<courtyardoutline outline={[{"x":-2.549982699999987,"y":1.1499982000000273},{"x":2.549982699999873,"y":1.1499982000000273},{"x":2.549982699999873,"y":-1.1499981999999136},{"x":-2.549982699999987,"y":-1.1499981999999136},{"x":-2.549982699999987,"y":1.1499982000000273}]} />
      </footprint>}
      cadModel={{
        objUrl: objPath,
        positionOffset: { x: (0.0) * Math.cos(Number(props.pcbRotation ?? 0) * Math.PI / 180) - (-0.0) * Math.sin(Number(props.pcbRotation ?? 0) * Math.PI / 180), y: (0.0) * Math.sin(Number(props.pcbRotation ?? 0) * Math.PI / 180) + (-0.0) * Math.cos(Number(props.pcbRotation ?? 0) * Math.PI / 180), z: 0 },
        stepUrl: stepPath,
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0.00010160000010728254, y: 0, z: -0.11 },
      }}
      {...props}
    />
  )
}