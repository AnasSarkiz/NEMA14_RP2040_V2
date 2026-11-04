import React from "react"
import { pinProps } from "./pin-attributes"
import { SupplierPart } from "./supplier-parts"
import placements from "./supplier-placement.json"
const place=(name:string)=>(placements as Record<string,{pcbX:number,pcbY:number,pcbRotation:number,layer?:"top"|"bottom"}>)[name]
import { SchematicNotes } from "./schematic-notes"
import { BottomMarkings } from "./bottom-markings"

// V2 draft: preserve the NEMA14 26 mm mounting-hole pitch while trimming 0.25 mm per edge.
// Circular Ø6.4 mm head envelope includes a defined 0.2 mm radial allowance; rear mounting is unverified.
export const mechanical = { width: 34.5, height: 34.5, holePitch: 26, holeDiameter: 3.2, headEnvelopeRadius: 3.2 }
const n = (name: string) => `net.${name}`
const mcuPins = {"pin1": "IOVDD1", "pin2": "GPIO0", "pin3": "GPIO1", "pin4": "GPIO2", "pin5": "GPIO3", "pin6": "GPIO4", "pin7": "GPIO5", "pin8": "GPIO6", "pin9": "GPIO7", "pin10": "IOVDD10", "pin11": "GPIO8", "pin12": "GPIO9", "pin13": "GPIO10", "pin14": "GPIO11", "pin15": "GPIO12", "pin16": "GPIO13", "pin17": "GPIO14", "pin18": "GPIO15", "pin19": "TESTEN", "pin20": "XIN", "pin21": "XOUT", "pin22": "IOVDD22", "pin23": "DVDD23", "pin24": "SWCLK", "pin25": "SWDIO", "pin26": "RUN", "pin27": "GPIO16", "pin28": "GPIO17", "pin29": "GPIO18", "pin30": "GPIO19", "pin31": "GPIO20", "pin32": "GPIO21", "pin33": "IOVDD33", "pin34": "GPIO22", "pin35": "GPIO23", "pin36": "GPIO24", "pin37": "GPIO25", "pin38": "GPIO26", "pin39": "GPIO27", "pin40": "GPIO28", "pin41": "GPIO29", "pin42": "IOVDD42", "pin43": "ADC_AVDD", "pin44": "VREG_IN", "pin45": "VREG_OUT", "pin46": "USB_DM", "pin47": "USB_DP", "pin48": "USB_VDD", "pin49": "IOVDD49", "pin50": "DVDD50", "pin51": "QSPI_SD3", "pin52": "QSPI_SCLK", "pin53": "QSPI_SD0", "pin54": "QSPI_SD2", "pin55": "QSPI_SD1", "pin56": "QSPI_SS", "pin57": "GND"} as const
const driverPins = {pin1:"OUT2B",pin2:"ENABLE_N",pin3:"GND",pin4:"CP1",pin5:"CP2",pin6:"VCP",pin7:"NC7",pin8:"VREG",pin9:"MS1",pin10:"MS2",pin11:"MS3",pin12:"RESET_N",pin13:"ROSC",pin14:"SLEEP",pin15:"VDD",pin16:"STEP",pin17:"REF",pin18:"GND18",pin19:"DIR",pin20:"NC20",pin21:"OUT1B",pin22:"VBB1",pin23:"SENSE1",pin24:"OUT1A",pin25:"NC25",pin26:"OUT2A",pin27:"SENSE2",pin28:"VBB2",pin29:"EP"} as const
const pdPins = {pin1:"VHV",pin2:"CFG2",pin3:"CFG3",pin4:"DP",pin5:"DM",pin6:"CC2",pin7:"CC1",pin8:"VBUS",pin9:"CFG1",pin10:"PG",pin11:"GND"} as const
const baseUsb = {GND1:n("GND"),GND2:n("GND"),GND3:n("GND"),GND4:n("GND"),EH1:n("GND"),EH2:n("GND"),EH3:n("GND"),EH4:n("GND")}
const resistor = (name:string,value:string,a:string,b:string) => <SupplierPart key={name} name={name}  resistance={value} tolerance="1%" {...place(name)} connections={{pin1:n(a),pin2:n(b)}} />
const cap = (name:string,value:string,a:string,b="GND") => <SupplierPart key={name} name={name}  capacitance={value} maxVoltageRating={['PD_VBUS','LOGIC_IN','BUCK_BST','CP1'].includes(a)||b==='PD_VBUS'?35:10} {...place(name)} connections={{pin1:n(a),pin2:n(b)}} />

