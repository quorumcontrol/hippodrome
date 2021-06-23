import { providers } from 'ethers'
import EventEmitter from 'events'
import Web3Modal from 'web3modal'
import Torus from '@toruslabs/torus-embed'
import { WalletMaker, safeFromAddr } from 'kasumah-wallet/dist/src'
import { GnosisSafe } from 'kasumah-wallet/dist/types/ethers-contracts';
import {
  Relayer,
} from 'kasumah-relay-wrapper/dist/src/relayers'
import { createRelayer, createSafe } from './safe'

export type KnownNetworkNames = 'mumbai' | 'matic'

export const networkNames: Record<number, string> = {
  137: 'Matic Mainnet',
  80001: 'Matic Mumbai Network'
}

const chainIds: Record<string, number> = {
  mumbai: 80001,
  matic: 137
}

const networkName = (new URLSearchParams(window.location.search).get(
  'network'
) || 'mumbai') as KnownNetworkNames // TODO: default to mainnet

const providerOptions = {
  torus: {
    package: Torus // required
  }
}

const web3Modal = new Web3Modal({
  network: networkName, // optional
  cacheProvider: true, // optional
  providerOptions // required
})

export class Chain extends EventEmitter {
  provider?: providers.Web3Provider

  signer?: providers.JsonRpcSigner

  relayer?: Relayer

  walletMaker?: WalletMaker

  connected = false

  address?: string

  safeAddress?: string

  networkName: KnownNetworkNames

  chainId?: number

  safe?: Promise<GnosisSafe>

  constructor(networkName: KnownNetworkNames) {
    super()
    this.networkName = networkName
  }

  async connect() {
    const web3Provider = await web3Modal.connect()
    web3Provider.on('networkChanged', async () => {
      console.log('web3 provider network change')
      // window.location.reload()
    })
    web3Provider.on('accountsChanged', async (info: any) => {
      console.log('web3 provider account change', info)
      // window.location.reload()
    })
    this.provider = new providers.Web3Provider(web3Provider)

    console.log('provider: ', this.provider)
    this.chainId = (await this.provider.getNetwork()).chainId
    this.signer = this.provider.getSigner()
    this.address = await this.signer.getAddress()

    this.walletMaker = new WalletMaker({ signer: this.signer, chainId: this.chainId })
    this.safeAddress = await this.walletMaker.walletAddressForUser(this.address)
    this.relayer = createRelayer(this.signer, this.provider, this.chainId)

    this.setupSafe() // TODO: no need to do this right on connect, wait until they've sent a deposit

    this.connected = true

    this.emit('connected')
  }

  expectedChain() {
    return chainIds[this.networkName]
  }

  private setupSafe() {
    this.safe = new Promise(async (resolve,reject) => {
      try {
        if (!this.signer || !this.walletMaker || !this.address || !this.provider || !this.chainId) {
          throw new Error('missing connected bits for setupSafe')
        }
        const isDeployed = await this.walletMaker.isDeployed(this.address)
        if (!isDeployed) {
          console.log('deploying safe')
          const safeTx = await createSafe(this.provider, this.address, this.chainId)
          await safeTx.wait()
        }

        resolve(safeFromAddr(this.signer, this.address))
      } catch(err) {
        reject(err)
      }
    }) 
  }
}

export default new Chain(networkName)
