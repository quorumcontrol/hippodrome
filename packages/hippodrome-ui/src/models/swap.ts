import { BigNumber, constants, utils, VoidSigner } from "ethers";
import chainInstance from "./chain";
import { fetchApprove, fetchSwap } from "./1inch";
import { WrappedLockAndMintDeposit } from "./ren";
import { minter as getMinter, balanceShifter as getBalanceShifter } from "./contracts";
import { LockAndMintParams } from "./ren";
import { inputTokens } from "./tokenList";
import { RenERC20LogicV1__factory } from "../types/ethers-contracts";

const voidSigner = new VoidSigner(constants.AddressZero)

function tokenContractFromAddress(address:string) {
  // TODO: weird to use the ren one here, but it's already in our types
  return RenERC20LogicV1__factory.connect(address, voidSigner)
}

export const doSwap = async (
  deposit: WrappedLockAndMintDeposit,
  lockAndMintParams: LockAndMintParams,
) => {
  const { relayer, safeAddress, address, signer } = chainInstance;
  if (!relayer || !safeAddress || !address || !signer) {
    throw new Error("must have a relayer and addresses");
  }

  const input = inputTokens.find((t) => t.symbol === lockAndMintParams.lockNetwork)?.renAddress
  const output = lockAndMintParams.outputToken
  if (!input) {
    throw new Error('no input token')
  }

  const renTx = await deposit.deposit.queryTx(); 
  if (!renTx.out || (renTx.out && renTx.out.revert)) {
      throw new Error('missing out tx')
  }
  const minter = getMinter()
  const shifter = getBalanceShifter()
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
  const shifterApproveOutput = await tokenContractFromAddress(output).populateTransaction.approve(shifter.address, constants.MaxUint256)
  
  const shiftTx = await shifter.populateTransaction.shift([input,output], safeAddress, address)

  // TODO: hard coding fee right now, should figure out the fee from the renFees call
  const swapAmount = amount.mul(10000 - 15).div(10000)
  console.log('ren amount: ', renTx.out.amount.toString(), 'swap amount', swapAmount.toString())

  const [approve, swap] = await Promise.all([
    fetchApprove(input),
    fetchSwap(input, output, swapAmount, safeAddress), 
  ]);

  if (!swap) {
    throw new Error('no swap')
  }

  const tx = await relayer.multisend([
    mintTx,
    {
      to: approve.to,
      data: approve.calldata,
    },
    {
      to: swap.to,
      data: swap.calldata,
    },
    shifterApproveInput,
    shifterApproveOutput,
    shiftTx
  ]);
  await tx.wait();

  console.log("finished");
  return true;
};
