import { BigNumber, utils } from "ethers"
import { tokenListTokensByAddress } from "./tokenList"

type Address = string

export enum PoolTypes {
  cometh,
  curve
}

const poolTypeToHumanName = {
  [PoolTypes.cometh]: "Cometh Swap",
  [PoolTypes.curve]: "Curve"
}

interface PoolOptions {
  type: PoolTypes,
  poolAddress: Address,
  token0: Address,
  token1: Address,
  rewardToken?: Address,
  weeklyReward?: BigNumber
  successUrl: string
}

const wptgRenDogePool: PoolOptions = {
  type: PoolTypes.cometh,
  poolAddress: '0x476278f883003862b374f22a7604e60f5643d647', // https://charts.cometh.io/pair/0x476278f883003862b374f22a7604e60f5643d647
  token0: '0xc0f14c88250e680ecd70224b7fba82b7c6560d12', // wPTG
  token1: '0xcE829A89d4A55a63418bcC43F00145adef0eDB8E', // renDOGE
  rewardToken: '0xc0f14c88250e680ecd70224b7fba82b7c6560d12',
  weeklyReward: utils.parseEther('1000000'),
  successUrl: 'https://swap.cometh.io/#/stake',
}

const curveRenBTCamWbtc: PoolOptions = {
  type: PoolTypes.curve,
  poolAddress: '0xC2d95EEF97Ec6C17551d45e77B590dc1F9117C67', // https://polygonscan.com/address/0xC2d95EEF97Ec6C17551d45e77B590dc1F9117C67#code
  token0: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', // WBTC
  token1: '0xDBf31dF14B66535aF65AaC99C32e9eA844e14501', // renBTC
  // rewardToken: '0xc0f14c88250e680ecd70224b7fba82b7c6560d12',
  // weeklyReward: utils.parseEther('1000000'),
  successUrl: 'https://polygon.curve.fi/ren',
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
  wptgRenDogePool,
].map((opts) => new Pool(opts))