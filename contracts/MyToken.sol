// contracts/MyToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.5.5;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";

contract MyToken is ERC20, Ownable {
    string public name = "MyToken";
    string public symbol = "MTK";
    uint8 public decimals = 18;

    constructor(uint256 initialSupply) public {
        _mint(msg.sender, initialSupply);
    }
}


