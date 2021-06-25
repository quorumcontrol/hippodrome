import { expect } from "chai";
import { BigNumber, utils } from "ethers";
import '@nomiclabs/hardhat-ethers'
import { ethers } from "hardhat";
import {
  IERC20__factory,
  UnderwriteableMinter,
  UnderwriteableMinter__factory,
  GatewayFactory__factory,
  BasicAdapter__factory,
  GatewayRegistry,
  GatewayRegistry__factory,
} from "../types/ethers-contracts";
// RenJS imports
import { MockProvider, MockChain } from "@renproject/mock-provider";
import RenJS from "@renproject/ren";
import { RenVMProvider } from "@renproject/rpc/build/main/v2";
import { Ethereum, EthereumConfig } from "@renproject/chains-ethereum";

describe("UnderwriteableMinter", async () => {
  let minter: UnderwriteableMinter;
  let Bitcoin: MockChain;
  let renJS: RenJS;
  let network: EthereumConfig;
  let registry: GatewayRegistry

  before(async () => {
    const [deployer, user] = await ethers.getSigners();

    const mockRenVMProvider = new MockProvider();
    renJS = new RenJS(new RenVMProvider("testnet", mockRenVMProvider));

    // Set up mock Bitcoin chain.
    Bitcoin = new MockChain();
    mockRenVMProvider.registerChain(Bitcoin);
    // Get mint authority from mock provider.
    const mintAuthority = mockRenVMProvider.mintAuthority();
    // Deploy Gateway Factory.
    const gatewayFactory = await new GatewayFactory__factory(deployer).deploy(
      mintAuthority,
      "Ethereum"
    );

    const gatewayRegistryAddress = await gatewayFactory.registry();
    registry = GatewayRegistry__factory.connect(gatewayRegistryAddress, deployer)
    // Deploy BTC and ZEC tokens and gateways.
    await gatewayFactory.addToken("Bitcoin", "BTC", 8);

    const basicAdapter = await new BasicAdapter__factory(deployer).deploy(
      gatewayRegistryAddress
    );
    // Set up Ethereum network config.
    const providerNetwork = await user.provider?.getNetwork();
    const networkID = providerNetwork ? providerNetwork.chainId : 0;
    network = LocalEthereumNetwork(
      networkID,
      gatewayRegistryAddress,
      basicAdapter.address
    );

    const underwriteableMinterFactory = (await ethers.getContractFactory(
      "UnderwriteableMinter"
    )) as UnderwriteableMinter__factory;
    minter = await underwriteableMinterFactory.deploy(
      gatewayRegistryAddress
    );
    await minter.deployed();
  });

  it("mints", async () => {
    const [_, user] = await ethers.getSigners();

    const nonce = utils.keccak256(Buffer.from("1"));

    const amount = BigNumber.from(10).pow(Bitcoin.assetDecimals(Bitcoin.asset).toString()); // should be "1"

    // MockProvider doesn't yet return fee details.
    const fixedFee = 1000; // sats
    const percentFee = 15; // BIPS
    const mint = await renJS.lockAndMint({
      // Send BTC from the Bitcoin blockchain to the Ethereum blockchain.
      asset: "BTC", // `bitcoin.asset`
      from: Bitcoin,
      // If you change this to another chain, you also have to change the
      // chain name passed to `gatewayFactory` above.
      to: Ethereum(user.provider! as any, user, network).Contract({
        // The contract we want to interact with
        sendTo: minter.address,

        // The name of the function we want to call
        contractFn: "temporaryMint",

        // Arguments expected for calling `deposit`
        contractParams: [
          {
            name: "to",
            type: "address",
            value: user.address,
          },
          {
            name: "nonce",
            type: "bytes32",
            value: nonce,
          },
        ],
      }),
    });

    Bitcoin.addUTXO(mint.gatewayAddress!, amount.toNumber());

    // Process the deposit, including the mint step.
    await new Promise<void>((resolve, reject) => {
      mint.on("deposit", async deposit => {
        try {
          await deposit.confirmed();
          await deposit.signed();
          
          const tx = await deposit.queryTx()
          if (tx.out && !tx.out.revert) {
            await minter.temporaryMint(user.address, nonce, 'BTC', BigNumber.from(tx.out.amount.toString()), tx.out.nhash, tx.out.signature!)
          } else {
            throw new Error('revert was present on the out')
          }

          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });

    const tokenAddr = await registry.getTokenBySymbol('BTC')
    const token = IERC20__factory.connect(tokenAddr, user)
    const bal = await token.balanceOf(user.address)
    expect(bal.toString()).to.equal(amount.sub(fixedFee).mul(10000 - percentFee).div(10000).add(1).toString())
  }).timeout(120000);
});

const LocalEthereumNetwork = (
  networkID: number,
  gatewayRegistry: string,
  basicAdapter: string
) => ({
  name: "hardhat",
  chain: "hardhat",
  chainLabel: "Hardhat",
  isTestnet: true,
  networkID,
  infura: "",
  etherscan: "",
  addresses: {
    GatewayRegistry: gatewayRegistry,
    BasicAdapter: basicAdapter,
  },
});
