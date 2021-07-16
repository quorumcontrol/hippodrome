import { providers, Signer, utils, Wallet } from "ethers";
import "jest";
import EventEmitter from "events";
import { IChain } from "./models/chain";
import { WalletMaker } from "kasumah-wallet";
import {
  GnosisLocalRelayer,
  Relayer,
} from "kasumah-relay-wrapper/dist/src/relayers";
import 'dotenv/config'

// unfortunately to really test this we need to fork mainnet and use a pending ren deposit
// which means "real money" which also means we need to have a private key to actually run the tests
const SHARED_LOCAL_DEV_PRIVATE_KEY = process.env.TEST_DEPOSIT_PRIVATE_KEY
export const SHARED_LOCAL_DEV = "0x946c516f181a55032bbb0d04749af5cffcadb981";

export const CHAIN_ID = 31337

let testChain:TestChain
const globalProvider = new providers.StaticJsonRpcProvider("http://localhost:8545");
const startBlock = globalProvider.getBlockNumber()

export function getTestChain() {
  if (!testChain) {
    throw new Error('test chain undefined')
  }
  return testChain
}

async function getProvider() {
  const provider = new providers.StaticJsonRpcProvider("http://localhost:8545");
  const signer = new Wallet(SHARED_LOCAL_DEV_PRIVATE_KEY!, provider)
  return {
    signer,
    provider,
  };
}

class TestChain extends EventEmitter implements IChain {
  relayer?: Relayer;
  safeAddress?: string;
  address?: string;
  signer: Signer;
  provider: providers.StaticJsonRpcProvider;

  constructor({ signer, provider }: {signer: Signer, provider: providers.StaticJsonRpcProvider}) {
    super();
    this.signer = signer
    this.provider = provider
  }

  async setup() {
    const signer = this.signer

    const address = await signer.getAddress();
    const walletMaker = new WalletMaker({
      signer,
      chainId: CHAIN_ID,
    });
    this.safeAddress = await walletMaker.walletAddressForUser(address)
    this.address = address;
    this.relayer = new GnosisLocalRelayer({
      transmitSigner: signer,
      userSigner: signer,
      chainId: CHAIN_ID,
    });
  }
}

async function resetFork() {
  await globalProvider.send(
    "hardhat_reset",
    [
      {
        forking: {
          jsonRpcUrl: "https://polygon-mainnet.g.alchemy.com/v2/zApEggK_mSyvPkOreEJQTEWShlbw9vOU",
          blockNumber: await startBlock,
        },
      },
    ]
  );
  await globalProvider.send("hardhat_setBalance", [
    SHARED_LOCAL_DEV,
    `0x${utils.parseEther('100').toHexString().slice(3)}` // needs to be non-zero padded hex
  ]);
}

beforeEach(async () => {
  await resetFork()

  testChain = new TestChain(await getProvider());
  await testChain.setup()

  
  const walletMaker = new WalletMaker({ signer: testChain.signer!, chainId: CHAIN_ID })
  await walletMaker.deployWallet(SHARED_LOCAL_DEV)
})

