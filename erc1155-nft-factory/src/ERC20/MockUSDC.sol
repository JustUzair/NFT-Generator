// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    address public s_owner;
    uint8 public immutable i_decimals;

    constructor(uint8 _decimals) ERC20("USD Coin", "USDC") {
        s_owner = msg.sender;
        i_decimals = _decimals;
        _mint(msg.sender, 1000000 * 10 ** i_decimals);
    }

    function mint(address recipient, uint256 amount) public {
        require(msg.sender == s_owner, "only owner can mint");
        _mint(recipient, amount);
    }

    function faucet() public {
        _mint(msg.sender, 1000 * 10 ** i_decimals);
    }
}
