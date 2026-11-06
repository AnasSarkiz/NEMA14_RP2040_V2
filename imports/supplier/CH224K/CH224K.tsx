import React from "react"
const objPath = "https://modelcdn.tscircuit.com/easyeda_models/assets/C970725.obj"
const stepPath = "https://modelcdn.tscircuit.com/easyeda_models/assets/C970725.step"
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["VDD"],
  pin2: ["CFG2"],
  pin3: ["CFG3"],
  pin4: ["DP"],
  pin5: ["DM"],
  pin6: ["CC2"],
  pin7: ["CC1"],
  pin8: ["VBUS"],
  pin9: ["CFG1"],
  pin10: ["PG"],
  pin11: ["GND"]
} as const

const pinAttributes = {
  pin1: {requiresPower: true},
  pin8: {requiresPower: true},
  pin11: {requiresGround: true}
} as const

export const CH224K = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C970725"
  ]
}}
      manufacturerPartNumber="CH224K"
      footprint={<footprint>
        <smtpad portHints={["pin10"]} pcbX="-1.999996mm" pcbY="2.999867mm" width="0.5999988mm" height="1.499997mm" shape="rect" />
<smtpad portHints={["pin9"]} pcbX="-0.999998mm" pcbY="3.000121mm" width="0.5999988mm" height="1.499997mm" shape="rect" />
<smtpad portHints={["pin8"]} pcbX="-0mm" pcbY="3.000121mm" width="0.5999988mm" height="1.499997mm" shape="rect" />
<smtpad portHints={["pin7"]} pcbX="0.999998mm" pcbY="3.000121mm" width="0.5999988mm" height="1.499997mm" shape="rect" />
<smtpad portHints={["pin6"]} pcbX="1.999996mm" pcbY="2.999867mm" width="0.5999988mm" height="1.499997mm" shape="rect" />
<smtpad portHints={["pin5"]} pcbX="1.999996mm" pcbY="-3.000121mm" width="0.5999988mm" height="1.499997mm" shape="rect" />
<smtpad portHints={["pin4"]} pcbX="0.999998mm" pcbY="-3.000121mm" width="0.5999988mm" height="1.499997mm" shape="rect" />
<smtpad portHints={["pin3"]} pcbX="-0mm" pcbY="-3.000121mm" width="0.5999988mm" height="1.499997mm" shape="rect" />
<smtpad portHints={["pin2"]} pcbX="-0.999998mm" pcbY="-3.000121mm" width="0.5999988mm" height="1.499997mm" shape="rect" />
<smtpad portHints={["pin1"]} pcbX="-1.999996mm" pcbY="-3.000121mm" width="0.5999988mm" height="1.499997mm" shape="rect" />
<smtpad portHints={["pin11"]} pcbX="-0mm" pcbY="0.000127mm" width="3.2999934mm" height="2.0999958mm" shape="rect" />
<silkscreenpath route={[{"x":-2.4600916000000552,"y":0.5400039999999535},{"x":-2.5000711999999794,"y":0.5800089999999045},{"x":-2.5000711999999794,"y":0.8199882000000116},{"x":-2.5000711999999794,"y":1.9499580000000378}]} />
<silkscreenpath route={[{"x":-2.5000711999999794,"y":-0.48003460000006726},{"x":-2.400045999999975,"y":-0.48003460000006726}]} />
<silkscreenpath route={[{"x":-2.5000711999999794,"y":-1.9500087999999778},{"x":-2.5000711999999794,"y":-0.48003460000006726}]} />
<silkscreenpath route={[{"x":2.499918799999932,"y":-1.9500087999999778},{"x":2.499918799999932,"y":1.9499580000000378}]} />
<silkscreenpath route={[{"x":-2.5000711999999794,"y":1.9499580000000378},{"x":2.499918799999932,"y":1.9499580000000378}]} />
<silkscreenpath route={[{"x":-2.5000711999999794,"y":-1.9500087999999778},{"x":2.499918799999932,"y":-1.9500087999999778}]} />
<silkscreenpath route={[{"x":-1.9200622000000749,"y":0},{"x":-1.948065706108082,"y":0.21401308169981803},{"x":-2.063987168701715,"y":0.3960790312980862},{"x":-2.2460531183000967,"y":0.5120004938919465},{"x":-2.4600662000000284,"y":0.5400039999999535}]} />
<silkscreenpath route={[{"x":-2.4000714000001153,"y":-0.48000920000004044},{"x":-2.1600667999999814,"y":-0.41570016125035636},{"x":-1.984371238749759,"y":-0.2400046000001339},{"x":-1.9200622000000749,"y":0}]} />
<silkscreencircle pcbX="-1.919986mm" pcbY="-1.260221mm" radius="0.284226mm" />
<silkscreentext text="{NAME}" pcbX="-0.006604mm" pcbY="4.761613mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-2.7000586000001476,"y":4.0001194999999825},{"x":2.6999316000000135,"y":4.0001194999999825},{"x":2.6999316000000135,"y":-4.0001194999999825},{"x":-2.7000586000001476,"y":-4.0001194999999825},{"x":-2.7000586000001476,"y":4.0001194999999825}]} />
      </footprint>}
      cadModel={{
        objUrl: objPath,
        positionOffset: { x: (-0.0) * Math.cos(Number(props.pcbRotation ?? 0) * Math.PI / 180) - (0.0) * Math.sin(Number(props.pcbRotation ?? 0) * Math.PI / 180), y: (-0.0) * Math.sin(Number(props.pcbRotation ?? 0) * Math.PI / 180) + (0.0) * Math.cos(Number(props.pcbRotation ?? 0) * Math.PI / 180), z: 0 },
        stepUrl: stepPath,
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0.000063500000123895, y: 0, z: -0.81 },
      }}
      {...props}
    />
  )
}