import React from "react"
const objPath = "https://modelcdn.tscircuit.com/easyeda_models/assets/C193627.obj"
const stepPath = "https://modelcdn.tscircuit.com/easyeda_models/assets/C193627.step"
import type { CapacitorProps } from "@tscircuit/props"

export const EEEFT1V470AR = (props: Omit<CapacitorProps, "capacitance">) => {
  const { name = "C1", ...restProps } = props

  return (
    <capacitor
      name={name}
      capacitance="47uF"
      polarized
      supplierPartNumbers={{
  "jlcpcb": [
    "C193627"
  ]
}}
      manufacturerPartNumber="EEEFT1V470AR"
      footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="-2.100072mm" pcbY="0mm" width="2.7999944mm" height="1.0999978mm" shape="rect" />
<smtpad portHints={["pin2"]} pcbX="2.100072mm" pcbY="0mm" width="2.7999944mm" height="1.0999978mm" shape="rect" />
<silkscreenpath route={[{"x":2.659379999999828,"y":0.6070599999999331},{"x":2.659379999999828,"y":2.649220000000014},{"x":-1.3487400000000207,"y":2.649220000000014},{"x":-2.659379999999942,"y":1.34112000000016},{"x":-2.659379999999942,"y":0.6070599999999331}]} />
<silkscreenpath route={[{"x":2.6492199999999,"y":-0.6070600000000468},{"x":2.6492199999999,"y":-2.618739999999889},{"x":-1.371599999999944,"y":-2.618739999999889},{"x":-2.659379999999942,"y":-1.3309600000000046},{"x":-2.659379999999942,"y":-0.6070600000000468}]} />
<silkscreentext text="{NAME}" pcbX="0mm" pcbY="3.6416mm" anchorAlignment="center" fontSize="1mm" />
<fabricationnotepath route={[{"x":2.2560025999998743,"y":0.07200899999998},{"x":2.2560025999998743,"y":-0.07200899999998},{"x":1.680006800000001,"y":-0.07200899999998},{"x":1.680006800000001,"y":0.07200899999998},{"x":2.2560025999998743,"y":0.07200899999998}]} strokeWidth="0.254mm" />
<fabricationnotepath route={[{"x":-2.256002599999988,"y":0.07200899999998},{"x":-2.256002599999988,"y":-0.07200899999998},{"x":-1.680006800000001,"y":-0.07200899999998},{"x":-1.680006800000001,"y":0.07200899999998},{"x":-2.256002599999988,"y":0.07200899999998}]} strokeWidth="0.254mm" />
<fabricationnotepath route={[{"x":-2.040001000000075,"y":0.48000920000004044},{"x":-2.040001000000075,"y":-0.48000920000004044},{"x":-1.896008400000028,"y":-0.48000920000004044},{"x":-1.896008400000028,"y":0.48000920000004044},{"x":-2.040001000000075,"y":0.48000920000004044}]} strokeWidth="0.254mm" />
<courtyardoutline outline={[{"x":-3.750069200000098,"y":2.9000074000000495},{"x":3.7500691999999844,"y":2.9000074000000495},{"x":3.7500691999999844,"y":-2.899981999999909},{"x":-3.750069200000098,"y":-2.899981999999909},{"x":-3.750069200000098,"y":2.9000074000000495}]} />
      </footprint>}
      cadModel={{
        objUrl: objPath,
        stepUrl: stepPath,
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0.000012699999956566899, y: -0.000012700000070253736, z: -0.1 },
      }}
      {...restProps}
    />
  )
}