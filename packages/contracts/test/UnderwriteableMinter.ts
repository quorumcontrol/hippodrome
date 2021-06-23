import { expect } from 'chai'
import { utils } from 'ethers'
import { ethers } from 'hardhat'
import { IGatewayRegistry__factory, UnderwriteableMinter, UnderwriteableMinter__factory } from '../types/ethers-contracts'

describe('UnderwriteableMinter', async () => {
  let minter:UnderwriteableMinter

  before(async () => {
    const underwriteableMinterFactory = await ethers.getContractFactory('UnderwriteableMinter') as UnderwriteableMinter__factory
    minter = await underwriteableMinterFactory.deploy('0xD881213F5ABF783d93220e6bD3Cc21706A8dc1fC') // mumbai gateway registry
    await minter.deployed()
  })

  it('mints', async () => {
    await minter.temporaryMint(
      '0xa2f996446955ef3aa3297f82978c66d3cc833b71',
      utils.keccak256(Buffer.from('39')),
      'BTC',
      '9186',
      '0x0d589198b9e0cd1a5a414a487ac0ad9143451b2bb56f091a85fe8f3119652b37',
      '0x6953730e419852b8e9f698f285e9f0f58f2f04cbd7596b12de6bd4c8bdf12def32e493de7ed8f4149d35369320121074eb77360a6220e398e4af478711d7ec0d1b'
    )
  })
})