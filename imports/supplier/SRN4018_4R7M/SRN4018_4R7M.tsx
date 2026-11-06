import React from "react"
const objPath = "https://modelcdn.tscircuit.com/easyeda_models/assets/C780206.obj"
const stepPath = "https://modelcdn.tscircuit.com/easyeda_models/assets/C780206.step"
import type { InductorProps } from "@tscircuit/props"

export const SRN4018_4R7M = (props: Omit<InductorProps, "inductance">) => {
  return (
    <inductor
      inductance="4.7uH"
      supplierPartNumbers={{
  "jlcpcb": [
    "C780206"
  ]
}}
      manufacturerPartNumber="SRN4018-4R7M"
      footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="-1.400048mm" pcbY="0mm" width="1.3999972mm" height="4.1999916mm" shape="rect" />
<smtpad portHints={["pin2"]} pcbX="1.400048mm" pcbY="0mm" width="1.3999972mm" height="4.1999916mm" shape="rect" />
<silkscreenpath route={[{"x":-2.286000000000058,"y":2.5399999999999636},{"x":2.4129999999998972,"y":2.5399999999999636},{"x":2.4129999999998972,"y":-2.286000000000058},{"x":2.4129999999998972,"y":-2.413000000000011},{"x":-2.286000000000058,"y":-2.413000000000011},{"x":-2.413000000000011,"y":-2.413000000000011},{"x":-2.413000000000011,"y":2.5399999999999636},{"x":-2.286000000000058,"y":2.5399999999999636}]} />
<silkscreentext text="{NAME}" pcbX="0mm" pcbY="3.54mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-2.3500466000000415,"y":2.349995799999988},{"x":2.350046599999928,"y":2.349995799999988},{"x":2.350046599999928,"y":-2.349995799999988},{"x":-2.3500466000000415,"y":-2.349995799999988},{"x":-2.3500466000000415,"y":2.349995799999988}]} />
      </footprint>}
      cadModel={{
        objUrl: objPath,
        positionOffset: { x: (0.0) * Math.cos(Number(props.pcbRotation ?? 0) * Math.PI / 180) - (0.0) * Math.sin(Number(props.pcbRotation ?? 0) * Math.PI / 180), y: (0.0) * Math.sin(Number(props.pcbRotation ?? 0) * Math.PI / 180) + (0.0) * Math.cos(Number(props.pcbRotation ?? 0) * Math.PI / 180), z: 0 },
        stepUrl: stepPath,
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0, y: 0.02499999999999991, z: -0.02 },
      }}
      {...props}
    />
  )
}