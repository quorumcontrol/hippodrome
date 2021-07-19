import "jest";
import { LockAndMintParams, LockAndMintWrapper, WrappedLockAndMintDeposit } from "./ren";
import { doAddLiquidity } from "./stake";
import { getTestChain } from "../testHelpers";
import { pools } from "./poolList";

// TODO: We have a pretty complicated thing to test here:
// we need to have a ren mint and so we can't actually spend money, but we also need to
// *sign* transactions and verify signatures which we can't do with impersonate account.
// not sure how to really get in there and test
// but this structure is *useful* for now while we figure that out.
test("adds liquidity to wPTG/renDOGE pool", async () => {
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

  await doAddLiquidity(testChain, deposit, params, pools[0])

  expect(true).toBeTruthy();
  return
});
