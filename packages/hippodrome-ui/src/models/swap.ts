import { BigNumber, utils } from "ethers";
import chainInstance from "./chain";
import { fetchApprove, fetchSwap } from "./1inch";
import { NETWORKS, WrappedLockAndMintDeposit } from "./ren";
import { minter as getMinter } from "./contracts";
import { LockAndMintParams } from "./ren";
import { inputTokens } from "./tokenList";


export const doSwap = async (
  deposit: WrappedLockAndMintDeposit,
  lockAndMintParams: LockAndMintParams,
) => {
  const { relayer, safeAddress } = chainInstance;
  if (!relayer || !safeAddress) {
    throw new Error("must have a relayer and safe address");
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
  const amount = BigNumber.from(renTx.out.amount.toString())

  const mintTx = await minter.populateTransaction.temporaryMint(
    safeAddress,
    utils.keccak256(Buffer.from(lockAndMintParams.nonce.toString())),
    lockAndMintParams.lockNetwork,
    amount,
    renTx.out.nhash,
    renTx.out.signature!,
  )

  const [approve, swap] = await Promise.all([
    fetchApprove(input),
    fetchSwap(input, output, amount, safeAddress),
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
