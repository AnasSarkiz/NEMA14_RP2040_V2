import React from "react"
const objPath = "https://modelcdn.tscircuit.com/easyeda_models/assets/C2765063.obj"
const stepPath = "https://modelcdn.tscircuit.com/easyeda_models/assets/C2765063.step"
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["pin1"],
  pin2: ["pin2"],
  pin3: ["pin3"],
  pin4: ["pin4"]
} as const

export const A_250_204 = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      supplierPartNumbers={{
  "jlcpcb": [
    "C2765063"
  ]
}}
      manufacturerPartNumber="250-204"
      footprint={<footprint>
        <platedhole  portHints={["pin4"]} pcbX="5.250053mm" pcbY="-2.499995mm" outerDiameter="1.7999964mm" holeDiameter="0.999998mm" shape="circle" />
<platedhole  portHints={["pin3"]} pcbX="1.749933mm" pcbY="2.499995mm" outerDiameter="1.7999964mm" holeDiameter="0.999998mm" shape="circle" />
<platedhole  portHints={["pin2"]} pcbX="-1.749933mm" pcbY="-2.499995mm" outerDiameter="1.7999964mm" holeDiameter="0.999998mm" shape="circle" />
<platedhole  portHints={["pin1"]} pcbX="-5.250053mm" pcbY="2.499995mm" outerDiameter="1.7999964mm" holeDiameter="0.999998mm" shape="circle" />
<silkscreenpath route={[{"x":6.381089599999996,"y":-2.4999950000000126},{"x":6.999960599999895,"y":-2.4999950000000126}]} />
<silkscreenpath route={[{"x":6.999960599999895,"y":4.799990399999956},{"x":6.999960599999895,"y":-7.200011000000018}]} />
<silkscreenpath route={[{"x":6.999960599999895,"y":4.799990399999956},{"x":-8.565057799999977,"y":4.799990399999956}]} />
<silkscreenpath route={[{"x":-0.6189217999999528,"y":-2.49923299999989},{"x":4.118813199999977,"y":-2.49923299999989}]} />
<silkscreenpath route={[{"x":-8.565057799999977,"y":-2.49923299999989},{"x":-2.8811981999999716,"y":-2.49923299999989}]} />
<silkscreenpath route={[{"x":-8.565057799999977,"y":4.799990399999956},{"x":-8.565057799999977,"y":-7.200011000000018}]} />
<silkscreenpath route={[{"x":6.999960599999895,"y":-7.200011000000018},{"x":-8.565057799999977,"y":-7.200011000000018}]} />
<silkscreencircle pcbX="-5.250053mm" pcbY="-5.120005mm" radius="1.27mm" />
<silkscreencircle pcbX="-1.749933mm" pcbY="-5.039995mm" radius="1.27mm" />
<silkscreencircle pcbX="1.749933mm" pcbY="-5.120005mm" radius="1.27mm" />
<silkscreencircle pcbX="5.250053mm" pcbY="-5.039995mm" radius="1.27mm" />
<silkscreentext text="{NAME}" pcbX="-0.805053mm" pcbY="5.836795mm" anchorAlignment="center" fontSize="1mm" />
<fabricationnotepath route={[{"x":-8.32998079999993,"y":-7.239000000000146},{"x":6.801992999999925,"y":-7.239000000000146},{"x":6.801992999999925,"y":-6.985000000000127},{"x":-8.32998079999993,"y":-6.985000000000127},{"x":-8.32998079999993,"y":-7.239000000000146}]} strokeWidth="0.254mm" />
<fabricationnotepath route={[{"x":-8.579992999999945,"y":-7.239000000000146},{"x":-8.579992999999945,"y":4.825999999999908},{"x":6.799986399999966,"y":4.825999999999908},{"x":6.799986399999966,"y":-7.239000000000146},{"x":6.549986900000022,"y":-7.239000000000146},{"x":6.549986900000022,"y":4.571999999999889},{"x":-8.32599300000004,"y":4.571999999999889},{"x":-8.32599300000004,"y":-7.239000000000146},{"x":-8.579992999999945,"y":-7.239000000000146}]} strokeWidth="0.254mm" />
<courtyardoutline outline={[{"x":-8.750033799999983,"y":5.064976399999864},{"x":7.249935199999982,"y":5.064976399999864},{"x":7.249935199999982,"y":-7.434999600000083},{"x":-8.750033799999983,"y":-7.434999600000083},{"x":-8.750033799999983,"y":5.064976399999864}]} />
      </footprint>}
      cadModel={{
        objUrl: objPath,
        stepUrl: stepPath,
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0.00004930000000058499, y: -0.01498839999994761, z: -0.10000699999999973 },
      }}
      {...props}
    />
  )
}