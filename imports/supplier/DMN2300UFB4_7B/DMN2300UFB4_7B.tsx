import React from "react"
const objPath = "https://modelcdn.tscircuit.com/easyeda_models/assets/C154728.obj?uuid=c4a72fda97734ddfadf5f796f604199d"
const stepPath = "https://modelcdn.tscircuit.com/easyeda_models/assets/C154728.step?uuid=c4a72fda97734ddfadf5f796f604199d"
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["G"],
  pin2: ["D"],
  pin3: ["S"]
} as const

export const DMN2300UFB4_7B = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      symbol={
        <symbol>
          <schematicpath points={[{"x":0.4,"y":0.2},{"x":0.4,"y":0.14}]} strokeColor="#8D2323" />
          <schematicpath points={[{"x":0.4,"y":-0.14},{"x":0.4,"y":-0.2}]} strokeColor="#8D2323" />
          <schematicpath points={[{"x":0.52,"y":0.14},{"x":0.52,"y":0}]} strokeColor="#8D2323" />
          <schematicpath points={[{"x":0.52,"y":-0.02},{"x":0.52,"y":-0.14}]} strokeColor="#8D2323" />
          <schematicpath points={[{"x":0.52,"y":-0.14},{"x":0.4,"y":-0.14}]} strokeColor="#8D2323" />
          <schematicpath points={[{"x":0.26,"y":0.2},{"x":0.26,"y":0.14}]} strokeColor="#8D2323" />
          <schematicpath points={[{"x":0.26,"y":0.14},{"x":0.26,"y":0.1}]} strokeColor="#8D2323" />
          <schematicpath points={[{"x":0.26,"y":0.04},{"x":0.26,"y":0}]} strokeColor="#8D2323" />
          <schematicpath points={[{"x":0.26,"y":0},{"x":0.26,"y":-0.04}]} strokeColor="#8D2323" />
          <schematicpath points={[{"x":0.26,"y":-0.2},{"x":0.26,"y":-0.14}]} strokeColor="#8D2323" />
          <schematicpath points={[{"x":0.26,"y":-0.14},{"x":0.26,"y":-0.1}]} strokeColor="#8D2323" />
          <schematicpath points={[{"x":0.2,"y":0.2},{"x":0.2,"y":-0.2}]} strokeColor="#8D2323" />
          <schematicpath points={[{"x":0.28,"y":0},{"x":0.4,"y":0}]} strokeColor="#8D2323" />
          <schematicpath points={[{"x":0.4,"y":0},{"x":0.4,"y":-0.14}]} strokeColor="#8D2323" />
          <schematicpath points={[{"x":0.26,"y":0.14},{"x":0.52,"y":0.14},{"x":0.52,"y":0.14},{"x":0.52,"y":0.14}]} strokeColor="#8D2323" />
          <schematicpath points={[{"x":0.26,"y":-0.14},{"x":0.4,"y":-0.14}]} strokeColor="#8D2323" />
          <schematiccircle center={{ x: 0.4, y: 0.14 }} radius={0.02} strokeWidth={0.02} color="#8D2323" />
          <schematiccircle center={{ x: 0.4, y: -0.14 }} radius={0.02} strokeWidth={0.02} color="#8D2323" />
          <port name="pin1" pinNumber={1} aliases={["G"]} direction="left" schX={-0.4} schY={0} schStemLength={0.2} />
          <port name="pin2" pinNumber={2} aliases={["D"]} direction="down" schX={0.4} schY={0.4} schStemLength={0.2} />
          <port name="pin3" pinNumber={3} aliases={["S"]} direction="up" schX={0.4} schY={-0.4} schStemLength={0.2} />
          <schematictext schX={0.36} schY={0.18} text="D" fontSize={0.06} anchor="left" color="#238D23" schRotation={0} />
          <schematictext schX={0.36} schY={-0.24} text="S" fontSize={0.06} anchor="left" color="#238D23" schRotation={0} />
          <schematictext schX={0.12} schY={0} text="G" fontSize={0.06} anchor="left" color="#238D23" schRotation={0} />
          <schematicpath points={[{"x":0.28,"y":0},{"x":0.26,"y":0}]} strokeColor="#8D2323" />
          <schematicpath points={[{"x":0.26,"y":0},{"x":0.34,"y":-0.02}]} strokeColor="#8D2323" />
          <schematicpath points={[{"x":0.26,"y":0},{"x":0.34,"y":0.02}]} strokeColor="#8D2323" />
          <schematicpath points={[{"x":0.34,"y":-0.02},{"x":0.34,"y":0.02}]} strokeColor="#8D2323" />
          <schematicpath points={[{"x":0.34,"y":0.02},{"x":0.28,"y":0}]} strokeColor="#8D2323" />
          <schematicpath points={[{"x":0.28,"y":0},{"x":0.34,"y":-0.02}]} strokeColor="#8D2323" />
          <schematicpath points={[{"x":0.34,"y":-0.02},{"x":0.3,"y":0}]} strokeColor="#8D2323" />
          <schematicpath points={[{"x":0.52,"y":0},{"x":0.52,"y":0.04}]} strokeColor="#8D2323" />
          <schematicpath points={[{"x":0.56,"y":-0.04},{"x":0.54,"y":-0.04}]} strokeColor="#8D2323" />
          <schematicpath points={[{"x":0.54,"y":-0.04},{"x":0.5,"y":-0.04}]} strokeColor="#8D2323" />
          <schematicpath points={[{"x":0.5,"y":-0.04},{"x":0.48,"y":-0.04}]} strokeColor="#8D2323" />
          <schematicpath points={[{"x":0.52,"y":0.04},{"x":0.56,"y":-0.04}]} strokeColor="#8D2323" />
          <schematicpath points={[{"x":0.56,"y":0.04},{"x":0.52,"y":0.04}]} strokeColor="#8D2323" />
          <schematicpath points={[{"x":0.52,"y":0.04},{"x":0.48,"y":0.04}]} strokeColor="#8D2323" />
          <schematicpath points={[{"x":0.54,"y":-0.04},{"x":0.52,"y":0}]} strokeColor="#8D2323" />
          <schematicpath points={[{"x":0.52,"y":0},{"x":0.5,"y":-0.04}]} strokeColor="#8D2323" />
          <schematicpath points={[{"x":0.54,"y":-0.02},{"x":0.52,"y":0}]} strokeColor="#8D2323" />
          <schematicpath points={[{"x":0.52,"y":0},{"x":0.5,"y":-0.02}]} strokeColor="#8D2323" />
          <schematicpath points={[{"x":0.48,"y":-0.04},{"x":0.52,"y":0.04}]} strokeColor="#8D2323" />
          <schematicpath points={[{"x":0.4,"y":-0.26},{"x":-0.2,"y":-0.26},{"x":-0.2,"y":0},{"x":0.2,"y":0}]} strokeColor="#880000" />
          <schematiccircle center={{ x: -0.2, y: 0 }} radius={0.02} strokeWidth={0.02} color="#8D2323" />
          <schematiccircle center={{ x: 0.4, y: -0.26 }} radius={0.02} strokeWidth={0.02} color="#8D2323" />
          <schematicpath points={[{"x":0.02,"y":-0.18},{"x":0.04,"y":-0.2},{"x":0.04,"y":-0.32},{"x":0.06,"y":-0.34}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0.12,"y":-0.34},{"x":0.12,"y":-0.18},{"x":0.04,"y":-0.26},{"x":0.12,"y":-0.34},{"x":0.12,"y":-0.34}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0.06,"y":-0.34},{"x":0.04,"y":-0.32},{"x":0.04,"y":-0.2},{"x":0.02,"y":-0.18}]} strokeColor="#880000" />
          <schematicpath points={[{"x":-0.04,"y":-0.18},{"x":-0.04,"y":-0.34},{"x":0.04,"y":-0.26},{"x":-0.04,"y":-0.18},{"x":-0.04,"y":-0.18}]} strokeColor="#880000" />
          <schematictext schX={0.06} schY={0.64} text="{NAME}" fontSize={0.2} anchor="bottom_center" />
        </symbol>
      }
      supplierPartNumbers={{
  "jlcpcb": [
    "C154728"
  ]
}}
      manufacturerPartNumber="DMN2300UFB4-7B"
      footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="-0.2250186mm" pcbY="-0.350012mm" width="0.2500122mm" height="0.3999992mm" shape="rect" />
