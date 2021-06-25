import { BigNumber, utils } from "ethers";
import chainInstance from "./chain";
import { fetchApprove, fetchSwap } from "./1inch";
import { WrappedLockAndMintDeposit } from "./ren";
import { minter as getMinter } from "./contracts";
import { LockAndMintParams } from "./ren";

type Address = string;

export const doSwap = async (
  deposit: WrappedLockAndMintDeposit,
  lockAndMint: LockAndMintParams,
  input: Address,
  output: Address,
) => {
  const { relayer, safeAddress } = chainInstance;
  if (!relayer || !safeAddress) {
    throw new Error("must have a relayer and safe address");
  }

  const renTx = await deposit.deposit.queryTx(); 
  if (!renTx.out || (renTx.out && renTx.out.revert)) {
      throw new Error('missing out tx')
  }
  const minter = getMinter()
  const mintTx = await minter.populateTransaction.temporaryMint(
    safeAddress,
    utils.keccak256(Buffer.from(lockAndMint.nonce.toString())),
    lockAndMint.lockNetwork,
    renTx.out.amount,
    renTx.out.nhash,
    renTx.out.signature!,
  )

  const [approve, swap] = await Promise.all([
    fetchApprove(input),
    fetchSwap(input, output, BigNumber.from(renTx.out.amount.toString()), safeAddress),
  ]);
  if (!swap) {
    return true;
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
  ]);
  console.log("submitting swap: ", tx.hash);
  await tx.wait();
  console.log("finished");
  return true;
};
