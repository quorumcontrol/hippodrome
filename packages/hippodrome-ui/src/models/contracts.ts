import chainInstance from './chain'
import { wrapContract } from 'kasumah-relay-wrapper/dist/src'
import { UnderwriteableMinter, UnderwriteableMinter__factory } from '../types/ethers-contracts'

export const MINTER_ADDRESSES:Record<string,string> = {
  mumbai: '0xD7bb140b53EB814aa10f051B76B0e5b2458fBcAd',
  matic: '0xD7bb140b53EB814aa10f051B76B0e5b2458fBcAd',
}

export const minter = () => {
  if (!chainInstance.relayer || !chainInstance.signer) {
    throw new Error('missing chain info')
  }
  const minterAddress = MINTER_ADDRESSES[chainInstance.networkName]
  if (!minterAddress) {
    throw new Error(`missing minter address for: ${chainInstance.networkName}`)
  }
  const relayer = chainInstance.relayer
  const minter = UnderwriteableMinter__factory.connect(minterAddress, chainInstance.signer)
  return wrapContract<UnderwriteableMinter>(minter, relayer)
}