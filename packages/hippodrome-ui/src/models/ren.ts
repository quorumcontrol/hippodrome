import { Bitcoin, Dogecoin, Polygon } from "@renproject/chains"
import RenJS from "@renproject/ren";
import { utils } from "ethers";
import chainInstance from './chain'

export type KnownInputChains = 'BTC' | 'DOGE'

const ren = new RenJS('testnet') // TODO: support testnet

export const NETWORKS = {
  BTC: Bitcoin('testnet'),
  DOGE: Dogecoin('testnet'),
}

export const fetchFees = (networkName:KnownInputChains) => {
  try {
    if (!chainInstance.provider) {
      throw new Error('can only call fetchFees with a provider')
    }
    const net = NETWORKS[networkName]
    console.dir(net)
    return ren.getFees({
      asset: net.asset,
      from: net,
      to: Polygon(chainInstance.provider.provider as any, 'testnet')
    })
  } catch (err) {
    console.error('fetchFees err', err)
    throw err
  }
}

const NONCE_KEY = 'ren-nonce'

export const getNextNonce = () => {
  let nonce = 0
  const currentNonce = localStorage.getItem(NONCE_KEY)
  if (currentNonce) {
    nonce = parseInt(currentNonce) + 1
  }
  localStorage.setItem(NONCE_KEY, nonce.toString())
  return nonce
}

export const getDeposit = async (lockChain:KnownInputChains, txHash:Buffer) => {
  if (!chainInstance.provider) {
    throw new Error('can only call lockAndMint with a provider')
  }

  const net = NETWORKS[lockChain]

  const selector = ren.renVM.selector({
    asset: net.asset,
    from: net,
    to: Polygon(chainInstance.provider.provider as any, 'testnet')
  })
  return ren.renVM.queryMintOrBurn(selector, txHash)
}

export const lockAndMint = async (networkName:KnownInputChains, to: string, nonce:number) => {
  const net = NETWORKS[networkName]
  if (!chainInstance.provider) {
    throw new Error('can only call lockAndMint with a provider')
  }

  const lockAndMint = await ren.lockAndMint({
    asset: net.asset,
    from: net,
    to: Polygon(chainInstance.provider.provider as any, 'testnet').Address(to),
    nonce: utils.keccak256(Buffer.from(nonce.toString())),
  });
  console.log('lock and mint: ', lockAndMint)
  return lockAndMint
}