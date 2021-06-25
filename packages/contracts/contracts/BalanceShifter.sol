// SPDX-License-Identifier: MIT
pragma solidity ^0.8.5;

interface IShiftableERC20 {
    function balanceOf(address account) external view returns (uint256);
     function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);
}

/**
Balance shifter takes any ERC20 addresses and shifts the total balances over to a new address.
Useful for when you don't know the balance before executing a transaction.
 */
contract BalanceShifter {

  function shift(address[] calldata tokens, address from, address to) public returns (bool) {
    require(from == msg.sender, 'may only transfer your own tokens');
    
    for(uint i; i < tokens.length; i++) {
      IShiftableERC20 token = IShiftableERC20(tokens[i]);
      require(token.transferFrom(from, to, token.balanceOf(from)), 'failed transfer');
    }
    return true;
  }

}