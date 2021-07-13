import { BigNumber, constants } from "ethers"

export const parseValueToHex = (userVal:string|number|undefined, decimals:number) => {
  if (!userVal) {
    return constants.Zero.toHexString()
  }
    // handle inputted decimals like 0.001 BTC
    if (decimals < 5) {
      throw new Error('this is a state we did not plan where there is a token with less than 5 decimals')
    }
    let val:number = userVal as number
    if (typeof userVal === 'string') {
      val = parseInt(userVal, 10)
    }
    // multiply the value by 10**5 to allow for user input decmals and then turn that into the 
    // target decimal number output
    return BigNumber.from(Math.floor(val * (10 ** 5))).mul((10 ** (decimals - 5)).toString()).toHexString()
}