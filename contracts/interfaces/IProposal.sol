pragma solidity ^0.6.2;

interface IProposal {
    function active() external;
    function unActive() external;
    function INVEST_ETH() external view returns (uint256);
    function getBalance() external view returns (uint256); 
}