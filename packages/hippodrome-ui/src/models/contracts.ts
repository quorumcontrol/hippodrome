import chainInstance from './chain'
import { wrapContract } from 'kasumah-relay-wrapper/dist/src'
import { UnderwriteableMinter, UnderwriteableMinter__factory } from '../types/ethers-contracts'
import { BalanceShifter__factory } from '../types/ethers-contracts/factories/BalanceShifter__factory'
import { BalanceShifter } from '../types/ethers-contracts/BalanceShifter'

export const MINTER_ADDRESS = '0xD7bb140b53EB814aa10f051B76B0e5b2458fBcAd'
export const BALANCE_SHIFTER_ADDRESS = '0x4cEAD3Fe4994f6a01d1c24E8C96843c6Dc7ceD5d'

export const minter = () => {
  if (!chainInstance.relayer || !chainInstance.signer) {
    throw new Error('missing chain info')
  }

  const relayer = chainInstance.relayer
  const minter = UnderwriteableMinter__factory.connect(MINTER_ADDRESS, chainInstance.signer)
  return wrapContract<UnderwriteableMinter>(minter, relayer)
}

export const balanceShifter = () => {
  if (!chainInstance.relayer || !chainInstance.signer) {
    throw new Error('missing chain info')
  }

  const relayer = chainInstance.relayer
  const shifter = BalanceShifter__factory.connect(BALANCE_SHIFTER_ADDRESS, chainInstance.signer)
  return wrapContract<BalanceShifter>(shifter, relayer)
}
