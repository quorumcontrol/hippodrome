import { BigNumber, constants } from "ethers"

export const parseValueToHex = (val:string|number|undefined, decimals:number) => {
  if (!val) {
    return constants.Zero.toHexString()
  }
  return BigNumber.from(val).mul((10 ** decimals).toString()).toHexString()
}