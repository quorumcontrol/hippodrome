import { BigNumber, constants, utils, VoidSigner } from "ethers";
import { IChain } from "./chain";
import { fetchApprove, fetchQuote, fetchSwap } from "./1inch";
import { amountAfterFees, fetchFees, WrappedLockAndMintDeposit } from "./ren";
import { minter as getMinter, balanceShifter as getBalanceShifter, COMETH_ROUTER_ADDRESS } from "./contracts";
import { LockAndMintParams } from "./ren";
import { inputTokens } from "./tokenList";
import { RenERC20LogicV1__factory } from "../types/ethers-contracts";
import { addLiquidityTx } from "./liquidityPool";
import { Pool } from "./poolList";

const voidSigner = new VoidSigner(constants.AddressZero)

function tokenContractFromAddress(address:string) {
  // TODO: weird to use the ren erc20 here just for a normal erc20 contract, but it's already in our types, so mind as well reuse
  return RenERC20LogicV1__factory.connect(address, voidSigner)
}

// https://charts.cometh.io/pair/0x476278f883003862b374f22a7604e60f5643d647
// export const wPTGRenDogeComethPair = '0x476278f883003862b374f22a7604e60f5643d647'

// TODO: this is a hard coded liquidity add to the particular sushi pool on polygon
export const doAddLiquidity = async (
  chainInstance: IChain,
  deposit: WrappedLockAndMintDeposit,
  lockAndMintParams: LockAndMintParams,
  pool:Pool,
) => {
  const { relayer, safeAddress, address, signer } = chainInstance;
  if (!relayer || !safeAddress || !address || !signer) {
    throw new Error("must have a relayer and addresses");
  }

  const token0 = pool.token0()
  const token1 = pool.token1()
  const poolAddress = pool.options.poolAddress

  const fees = await fetchFees(chainInstance, lockAndMintParams.lockNetwork)

  const input = inputTokens.find((t) => t.symbol === lockAndMintParams.lockNetwork)?.renAddress
  if (!input) {
    throw new Error('no input token')
  }

  const renTx = await deposit.deposit.queryTx(); 
  if (!renTx.out || (renTx.out && renTx.out.revert)) {
      throw new Error('missing out tx')
  }
  const minter = getMinter(chainInstance)
  const shifter = getBalanceShifter(chainInstance)
  const amount = BigNumber.from(renTx.out.amount.toString())

  const mintTx = await minter.populateTransaction.temporaryMint(
    safeAddress,
    utils.keccak256(Buffer.from(lockAndMintParams.nonce.toString())),
    lockAndMintParams.lockNetwork,
    amount,
    renTx.out.nhash,
    renTx.out.signature!,
  )

  const shifterApproveInput = await tokenContractFromAddress(input).populateTransaction.approve(shifter.address, constants.MaxUint256)
  const shifterApproveToken0 = await tokenContractFromAddress(
    token0.address
  ).populateTransaction.approve(shifter.address, constants.MaxUint256)
  const shifterApproveToken1 = await tokenContractFromAddress(token1.address).populateTransaction.approve(shifter.address, constants.MaxUint256)
  const shifterApproveLPToken = await tokenContractFromAddress(pool.options.poolAddress).populateTransaction.approve(shifter.address, constants.MaxUint256)
  
  const shiftTx = await shifter.populateTransaction.shift([input, token0.address, token1.address, poolAddress], safeAddress, address)

  const swapAmount = amountAfterFees(fees, amount)
  console.log('swap amount: ', swapAmount)
  const halfSwap = swapAmount.div(2)

  const [token0Quote, token1Quote] = await Promise.all([
    fetchQuote(input, token0.address, halfSwap),
    fetchQuote(input, token1.address, halfSwap)
  ])

  const swaps = (await Promise.all([
    fetchSwap(input, token0.address, halfSwap, safeAddress),
    fetchSwap(input, token1.address, halfSwap, safeAddress),
  ])).filter(Boolean)

  const approves = await Promise.all([
    fetchApprove(token0.address),
    fetchApprove(token1.address)
  ])

  const token0Approve = await tokenContractFromAddress(token0.address).populateTransaction.approve(COMETH_ROUTER_ADDRESS, constants.MaxUint256)
  const token1Approve = await tokenContractFromAddress(token1.address).populateTransaction.approve(COMETH_ROUTER_ADDRESS, constants.MaxUint256)

  console.log('ren amount: ', renTx.out.amount.toString(), 'half amount', halfSwap.toString())

  const txs = [mintTx]
    .concat(approves)
    .concat(swaps)
    .concat([
      token0Approve,
      token1Approve,
      await addLiquidityTx(
        chainInstance,
        safeAddress,
        token0.address,
        token1.address,
        token0Quote.mul(99).div(100), // to account for the 1% slippage
        token1Quote.mul(99).div(100),
        1,
        COMETH_ROUTER_ADDRESS,
        Math.floor(new Date().getTime() / 1000 + 60 * 10) // 10 minutes
      ),
      shifterApproveInput,
      shifterApproveToken0,
      shifterApproveToken1,
      shifterApproveLPToken,
      shiftTx,
    ])
  const tx = await relayer.multisend(txs)

  await tx.wait();
  
  console.log("finished");
  return true;
};
