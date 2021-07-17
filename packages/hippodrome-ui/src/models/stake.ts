import { BigNumber, constants, utils, VoidSigner } from "ethers";
import { IChain } from "./chain";
import { fetchApprove, fetchQuote, fetchSwap } from "./1inch";
import { amountAfterFees, fetchFees, WrappedLockAndMintDeposit } from "./ren";
import { minter as getMinter, balanceShifter as getBalanceShifter, COMETH_ROUTER_ADDRESS, WPTG_ADDRESS, RENDOGE_ADDRESS } from "./contracts";
import { LockAndMintParams } from "./ren";
import { inputTokens } from "./tokenList";
import { RenERC20LogicV1__factory } from "../types/ethers-contracts";
import { addLiquidityTx } from "./liquidityPool";

const voidSigner = new VoidSigner(constants.AddressZero)

function tokenContractFromAddress(address:string) {
  // TODO: weird to use the ren erc20 here just for a normal erc20 contract, but it's already in our types, so mind as well reuse
  return RenERC20LogicV1__factory.connect(address, voidSigner)
}

// https://charts.cometh.io/pair/0x476278f883003862b374f22a7604e60f5643d647
export const wPTGRenDogeComethPair = '0x476278f883003862b374f22a7604e60f5643d647'

// TODO: this is a hard coded liquidity add to the particular sushi pool on polygon
export const doAddLiquidity = async (
  chainInstance: IChain,
  deposit: WrappedLockAndMintDeposit,
  lockAndMintParams: LockAndMintParams,
) => {
  const { relayer, safeAddress, address, signer } = chainInstance;
  if (!relayer || !safeAddress || !address || !signer) {
    throw new Error("must have a relayer and addresses");
  }

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
  const shifterApproveWPTG = await tokenContractFromAddress(
    WPTG_ADDRESS
  ).populateTransaction.approve(shifter.address, constants.MaxUint256)
  const shifterApproveRENDOGE = await tokenContractFromAddress(RENDOGE_ADDRESS).populateTransaction.approve(shifter.address, constants.MaxUint256)
  const shifterApproveLPToken = await tokenContractFromAddress(wPTGRenDogeComethPair).populateTransaction.approve(shifter.address, constants.MaxUint256)
  
  const shiftTx = await shifter.populateTransaction.shift([input, RENDOGE_ADDRESS, WPTG_ADDRESS, wPTGRenDogeComethPair], safeAddress, address)

  const swapAmount = amountAfterFees(fees, amount)
  console.log('swap amount: ', swapAmount)
  const halfSwap = swapAmount.div(2)

  const [renApprove, quoteWPTG, swapWPTG, quoteWRENDOGE, ] =
    await Promise.all([
      fetchApprove(input),
      fetchQuote(input, WPTG_ADDRESS, halfSwap),
      fetchSwap(input, WPTG_ADDRESS, halfSwap, safeAddress),
      fetchQuote(input, RENDOGE_ADDRESS, halfSwap),
    ])

  const wPTGApprove = await tokenContractFromAddress(WPTG_ADDRESS).populateTransaction.approve(COMETH_ROUTER_ADDRESS, constants.MaxUint256)
  const renDOGEApprove = await tokenContractFromAddress(RENDOGE_ADDRESS).populateTransaction.approve(COMETH_ROUTER_ADDRESS, constants.MaxUint256)

  console.log('ren amount: ', renTx.out.amount.toString(), 'half amount', halfSwap.toString())

  const tx = await relayer.multisend([
    mintTx,
    {
      to: renApprove.to,
      data: renApprove.calldata,
    },
    {
      to: swapWPTG!.to,
      data: swapWPTG!.calldata,
    },
    wPTGApprove,
    renDOGEApprove,
    await addLiquidityTx(
      chainInstance,
      safeAddress,
      WPTG_ADDRESS,
      RENDOGE_ADDRESS,
      quoteWPTG.mul(99).div(100), // to account for the 1% slippage
      quoteWRENDOGE,
      1,
      COMETH_ROUTER_ADDRESS,
      Math.floor(new Date().getTime() / 1000 + 60 * 10) // 10 minutes
    ),
    shifterApproveInput,
    shifterApproveWPTG,
    shifterApproveRENDOGE,
    shifterApproveLPToken,
    shiftTx,
  ])
  await tx.wait();

  // const renDoge = RenERC20LogicV1__factory.connect(RENDOGE_ADDRESS, signer)
  // const wptg = RenERC20LogicV1__factory.connect(WPTG_ADDRESS, signer)
  // await renDoge.approve(COMETH_ROUTER_ADDRESS, constants.MaxUint256)
  // await wptg.approve(COMETH_ROUTER_ADDRESS, constants.MaxUint256)
  // console.log('wptgBalance: ', (await wptg.balanceOf(address)).toString(), ' quote: ', quoteWPTG.mul(99).div(100).toString())
  // console.log('renDogeBalance: ', (await renDoge.balanceOf(address)).toString(), ' quote: ', quoteWRENDOGE.toString())

  // await (await addLiquidityTx(
  //   chainInstance,
  //   address,
  //   WPTG_ADDRESS,
  //   RENDOGE_ADDRESS,
  //   quoteWPTG.mul(99).div(100), // to account for the 1% slippage
  //   quoteWRENDOGE,
  //   1,
  //   COMETH_ROUTER_ADDRESS,
  //   Math.floor(new Date().getTime() / 1000 + 60 * 10) // 10 minutes
  // )).wait()
  
  console.log("finished");
  return true;
};
