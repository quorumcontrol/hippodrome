import { BigNumber, utils } from "ethers"
import { tokenListTokensByAddress } from "./tokenList"

type Address = string

export enum PoolTypes {
  cometh
}

const poolTypeToHumanName = {
  [PoolTypes.cometh]: "Cometh Swap"
}

interface PoolOptions {
  type: PoolTypes,
  poolAddress: Address,
  token0: Address,
  token1: Address,
  rewardToken: Address,
  weeklyReward: BigNumber
  successUrl: string
}

const wptgRenDogePool: PoolOptions = {
  type: PoolTypes.cometh,
  poolAddress: '0x476278f883003862b374f22a7604e60f5643d647', // https://charts.cometh.io/pair/0x476278f883003862b374f22a7604e60f5643d647
  token0: '0xc0f14c88250e680ecd70224b7fba82b7c6560d12',
  token1: '0xcE829A89d4A55a63418bcC43F00145adef0eDB8E',
  rewardToken: '0xc0f14c88250e680ecd70224b7fba82b7c6560d12',
  weeklyReward: utils.parseEther('1000000'),
  successUrl: 'https://swap.cometh.io/#/stake',
}

export class Pool {
  options: PoolOptions
  
  constructor(opts: PoolOptions) {
    this.options = opts
  }

  pairName() {
    return `${this.token0().name}/${this.token1().name}`
  }

  typeName() {
    return poolTypeToHumanName[this.options.type]
  }

  token0() {
    return tokenListTokensByAddress[this.options.token0.toLowerCase()]
  }

  token1() {
    return tokenListTokensByAddress[this.options.token1.toLowerCase()]
  }
}

export const pools = [
  wptgRenDogePool
].map((opts) => new Pool(opts))