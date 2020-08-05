pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";

contract ETHFarm is ERC20, ReentrancyGuard, Pausable {
    using SafeMath for uint256;
    address owner;
    uint public constant MINIMUM_LIQUIDITY = 10**3;
    IERC20 FETH;

    event Deposit(address holder, uint256 amount);
    event Withdraw(address holder, uint256 amount);

    modifier onlyOwner {
        require(owner == msg.sender, "Ownable: caller is not the owner");
        _;
    }
    constructor(IERC20 ETH) public ERC20("ETH farm", "VOT") {
        owner = msg.sender;
        FETH = ETH;
    }
    function mint(address receptor, uint256 amount) external onlyOwner {
        _mint(receptor, amount);
    }
    function deposit(uint256 amountFETH) external nonReentrant whenNotPaused returns (uint256 liquidity) {
        //deposit FETH
        require(FETH.transferFrom(msg.sender, address(this), amountFETH), "deposit failed");

        if (totalSupply() == 0) {
            liquidity = amountFETH;
        } else {
            uint256 share = amountFETH.mul(1e18).div(address(this).balance);
            liquidity = share.mul(totalSupply()).div(1e18);
        }
        _mint(msg.sender, liquidity);
        emit Deposit(msg.sender, amountFETH);
    }
    function withdraw(uint256 amountVOT) external nonReentrant returns (uint256 ethAmount) {
        require(amountVOT <= totalSupply(), "not enouth token to burn");
        _burn(msg.sender, amountVOT);
        uint256 share = amountVOT.mul(1e18).div(totalSupply());
        ethAmount = share.mul(address(this).balance).div(1e18);
        require(FETH.transfer(msg.sender, ethAmount), "withdraw failed");
        emit Withdraw(msg.sender, amountVOT);
    }
    //TODO vot
    //TODO start and stop

}
