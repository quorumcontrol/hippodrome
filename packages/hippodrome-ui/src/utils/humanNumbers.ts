import { BigNumber, BigNumberish, utils } from 'ethers'

const formatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 3,
  minimumFractionDigits: 2
})

const currencyformatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2
})

const humanBigNumber = (num: BigNumber | BigNumberish) => {
  const formatted = utils.formatEther(num)
  const number = parseFloat(formatted)
  return formatter.format(number)
}

export const formatCurrency = (val:number) => {
  return currencyformatter.format(val)
}

export default humanBigNumber
