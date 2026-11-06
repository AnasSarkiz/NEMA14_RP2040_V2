import React from "react"
const objPath = "https://modelcdn.tscircuit.com/easyeda_models/assets/C38437.obj"
const stepPath = "https://modelcdn.tscircuit.com/easyeda_models/assets/C38437.step"
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["OUT2B"],
  pin2: ["N_ENABLE"],
  pin3: ["GND2"],
  pin4: ["CP1"],
  pin5: ["CP2"],
  pin6: ["VCP"],
  pin7: ["NC3"],
  pin8: ["VREG"],
  pin9: ["MS1"],
  pin10: ["MS2"],
  pin11: ["MS3"],
  pin12: ["N_RESET"],
  pin13: ["ROSC"],
  pin14: ["N_SLEEP"],
  pin15: ["VDD"],
  pin16: ["STEP"],
  pin17: ["REF"],
  pin18: ["GND1"],
  pin19: ["DIR"],
  pin20: ["NC2"],
  pin21: ["OUT1B"],
  pin22: ["VBB1"],
  pin23: ["SENSE1"],
  pin24: ["OUT1A"],
  pin25: ["NC1"],
  pin26: ["OUT2A"],
  pin27: ["SENSE2"],
  pin28: ["VBB2"],
  pin29: ["PAD"]
} as const

const pinAttributes = {
  pin3: {requiresGround: true, mustBeConnected: true},
  pin7: {doNotConnect: true},
  pin15: {requiresPower: true, mustBeConnected: true, shouldHaveDecouplingCapacitor: true},
  pin18: {requiresGround: true, mustBeConnected: true},
  pin20: {doNotConnect: true},
  pin25: {doNotConnect: true},
  pin29: {requiresGround: true, mustBeConnected: true},
  pin28: {requiresPower: true, mustBeConnected: true, shouldHaveDecouplingCapacitor: true},
  pin27: {isInput: true, mustBeConnected: true},
  pin26: {isOutput: true, canUseTriState: true},
  pin24: {isOutput: true, canUseTriState: true},
  pin23: {isInput: true, mustBeConnected: true},
  pin22: {requiresPower: true, mustBeConnected: true, shouldHaveDecouplingCapacitor: true},
  pin21: {isOutput: true, canUseTriState: true},
  pin19: {isInput: true},
  pin17: {isInput: true},
  pin16: {isInput: true},
  pin14: {isInput: true},
  pin13: {isPassive: true},
  pin12: {isInput: true},
  pin11: {isInput: true, canUseInternalPulldown: true, isUsingInternalPulldown: true},
  pin10: {isInput: true, canUseInternalPulldown: true, isUsingInternalPulldown: true},
  pin9: {isInput: true, canUseInternalPulldown: true, isUsingInternalPulldown: true},
  pin8: {isOutput: true, mustBeConnected: true, shouldHaveDecouplingCapacitor: true, recommendedDecouplingCapacitorCapacitance: "0.22uF"},
  pin6: {isOutput: true, mustBeConnected: true},
  pin5: {isPassive: true},
  pin4: {isPassive: true},
  pin2: {isInput: true},
  pin1: {isOutput: true, canUseTriState: true}
} satisfies NonNullable<ChipProps["pinAttributes"]>

