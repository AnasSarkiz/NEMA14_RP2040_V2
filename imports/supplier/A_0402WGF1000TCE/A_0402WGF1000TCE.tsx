import React from "react"
const objPath = "https://modelcdn.tscircuit.com/easyeda_models/assets/C25076.obj"
const stepPath = "https://modelcdn.tscircuit.com/easyeda_models/assets/C25076.step"
import type { ResistorProps } from "@tscircuit/props"

export const A_0402WGF1000TCE = (props: Omit<ResistorProps, "resistance">) => {
  const { name = "R1", ...restProps } = props

  return (
    <resistor
      name={name}
      resistance="100ohm"
      supplierPartNumbers={{
  "jlcpcb": [
    "C25076"
  ]
}}
      manufacturerPartNumber="0402WGF1000TCE"
      footprint={<footprint>
        <smtpad portHints={["pin2"]} pcbX="0.432816mm" pcbY="0mm" width="0.565658mm" height="0.540004mm" shape="rect" />
<smtpad portHints={["pin1"]} pcbX="-0.432816mm" pcbY="0mm" width="0.565658mm" height="0.540004mm" shape="rect" />
<silkscreenpath route={[{"x":-0.22621240000012222,"y":-0.4986020000000053},{"x":-0.9442450000001372,"y":-0.4986020000000053},{"x":-0.9442450000001372,"y":0.498602000000119},{"x":-0.22621240000012222,"y":0.498602000000119}]} />
<silkscreenpath route={[{"x":0.22621240000000853,"y":-0.4986020000000053},{"x":0.9442449999999099,"y":-0.4986020000000053},{"x":0.9442449999999099,"y":0.498602000000119},{"x":0.22621240000000853,"y":0.498602000000119}]} />
<silkscreentext text="{NAME}" pcbX="0mm" pcbY="1.508mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-0.9656450000001087,"y":0.5200019999999768},{"x":0.965644999999995,"y":0.5200019999999768},{"x":0.965644999999995,"y":-0.5200019999999768},{"x":-0.9656450000001087,"y":-0.5200019999999768},{"x":-0.9656450000001087,"y":0.5200019999999768}]} />
      </footprint>}
      cadModel={{
        objUrl: objPath,
        stepUrl: stepPath,
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0, y: -0.000012700000070253736, z: 0 },
      }}
      {...restProps}
    />
  )
}