import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

// see https://github.com/renproject/ren-js/blob/f06622ecbb5e2b6134709fff71431e8f537f5a8d/packages/lib/chains/chains-ethereum/src/polygon.ts#L24
const gatewayRegistryAddresses:Record<string,string> = {
  mumbai: '0xD881213F5ABF783d93220e6bD3Cc21706A8dc1fC',
  matic: '0x21C482f153D0317fe85C60bE1F7fa079019fcEbD'
}

// localhost we use mainnet
gatewayRegistryAddresses.hardhat = gatewayRegistryAddresses.matic

const func: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments
  const { deployer } = await hre.getNamedAccounts()

  const networkName = hre.network.name
  console.log('network name: ', networkName)
  if (!gatewayRegistryAddresses[networkName]) {
    throw new Error('no gatewayRegistryAddress stored for ' + networkName)
  }

  await deploy('UnderwriteableMinter', {
    from: deployer,
    log: true,
    args: [gatewayRegistryAddresses[networkName]]
  })
}
export default func
