pragma solidity ^0.6.8;
import "../interfaces/IFarm.sol";

contract Pause {
    IFarm immutable public FARM;
    bool status;
    
    constructor(IFarm farm) public {
        FARM = farm;
    }

    modifier onlyFarm {
        require(msg.sender == address(FARM));
        _;
    }

    function active() external onlyFarm returns (bool status){
        FARM.pause();
        status = true;
    }
}