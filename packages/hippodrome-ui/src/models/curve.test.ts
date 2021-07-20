import "jest";
import { LockAndMintParams, LockAndMintWrapper, WrappedLockAndMintDeposit } from "./ren";
import { doAddLiquidity } from "./curve";
import { getTestChain } from "../testHelpers";
import { Pool, pools, PoolTypes } from "./poolList";

// TODO: We have a pretty complicated thing to test here:
// we need to have a ren mint and so we can't actually spend money, but we also need to
// *sign* transactions and verify signatures which we can't do with impersonate account.
// not sure how to really get in there and test
// but this structure is *useful* for now while we figure that out.
test.only("adds liquidity to curve amWBTC/renBTC pool", async () => {
  const testChain = getTestChain()

  const params: LockAndMintParams = {
    lockNetwork: "DOGE",
    to: testChain.safeAddress!,
    nonce: 135,
    outputToken: "",
  };

  const wrappedLockAndMint = new LockAndMintWrapper({
    chainInstance: testChain,
    ...params,
  });
  const deposit:WrappedLockAndMintDeposit = await new Promise(async (resolve) => {
    wrappedLockAndMint.once("deposit", resolve);
  });

  await doAddLiquidity(testChain, deposit, params, new Pool({
    type: PoolTypes.curve,
    poolAddress: '0xC2d95EEF97Ec6C17551d45e77B590dc1F9117C67', // https://polygonscan.com/address/0xC2d95EEF97Ec6C17551d45e77B590dc1F9117C67#code
    token0: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', // WBTC
    token1: '0xDBf31dF14B66535aF65AaC99C32e9eA844e14501', // renBTC
    // rewardToken: '0xc0f14c88250e680ecd70224b7fba82b7c6560d12',
    // weeklyReward: utils.parseEther('1000000'),
    successUrl: 'https://polygon.curve.fi/ren',
  }))

  expect(true).toBeTruthy();
  return
});
