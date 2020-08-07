// SPDX-License-Identifier: MIT
pragma solidity ^0.6.8;
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol";


contract MyToken is ERC20 {
    constructor() public ERC20("My Token", "MYT") {
        _mint(msg.sender, 1000);
    }
}
