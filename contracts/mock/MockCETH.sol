pragma solidity ^0.6.2;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockCETH is ERC20 {
    
    using SafeMath for uint256;

    uint256 rate = 11e17;

    constructor() public ERC20('Compound Ether', 'cETH') {

	}
    // function liquidateBorrow(address _borrower, address _cTokenCollateral) external payable {
    //     require(msg.value != 0);
    //     _mint(msg.sender, msg.value.mul(1e18).div(rate));
    // }
    function mint() external payable {
        _mint(msg.sender, msg.value.mul(1e18).div(rate));
    }
    // function redeem(uint redeemTokens) external returns (uint) {
    //     // IERC20(address(this)).transferFrom(msg.sender, address(this), redeemTokens);
    //     _burn(msg.sender, redeemTokens);
    //     msg.sender.transfer(redeemTokens.mul(rate).div(1e18));
    //     return 0;
    // }
    // function () external payable {}
}
