import useSWR from "swr";
import { getAPY, getPoolReserves } from "../models/uniswapPool";
import { useChainContext } from "./useChainContext";
import { WPTG_ADDRESS } from "../models/contracts"
import { constants, utils } from "ethers";
import { Pool, PoolTypes } from "../models/poolList";

// TODO: hard coding rewards for now, calculate from some API
export function useUniswapPool(pool:Pool) {
  const { chain } = useChainContext()
  const { data } = useSWR(['/uniswap-pairs', pool.options.poolAddress], {
    fetcher: async (_, pairAddress) => {
      if (pool.options.type !== PoolTypes.cometh) {
        return {
          reserves: undefined,
          apy: undefined,
        }
      }
      try {
        const reserves = await getPoolReserves(chain, pairAddress)
        console.log('reserves: ', reserves)
        const apy = await getAPY(chain, pairAddress, pool.options.rewardToken!, pool.options.weeklyReward!)
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
