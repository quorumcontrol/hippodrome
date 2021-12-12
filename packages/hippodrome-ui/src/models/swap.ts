import { BigNumber, constants, utils, VoidSigner } from "ethers";
import { IChain } from "./chain";
import { fetchApprove, fetchSwap } from "./1inch";
import { WrappedLockAndMintDeposit } from "./ren";
import {
  minter as getMinter,
  balanceShifter as getBalanceShifter,
} from "./contracts";
import { LockAndMintParams } from "./ren";
import { inputTokens } from "./tokenList";
import { RenERC20LogicV1__factory } from "../types/ethers-contracts";

const voidSigner = new VoidSigner(constants.AddressZero);

function tokenContractFromAddress(address: string) {
  // TODO: weird to use the ren one here, but it's already in our types
  return RenERC20LogicV1__factory.connect(address, voidSigner);
}

export const doSwap = async (
  deposit: WrappedLockAndMintDeposit,
  lockAndMintParams: LockAndMintParams,
  chainInstance: IChain
) => {
  const { relayer, safeAddress, address, signer } = chainInstance;
  if (!relayer || !safeAddress || !address || !signer) {
    throw new Error("must have a relayer and addresses");
  }

  const input = inputTokens.find(
    (t) => t.symbol === lockAndMintParams.lockNetwork
  )?.renAddress;
  const output = lockAndMintParams.outputToken;
  if (!input) {
    throw new Error("no input token");
  }
  const forwardTo = lockAndMintParams.forwardTo || address

  const renTx = await deposit.deposit.queryTx();
  if (!renTx.out || (renTx.out && renTx.out.revert)) {
    throw new Error("missing out tx");
  }
  console.log("ren tx: ", renTx);
  const minter = getMinter(chainInstance);
  const shifter = getBalanceShifter(chainInstance);
  const amount = BigNumber.from(renTx.out.amount.toString());

  const mintTx = await minter.populateTransaction.temporaryMint(
    safeAddress,
    utils.keccak256(Buffer.from(lockAndMintParams.nonce.toString())),
    lockAndMintParams.lockNetwork,
    amount,
    renTx.out.nhash,
    renTx.out.signature!
  );

  const swapAmount = amount;
  console.log("amount to swap: ", renTx.out.amount.toString());

  let txs = [mintTx];

  const [approve, swap] = await Promise.all([
    fetchApprove(input),
    fetchSwap(input, output, swapAmount, safeAddress),
  ]);

  // if we're only bridging, then don't do the swap
  if (swap) {
    txs = txs.concat([
      {
        to: approve.to,
        data: approve.data,
      },
      {
        to: swap.to,
        data: swap.data,
      },
    ]);
  }
  // if we're just gonna forward to the safe address anyway, no need for these extra transactions
  if (forwardTo !== safeAddress) {
    const shifterApproveInput = await tokenContractFromAddress(
      input
    ).populateTransaction.approve(shifter.address, constants.MaxUint256);
    const shifterApproveOutput = await tokenContractFromAddress(
      output
    ).populateTransaction.approve(shifter.address, constants.MaxUint256);
  
    const shiftTx = await shifter.populateTransaction.shift(
      [input, output],
      safeAddress,
      forwardTo
    );
    txs = txs.concat([shifterApproveInput, shifterApproveOutput, shiftTx]);
  }

  const tx = await relayer.multisend(txs);
  await tx.wait();

  console.log("finished");
  return true;
};

export const doAriSwap = async (
  deposit: WrappedLockAndMintDeposit,
  lockAndMintParams: LockAndMintParams,
  chainInstance: IChain
) => {
  const { relayer, safeAddress, address, signer } = chainInstance;
  if (!relayer || !safeAddress || !address || !signer) {
    throw new Error("must have a relayer and addresses");
  }

  const input = inputTokens.find(
    (t) => t.symbol === lockAndMintParams.lockNetwork
  )?.renAddress;
  // const output = lockAndMintParams.outputToken;
  if (!input) {
    throw new Error("no input token");
  }
  // const forwardTo = lockAndMintParams.forwardTo || address

  const renTx = await deposit.deposit.queryTx();
  if (!renTx.out || (renTx.out && renTx.out.revert)) {
    throw new Error("missing out tx");
  }
  console.log("ari ren tx: ", renTx);
  console.log("ari safe address: ", safeAddress)
  const minter = getMinter(chainInstance);
  // const shifter = getBalanceShifter(chainInstance);
  const amount = BigNumber.from(renTx.out.amount.toString());

  const mintTx = await minter.populateTransaction.temporaryMint(
    safeAddress,
    utils.keccak256(Buffer.from(lockAndMintParams.nonce.toString())),
    lockAndMintParams.lockNetwork,
    amount,
    renTx.out.nhash,
    renTx.out.signature!
  );

  const tx = await relayer.multisend([mintTx])

  console.log('ari: ', tx.hash, mintTx)

  await tx.wait().catch((err) => {
    console.error('ari: ', err)
  });

  console.log("finished");
  return true;
};
