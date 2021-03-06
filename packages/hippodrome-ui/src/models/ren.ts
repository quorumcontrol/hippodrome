import { Bitcoin, Dogecoin, Polygon } from "@renproject/chains";
import RenJS from "@renproject/ren";
import {
  LockAndMint,
  LockAndMintDeposit,
} from "@renproject/ren/build/main/lockAndMint";
import { BigNumber, providers, utils } from "ethers";
import EventEmitter from "events";
import ThenArg from "../utils/ThenArg";
import { IChain } from "./chain";
import { MINTER_ADDRESS } from "./contracts";

export const HIPPODROME_FEE = 0.003 * 10000 // turn 0.3% into an integer the same as the mint fee

export type RenFeeTuple = ThenArg<ReturnType<typeof fetchFees>>

class FakeWeb3Provider {
  provider: providers.JsonRpcProvider;
  constructor(ethersProvider: providers.JsonRpcProvider) {
    this.provider = ethersProvider;
  }

  async sendAsync(
    body: { id: any; jsonrpc: any; method: string; params: any[] },
    callback: (err: any, resp?: any) => void
  ) {
    try {
      const result = await this.provider.send(body.method, body.params);
      callback(null, {
        id: body.id,
        jsonrpc: body.jsonrpc,
        result
      });
    } catch (err) {
      callback(err);
    }
  }
}

export const isTestnet = new URLSearchParams(window.location.search).get(
  "testnet"
);

console.log("is testnet: ", isTestnet);

export interface LockAndMintParams {
  lockNetwork: KnownInputChains;
  to: string;
  nonce: number;
  outputToken: string; // address of output token (only used by hippodrome and not ren)
  forwardTo?: string;
}

export type KnownInputChains = "BTC" | "DOGE";

const ren = new RenJS(isTestnet ? "testnet" : undefined);

export const NETWORKS = {
  BTC: Bitcoin(isTestnet ? "testnet" : undefined),
  DOGE: Dogecoin(isTestnet ? "testnet" : undefined),
};

export const fetchFees = (
  chainInstance: IChain,
  networkName: KnownInputChains
) => {
  try {
    if (!chainInstance.provider) {
      throw new Error("can only call fetchFees with a provider");
    }
    const net = NETWORKS[networkName];
    console.log("fetching ren fees for: ", networkName);
    return ren.getFees({
      asset: net.asset,
      from: net,
      to: Polygon(
        new FakeWeb3Provider(chainInstance.provider) as any,
        isTestnet ? "testnet" : "mainnet"
      ),
    });
  } catch (err) {
    console.error("fetchFees err", err);
    throw err;
  }
};

const NONCE_KEY = "ren-nonce";

export const getNextNonce = () => {
  let nonce = 0;
  const currentNonce = localStorage.getItem(NONCE_KEY);
  if (currentNonce) {
    nonce = parseInt(currentNonce) + 1;
  }
  localStorage.setItem(NONCE_KEY, nonce.toString());
  return nonce;
};

const lockAndMint = async (
  chainInstance: IChain,
  { lockNetwork, nonce, to }: LockAndMintParams
) => {
  const net = NETWORKS[lockNetwork];
  if (!chainInstance.provider) {
    throw new Error("can only call lockAndMint with a provider");
  }

  const nonceHash = utils.keccak256(Buffer.from(nonce.toString()));

  const lockAndMint = await ren.lockAndMint({
    asset: net.asset,
    from: net,
    to: Polygon(
      new FakeWeb3Provider(chainInstance.provider) as any,
      isTestnet ? "testnet" : "mainnet"
    ).Contract({
      // The contract we want to interact with
      sendTo: MINTER_ADDRESS,

      // The name of the function we want to call
      contractFn: "temporaryMint",

      // Arguments expected for calling `deposit`
      contractParams: [
        {
          name: "to",
          type: "address",
          value: to,
        },
        {
          name: "nonce",
          type: "bytes32",
          value: nonceHash,
        },
      ],
    }),
    nonce: nonceHash,
  });

  console.log("lock and mint: ", lockAndMint);
  return lockAndMint;
};

