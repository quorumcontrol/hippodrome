import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { utils } from 'ethers'

const SHARED_LOCAL_DEV_ADDR = '0x946c516F181A55032BBB0d04749AF5cffCAdB981'

const func: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
  if (!hre.network.live) {
    //local dev
    const signers = await hre.ethers.getSigners()
    // console.log(utils.formatEther((await signers[0].getBalance())))
    // return
    const tx = await signers[0].sendTransaction({
      to: SHARED_LOCAL_DEV_ADDR,
      value: utils.parseEther('100'),
      gasLimit: 100000
    })

    await tx.wait()

    console.log(`sent 100 matic to ${SHARED_LOCAL_DEV_ADDR}`, tx.hash)
  }
}
export default func
