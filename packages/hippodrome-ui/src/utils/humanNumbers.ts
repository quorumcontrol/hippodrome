import { BigNumber, BigNumberish } from 'ethers'

const formatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 6,
  minimumFractionDigits: 2
})

const currencyformatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2
})

const humanBigNumber = (num: BigNumber | BigNumberish, decimals:number = 18) => {
  const decimalDivisor = BigNumber.from((10 ** (decimals - 7)).toString())
  const number = BigNumber.from(num.toString()).div(decimalDivisor).toNumber()
  return formatter.format(number / 10**7)
}

export const formatCurrency = (val:number) => {
  return currencyformatter.format(val)
}

export default humanBigNumber
