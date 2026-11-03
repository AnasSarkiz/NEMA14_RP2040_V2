import type { ChipProps } from 'tscircuit'
const power=(names:string[])=>Object.fromEntries(names.map(n=>[n,{requiresPower:true,mustBeConnected:true}]))
const ground=(names:string[])=>Object.fromEntries(names.map(n=>[n,{requiresGround:true,mustBeConnected:true}]))
export function pinProps(name:string):Pick<ChipProps,'pinAttributes'> {
 const attributes:Record<string,NonNullable<ChipProps['pinAttributes']>[string]>={
  ...({
   D_STATUS:{...power(["_POS"]),R_NEG:{mustBeConnected:true},G_NEG:{mustBeConnected:true},B_NEG:{mustBeConnected:true}},
   BZ1:{...power(["_POS"]),_NEG:{mustBeConnected:true}},
   D_TVS:{pin1:{requiresGround:true,mustBeConnected:true},pin2:{isPassive:true,mustBeConnected:true}},
   Q_BUZZER:{...ground(["S"]),G:{isInput:true,mustBeConnected:true},D:{mustBeConnected:true}},
   Q_STATUS_R:{...ground(["S"]),G:{isInput:true,mustBeConnected:true},D:{mustBeConnected:true}},
   Q_STATUS_G:{...ground(["S"]),G:{isInput:true,mustBeConnected:true},D:{mustBeConnected:true}},
   Q_STATUS_B:{...ground(["S"]),G:{isInput:true,mustBeConnected:true},D:{mustBeConnected:true}},
   U_TEMP:{...power(["V_POS"]),...ground(["GND","ADD0"]),SCL:{mustBeConnected:true,isInput:true,needsExternalPullup:true,canUseOpenDrain:true},SDA:{mustBeConnected:true,isBidirectional:true,needsExternalPullup:true,canUseOpenDrain:true}},
   U_PD:{...power(['VHV']),...ground(['GND']),VBUS:{isInput:true,mustBeConnected:true},PG:{isOutput:true,canUseOpenDrain:true,needsExternalPullup:true}},
   U_DRV:{...power(['VDD','VBB1','VBB2']),...ground(['GND','GND18','EP'])},
   U_IA:{...power(['VS']),...ground(['GND']),NC:{doNotConnect:true}},
   U_IB:{...power(['VS']),...ground(['GND']),NC:{doNotConnect:true}},
   U_LDO:{...power(['VIN']),...ground(['GND']),VOUT:{providesPower:true,mustBeConnected:true}},
   U_BUCK:{...power(['VIN']),...ground(['GND']),FB:{mustBeConnected:true},BST:{mustBeConnected:true}},
   U_FLASH:{...power(['VCC']),...ground(['GND','GND18','EP'])},
   U_ESD:{...power(['VBUS']),...ground(['GND'])},
   U_MCU:{...power(['IOVDD1','IOVDD10','IOVDD22','IOVDD33','IOVDD42','IOVDD49','DVDD23','DVDD50','VREG_IN','USB_VDD','ADC_AVDD']),...ground(['GND']),VREG_OUT:{providesPower:true,mustBeConnected:true}},
   J_PD:{VBUS1:{providesPower:true},VBUS2:{providesPower:true},GND1:{providesGround:true},GND2:{providesGround:true}},
   J_DATA:{VBUS1:{providesPower:true},VBUS2:{providesPower:true},GND1:{providesGround:true},GND2:{providesGround:true}},
   J_DEBUG:{VDD:{providesPower:true},GND:{providesGround:true}},
   J_MOTOR:{A_PLUS:{includeInBoardPinout:true},A_MINUS:{includeInBoardPinout:true},B_PLUS:{includeInBoardPinout:true},B_MINUS:{includeInBoardPinout:true}},
   J_BOOT:{BOOT:{includeInBoardPinout:true}},
   Y_MCU:{pin2:{requiresGround:true},pin4:{requiresGround:true}},
  } as Record<string,Record<string,NonNullable<ChipProps['pinAttributes']>[string]>>)[name]??{}
 }
 return {pinAttributes:attributes}
}
