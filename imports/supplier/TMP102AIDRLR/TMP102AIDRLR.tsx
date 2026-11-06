import React from "react"
const objPath = "https://modelcdn.tscircuit.com/easyeda_models/assets/C99269.obj?uuid=ec2270bac0544bf5afe06b24e8356512"
const stepPath = "https://modelcdn.tscircuit.com/easyeda_models/assets/C99269.step?uuid=ec2270bac0544bf5afe06b24e8356512"
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["SCL"],
  pin2: ["GND"],
  pin3: ["ALERT"],
  pin4: ["ADD0"],
  pin5: ["V_POS"],
  pin6: ["SDA"]
} as const

const pinAttributes = {
  pin2: {requiresGround: true, mustBeConnected: true},
  pin5: {requiresPower: true, mustBeConnected: true, shouldHaveDecouplingCapacitor: true},
  pin3: {isOutput: true, needsExternalPullup: true, canUseOpenDrain: true},
  pin1: {isInput: true, capabilities: ["i2c_scl"]},
  pin4: {isInput: true},
  pin6: {isInput: true, isOutput: true, isBidirectional: true, capabilities: ["i2c_sda"], needsExternalPullup: true, canUseOpenDrain: true}
} satisfies NonNullable<ChipProps["pinAttributes"]>

export const TMP102AIDRLR = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C99269"
  ]
}}
      manufacturerPartNumber="TMP102AIDRLR"
      footprint={<footprint>
        <smtpad portHints={["pin5"]} pcbX="-0.7499858mm" pcbY="-0.000127mm" width="0.5999988mm" height="0.2999994mm" shape="rect" />
<smtpad portHints={["pin2"]} pcbX="0.7499858mm" pcbY="-0.000127mm" width="0.5999988mm" height="0.2999994mm" shape="rect" />
<smtpad portHints={["pin3"]} pcbX="0.7499858mm" pcbY="0.499999mm" width="0.5999988mm" height="0.2999994mm" shape="rect" />
<smtpad portHints={["pin1"]} pcbX="0.7499858mm" pcbY="-0.499999mm" width="0.5999988mm" height="0.2999994mm" shape="rect" />
<smtpad portHints={["pin4"]} pcbX="-0.7499858mm" pcbY="0.499999mm" width="0.5999988mm" height="0.2999994mm" shape="rect" />
<smtpad portHints={["pin6"]} pcbX="-0.7499858mm" pcbY="-0.499999mm" width="0.5999988mm" height="0.2999994mm" shape="rect" />
<silkscreenpath route={[{"x":-0.4751578000000052,"y":-0.7874762000000004},{"x":0.4748021999999992,"y":-0.7874762000000004}]} />
<silkscreenpath route={[{"x":-0.4751578000000052,"y":0.7873237999999958},{"x":0.4748021999999992,"y":0.7873237999999958}]} />
<silkscreencircle pcbX="0.840105mm" pcbY="-0.930021mm" radius="0.059944mm" />
<silkscreentext text="{NAME}" pcbX="0.016383mm" pcbY="1.834517mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-1.299985200000009,"y":1.0799196000000109},{"x":1.2999851999999947,"y":1.0799196000000109},{"x":1.2999851999999947,"y":-1.020077200000003},{"x":-1.299985200000009,"y":-1.020077200000003},{"x":-1.299985200000009,"y":1.0799196000000109}]} />
      </footprint>}
      cadModel={{
        objUrl: objPath,
        stepUrl: stepPath,
        pcbRotationOffset: 180,
        modelOriginPosition: { x: -0.00005079999999679785, y: 0.029921200000003978, z: 0 },
      }}
      {...props}
    />
  )
}