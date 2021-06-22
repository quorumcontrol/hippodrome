import "@nomiclabs/hardhat-waffle"
import "@nomiclabs/hardhat-ethers"
import { HardhatUserConfig } from "hardhat/config"
import 'hardhat-deploy';
import { NetworkUserConfig } from "hardhat/types";
import fs from 'fs'

// these tasks rely on types, which require a compile, but
// at initial install the types aren't there and so you can't compile.
// this lets a first run happen.
if (!process.env.FIRST_RUN) {
  //todo load tasks hre
}

interface NetworkSecrets {
  privateKey: string
}

let secrets:{[key:string]:NetworkSecrets} = {}

if (fs.existsSync('./secrets.json')) {
  secrets = JSON.parse(fs.readFileSync('./secrets.json').toString())
}

let networks:{[key:string]:NetworkUserConfig} = {}

networks['hardhat'] = {
  // forking: {
  //   // url: `https://rpc-mainnet.matic.network`,
  //   url: `https://rpc-mainnet.maticvigil.com/v1/c0ce8ac6dcee6f838f2d4cf83d16b6ca1493aa0b`,
  // },
  allowUnlimitedContractSize: true,
}

networks['mumbai'] = {
  // url: 'https://rpc-mumbai.maticvigil.com/v1/c0ce8ac6dcee6f838f2d4cf83d16b6ca1493aa0b',
  url: 'https://rpc-mumbai.matic.today',
  chainId: 80001,
}

networks['matic'] = {
  // url: 'https://rpc-mainnet.maticvigil.com/v1/c0ce8ac6dcee6f838f2d4cf83d16b6ca1493aa0b',
  url: 'https://rpc-mainnet.matic.network',
  chainId: 137,
}

if (secrets['80001']) {
  networks['mumbai'].accounts = [secrets['80001'].privateKey]
}

if (secrets['137']) {
  networks['matic'].accounts = [secrets['137'].privateKey]
}

// Enable this to turn on logging while running the tests
// networks['hardhat'] = {
//   loggingEnabled: true,
// }

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  namedAccounts: {
    deployer: {
      default: 0,
    },
    alice: {
      default: 2,
    }
  },
  solidity: {
    compilers: [
      {
        version: "0.8.5",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks,
};
export default config;
