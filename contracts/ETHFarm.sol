// SPDX-License-Identifier: MIT
pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-ethereum-package/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/utils/Pausable.sol";

// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts/math/SafeMath.sol";
// import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
// import "@openzeppelin/contracts/utils/Pausable.sol";

contract ETHFarm is Initializable, ERC20, ReentrancyGuard, Pausable {
    using SafeMath for uint256;
    address public owner;
    uint public constant MINIMUM_LIQUIDITY = 10**3;
    IERC20 FETH;
    struct Proposal {
        bool status;
        uint256 votes;
        uint256 expired;  //block number
    }
    uint256 public LOCK_INTERVAL = 120;
    mapping (address => uint256) private freezeAsset; //unfreeze blocknumber;
    mapping (address => Proposal) public proposals;
    event Deposit(address holder, uint256 amount);
    event Withdraw(address holder, uint256 amount);
    event ProposalStatus(address proposalAddr, Proposal proposal);

    modifier onlyOwner {
        require(owner == msg.sender, "Ownable: caller is not the owner");
        _;
    }
    // constructor(IERC20 ETH) public ERC20("ETH farm", "VOT") {
    //     owner = msg.sender;
    //     FETH = ETH;
    // }
    function initialize(IERC20 ETH) public initializer {
        ERC20.initialize("ETH farm", "VOT");
        owner = msg.sender;
        FETH = ETH;     
    }

    function mint(address receptor, uint256 amount) external onlyOwner {
        _mint(receptor, amount);
    }
    //deposit FETH
    function deposit(uint256 amountFETH) external nonReentrant returns (uint256 liquidity) {

        if (totalSupply() == 0) {
            liquidity = amountFETH;
        } else {
            uint256 FETHAmount = FETH.balanceOf(address(this));
            uint256 share = amountFETH.mul(1e18).div(FETHAmount);
            liquidity = share.mul(totalSupply()).div(1e18);
        }
        require(FETH.transferFrom(msg.sender, address(this), amountFETH), "deposit failed");
        _mint(msg.sender, liquidity);
        emit Deposit(msg.sender, amountFETH);
    }
    function withdraw(uint256 amountVOT) external nonReentrant returns (uint256 ethAmount) {
        require(amountVOT <= totalSupply(), "not enouth token to burn");
        uint256 share = amountVOT.mul(1e18).div(totalSupply());
        uint256 FETHAmount = FETH.balanceOf(address(this));
        ethAmount = share.mul(FETHAmount).div(1e18);
        _burn(msg.sender, amountVOT);
        
        require(FETH.transfer(msg.sender, ethAmount), "withdraw failed");
        emit Withdraw(msg.sender, amountVOT);
    }
    function isFreezed() external view returns (bool freezed) {
       return  block.number < freezeAsset[msg.sender];
    }
    function getCurrentRate() external view returns (uint256 currentRate) {
        uint256 share = uint256(1e18).mul(1e18).div(totalSupply());
        uint256 FETHAmount = FETH.balanceOf(address(this));
        currentRate = share.mul(FETHAmount).div(1e18);
    }
    //TODO get share amount out
    //TODO vot
    //TODO start and stop
    function vote(address proposal) external returns (bool status, uint256 votes) {
        //TODO get proposal info

        //TODO save info

        require(!proposals[proposal].status, "proposal signed");
        //TODO 是否过期

        //TODO freeze token
        require(block.number >= freezeAsset[msg.sender], "asset is freezed");
        freezeAsset[msg.sender] = block.number + LOCK_INTERVAL;

        proposals[proposal].votes = proposals[proposal].votes.add(balanceOf(msg.sender));
        uint256 share = proposals[proposal].votes.mul(1e18).div(totalSupply()); 

        if (share >= 66e16) {  //approve vote above 66% of total supply VOT
        //临时授权
            proposals[proposal].status = true;
            emit ProposalStatus(proposal, proposals[proposal]);

        //关闭临时授权
        }
        // status = proposals[proposal].activaty;
        // votes = proposals[proposal].votes;
        //TODO is activated
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override {
        require(block.number >= freezeAsset[msg.sender], "asset is freezed");
    }


    function getProposal(address proposal) external view returns (bool status, uint256 votes) {
       status = proposals[proposal].status;
       votes = proposals[proposal].votes; 
    }
    function pause() external {
        // require(proposals[proposal].activaty, "unactivated proposal");
        _pause();
    }
    function unpause() external {
        // require(proposals[proposal].activaty, "unactivated proposal");
        _unpause();
    }
}
