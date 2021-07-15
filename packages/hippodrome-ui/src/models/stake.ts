import { BigNumber, constants, utils, VoidSigner } from "ethers";
import chainInstance from "./chain";
import { fetchApprove, fetchQuote, fetchSwap } from "./1inch";
import { WrappedLockAndMintDeposit } from "./ren";
import { minter as getMinter, balanceShifter as getBalanceShifter, SUSHI_ROUTER_ADDRESS, COMETH_ROUTER_ADDRESS } from "./contracts";
import { LockAndMintParams } from "./ren";
import { inputTokens } from "./tokenList";
import { RenERC20LogicV1__factory } from "../types/ethers-contracts";
import { addLiquidityTx } from "./liquidityPool";

const voidSigner = new VoidSigner(constants.AddressZero)

function tokenContractFromAddress(address:string) {
  // TODO: weird to use the ren erc20 here, but it's already in our types, so mind as well reuse
  return RenERC20LogicV1__factory.connect(address, voidSigner)
}

// see https://analytics-polygon.sushi.com/pairs/0x8f8e95ff4b4c5e354ccb005c6b0278492d7b5907
const ibBTCAddress = '0x4eac4c4e9050464067d673102f8e24b2fcceb350'
const wbtcAddress = '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6'
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
  const shifterApproveWbtC = await tokenContractFromAddress(wbtcAddress).populateTransaction.approve(shifter.address, constants.MaxUint256)
  const shifterApproveibBTC = await tokenContractFromAddress(ibBTCAddress).populateTransaction.approve(shifter.address, constants.MaxUint256)
  const shifterApproveLPToken = await tokenContractFromAddress(ibBTCWBTCPairAddress).populateTransaction.approve(shifter.address, constants.MaxUint256)
  
  const shiftTx = await shifter.populateTransaction.shift([input, wbtcAddress, ibBTCAddress, ibBTCWBTCPairAddress], safeAddress, address)

  const swapAmount = amount
  const halfSwap = swapAmount.div(2)

  const [renApprove, swapWbtc, swapIbBTc, quoteWbtc, quoteIbBTc] = await Promise.all([
    fetchApprove(input),
    fetchSwap(input, wbtcAddress, halfSwap, safeAddress),
    fetchSwap(input, ibBTCAddress, halfSwap, safeAddress),
    fetchQuote(input, wbtcAddress, halfSwap),
    fetchQuote(input, ibBTCAddress, halfSwap)
  ])

  const ibbtcApprove = await tokenContractFromAddress(ibBTCAddress).populateTransaction.approve(COMETH_ROUTER_ADDRESS, constants.MaxUint256)
  const wbtcApprove = await tokenContractFromAddress(wbtcAddress).populateTransaction.approve(COMETH_ROUTER_ADDRESS, constants.MaxUint256)

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
      ibBTCAddress,
      wbtcAddress,
      quoteIbBTc,
      quoteWbtc,
      1,
      SUSHI_ROUTER_ADDRESS,
      new Date().getTime() / 1000 + (60 * 10) // 10 minutes
    ),
    shifterApproveInput,
    shifterApproveWbtC,
    shifterApproveibBTC,
    shifterApproveLPToken,
    shiftTx
  ]);
  await tx.wait();

  console.log("finished");
  return true;
};
