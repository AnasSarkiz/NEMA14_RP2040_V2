import React from "react"
const objPath = "https://modelcdn.tscircuit.com/easyeda_models/assets/C93965.obj"
const stepPath = "https://modelcdn.tscircuit.com/easyeda_models/assets/C93965.step"
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["NC"],
  pin2: ["IN_POS"],
  pin3: ["IN_NEG"],
  pin4: ["GND"],
  pin5: ["VS"],
  pin6: ["REF2"],
  pin7: ["REF1"],
  pin8: ["OUT"]
} as const

const pinAttributes = {
  pin1: {doNotConnect: true},
  pin4: {requiresGround: true}
} as const

export const INA240A1PWR = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C93965"
  ]
}}
      manufacturerPartNumber="INA240A1PWR"
      footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="-0.975106mm" pcbY="-2.927096mm" width="0.3530092mm" height="1.4539976mm" radius="0.1765046mm" shape="pill" />
<smtpad portHints={["pin2"]} pcbX="-0.324866mm" pcbY="-2.927096mm" width="0.3530092mm" height="1.4539976mm" radius="0.1765046mm" shape="pill" />
<smtpad portHints={["pin3"]} pcbX="0.32512mm" pcbY="-2.927096mm" width="0.3530092mm" height="1.4539976mm" radius="0.1765046mm" shape="pill" />
<smtpad portHints={["pin4"]} pcbX="0.975106mm" pcbY="-2.927096mm" width="0.3530092mm" height="1.4539976mm" radius="0.1765046mm" shape="pill" />
<smtpad portHints={["pin8"]} pcbX="-0.975106mm" pcbY="2.927096mm" width="0.3530092mm" height="1.4539976mm" radius="0.1765046mm" shape="pill" />
<smtpad portHints={["pin7"]} pcbX="-0.324866mm" pcbY="2.927096mm" width="0.3530092mm" height="1.4539976mm" radius="0.1765046mm" shape="pill" />
<smtpad portHints={["pin6"]} pcbX="0.32512mm" pcbY="2.927096mm" width="0.3530092mm" height="1.4539976mm" radius="0.1765046mm" shape="pill" />
<smtpad portHints={["pin5"]} pcbX="0.975106mm" pcbY="2.927096mm" width="0.3530092mm" height="1.4539976mm" radius="0.1765046mm" shape="pill" />
<silkscreenpath route={[{"x":1.4999969999998939,"y":1.9658838000000287},{"x":1.4999969999998939,"y":-1.9381978000000117}]} />
<silkscreenpath route={[{"x":-1.4999970000000076,"y":-0.5080000000000382},{"x":-1.4999970000000076,"y":-1.9381978000000117}]} />
<silkscreenpath route={[{"x":-1.501139999999964,"y":0.5080000000000382},{"x":-1.501139999999964,"y":1.9658838000000287}]} />
<silkscreenpath route={[{"x":-1.4999970000000076,"y":-1.9381978000000117},{"x":1.4999969999998939,"y":-1.9381978000000117}]} />
<silkscreenpath route={[{"x":-1.4999970000000076,"y":1.9658838000000287},{"x":1.4999969999998939,"y":1.9658838000000287}]} />
<silkscreenpath route={[{"x":-1.4999970000000076,"y":-0.5080000000000382},{"x":-1.501139999999964,"y":0.5080000000000382}]} />
<silkscreentext text="{NAME}" pcbX="0mm" pcbY="4.4798mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-1.7499970000000076,"y":3.9040948000000526},{"x":1.7499969999998939,"y":3.9040948000000526},{"x":1.7499969999998939,"y":-3.904094799999939},{"x":-1.7499970000000076,"y":-3.904094799999939},{"x":-1.7499970000000076,"y":3.9040948000000526}]} />
      </footprint>}
      cadModel={{
        objUrl: objPath,
        stepUrl: stepPath,
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0, y: 0, z: 0 },
      }}
      {...props}
    />
  )
}