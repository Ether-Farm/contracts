pragma solidity ^0.6.2;

interface ICompound {
    function mint() external payable;
    function exchangeRateStored() external view returns (uint256);
    function redeem(uint256 redeemAmount) external returns (uint256);
    function balanceOf(address owner) external view returns (uint256);
    
}