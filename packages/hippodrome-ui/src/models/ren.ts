import { Bitcoin, Dogecoin, Polygon } from "@renproject/chains";
import RenJS from "@renproject/ren";
import {
  LockAndMint,
  LockAndMintDeposit,
} from "@renproject/ren/build/main/lockAndMint";
import { utils } from "ethers";
import EventEmitter from "events";
import chainInstance from "./chain";
import { MINTER_ADDRESS } from "./contracts";

export const isTestnet = (new URLSearchParams(window.location.search).get(
  'testnet'
))

export interface LockAndMintParams {
  lockNetwork: KnownInputChains;
  to: string;
  nonce: number;
  outputToken: string; // address of output token (only used by hippodrome and not ren)
}

export type KnownInputChains = "BTC" | "DOGE";

const ren = new RenJS(isTestnet ? "testnet" : undefined);

export const NETWORKS = {
  BTC: Bitcoin(isTestnet ? "testnet" : undefined),
  DOGE: Dogecoin(isTestnet ? "testnet" : undefined),
};

export const fetchFees = (networkName: KnownInputChains) => {
  try {
    if (!chainInstance.provider) {
      throw new Error("can only call fetchFees with a provider");
    }
    const net = NETWORKS[networkName];
    console.dir(net);
    return ren.getFees({
      asset: net.asset,
      from: net,
      to: Polygon(chainInstance.provider.provider as any, isTestnet ? "testnet" : 'mainnet')
    })
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

const lockAndMint = async ({ lockNetwork, nonce, to }: LockAndMintParams) => {
  const net = NETWORKS[lockNetwork];
  if (!chainInstance.provider) {
    throw new Error("can only call lockAndMint with a provider");
  }
 
  const nonceHash = utils.keccak256(Buffer.from(nonce.toString()))

  const lockAndMint = await ren.lockAndMint({
    asset: net.asset,
    from: net,
    to: Polygon(chainInstance.provider.provider as any, isTestnet ? "testnet" : 'mainnet').Contract({
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
    nonce: nonceHash
  });

  console.log("lock and mint: ", lockAndMint);
  return lockAndMint;
};

const lockAndMintRegistry: Record<string, LockAndMintWrapper> = {};

function paramsToRegistryKey({ lockNetwork, to, nonce }: LockAndMintParams) {
  return `${lockNetwork}-${to}-${nonce}`;
}

export const getLockAndMint = (params: LockAndMintParams) => {
  const alreadyRegistered = lockAndMintRegistry[paramsToRegistryKey(params)];
  if (alreadyRegistered) {
    return alreadyRegistered;
  }
  const wrappedLockAndMint = new LockAndMintWrapper(params);
  lockAndMintRegistry[paramsToRegistryKey(params)] = wrappedLockAndMint;
  return wrappedLockAndMint;
};

export class WrappedLockAndMintDeposit extends EventEmitter {
  lockAndMint: LockAndMintWrapper
  deposit: LockAndMintDeposit
  confirmed = false
  signed = false
  targetConfirmations?:number
  confirmations?:number

  constructor(deposit:LockAndMintDeposit, lockAndMint:LockAndMintWrapper) {
    super()
    this.lockAndMint = lockAndMint
    this.deposit = deposit
    this.setupListeners()
  }

  private async setupListeners() {
    const confirmed = this.deposit.confirmed()

    this.deposit.confirmations().then((confirmations) =>{
      console.log('confirmations found: ', confirmations, this)
      this.targetConfirmations = confirmations.target
      this.confirmations = confirmations.current
      this.emitUpdate('confirmations')
    })
    confirmed.on('confirmation', (current) => {
      if (current > (this.confirmations || 0)) {
        this.confirmations = current
        this.emitUpdate('confirmation', current)
      }
    })
    await confirmed
    console.log('confirmed')
    this.confirmed = true
    this.emitUpdate('confirmed')
    await this.deposit.signed()
    console.log('signed')
    this.signed = true
    this.emitUpdate('signed')
  }

  private emitUpdate(additionalName?: string, additionalPayload?: any) {
    this.emit("update");
    if (additionalName) {
      this.emit(additionalName, additionalPayload);
    }
  }
}

export class LockAndMintWrapper extends EventEmitter {
  ready: Promise<LockAndMint>;
  deposits: WrappedLockAndMintDeposit[];
  lockAndMint?: LockAndMint
  params: LockAndMintParams

  constructor(params: LockAndMintParams) {
    super();
    this.params = params
    this.ready = lockAndMint(params);
    this.ready.then((lockAndMint) => {
      this.lockAndMint = lockAndMint
    })
    this.deposits = [];
    this.setupListener();
  }

  private async handleDeposit(deposit: LockAndMintDeposit) {
    console.log('handle deposit')
    const wrappedDeposit = new WrappedLockAndMintDeposit(deposit, this)
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
