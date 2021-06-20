import { providers } from 'ethers'
import EventEmitter from 'events'
import Web3Modal from 'web3modal'
import Torus from '@toruslabs/torus-embed'

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
) || 'matic') as KnownNetworkNames

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

  connected = false

  address?: string

  network?: providers.Network

  networkName: KnownNetworkNames

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
    this.network = await this.provider.getNetwork()
    this.signer = this.provider.getSigner()
    this.address = await this.signer.getAddress()
    this.connected = true

    this.emit('connected')
  }

  expectedChain() {
    return chainIds[this.networkName]
  }
}

export default new Chain(networkName)
