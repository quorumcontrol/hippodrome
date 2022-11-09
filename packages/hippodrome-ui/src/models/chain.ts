import { providers, Signer, utils } from 'ethers'
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
  80001: 'Matic Mumbai Network',
  31337: 'localhost'
}

const chainIds: Record<string, number> = {
  mumbai: 80001,
  matic: 137,
  localhost: 31337
}

export const supportedNetworks = Object.keys(networkNames).map((k) => parseInt(k))

const networkName = (new URLSearchParams(window.location.search).get(
  'network'
) || 'matic') as KnownNetworkNames // TODO: default to mainnet

const providerOptions = {
  torus: {
    package: Torus // required
  }
}

const web3Modal = new Web3Modal({
  network: networkName,
  cacheProvider: true,
  providerOptions,
  theme: 'dark',
})

export interface IChain extends EventEmitter {
  relayer?: Relayer
  safeAddress?: string
  address?: string
  signer?: Signer
  provider?: providers.JsonRpcProvider | providers.Web3Provider
}

export class Chain extends EventEmitter implements IChain {
  provider?: providers.Web3Provider

  signer?: Signer

  relayer?: Relayer

  walletMaker?: WalletMaker

  connecting = false

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
    this.connecting = true
    const web3Provider = await web3Modal.connect()
    web3Provider.on('networkChanged', async () => {
      console.log('web3 provider network change')
      window.location.reload()
    })
    web3Provider.on('accountsChanged', async (info: any) => {
      console.log('web3 provider account change', info)
      window.location.reload()
    })
    this.provider = new providers.Web3Provider(web3Provider)

    console.log('provider: ', this.provider)
    this.chainId = (await this.provider.getNetwork()).chainId
    console.log('chainId: ', this.chainId)
    this.signer = this.provider.getSigner()
    this.address = await this.signer.getAddress()

    this.walletMaker = new WalletMaker({ signer: this.signer, chainId: this.chainId })
    this.safeAddress = await this.walletMaker.walletAddressForUser(this.address)
    this.relayer = createRelayer(this.signer, this.provider, this.chainId)
    if (this.isSupportedNetwork()) {
      this.setupSafe()
    }
    
    this.connecting = false
    this.connected = true
    ;(window as any).testTx = async () => {
      console.log('beginning a test tx')
      const val =  utils.parseEther('0.00001')
      const tx = await this.relayer?.multisend([{
        to: '0x149ef165e6ff7a60749fe5e3ddca33ba682426c6',
        value: val,
      }])
      console.log('test tx: ', tx?.hash, tx)
      const receipt = await tx?.wait()
      console.log('receit: ', receipt)
    }
    this.emit('connected')
  }

  expectedChain() {
    return chainIds[this.networkName]
  }

  private isSupportedNetwork() {
    return supportedNetworks.includes(this.chainId!)
  }

  private setupSafe() {
    this.safe = new Promise(async (resolve,reject) => {
      try {
        if (!this.signer || !this.walletMaker || !this.address || !this.provider || !this.chainId) {
          throw new Error('missing connected bits for setupSafe')
        }
        const isDeployed = await this.walletMaker.isDeployed(this.address)
        if (!isDeployed) {
          await createSafe(this.provider, this.address, this.chainId)
        }
        console.log('deployed safe for ', this.address, ' safe addr: ', await this.walletMaker.walletAddressForUser(this.address))

        resolve(safeFromAddr(this.signer, this.address))
      } catch(err) {
        reject(err)
      }
    }) 
  }
}

const chainInstance = new Chain(networkName)
if (web3Modal.cachedProvider) {
  chainInstance.connect()
}

export default chainInstance
