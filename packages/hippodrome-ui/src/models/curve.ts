import { BigNumber, constants, utils, VoidSigner } from "ethers";
import { IChain } from "./chain";
import { fetchApprove, fetchQuote, fetchSwap } from "./1inch";
import { amountAfterFees, fetchFees, WrappedLockAndMintDeposit } from "./ren";
import { minter as getMinter, balanceShifter as getBalanceShifter } from "./contracts";
import { LockAndMintParams } from "./ren";
import { inputTokens } from "./tokenList";
import { Curve__factory, RenERC20LogicV1__factory } from "../types/ethers-contracts";
import { Pool } from "./poolList";

async function addLiquidityTx( 
  chain:IChain,
  token0Amt:BigNumber, // to account for the 1% slippage
  token1Amt:BigNumber,
  slippage:number,
  poolAddress:string
) {
  if (!chain.signer) {
    throw new Error('only supports signed in')
  }
  const curvePool = Curve__factory.connect(poolAddress, chain.signer)

  if (token0Amt.lte(token1Amt)) {
    return curvePool["add_liquidity(uint256[2],uint256,bool)"]([token0Amt, token0Amt], 0, true)
  } else {
    return curvePool["add_liquidity(uint256[2],uint256,bool)"]([token1Amt, token1Amt], 0, true)
  }
}

const voidSigner = new VoidSigner(constants.AddressZero)

function tokenContractFromAddress(address:string) {
  // TODO: weird to use the ren erc20 here just for a normal erc20 contract, but it's already in our types, so mind as well reuse
  return RenERC20LogicV1__factory.connect(address, voidSigner)
}

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

  const curvePool = Curve__factory.connect(poolAddress, signer)
  const lpTokenAddress = await curvePool.lp_token()


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
  const shifterApproveLPToken = await tokenContractFromAddress(lpTokenAddress).populateTransaction.approve(shifter.address, constants.MaxUint256)
  
  const shiftTx = await shifter.populateTransaction.shift([input, token0.address, token1.address, lpTokenAddress], safeAddress, address)

  const swapAmount = amountAfterFees(fees, amount)
  console.log('swap amount: ', swapAmount)
  const halfSwap = swapAmount.div(2)

  const [token0Quote, token1Quote] = await Promise.all([
    fetchQuote(input, token0.address, halfSwap),
    fetchQuote(input, token1.address, halfSwap)
  ])

  // const swaps = (await Promise.all([
  //   fetchSwap(input, token0.address, halfSwap, safeAddress),
  //   fetchSwap(input, token1.address, halfSwap, safeAddress),
  // ])).filter(Boolean)
  const swaps = (await Promise.all([
    fetchSwap(input, token0.address, halfSwap, address),
    fetchSwap(input, token1.address, halfSwap, address),
  ])).filter(Boolean)

  const approves = await Promise.all([
    fetchApprove(input),
  ])

  const token0Approve = await tokenContractFromAddress(token0.address).populateTransaction.approve(poolAddress, constants.MaxUint256)
  const token1Approve = await tokenContractFromAddress(token1.address).populateTransaction.approve(poolAddress, constants.MaxUint256)

  console.log('ren amount: ', renTx.out.amount.toString(), 'half amount', halfSwap.toString())

  const txs = [mintTx]
    .concat(approves)
    .concat(swaps)
    .concat([
      token0Approve,
      token1Approve,
      shifterApproveInput,
      shifterApproveToken0,
      shifterApproveToken1,
      shifterApproveLPToken,
      shiftTx,
    ])
  const tx = await relayer.multisend(txs)
  await tx.wait()

  await (await RenERC20LogicV1__factory.connect(token0.address, signer).approve(poolAddress, constants.MaxUint256)).wait()
  await (await RenERC20LogicV1__factory.connect(token1.address, signer).approve(poolAddress, constants.MaxUint256)).wait()

  console.log('0 bal: ', (await RenERC20LogicV1__factory.connect(token0.address, signer).balanceOf(address)).toString())
  console.log('01 bal: ', (await RenERC20LogicV1__factory.connect(token1.address, signer).balanceOf(address)).toString())

    console.log('adding liquidity')
      await (await addLiquidityTx(
        chainInstance,
        token0Quote.mul(99).div(100), // to account for the 1% slippage
        token1Quote.mul(99).div(100),
        1,
        pool.options.poolAddress,
      )).wait()

  // await (await signer.sendTransaction(approves[0])).wait()
  // await (await signer.sendTransaction(swaps[0]!)).wait()

  await tx.wait();
  
  console.log("finished");
  return true;
};
