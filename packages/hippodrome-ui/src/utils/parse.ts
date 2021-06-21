import { utils } from "ethers"

export const parseValueToHex = (val?:string|number) => {
  return utils.parseEther((val || 0).toString()).toHexString()
}