import { Bitcoin, Dogecoin, Polygon } from "@renproject/chains"
import RenJS from "@renproject/ren";
import chainInstance from './chain'

export type KnownInputChains = 'BTC' | 'DOGE'

const ren = new RenJS() // TODO: support testnet

export const NETWORKS = {
  BTC: Bitcoin(),
  DOGE: Dogecoin(),
}

export const fetchFees = (networkName:KnownInputChains) => {
  if (!chainInstance.provider) {
    throw new Error('can only call fetchFees with a provider')
  }
  const net = NETWORKS[networkName]
  return ren.getFees({
    asset: net.asset,
    from: net,
    to: Polygon(chainInstance.provider.provider as any, 'mainnet')
  })
}