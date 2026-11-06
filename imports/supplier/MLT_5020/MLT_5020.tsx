import React from "react"
const objPath = "https://modelcdn.tscircuit.com/easyeda_models/assets/C94598.obj"
const stepPath = "https://modelcdn.tscircuit.com/easyeda_models/assets/C94598.step"
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["_POS"],
  pin2: ["_NEG"],
  pin3: ["NC"]
} as const

const pinAttributes = {
  pin3: {doNotConnect: true}
} as const

export const MLT_5020 = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      symbol={
        <symbol>
          <port name="pin3" pinNumber={3} aliases={["NC"]} direction="down" schX={0.1} schY={-0.4} schStemLength={0.2} />
          <schematicpath points={[{"x":-0.1,"y":0.14},{"x":0.1,"y":0.14}]} strokeColor="#880000" />
          <schematicpath points={[{"x":-0.1,"y":-0.14},{"x":0.1,"y":-0.14}]} strokeColor="#880000" />
          <schematicpath points={[{"x":-0.1,"y":0.14},{"x":-0.1,"y":-0.14}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0.1,"y":0.14},{"x":0.1,"y":-0.14}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0.28,"y":0.3},{"x":0.28,"y":-0.3}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0.1,"y":-0.14},{"x":0.28,"y":-0.3}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0.28,"y":0.3},{"x":0.1,"y":0.14}]} strokeColor="#880000" />
          <port name="pin2" pinNumber={2} aliases={["_NEG"]} direction="left" schX={-0.3} schY={-0.1} schStemLength={0.2} />
          <port name="pin1" pinNumber={1} aliases={["_POS"]} direction="left" schX={-0.3} schY={0.1} schStemLength={0.2} />
          <schematictext schX={-0.02} schY={0.5} text="{NAME}" fontSize={0.2} anchor="bottom_center" />
        </symbol>
      }
      supplierPartNumbers={{
  "jlcpcb": [
    "C94598"
  ]
}}
      manufacturerPartNumber="MLT-5020"
      footprint={<footprint>
        <smtpad portHints={["pin2"]} pcbX="2.29997mm" pcbY="-1.749933mm" width="1.6999966mm" height="0.6999986mm" shape="rect" />
<smtpad portHints={["pin1"]} pcbX="-2.29997mm" pcbY="-1.749933mm" width="1.6999966mm" height="0.6999986mm" shape="rect" />
<smtpad portHints={["pin3"]} pcbX="-2.29997mm" pcbY="1.749933mm" width="1.6999966mm" height="0.6999986mm" shape="rect" />
<silkscreenpath route={[{"x":-2.793999999999869,"y":2.3312120000000505},{"x":-2.793999999999869,"y":2.5400000000000773},{"x":1.77800000000002,"y":2.5400000000000773},{"x":2.7940000000000964,"y":1.524000000000001}]} />
<silkscreenpath route={[{"x":-2.793999999999869,"y":-1.168781000000081},{"x":-2.793999999999869,"y":1.168907999999874}]} />
<silkscreenpath route={[{"x":-2.793999999999869,"y":-2.5400000000000773},{"x":-2.793999999999869,"y":-2.33108500000003}]} />
<silkscreenpath route={[{"x":2.7934920000001284,"y":-2.3315930000001117},{"x":2.7934920000001284,"y":-2.539873000000057},{"x":-2.793999999999869,"y":-2.5400000000000773}]} />
<silkscreenpath route={[{"x":2.7940000000000964,"y":1.524000000000001},{"x":2.7940000000000964,"y":-1.168781000000081}]} />
<silkscreentext text="+" pcbX="-1.524mm" pcbY="-1.397127mm" anchorAlignment="bottom_left" fontSize="2.032mm" />
<silkscreentext text="-" pcbX="0.762mm" pcbY="-1.397127mm" anchorAlignment="bottom_left" fontSize="2.032mm" />
<silkscreentext text="{NAME}" pcbX="-0.003048mm" pcbY="3.618867mm" anchorAlignment="center" fontSize="1mm" />
<fabricationnotepath route={[{"x":-1.8414999999998827,"y":-2.222474600000055},{"x":-1.8414999999998827,"y":-1.8414746000000832},{"x":-2.2224999999998545,"y":-1.8414746000000832},{"x":-2.2224999999998545,"y":-1.7144746000000168},{"x":-1.8414999999998827,"y":-1.7144746000000168},{"x":-1.8414999999998827,"y":-1.333474600000045},{"x":-1.7144999999998163,"y":-1.333474600000045},{"x":-1.7144999999998163,"y":-1.7144746000000168},{"x":-1.3334999999998445,"y":-1.7144746000000168},{"x":-1.3334999999998445,"y":-1.8414746000000832},{"x":-1.7144999999998163,"y":-1.8414746000000832},{"x":-1.7144999999998163,"y":-2.222474600000055},{"x":-1.8414999999998827,"y":-2.222474600000055}]} strokeWidth="0.254mm" />
<fabricationnotepath route={[{"x":1.5875000000002046,"y":-1.7144746000000168},{"x":2.4765000000002146,"y":-1.7144746000000168},{"x":2.4765000000002146,"y":-1.8414746000000832},{"x":1.5875000000002046,"y":-1.8414746000000832},{"x":1.5875000000002046,"y":-1.7144746000000168}]} strokeWidth="0.254mm" />
<courtyardoutline outline={[{"x":-3.399968299999955,"y":2.8800683999999137},{"x":3.3999683000000687,"y":2.8800683999999137},{"x":3.3999683000000687,"y":-2.879916000000094},{"x":-3.399968299999955,"y":-2.879916000000094},{"x":-3.399968299999955,"y":2.8800683999999137}]} />
      </footprint>}
      cadModel={{
        objUrl: objPath,
        stepUrl: stepPath,
        pcbRotationOffset: 270,
        modelOriginPosition: { x: 0.00007619999996677507, y: 0.06042139999991303, z: 0 },
      }}
      {...props}
    />
  )
}