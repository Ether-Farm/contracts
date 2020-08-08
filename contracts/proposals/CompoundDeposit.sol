pragma solidity ^0.6.2;
import "../interfaces/IFarm.sol";

contract CompoundDeposit {
    IFarm public farm;
    bool public status;
    uint256 public investETH = 1e16;
    // address public cETH = address("0xbe839b6d93e3ea47effcca1f27841c917a8794f3");

    constructor(IFarm initFarm) public {
        farm = initFarm;
    }

    modifier onlyFarm {
        require(msg.sender == address(farm), "caller is not the farm");
        _;
    }

    function active() external onlyFarm {
        // farm.unpause();
        status = true;
    }
}