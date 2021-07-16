import useSWR from "swr";
import { getAPY, getPoolReserves } from "../models/uniswapPools";
import { useChainContext } from "./useChainContext";
import { WPTG_ADDRESS } from "../models/contracts"
import { utils } from "ethers";

// TODO: hard coding rewards for now, calculate from some API
export function useUniswapPool(pairAddress:string) {
  const { chain } = useChainContext()
  const { data } = useSWR(['/uniswap-pairs', pairAddress], {
    fetcher: async (_, pairAddress) => {
      try {
        const reserves = await getPoolReserves(chain, pairAddress)
        console.log('reserves: ', reserves)
        const apy = await getAPY(chain, pairAddress, WPTG_ADDRESS, utils.parseEther('1000000'))
        return {
          reserves,
          apy
        }
      } catch (err) {
        console.error('error fetching uniswap pool: ', err)
        throw err
      }
    }
  })
  return {
    reserves: data?.reserves,
    apy: data?.apy,
    loading: !data
  }
}
