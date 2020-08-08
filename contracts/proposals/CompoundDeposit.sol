pragma solidity ^0.6.2;

import "../interfaces/IFarm.sol";
import "../interfaces/ICompound.sol";

contract CompoundDeposit {
    IFarm public farm;
    bool public status;
    string public SUMMARY = "proposal for deposit to compound"; 
    uint256 public INVEST_ETH = 11e15;
    ICompound public cETH;

    constructor(IFarm initFarm, ICompound initCETH) public {
        farm = initFarm;
        cETH = initCETH;
    }

    modifier onlyFarm {
        require(msg.sender == address(farm), "caller is not the farm");
        _;
    }

    function active() external onlyFarm {
        // farm.unpause();
        cETH.mint.value(INVEST_ETH)();
        status = true;
    }
    receive() external payable {}
}