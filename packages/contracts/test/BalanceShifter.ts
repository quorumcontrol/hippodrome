import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signers'
import { expect } from 'chai'
import { constants, utils } from 'ethers'
import { ethers, network } from 'hardhat'
import { BalanceShifter, BalanceShifter__factory, RenERC20LogicV1__factory } from '../types/ethers-contracts'

const vitalikAddress = '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B'
const fraudSHIBAddr = '0x93ebbd61b01a687ed5a51da9bdc08609490cb631' // a totally fake SHIB INU designed to scam folks I guess?

describe('BalanceShifter', () => {
  let shifter:BalanceShifter
  let vitalik:SignerWithAddress

  beforeEach(async () => {
    let [deployer] = await ethers.getSigners()
    
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [vitalikAddress]}
    )

    vitalik = await ethers.getSigner(vitalikAddress)

    await deployer.sendTransaction({
      to: vitalik.address,
      value: utils.parseEther('100') // give poor, poor vitalik a little matic
    })

    const shifterFactory = await ethers.getContractFactory('BalanceShifter') as BalanceShifter__factory
    shifter = await shifterFactory.deploy()
    await shifter.deployed()
  })

  it('shifts', async () => {
    let [alice] = await ethers.getSigners()
    
    const token = RenERC20LogicV1__factory.connect(fraudSHIBAddr, vitalik)
    const vitalikBalance = await token.balanceOf(vitalik.address)
    await token.approve(shifter.address, constants.MaxUint256)
    await shifter.connect(vitalik).shift([fraudSHIBAddr], vitalik.address, alice.address)
    expect((await token.balanceOf(alice.address)).toString()).to.equal(vitalikBalance.toString())
  })

})