const lockAndMintRegistry: Record<string, LockAndMintWrapper> = {};

function paramsToRegistryKey({ lockNetwork, to, nonce }: LockAndMintParams) {
  return `${lockNetwork}-${to}-${nonce}`;
}

export function amountAfterFees(fees:RenFeeTuple, amount:BigNumber) {
  const minerFee = fees.lock!.toString()
  console.log('miner fee: ', minerFee, ' amount: ', amount.toString())
  return amount.mul(10000 - fees.mint).div(10000).sub(minerFee).mul(10000 - HIPPODROME_FEE).div(10000)
}

export const getLockAndMint = (
  chainInstance: IChain,
  params: LockAndMintParams
) => {
  const alreadyRegistered = lockAndMintRegistry[paramsToRegistryKey(params)];
  if (alreadyRegistered) {
    return alreadyRegistered;
  }
  const wrappedLockAndMint = new LockAndMintWrapper({
    chainInstance,
    ...params,
  });
  lockAndMintRegistry[paramsToRegistryKey(params)] = wrappedLockAndMint;
  return wrappedLockAndMint;
};

export class WrappedLockAndMintDeposit extends EventEmitter {
  lockAndMint: LockAndMintWrapper;
  deposit: LockAndMintDeposit;
  confirmed = false;
  signed = false;
  targetConfirmations?: number;
  confirmations?: number;

  constructor(deposit: LockAndMintDeposit, lockAndMint: LockAndMintWrapper) {
    super();
    this.lockAndMint = lockAndMint;
    this.deposit = deposit;
    this.setupListeners();
  }

  async amountAfterFees() {
    const fees = await fetchFees(this.lockAndMint.chainInstance, this.lockAndMint.params.lockNetwork)
    return amountAfterFees(fees, BigNumber.from(this.deposit.depositDetails.amount))
  }

  private async setupListeners() {
    const confirmed = this.deposit.confirmed();

    this.deposit.confirmations().then((confirmations) => {
      console.log("confirmations found: ", confirmations, this);
      this.targetConfirmations = confirmations.target;
      this.confirmations = confirmations.current;
      this.emitUpdate("confirmations");
    });
    confirmed.on("confirmation", (current) => {
      if (current > (this.confirmations || 0)) {
        this.confirmations = current;
        this.emitUpdate("confirmation", current);
      }
    });
    await confirmed;
    console.log("confirmed");
    this.confirmed = true;
    this.emitUpdate("confirmed");
    await this.deposit.signed();
    console.log("signed");
    this.signed = true;
    this.emitUpdate("signed");
  }

  private emitUpdate(additionalName?: string, additionalPayload?: any) {
    this.emit("update");
    if (additionalName) {
      this.emit(additionalName, additionalPayload);
    }
  }
}

interface LockAndMintWrapperConstructorArgs extends LockAndMintParams {
  chainInstance: IChain;
}

export class LockAndMintWrapper extends EventEmitter {
  ready: Promise<LockAndMint>;
  deposits: WrappedLockAndMintDeposit[];
  lockAndMint?: LockAndMint;
  params: LockAndMintParams;
  chainInstance: IChain

  constructor(params: LockAndMintWrapperConstructorArgs) {
    super();
    this.params = params;
    this.ready = lockAndMint(params.chainInstance, params);
    this.ready.then((lockAndMint) => {
      this.lockAndMint = lockAndMint;
    });
    this.chainInstance = params.chainInstance
    this.deposits = [];
    this.setupListener();
  }

  private async handleDeposit(deposit: LockAndMintDeposit) {
    console.log("handle deposit");
    const wrappedDeposit = new WrappedLockAndMintDeposit(deposit, this);
    this.deposits.push(wrappedDeposit);
    this.emitUpdate("deposit", wrappedDeposit);
  }

  private async setupListener() {
    const lockAndMint = await this.ready;
    lockAndMint.on("deposit", this.handleDeposit.bind(this));
  }

  private emitUpdate(additionalName?: string, additionalPayload?: any) {
    this.emit("update");
    if (additionalName) {
      this.emit(additionalName, additionalPayload);
    }
  }
}
