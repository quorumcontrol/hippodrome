import { BigNumber } from "ethers"
import { poolRouter } from "./contracts"

export const addLiquidityTx = async (
  to: string, // where to send the LP tokens
  tokenA: string,
  tokenB: string,
  amountADesired: BigNumber,
  amountBDesired: BigNumber,
  slippage: number, // as a percentage
  routerAddress: string, //sushi,
  userDeadline?: number,
) => {
  const router = poolRouter(routerAddress)
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
