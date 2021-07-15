import { BigNumber, constants, utils, VoidSigner } from "ethers";
import chainInstance from "./chain";
import { fetchApprove, fetchQuote, fetchSwap } from "./1inch";
import { WrappedLockAndMintDeposit } from "./ren";
import { minter as getMinter, balanceShifter as getBalanceShifter, COMETH_ROUTER_ADDRESS, WPTG_ADDRESS, RENDOGE_ADDRESS } from "./contracts";
import { LockAndMintParams } from "./ren";
import { inputTokens } from "./tokenList";
import { RenERC20LogicV1__factory } from "../types/ethers-contracts";
import { addLiquidityTx } from "./liquidityPool";

const voidSigner = new VoidSigner(constants.AddressZero)

function tokenContractFromAddress(address:string) {
  // TODO: weird to use the ren erc20 here, but it's already in our types, so mind as well reuse
  return RenERC20LogicV1__factory.connect(address, voidSigner)
}

// TODO: change to wPTG/rendoge pair
const ibBTCWBTCPairAddress = '0x8f8e95ff4b4c5e354ccb005c6b0278492d7b5907'

// TODO: this is a hard coded liquidity add to the particular sushi pool on polygon
export const doAddLiquidity = async (
  deposit: WrappedLockAndMintDeposit,
  lockAndMintParams: LockAndMintParams,
) => {
  const { relayer, safeAddress, address, signer } = chainInstance;
  if (!relayer || !safeAddress || !address || !signer) {
    throw new Error("must have a relayer and addresses");
  }

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
  const shifterApproveWbtC = await tokenContractFromAddress(RENDOGE_ADDRESS).populateTransaction.approve(shifter.address, constants.MaxUint256)
  const shifterApproveibBTC = await tokenContractFromAddress(WPTG_ADDRESS).populateTransaction.approve(shifter.address, constants.MaxUint256)
  const shifterApproveLPToken = await tokenContractFromAddress(ibBTCWBTCPairAddress).populateTransaction.approve(shifter.address, constants.MaxUint256)
  
  const shiftTx = await shifter.populateTransaction.shift([input, RENDOGE_ADDRESS, WPTG_ADDRESS, ibBTCWBTCPairAddress], safeAddress, address)

  const swapAmount = amount
  const halfSwap = swapAmount.div(2)

  const [renApprove, swapWbtc, swapIbBTc, quoteWbtc, quoteIbBTc] = await Promise.all([
    fetchApprove(input),
    fetchSwap(input, RENDOGE_ADDRESS, halfSwap, safeAddress),
    fetchSwap(input, WPTG_ADDRESS, halfSwap, safeAddress),
    fetchQuote(input, RENDOGE_ADDRESS, halfSwap),
    fetchQuote(input, WPTG_ADDRESS, halfSwap)
  ])

  const ibbtcApprove = await tokenContractFromAddress(WPTG_ADDRESS).populateTransaction.approve(COMETH_ROUTER_ADDRESS, constants.MaxUint256)
  const wbtcApprove = await tokenContractFromAddress(RENDOGE_ADDRESS).populateTransaction.approve(COMETH_ROUTER_ADDRESS, constants.MaxUint256)

  console.log('ren amount: ', renTx.out.amount.toString(), 'swap amount', swapAmount.toString())

  const tx = await relayer.multisend([
    mintTx,
    {
      to: renApprove.to,
      data: renApprove.calldata,
    },
    {
      to: swapIbBTc!.to,
      data: swapIbBTc!.calldata,
    },
    {
      to: swapWbtc!.to,
      data: swapWbtc!.calldata,
    },
    ibbtcApprove,
    wbtcApprove,
    await addLiquidityTx(
      safeAddress,
      WPTG_ADDRESS,
      RENDOGE_ADDRESS,
      quoteIbBTc,
      quoteWbtc,
      1,
      COMETH_ROUTER_ADDRESS,
      new Date().getTime() / 1000 + 60 * 10 // 10 minutes
    ),
    shifterApproveInput,
    shifterApproveWbtC,
    shifterApproveibBTC,
    shifterApproveLPToken,
    shiftTx,
  ])
  await tx.wait();

  console.log("finished");
  return true;
};
