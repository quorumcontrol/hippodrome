import { task } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import { RenERC20LogicV1__factory } from "../types/ethers-contracts";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const tokenBalance = async (
  hre: HardhatRuntimeEnvironment,
  tokenAddress: string,
  userAddress: string
) => {
  const token = RenERC20LogicV1__factory.connect(
    tokenAddress,
    hre.ethers.provider
  );
  return token.balanceOf(userAddress);
};

task("doge-balance", "doge balance")
  .addParam("address", "the user address")
  .setAction(async ({ address }, hre) => {
    const balance = await tokenBalance(
      hre,
      "0xcE829A89d4A55a63418bcC43F00145adef0eDB8E",
      address
    );
    console.log(balance.toNumber() / 10 ** 8);
  });

task("token-balance", "token balance")
  .addParam("tokenAddress", "the address of the ERC20 token")
  .addParam("userAddress", "the address of the EOA or contract with balance")
  .setAction(async ({ tokenAddress, userAddress }, hre) => {
    const balance = await tokenBalance(hre, tokenAddress, userAddress);
    console.log(balance.toString());
  });
