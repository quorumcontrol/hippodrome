import { providers } from "ethers";
import "jest";
import EventEmitter from "events";
import { IChain } from "./chain";
import { WalletMaker } from "kasumah-wallet";
import {
  GnosisLocalRelayer,
  Relayer,
} from "kasumah-relay-wrapper/dist/src/relayers";
import { LockAndMintParams, LockAndMintWrapper, WrappedLockAndMintDeposit } from "./ren";
import { doSwap } from "./swap";

const SHARED_LOCAL_DEV = "0x946c516f181a55032bbb0d04749af5cffcadb981";

async function getProvider() {
  const provider = new providers.StaticJsonRpcProvider("http://localhost:8545");
  await provider.send("hardhat_impersonateAccount", [SHARED_LOCAL_DEV]);
  const signer = provider.getSigner(SHARED_LOCAL_DEV);
  return {
    signer,
    provider,
  };
}

class TestChain extends EventEmitter implements IChain {
  relayer?: Relayer;
  safeAddress?: string;
  address?: string;
  signer?: providers.JsonRpcSigner;
  provider?: providers.StaticJsonRpcProvider;

  constructor() {
    super();
  }

  async setup() {
    const { signer, provider } = await getProvider();
    const address = await signer.getAddress();
    const walletMaker = new WalletMaker({
      signer,
      chainId: 31337,
    });
    this.safeAddress = await walletMaker.walletAddressForUser(address)
    this.signer = signer
    this.provider = provider;
    this.address = address;
    this.relayer = new GnosisLocalRelayer({
      transmitSigner: signer,
      userSigner: signer,
      chainId: 31337,
    });
  }
}

// TODO: thistest isn't passing. We have a pretty complicated thing to test here:
// we need to have a ren mint and so we can't actually spend money, but we also need to
// *sign* transactions and verify signatures which we can't do with impersonate account.
// not sure how to really get in there and test
// but this structure is *useful* for now while we figure that out.
test.skip("says true", async () => {
  jest.setTimeout(60000)
  const testChain = new TestChain();
  await testChain.setup();
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