export default function Nema14Controller({ routingDisabled = false, assemblyPreview = false }: { routingDisabled?: boolean, assemblyPreview?: boolean } = {}) {
 return <board {...(assemblyPreview?{name:"CONTROLLER_PCB",mountedTo:"MOTOR_REFERENCE_CONCEPT.backface",mountGap:"6mm",mountRotationAnchor:"topedge" as const,mountRotation:"MOTOR_REFERENCE_CONCEPT.wireside"}:{})} width={mechanical.width} height={mechanical.height} layers={4} thickness={1.6}
  routingDisabled={routingDisabled} minTraceWidth={0.16} minTraceToPadEdgeClearance={0.15} minPadEdgeToPadEdgeClearance={0.15}
  minViaHoleDiameter={0.3} minViaPadDiameter={0.45} minViaHoleEdgeToViaHoleEdgeClearance={0.2} minPlatedHoleDrillEdgeToDrillEdgeClearance={0.45} minBoardEdgeClearance={0.25}
  autorouter={{local:true, traceClearance:0.15}} autorouterEffortLevel="2x" schAutoLayoutEnabled={false}>
  <schematicsheet name="NEMA14_RP2040" sheetSize="A4">
  {['A_DRV_PLUS','B_DRV_PLUS','I_A_RAW','I_B_RAW','I_A_ADC','I_B_ADC','GND','PD_VBUS','V3V3','LOGIC_IN','DATA_VBUS','PD_VHV','PD_CC1','PD_CC2','DATA_CC1','DATA_CC2','USB_DP','USB_DM','STEP','DIR','ENABLE_N','SLEEP','PD_GOOD','DATA_PRESENT','VM_SENSE','VREF','CP1','CP2','VCP','VREG','SENSE1','SENSE2','A_PLUS','A_MINUS','B_PLUS','B_MINUS','V1V1','QSPI_SS','QSPI_SCLK','QSPI_SD0','QSPI_SD1','QSPI_SD2','QSPI_SD3','MCU_DM','MCU_DP','XIN','XOUT','XTAL_OUT','RUN','SWCLK','SWDIO','BUCK_SW','BUCK_BST','BOOT_PAD','PWR_LED_A','TEMP_SDA','TEMP_SCL','BUZZER_PWM','BUZZER_GATE','BUZZER_SINK','LED_R','LED_G','LED_B','STATUS_R_K','STATUS_G_K','STATUS_B_K','STATUS_R_C','STATUS_G_C','STATUS_B_C','PD_CFG'].map(name=><React.Fragment key={name}><net name={name} isGroundNet={name==='GND'} isPowerNet={['PD_VBUS','V3V3','LOGIC_IN','DATA_VBUS','PD_VHV','V1V1'].includes(name)} nominalTraceWidth={['A_DRV_PLUS','B_DRV_PLUS','PD_VBUS','A_PLUS','A_MINUS','B_PLUS','B_MINUS','SENSE1','SENSE2'].includes(name)?0.45:0.16} /></React.Fragment>)}
  {/* Screw-head clearance applies to exposed surface copper and all through vias.
      Internal copper remains insulated by FR-4 and clears each mounting drill by 0.25 mm.
      Full supplier courtyards still avoid the complete head envelope. */}
  {[-mechanical.holePitch/2,mechanical.holePitch/2].flatMap(x=>[-mechanical.holePitch/2,mechanical.holePitch/2].map(y=><React.Fragment key={`${x},${y}`}><hole name={`M${x}_${y}`} pcbX={x} pcbY={y} diameter={mechanical.holeDiameter} /><keepout pcbX={x} pcbY={y} shape="circle" radius={mechanical.headEnvelopeRadius} allowPlacements={true} layers={['top','bottom']} /><silkscreencircle pcbX={x} pcbY={y} radius={mechanical.headEnvelopeRadius} strokeWidth={0.1} /></React.Fragment>))}
  <SupplierPart name="J_PD" {...pinProps("J_PD")}    noConnect={['DP1','DP2','DM1','DM2','SBU1','SBU2']} {...place("J_PD")} connections={{...baseUsb,VBUS1:n('PD_VBUS'),VBUS2:n('PD_VBUS'),VBUS3:n('PD_VBUS'),VBUS4:n('PD_VBUS'),CC1:n('PD_CC1'),CC2:n('PD_CC2')}} />
  <SupplierPart name="J_DATA" {...pinProps("J_DATA")}    noConnect={['SBU1','SBU2']} {...place("J_DATA")} connections={{...baseUsb,VBUS1:n('DATA_VBUS'),VBUS2:n('DATA_VBUS'),VBUS3:n('DATA_VBUS'),VBUS4:n('DATA_VBUS'),CC1:n('DATA_CC1'),CC2:n('DATA_CC2'),DP1:n('USB_DP'),DP2:n('USB_DP'),DM1:n('USB_DM'),DM2:n('USB_DM')}} />
  <SupplierPart name="U_PD" {...pinProps("U_PD")}  pinLabels={pdPins} noConnect={['DP','DM','CFG2','CFG3']} {...place("U_PD")} connections={{VHV:n('PD_VHV'),CFG1:n('PD_CFG'),VBUS:n('PD_VBUS'),CC1:n('PD_CC1'),CC2:n('PD_CC2'),PG:n('PD_GOOD'),GND:n('GND')}} />
  {resistor('R_PD','0','PD_VBUS','PD_VHV')}
  <SupplierPart name="C_PD" capacitance="1uF" maxVoltageRating={50} {...place("C_PD")} connections={{pin1:n("PD_VHV"),pin2:n("GND")}} />
  {resistor('R_PG','10k','V3V3','PD_GOOD')}
  <SupplierPart name="U_MCU" {...pinProps("U_MCU")}   pinLabels={mcuPins} noConnect={["GPIO0", "GPIO1", "GPIO11", "GPIO12", "GPIO13", "GPIO14", "GPIO15", "GPIO17", "GPIO18", "GPIO19", "GPIO20", "GPIO21", "GPIO22", "GPIO23", "GPIO24"]} {...place("U_MCU")} connections={{IOVDD1:n("V3V3"),IOVDD10:n("V3V3"),IOVDD22:n("V3V3"),IOVDD33:n("V3V3"),IOVDD42:n("V3V3"),IOVDD49:n("V3V3"),DVDD23:n("V1V1"),DVDD50:n("V1V1"),VREG_OUT:n("V1V1"),ADC_AVDD:n("V3V3"),USB_VDD:n("V3V3"),VREG_IN:n("V3V3"),TESTEN:n("GND"),GND:n("GND"),GPIO6:n("STEP"),GPIO7:n("DIR"),GPIO8:n("ENABLE_N"),GPIO9:n("SLEEP"),GPIO10:n("PD_GOOD"),GPIO28:n("VM_SENSE"),GPIO29:n("DATA_PRESENT"),USB_DM:n("MCU_DM"),USB_DP:n("MCU_DP"),RUN:n("RUN"),SWCLK:n("SWCLK"),SWDIO:n("SWDIO"),XIN:n("XIN"),XOUT:n("XOUT"),QSPI_SS:n("QSPI_SS"),QSPI_SCLK:n("QSPI_SCLK"),QSPI_SD0:n("QSPI_SD0"),QSPI_SD1:n("QSPI_SD1"),QSPI_SD2:n("QSPI_SD2"),QSPI_SD3:n("QSPI_SD3"),GPIO4:n("TEMP_SDA"),GPIO5:n("TEMP_SCL"),GPIO26:n("I_A_ADC"),GPIO27:n("I_B_ADC"),GPIO16:n("BUZZER_PWM"),GPIO25:n("LED_R"),GPIO2:n("LED_G"),GPIO3:n("LED_B")}} />
  {cap('C_IO1','100nF','V3V3','GND')}
  {cap('C_IO10','100nF','V3V3','GND')}
  {cap('C_IO22','100nF','V3V3','GND')}
  {cap('C_IO33','100nF','V3V3','GND')}
  {cap('C_IO42','100nF','V3V3','GND')}
  {cap('C_IO49','100nF','V3V3','GND')}
  {cap('C_DV23','100nF','V1V1','GND')}
  {cap('C_DV50','100nF','V1V1','GND')}
  {cap('C_USB','100nF','V3V3','GND')}
  {cap('C_ADC','100nF','V3V3','GND')}
  {cap('C_VREG_IN','1uF','V3V3','GND')}
  {cap('C_VREG_OUT','1uF','V1V1','GND')}
  <SupplierPart name="U_FLASH" {...pinProps("U_FLASH")}   pinLabels={{pin1:'CS',pin2:'IO1',pin3:'IO2',pin4:'GND',pin5:'IO0',pin6:'CLK',pin7:'IO3',pin8:'VCC',pin9:'EP'}} {...place("U_FLASH")} connections={{CS:n('QSPI_SS'),IO1:n('QSPI_SD1'),IO2:n('QSPI_SD2'),GND:n('GND'),IO0:n('QSPI_SD0'),CLK:n('QSPI_SCLK'),IO3:n('QSPI_SD3'),VCC:n('V3V3'),EP:n('GND')}} />
  {cap('C_FLASH','100nF','V3V3','GND')}
  {resistor('R_FLASH_CS','10k','V3V3','QSPI_SS')}
  {resistor('R_BOOT','1k','QSPI_SS','BOOT_PAD')}
  <SupplierPart name="Y_MCU" {...pinProps("Y_MCU")}    {...place("Y_MCU")} connections={{pin1:n('XIN'),pin3:n('XTAL_OUT'),pin2:n('GND'),pin4:n('GND')}} />
  {resistor('R_XOUT','1k','XOUT','XTAL_OUT')}
  {cap('C_XIN','15pF','XIN','GND')}
  {cap('C_XOUT','15pF','XTAL_OUT','GND')}
  {resistor('R_RUN','10k','V3V3','RUN')}
  {resistor('R_DM','27','MCU_DM','USB_DM')}
  {resistor('R_DP','27','MCU_DP','USB_DP')}
  {resistor('R_CC1','5.1k','DATA_CC1','GND')}
  {resistor('R_CC2','5.1k','DATA_CC2','GND')}
  {resistor('R_USB_SENSE_H','100k','DATA_VBUS','DATA_PRESENT')}
  {resistor('R_USB_SENSE_L','100k','DATA_PRESENT','GND')}
  {resistor('R_VM_H','100k','PD_VBUS','VM_SENSE')}
  {resistor('R_VM_L','10k','VM_SENSE','GND')}
  {cap('C_VM_SENSE','10nF','VM_SENSE','GND')}
  <SupplierPart name="U_BUCK" {...pinProps("U_BUCK")}   pinLabels={{pin1:'FB',pin2:'EN',pin3:'VIN',pin4:'GND',pin5:'SW',pin6:'BST'}} {...place("U_BUCK")} connections={{FB:n('V3V3'),EN:n('LOGIC_IN'),VIN:n('LOGIC_IN'),GND:n('GND'),SW:n('BUCK_SW'),BST:n('BUCK_BST')}} />
  <SupplierPart name="L_BUCK" inductance="4.7uH" {...place("L_BUCK")} connections={{pin1:n('BUCK_SW'),pin2:n('V3V3')}} />
  {cap('C_BOOTSTRAP','100nF','BUCK_BST','BUCK_SW')}
  {cap('C_BUCK_IN','10uF','LOGIC_IN','GND')}
  {cap('C_BUCK_OUT1','22uF','V3V3','GND')}
  {cap('C_BUCK_OUT2','22uF','V3V3','GND')}
  <SupplierPart name="D_PD" {...place("D_PD")} connections={{anode:n('PD_VBUS'),cathode:n('LOGIC_IN')}} />
  <SupplierPart name="D_DATA" {...place("D_DATA")} connections={{anode:n('DATA_VBUS'),cathode:n('LOGIC_IN')}} />
  <SupplierPart name="U_DRV" {...pinProps("U_DRV")}  pinLabels={driverPins} noConnect={['NC7','NC20','NC25']} {...place("U_DRV")} connections={{OUT1A:n('A_DRV_PLUS'),OUT1B:n('A_MINUS'),OUT2A:n('B_DRV_PLUS'),OUT2B:n('B_MINUS'),VBB1:n('PD_VBUS'),VBB2:n('PD_VBUS'),GND:n('GND'),GND18:n('GND'),EP:n('GND'),CP1:n('CP1'),CP2:n('CP2'),VCP:n('VCP'),VREG:n('VREG'),MS1:n('V3V3'),MS2:n('V3V3'),MS3:n('V3V3'),RESET_N:n('V3V3'),VDD:n('V3V3'),ROSC:n('GND'),STEP:n('STEP'),DIR:n('DIR'),ENABLE_N:n('ENABLE_N'),SLEEP:n('SLEEP'),REF:n('VREF'),SENSE1:n('SENSE1'),SENSE2:n('SENSE2')}} />
  {cap('C_CP','100nF','CP1','CP2')}
  {cap('C_VCP','100nF','VCP','PD_VBUS')}
  {cap('C_VREG','220nF','VREG','GND')}
  {cap('C_DRV_LOGIC','100nF','V3V3')}
  {cap('C_VM','100nF','PD_VBUS','GND')}
  <SupplierPart name="C_BULK" capacitance="47uF" maxVoltageRating={35} {...place("C_BULK")} connections={{pin1:n("PD_VBUS"),pin2:n("GND")}} />
  {resistor('R_SA','0.24','SENSE1','GND')}
  {resistor('R_SB','0.24','SENSE2','GND')}
  {/* Independent inline winding shunts measure signed coil current, including
      recirculation. Existing SENSE1/SENSE2 regulation resistors stay unchanged. */}
  {(['A','B'] as const).map(phase=><React.Fragment key={'current_'+phase}>
    {resistor('R_SHUNT_'+phase,'0.05',phase+'_DRV_PLUS',phase+'_PLUS')}
    <SupplierPart name={'U_I'+phase} {...pinProps('U_I'+phase)} {...place('U_I'+phase)} noConnect={['NC']}
      connections={{IN_POS:n(phase+'_DRV_PLUS'),IN_NEG:n(phase+'_PLUS'),GND:n('GND'),
        VS:n('V3V3'),REF1:n('V3V3'),REF2:n('GND'),OUT:n('I_'+phase+'_RAW')}} />
    {cap('C_I'+phase,'100nF','V3V3')}
    {resistor('R_I'+phase,'100','I_'+phase+'_RAW','I_'+phase+'_ADC')}
    {cap('C_IADC_'+phase,'10nF','I_'+phase+'_ADC')}
  </React.Fragment>)}

  {resistor('R_REF_H','39k','V3V3','VREF')}
  {resistor('R_REF_L','10k','VREF','GND')}
  {cap('C_REF','10nF','VREF')}
  {/* Strong defaults override the RP2040 reset pulls and driver input leakage. */}
  {resistor('R_ENABLE','10k','V3V3','ENABLE_N')}
  {resistor('R_SLEEP','10k','SLEEP','GND')}
  <SupplierPart name="J_MOTOR" {...pinProps("J_MOTOR")} {...place("J_MOTOR")}
    connections={{A_PLUS:n('A_PLUS'),A_MINUS:n('A_MINUS'),B_PLUS:n('B_PLUS'),B_MINUS:n('B_MINUS')}} />
  <SupplierPart name="U_ESD" {...pinProps("U_ESD")}  pinLabels={{pin1:"DP1",pin2:"GND",pin3:"DM1",pin4:"DM2",pin5:"VBUS",pin6:"DP2"}} {...place("U_ESD")} connections={{DP1:n("USB_DP"),DP2:n("USB_DP"),DM1:n("USB_DM"),DM2:n("USB_DM"),VBUS:n("DATA_VBUS"),GND:n("GND")}} />
  <SupplierPart name="D_TVS" {...pinProps("D_TVS")} {...place("D_TVS")} connections={{pin1:n("GND"),pin2:n("PD_VBUS")}} />
  {/* Essential wiring/debug legends are defined in critical-markings.json. */}
  {/* Reference feedback: TMP102 I2C address 0x48; alerts handled by application firmware. */}
  <SupplierPart name="U_TEMP" {...pinProps("U_TEMP")} {...place("U_TEMP")} noConnect={['ALERT']} connections={{SCL:n('TEMP_SCL'),GND:n('GND'),ADD0:n('GND'),V_POS:n('V3V3'),SDA:n('TEMP_SDA')}} />
  {cap('C_TEMP','100nF','V3V3')}
  {resistor('R_TEMP_SDA','4.7k','TEMP_SDA','V3V3')}
  {resistor('R_TEMP_SCL','4.7k','TEMP_SCL','V3V3')}
  <SupplierPart name="D_PWR" {...place("D_PWR")} connections={{anode:n('PWR_LED_A'),cathode:n('GND')}} />
  {resistor('R_PWR_LED','330','V3V3','PWR_LED_A')}
  {/* Common anode uses fixed programming USB 5 V, never the negotiated PD rail. */}
  <SupplierPart name="D_STATUS" {...pinProps("D_STATUS")} {...place("D_STATUS")} connections={{_POS:n('DATA_VBUS'),R_NEG:n('STATUS_R_K'),G_NEG:n('STATUS_G_K'),B_NEG:n('STATUS_B_K')}} />
  {(['R','G','B'] as const).map(color=><React.Fragment key={'status_'+color}>
    {resistor('R_STATUS_'+color,'1k','STATUS_'+color+'_K','STATUS_'+color+'_C')}
    <SupplierPart name={'Q_STATUS_'+color} {...pinProps('Q_STATUS_'+color)} {...place('Q_STATUS_'+color)} connections={{S:n('GND'),G:n('LED_'+color),D:n('STATUS_'+color+'_C')}} />
    {resistor('R_STATUS_PD_'+color,'10k','LED_'+color,'GND')}
  </React.Fragment>)}
  <SupplierPart name="BZ1" {...pinProps("BZ1")} {...place("BZ1")} noConnect={['NC']} connections={{_POS:n('V3V3'),_NEG:n('BUZZER_SINK')}} />
  <SupplierPart name="Q_BUZZER" {...pinProps("Q_BUZZER")} {...place("Q_BUZZER")} connections={{G:n('BUZZER_GATE'),S:n('GND'),D:n('BUZZER_SINK')}} />
  <SupplierPart name="D_BUZZER" {...place("D_BUZZER")} connections={{cathode:n('V3V3'),anode:n('BUZZER_SINK')}} />
  {resistor('R_BUZZER_GATE','100','BUZZER_PWM','BUZZER_GATE')}
  {resistor('R_BUZZER_PD','100k','BUZZER_GATE','GND')}
  {cap('C_BUZZER','10uF','V3V3')}
  <testpoint doNotPlace name="TP_3V3" layer="top" footprintVariant="pad" padDiameter="1.1mm" footprint={<footprint><smtpad portHints={["pin1"]} shape="circle" radius={.55} /><courtyardoutline outline={[{x:-.7,y:-.7},{x:.7,y:-.7},{x:.7,y:.7},{x:-.7,y:.7},{x:-.7,y:-.7}]} /></footprint>} {...place("TP_3V3")} connections={{pin1:n("V3V3")}} />
  <testpoint doNotPlace name="TP_GND" layer="top" footprintVariant="pad" padDiameter="1.1mm" footprint={<footprint><smtpad portHints={["pin1"]} shape="circle" radius={.55} /><courtyardoutline outline={[{x:-.7,y:-.7},{x:.7,y:-.7},{x:.7,y:.7},{x:-.7,y:.7},{x:-.7,y:-.7}]} /></footprint>} {...place("TP_GND")} connections={{pin1:n("GND")}} />
  <testpoint doNotPlace name="TP_SWCLK" layer="top" footprintVariant="pad" padDiameter="1.1mm" footprint={<footprint><smtpad portHints={["pin1"]} shape="circle" radius={.55} /><courtyardoutline outline={[{x:-.7,y:-.7},{x:.7,y:-.7},{x:.7,y:.7},{x:-.7,y:.7},{x:-.7,y:-.7}]} /></footprint>} {...place("TP_SWCLK")} connections={{pin1:n("SWCLK")}} />
  <testpoint doNotPlace name="TP_SWDIO" layer="top" footprintVariant="pad" padDiameter="1.1mm" footprint={<footprint><smtpad portHints={["pin1"]} shape="circle" radius={.55} /><courtyardoutline outline={[{x:-.7,y:-.7},{x:.7,y:-.7},{x:.7,y:.7},{x:-.7,y:.7},{x:-.7,y:-.7}]} /></footprint>} {...place("TP_SWDIO")} connections={{pin1:n("SWDIO")}} />
  <testpoint doNotPlace name="TP_RUN" layer="top" footprintVariant="pad" padDiameter="1.1mm" footprint={<footprint><smtpad portHints={["pin1"]} shape="circle" radius={.55} /><courtyardoutline outline={[{x:-.7,y:-.7},{x:.7,y:-.7},{x:.7,y:.7},{x:-.7,y:.7},{x:-.7,y:-.7}]} /></footprint>} {...place("TP_RUN")} connections={{pin1:n("RUN")}} />
  <testpoint doNotPlace name="TP_BOOT" layer="top" footprintVariant="pad" padDiameter="0.8mm" footprint={<footprint><smtpad portHints={["pin1"]} shape="circle" radius={.4} /><courtyardoutline outline={[{x:-.5,y:-.5},{x:.5,y:-.5},{x:.5,y:.5},{x:-.5,y:.5},{x:-.5,y:-.5}]} /></footprint>} {...place("TP_BOOT")} connections={{pin1:n("BOOT_PAD")}} />
  <testpoint doNotPlace name="TP_BOOT_GND" layer="top" footprintVariant="pad" padDiameter="0.8mm" footprint={<footprint><smtpad portHints={["pin1"]} shape="circle" radius={.4} /><courtyardoutline outline={[{x:-.5,y:-.5},{x:.5,y:-.5},{x:.5,y:.5},{x:-.5,y:.5},{x:-.5,y:-.5}]} /></footprint>} {...place("TP_BOOT_GND")} connections={{pin1:n("GND")}} />
  {/* Optional bottom AS5600; its two supply capacitors are fitted on top. Motor/magnet fit remains unverified. */}
  <SupplierPart name="U_ENCODER" layer="bottom" doNotPlace {...place("U_ENCODER")} noConnect={['OUT','PGO']} connections={{VDD5V:n('V3V3'),VDD3V3:n('V3V3'),GND:n('GND'),DIR:n('GND'),SDA:n('TEMP_SDA'),SCL:n('TEMP_SCL')}} />
  <SupplierPart name="C_ENCODER" layer="top" capacitance="100nF" maxVoltageRating={16} {...place("C_ENCODER")} connections={{pin1:n('V3V3'),pin2:n('GND')}} />
  <SupplierPart name="C_ENCODER_BULK" layer="top" capacitance="1uF" maxVoltageRating={6.3} {...place("C_ENCODER_BULK")} connections={{pin1:n('V3V3'),pin2:n('GND')}} />
  {/* CH224A Table 5-1: 56 kΩ requests 15 V; CFG2/SCL and CFG3/SDA are unconnected. */}
  {resistor('R_PD_CFG','56k','PD_CFG','GND')}
  {/* ST USBLC6-2 Figure 17: bypass its VBUS steering rail locally. */}
  {cap('C_ESD','100nF','DATA_VBUS','GND')}
  <BottomMarkings />
  <SchematicNotes />
  </schematicsheet>
 </board>
}
