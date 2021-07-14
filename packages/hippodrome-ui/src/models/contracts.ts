import chainInstance, { IChain } from './chain'
import { wrapContract } from 'kasumah-relay-wrapper/dist/src'
import { UnderwriteableMinter, UnderwriteableMinter__factory, UniswapV2Router02__factory } from '../types/ethers-contracts'
import { BalanceShifter__factory } from '../types/ethers-contracts/factories/BalanceShifter__factory'
import { BalanceShifter } from '../types/ethers-contracts/BalanceShifter'

export const MINTER_ADDRESS = '0xD7bb140b53EB814aa10f051B76B0e5b2458fBcAd'
export const BALANCE_SHIFTER_ADDRESS = '0x4cEAD3Fe4994f6a01d1c24E8C96843c6Dc7ceD5d'

export const SUSHI_ROUTER_ADDRESS = '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506'
export const COMETH_ROUTER_ADDRESS = "0x93bcDc45f7e62f89a8e901DC4A0E2c6C427D9F25"

export const minter = (chain:IChain) => {
  if (!chain.relayer || !chain.signer) {
    throw new Error('missing chain info')
  }

  const { relayer, signer } = chain
  const minter = UnderwriteableMinter__factory.connect(MINTER_ADDRESS, signer)
  return wrapContract<UnderwriteableMinter>(minter, relayer)
}

export const balanceShifter = (chain:IChain) => {
  if (!chain.relayer || !chain.signer) {
    throw new Error('missing chain info')
  }

  const { relayer, signer } = chain
  const shifter = BalanceShifter__factory.connect(BALANCE_SHIFTER_ADDRESS, signer)
  return wrapContract<BalanceShifter>(shifter, relayer)
}

export const poolRouter = (routerAddress: string) => {
  if (!chainInstance.signer) {
    throw new Error('missing chain info')
  }

  return UniswapV2Router02__factory.connect(routerAddress, chainInstance.signer)
}