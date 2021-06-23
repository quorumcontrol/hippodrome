import env from 'react-dotenv'
import chainInstance from './chain'
import {
  GnosisBiconomy,
} from 'kasumah-relay-wrapper/dist/src/relayers'
import axios from 'axios'
import { backOff } from "exponential-backoff";
import { constants, providers, Signer, VoidSigner } from 'ethers';
import { GnosisSafe__factory } from 'kasumah-wallet/dist/types/ethers-contracts';

const voidSigner = new VoidSigner(constants.AddressZero)

export const voidMasterCopy = new GnosisSafe__factory(voidSigner).attach(constants.AddressZero)

const BICONOMY_API_KEY:string = env.REACT_APP_BICONOMY_API_KEY
const WALLET_FACTORY_API_ID:string = env.REACT_APP_PROXY_FACTORY_API
const WALLET_EXEC_API_ID:string = env.REACT_APP_WALLET_EXEC_API

// gnosis safe wallet master copy
const MASTER_COPY_ADDR = '0x6851D6fDFAfD08c0295C392436245E5bc78B0185'
const DEFAULT_HANDLER = '0xd5D82B6aDDc9027B22dCA772Aa68D5d74cdBdF44'

async function setupDataForUser(user:string) {
  const setupData = await voidMasterCopy.populateTransaction.setup([user], 1, constants.AddressZero, '0x', DEFAULT_HANDLER, constants.AddressZero, 0, constants.AddressZero)
  if (!setupData.data) {
      throw new Error("no setup data")
  }
  return setupData.data
}

export const userHasSafe = async (address:string) => {
  const walletMaker = chainInstance.walletMaker
  if (!walletMaker) {
    throw new Error('can only call userHasSafe when there is a WalletMaker')
  }
  return walletMaker.isDeployed(address)
}

export const createRelayer = (userSigner: Signer, provider:providers.Provider, chainId:number ) => {
  return new GnosisBiconomy({
    userSigner,
    chainId,
    apiKey: BICONOMY_API_KEY,
    apiId: WALLET_EXEC_API_ID,
    targetChainProvider: provider,
  })
}

export const createSafe = async (address:string, chainId:number) => {
  const resp = await backOff(
    () => {
      return axios.post(
        "https://api.biconomy.io/api/v2/meta-tx/native",
        {
          apiId: WALLET_FACTORY_API_ID,
          params: [MASTER_COPY_ADDR, setupDataForUser(address), chainId],
          gasLimit: 9500000,
        },
        {
          headers: {
            "x-api-key": BICONOMY_API_KEY,
          },
        }
      );
    },
    {
      numOfAttempts: 5,
      retry: (e, attempts) => {
        console.dir(e);
        console.error(
          `error submitting Tx to biconomy, retrying. attempt: ${attempts}`
        );
        return true;
      },
      maxDelay: 5000,
    }
  );
}