<smtpad portHints={["pin2"]} pcbX="0.0000254mm" pcbY="0.350012mm" width="0.6999986mm" height="0.3999992mm" shape="rect" />
<smtpad portHints={["pin3"]} pcbX="0.2248154mm" pcbY="-0.350012mm" width="0.2500122mm" height="0.3999992mm" shape="rect" />
<silkscreenpath route={[{"x":-0.5200650000000451,"y":0.7101077999999461},{"x":-0.5200650000000451,"y":-0.7099046000000726}]} />
<silkscreenpath route={[{"x":0.4399279999997816,"y":0.7101077999999461},{"x":-0.4275328000001082,"y":0.7101077999999461}]} />
<silkscreenpath route={[{"x":0.519937999999911,"y":0.7101077999999461},{"x":0.519937999999911,"y":-0.7099046000000726}]} />
<silkscreenpath route={[{"x":0.519937999999911,"y":0.7101077999999461},{"x":0.4399279999997816,"y":0.7101077999999461}]} />
<silkscreenpath route={[{"x":-0.4275328000001082,"y":0.7101077999999461},{"x":-0.5200650000000451,"y":0.7101077999999461}]} />
<silkscreenpath route={[{"x":-0.5200650000000451,"y":-0.7099046000000726},{"x":0.519937999999911,"y":-0.7099046000000726}]} />
<silkscreencircle pcbX="-0.3301746mm" pcbY="-0.86487mm" radius="0.042672mm" />
<silkscreentext text="{NAME}" pcbX="0.0043434mm" pcbY="1.718312mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-0.6000247000000627,"y":0.800011599999948},{"x":0.600024699999949,"y":0.800011599999948},{"x":0.600024699999949,"y":-0.8000115999998343},{"x":-0.6000247000000627,"y":-0.8000115999998343},{"x":-0.6000247000000627,"y":0.800011599999948}]} />
      </footprint>}
      cadModel={{
        objUrl: objPath,
        stepUrl: stepPath,
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0.00008890000015071564, y: -0.0000889000000370288, z: -0.01 },
      }}
      {...props}
    />
  )
}