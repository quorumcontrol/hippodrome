import { BigNumber, utils } from "ethers"
import useSWR from "swr"
import axios from 'axios'

export const useTokenQuote = (input:string,output:string,amount:BigNumber) => {
  const { data, isValidating, revalidate } = useSWR(['/1inch-quote', input, output, amount.toHexString()], {
    fetcher: async ([_, input, output, amtString]) => {
      const amount = BigNumber.from(amtString)
      const resp = await axios.get('https://api.1inch.exchange/v3.0/137/quote', { // TODO: support mumbai
        data: {
          fromTokenAddress: input,
          toTokenAddress: output,
          amount: amount.div(1e19).toNumber(),
        }
      })
      return BigNumber.from(resp.data.toTokenAmount)
    }
  })

  return {
    amountOut: data,
    isValidating,
    revalidate,
    loading: !data,
  }

}