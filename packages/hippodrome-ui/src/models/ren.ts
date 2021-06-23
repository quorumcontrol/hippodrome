import { Bitcoin, Dogecoin, Polygon } from "@renproject/chains";
import RenJS from "@renproject/ren";
import {
  LockAndMint,
  LockAndMintDeposit,
} from "@renproject/ren/build/main/lockAndMint";
import { utils } from "ethers";
import EventEmitter from "events";
import chainInstance from "./chain";

export interface LockAndMintParams {
  lockNetwork: KnownInputChains;
  to: string;
  nonce: number;
}

const CONTRACT_ADDRESSES:Record<string,string> = {
  mumbai: '0xD7bb140b53EB814aa10f051B76B0e5b2458fBcAd'
}

export type KnownInputChains = "BTC" | "DOGE";

const ren = new RenJS("testnet"); // TODO: support testnet

export const NETWORKS = {
  BTC: Bitcoin("testnet"),
  DOGE: Dogecoin("testnet"),
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
      to: Polygon(chainInstance.provider.provider as any, "testnet")
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

  const addr = CONTRACT_ADDRESSES[chainInstance.networkName]
  if (!addr) {
    throw new Error(`no contract address for ${chainInstance.networkName}`)
  }

  const lockAndMint = await ren.lockAndMint({
    asset: net.asset,
    from: net,
    to: Polygon(chainInstance.provider.provider as any, "testnet").Contract({
      // The contract we want to interact with
      sendTo: addr,
  
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
  deposit: LockAndMintDeposit
  confirmed = false
  signed = false
  targetConfirmations?:number
  confirmations?:number

  constructor(deposit:LockAndMintDeposit) {
    super()
    this.deposit = deposit
    this.setupListeners()
  }

  private async setupListeners() {
    const confirmed = this.deposit.confirmed()

    this.deposit.confirmations().then((confirmations) =>{
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

  constructor(params: LockAndMintParams) {
    super();
    this.ready = lockAndMint(params);
    this.ready.then((lockAndMint) => {
      this.lockAndMint = lockAndMint
    })
    this.deposits = [];
    this.setupListener();
  }

  // async getDeposit(txHash: string) {
  //   const existing = this.deposits.find((dep) => dep.txHash() === txHash);
  //   if (existing) {
  //     return existing;
  //   }
  //   return new Promise((resolve) => {
  //     // need to do the search again inside of the promise incase one came in 
  //     // while we were creating the promise
  //     const existing = this.deposits.find((dep) => dep.txHash() === txHash);
  //     if (existing) {
  //       return resolve(existing);
  //     }
  //     // otherwise we'll wait for it to come in
  //     const cb = (deposit: LockAndMintDeposit) => {
  //       if (deposit.txHash() === txHash) {
  //         resolve(deposit);
  //         this.off("deposit", cb);
  //       }
  //     };
  //     this.on("deposit", cb);
  //   });
  // }

  private async handleDeposit(deposit: LockAndMintDeposit) {
    console.log('handle deposit')
    const wrappedDeposit = new WrappedLockAndMintDeposit(deposit)
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
