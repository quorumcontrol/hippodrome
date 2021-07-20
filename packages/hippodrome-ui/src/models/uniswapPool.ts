import { BigNumber } from "ethers";
import { IUniswapV2Pair__factory } from "../types/ethers-contracts";
import { IChain } from "./chain";
import { poolRouter } from "./contracts"

export async function getPoolReserves(chain:IChain, pairAddress:string) {
  const pair = IUniswapV2Pair__factory.connect(pairAddress, chain.signer!)
  const [token0Addr, token1Addr, [token0Reserve, token1Reserve]] = await Promise.all([
    pair.token0(),
    pair.token1(),
    pair.getReserves(),
  ])

  return {
    [token0Addr.toLowerCase()]: token0Reserve,
    [token1Addr.toLowerCase()]: token1Reserve,
  }
}

// TODO: this is a really rough estimate, but should be 'fairly close'
export async function getAPY(chain:IChain, pairAddress:string, rewardToken:string, weeklyRewardAmount:BigNumber) {
  const reserves = await getPoolReserves(chain, pairAddress)
  const rewardReserve = reserves[rewardToken.toLowerCase()]
  if (!rewardReserve) {
    throw new Error('getAPY only currently supports calculating using rewards of a reserve asset')
  }
  const percent = weeklyRewardAmount.mul(10000).div(rewardReserve) // percent where 10,000 is 100%
  return percent.mul(52).div(100) // now give back the percentage where 100 is 100%
}

export const addLiquidityTx = async (
  chain: IChain,
  to: string, // where to send the LP tokens
  tokenA: string,
  tokenB: string,
  amountADesired: BigNumber,
  amountBDesired: BigNumber,
  slippage: number, // as a percentage
  routerAddress: string,
  userDeadline?: number,
) => {
  const router = poolRouter(chain, routerAddress)
  const deadline = userDeadline || Math.floor((new Date().getTime() / 1000) + (10 * 60)) // 10 minutes
  return router.populateTransaction.addLiquidity(
    tokenA,
    tokenB,
    amountADesired,
    amountBDesired,
    amountADesired.mul(100 - slippage).div(100), // TODO: not sure if this is the best way to calculate minimums
    amountBDesired.mul(100 - slippage).div(100),
    to,
    deadline
  )
}