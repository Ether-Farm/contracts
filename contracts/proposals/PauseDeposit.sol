pragma solidity ^0.6.2;
import "../interfaces/IFarm.sol";

contract PauseDeposit {
    IFarm public farm;
    bool public status;
    string public SUMMARY = "proposal for pause farm deposit"; 
    uint256 public INVEST_ETH = 0;

    constructor(IFarm initFarm) public {
        farm = initFarm;
    }

    modifier onlyFarm {
        require(msg.sender == address(farm), "caller is not the farm");
        _;
    }

    function getBalance() external view returns (uint256 ethAmount) {
        ethAmount = 0;   
    }
    function active() external onlyFarm {
        farm.pause();
        status = true;
    }

    function unActive() external onlyFarm {
        farm.unpause();
        status = false;
    }
}