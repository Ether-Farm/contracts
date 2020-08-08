pragma solidity ^0.6.2;

import "../interfaces/IFarm.sol";
import "../interfaces/IFETH.sol";
import "../interfaces/ICompound.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract CompoundDeposit {
    using SafeMath for uint256;

    bool public status;
    uint256 public INVEST_ETH = 11e15;
    string public SUMMARY = "proposal for deposit to compound"; 
    ICompound public cETH;
    IFETH public feth;
    IFarm public farm;

    constructor(IFarm initFarm, IFETH initFETH, ICompound initCETH) public {
        farm = initFarm;
        cETH = initCETH;
        feth = initFETH;
    }

    modifier onlyFarm {
        require(msg.sender == address(farm), "caller is not the farm");
        _;
    }

    function active() external onlyFarm {
        feth.transferFrom(msg.sender, address(this), INVEST_ETH);

        feth.withdrawFETH(INVEST_ETH);
        cETH.mint.value(INVEST_ETH)();
        status = true;
    }
    function getBalance() external view returns (uint256 ethAmount) {
        uint256 cETHAmount = cETH.balanceOf(address(this));
        uint256 rate = cETH.exchangeRateStored();
        ethAmount = address(this).balance.add(cETHAmount.mul(rate).div(1e18));
    } 
    function unActive() external {
        uint256 cETHAmount = cETH.balanceOf(address(this));
        cETH.redeem(cETHAmount);
        payable(address(farm)).send(address(this).balance);
        status = false;
    }
    receive() external payable {}
}