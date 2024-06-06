// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PDBToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("PaulToken", "PDB") {
        _mint(msg.sender, initialSupply);
    }
}

/**
------- before Staking -----
0xPaul -> 3 PDB
0xx
0xHoward -> 4 PDB

------- after Staking -----
0xPaul -> 3 PDB
0xHoward -> 2 PDB

0xStaking -> 2 PDB
 
instead of using ETH, use PDB


e.g. payable only refers to ETH, but we're using PDB token

*/