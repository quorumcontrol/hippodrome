import "@nomiclabs/hardhat-ethers"
import { HardhatUserConfig } from "hardhat/config"
import 'hardhat-deploy';
import { NetworkUserConfig } from "hardhat/types";
import dotenv from 'dotenv'

dotenv.config()

// these tasks rely on types, which require a compile, but
// at initial install the types aren't there and so you can't compile.
// this lets a first run happen.
if (!process.env.FIRST_RUN) {
  //todo load tasks hre
}

let networks:{[key:string]:NetworkUserConfig} = {}

networks['hardhat'] = {
  forking: {
    url: `https://polygon-mumbai.infura.io/v3/419395b72785472bb0ee52583b7b4abd`,
  },
  allowUnlimitedContractSize: true,
}

networks['mumbai'] = {
  url: 'https://polygon-mumbai.infura.io/v3/419395b72785472bb0ee52583b7b4abd',
  chainId: 80001
}

networks['matic'] = {
  url: 'https://mainnet.infura.io/v3/419395b72785472bb0ee52583b7b4abd',
  chainId: 137
}

if (process.env.DEPLOYER_PRIVATE_KEY) {
  networks['mumbai'].accounts = [process.env.DEPLOYER_PRIVATE_KEY]
  networks['matic'].accounts = [process.env.DEPLOYER_PRIVATE_KEY]
}

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
