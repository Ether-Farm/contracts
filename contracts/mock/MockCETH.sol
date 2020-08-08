pragma solidity ^0.6.2;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockCETH is ERC20 {
    
    using SafeMath for uint256;

    uint256 public rate = 200329133933024042650566639;

    constructor() public ERC20('Compound Ether', 'cETH') {
        _setupDecimals(8);
	}
    // function liquidateBorrow(address _borrower, address _cTokenCollateral) external payable {
    //     require(msg.value != 0);
    //     _mint(msg.sender, msg.value.mul(1e18).div(rate));
    // }
    function mint() external payable {
        _mint(msg.sender, msg.value.mul(1e18).div(rate));
    }
    function exchangeRateStored() public view returns (uint256 currentRate) {
        currentRate = rate;
    }
    function redeem(uint redeemAmount) external returns (uint) {
        _burn(msg.sender, redeemAmount);
        msg.sender.transfer(redeemAmount.mul(rate).div(1e18));
        return 0;
    }
    // function () external payable {}
}
