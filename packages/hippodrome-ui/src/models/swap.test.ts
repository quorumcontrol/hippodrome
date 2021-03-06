import "jest";
import { LockAndMintParams, LockAndMintWrapper, WrappedLockAndMintDeposit } from "./ren";
import { doSwap } from "./swap";
import { getTestChain } from "../testHelpers";

// TODO: We have a pretty complicated thing to test here:
// we need to have a ren mint and so we can't actually spend money, but we also need to
// *sign* transactions and verify signatures which we can't do with impersonate account.
// not sure how to really get in there and test
// but this structure is *useful* for now while we figure that out.
test("does a swap", async () => {
  const testChain = getTestChain()

  const params: LockAndMintParams = {
    lockNetwork: "DOGE",
    to: testChain.safeAddress!,
    nonce: 135,
    outputToken: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", // dai
  };

  const wrappedLockAndMint = new LockAndMintWrapper({
    chainInstance: testChain,
    ...params,
  });
  const deposit:WrappedLockAndMintDeposit = await new Promise(async (resolve) => {
    wrappedLockAndMint.once("deposit", resolve);
  });

  await doSwap(deposit, params, testChain)

  expect(true).toBeTruthy();
  return
});
