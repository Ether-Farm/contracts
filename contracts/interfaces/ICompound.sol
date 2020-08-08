pragma solidity ^0.6.2;

interface ICompound {
    function mint() external payable;
    // function redeem(uint redeemTokens) external returns (uint);
}