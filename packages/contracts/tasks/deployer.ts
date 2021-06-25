import { task } from 'hardhat/config'
import 'hardhat-deploy'
import { utils } from 'ethers'

task('deployer-address', 'spit out the address of the deployer named signer')
  .setAction(async (_, hre) => {
    const addrs = await hre.getNamedAccounts()
    console.log('address: ', addrs.deployer)
  })

task('send-matic', 'this is only really good for test, but sends matic')
  .addParam('to', 'where to send')
  .addParam('amount', 'how much to send')
  .setAction(async ({ to, amount }, hre) => {
    const signers = await hre.ethers.getSigners()
    // console.log(utils.formatEther((await signers[0].getBalance())))
    // return
    const tx = await signers[0].sendTransaction({
      to: to,
      value: utils.parseEther(amount),
      gasLimit: 100000
    })

    await tx.wait()

    console.log('sent: ', tx.hash)
  })