export const A4988SETTR_T = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C38437"
  ]
}}
      manufacturerPartNumber="A4988SETTR-T"
      footprint={<footprint>
        <smtpad portHints={["pin29"]} pcbX="-0.000127mm" pcbY="-0.000127mm" width="3.1999936mm" height="3.1999936mm" shape="rect" />
<smtpad portHints={["pin28"]} pcbX="-2.499995mm" pcbY="-1.501267mm" width="0.8999982mm" height="0.2800096mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin27"]} pcbX="-2.499995mm" pcbY="-1.000887mm" width="0.8999982mm" height="0.2800096mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin26"]} pcbX="-2.499995mm" pcbY="-0.500507mm" width="0.8999982mm" height="0.2800096mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin25"]} pcbX="-2.499995mm" pcbY="-0.000127mm" width="0.8999982mm" height="0.2800096mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin24"]} pcbX="-2.499995mm" pcbY="0.500253mm" width="0.8999982mm" height="0.2800096mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin23"]} pcbX="-2.499995mm" pcbY="1.000633mm" width="0.8999982mm" height="0.2800096mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin22"]} pcbX="-2.499995mm" pcbY="1.501013mm" width="0.8999982mm" height="0.2800096mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin21"]} pcbX="-1.501267mm" pcbY="2.499995mm" width="0.2800096mm" height="0.8999982mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin20"]} pcbX="-1.000887mm" pcbY="2.499995mm" width="0.2800096mm" height="0.8999982mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin19"]} pcbX="-0.500507mm" pcbY="2.499995mm" width="0.2800096mm" height="0.8999982mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin18"]} pcbX="-0.000127mm" pcbY="2.499995mm" width="0.2800096mm" height="0.8999982mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin17"]} pcbX="0.500253mm" pcbY="2.499995mm" width="0.2800096mm" height="0.8999982mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin16"]} pcbX="1.000633mm" pcbY="2.499995mm" width="0.2800096mm" height="0.8999982mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin15"]} pcbX="1.501013mm" pcbY="2.499995mm" width="0.2800096mm" height="0.8999982mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin14"]} pcbX="2.499995mm" pcbY="1.501013mm" width="0.8999982mm" height="0.2800096mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin13"]} pcbX="2.499995mm" pcbY="1.000633mm" width="0.8999982mm" height="0.2800096mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin12"]} pcbX="2.499995mm" pcbY="0.500253mm" width="0.8999982mm" height="0.2800096mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin11"]} pcbX="2.499995mm" pcbY="-0.000127mm" width="0.8999982mm" height="0.2800096mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin10"]} pcbX="2.499995mm" pcbY="-0.500507mm" width="0.8999982mm" height="0.2800096mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin9"]} pcbX="2.499995mm" pcbY="-1.000887mm" width="0.8999982mm" height="0.2800096mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin8"]} pcbX="2.499995mm" pcbY="-1.501267mm" width="0.8999982mm" height="0.2800096mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin7"]} pcbX="1.501013mm" pcbY="-2.499995mm" width="0.2800096mm" height="0.8999982mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin6"]} pcbX="1.000633mm" pcbY="-2.499995mm" width="0.2800096mm" height="0.8999982mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin5"]} pcbX="0.500253mm" pcbY="-2.499995mm" width="0.2800096mm" height="0.8999982mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin4"]} pcbX="-0.000127mm" pcbY="-2.499995mm" width="0.2800096mm" height="0.8999982mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin3"]} pcbX="-0.500507mm" pcbY="-2.499995mm" width="0.2800096mm" height="0.8999982mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin2"]} pcbX="-1.000887mm" pcbY="-2.499995mm" width="0.2800096mm" height="0.8999982mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin1"]} pcbX="-1.501267mm" pcbY="-2.499995mm" width="0.2800096mm" height="0.8999982mm" radius="0.1400048mm" shape="pill" />
<silkscreenpath route={[{"x":-2.0001991999999973,"y":-2.6500328000000053},{"x":-2.6501851999999957,"y":-2.6500328000000053},{"x":-2.6501851999999957,"y":-2.000046800000007}]} />
<silkscreenpath route={[{"x":-2.0001991999999973,"y":2.6499311999999975},{"x":-2.6501851999999957,"y":2.6499311999999975},{"x":-2.6501851999999957,"y":1.999945199999992}]} />
<silkscreenpath route={[{"x":2.649778800000007,"y":1.999945199999992},{"x":2.649778800000007,"y":2.6499311999999975},{"x":1.9997927999999945,"y":2.6499311999999975}]} />
<silkscreenpath route={[{"x":1.9997927999999945,"y":-2.6500328000000053},{"x":2.649778800000007,"y":-2.6500328000000053},{"x":2.649778800000007,"y":-2.000046800000007}]} />
<silkscreenpath route={[{"x":-2.451303199999991,"y":-2.9997908000000137},{"x":-2.600044255997652,"y":-3.150432829703931},{"x":-2.450033199999993,"y":-3.299810224014749},{"x":-2.300022144002334,"y":-3.150432829703931},{"x":-2.448763199999995,"y":-2.9997908000000137}]} />
<silkscreentext text="{NAME}" pcbX="-0.009271mm" pcbY="3.955671mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-3.199994099999998,"y":3.199994099999998},{"x":3.199994099999998,"y":3.199994099999998},{"x":3.199994099999998,"y":-3.199994100000005},{"x":-3.199994099999998,"y":-3.199994100000005},{"x":-3.199994099999998,"y":3.199994099999998}]} />
      </footprint>}
      cadModel={{
        objUrl: objPath,
        positionOffset: { x: (0.0) * Math.cos(Number(props.pcbRotation ?? 0) * Math.PI / 180) - (-0.0) * Math.sin(Number(props.pcbRotation ?? 0) * Math.PI / 180), y: (0.0) * Math.sin(Number(props.pcbRotation ?? 0) * Math.PI / 180) + (-0.0) * Math.cos(Number(props.pcbRotation ?? 0) * Math.PI / 180), z: 0 },
        stepUrl: stepPath,
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0, y: 0, z: -0.05 },
      }}
      {...props}
    />
  )
}