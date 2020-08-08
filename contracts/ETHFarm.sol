pragma solidity ^0.6.2;
pragma experimental ABIEncoderV2;

// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

import "./interfaces/IVOT.sol";
import "./interfaces/IProposal.sol";

contract ETHFarm is ReentrancyGuard, Pausable {
    using SafeMath for uint256;
    address public owner;
    IERC20 feth;
    IVOT vot;
    struct Proposal {
        bool status;
        uint256 votes;
        uint256 expired;  //block number
    }
    address[] public proposalIndex;
    uint256 public LOCK_INTERVAL = 120;
    mapping (address => bool) private tempAuth;
    mapping (address => uint256) private freezeAsset; //unfreeze blocknumber;
    mapping (address => Proposal) public proposals;
    event Deposit(address holder, uint256 amount);
    event Withdraw(address holder, uint256 amount);
    event ProposalStatus(address proposalAddr, Proposal proposal);

    modifier onlyOwner() {
        require(owner == msg.sender, "Ownable: caller is not the owner");
        _;
    }
    modifier onlyTempAuth() {
        require(tempAuth[msg.sender], "Ownable: caller is not authorized");
        _;
    }
    constructor(IERC20 ETH, IVOT initVot) public {
        owner = msg.sender;
        feth = ETH;
        vot = initVot;
    }

    //deposit feth
    function deposit(uint256 amountFETH) external nonReentrant whenNotPaused returns (uint256 liquidity) {

        if (vot.totalSupply() == 0) {
            liquidity = amountFETH;
        } else {
            uint256 FETHAmount = feth.balanceOf(address(this));
            uint256 share = amountFETH.mul(1e18).div(FETHAmount);
            liquidity = share.mul(vot.totalSupply()).div(1e18);
        }
        require(feth.transferFrom(msg.sender, address(this), amountFETH), "deposit failed");
        vot.mint(msg.sender, liquidity);
        emit Deposit(msg.sender, amountFETH);
    }
    function withdraw(uint256 amountVOT) external nonReentrant returns (uint256 ethAmount) {
        require(amountVOT <= vot.totalSupply(), "not enouth token to burn");
        uint256 share = amountVOT.mul(1e18).div(vot.totalSupply());
        uint256 FETHAmount = feth.balanceOf(address(this));
        ethAmount = share.mul(FETHAmount).div(1e18);
        vot.burn(msg.sender, amountVOT);
        
        require(feth.transfer(msg.sender, ethAmount), "withdraw failed");
        emit Withdraw(msg.sender, amountVOT);
    }

    function getCurrentRate() external view returns (uint256 currentRate) {
        uint256 share = uint256(1e18).mul(1e18).div(vot.totalSupply());
        uint256 FETHAmount = feth.balanceOf(address(this));
        currentRate = share.mul(FETHAmount).div(1e18);
    }
    //TODO get share amount out
    //TODO vot
    //TODO start and stop
    function vote(address proposal) external nonReentrant returns (bool status, uint256 votes) {
        //TODO get proposal info
        //TODO save info
        require(!proposals[proposal].status, "proposal signed");
        require(proposals[proposal].votes == 0 || proposals[proposal].expired > block.number, "proposal expired");
        
        //vot shouldn't be freezed
        require(!vot.isFreezed(msg.sender), "asset is freezed");

        vot.freeze(msg.sender);
        if (proposals[proposal].votes == 0) {
            proposals[proposal].expired = block.number + vot.freezeInterval();
            proposalIndex.push(proposal);
        }
        proposals[proposal].votes = proposals[proposal].votes.add(vot.balanceOf(msg.sender));
        uint256 share = proposals[proposal].votes.mul(1e18).div(vot.totalSupply()); 

        if (share >= 66e16) {  //approve vote above 66% of total supply VOT

            //open temp auth
            tempAuth[proposal] = true;
            proposals[proposal].status = true;
            //active proposal
            IProposal(proposal).active();
            emit ProposalStatus(proposal, proposals[proposal]);

            //close temp auth
            tempAuth[proposal] = false;
        }
        // status = proposals[proposal].activaty;
        // votes = proposals[proposal].votes;
        //TODO is activated
    }

    function getProposalNumber() external view returns (uint256 length) {
        length = proposalIndex.length;
    }
    function getProposalByIndex(uint256 index) external view returns (address proposal, bool status, uint256 votes, uint256 expired) {
        proposal = proposalIndex[index];
        status = proposals[proposal].status;
        votes = proposals[proposal].votes; 
        expired = proposals[proposal].expired;
    }
    function getProposal(address proposal) external view returns (bool status, uint256 votes, uint256 expired) {
        status = proposals[proposal].status;
        votes = proposals[proposal].votes; 
        expired = proposals[proposal].expired;
    }
    function pause() external onlyTempAuth {
        _pause();
    }
    function unpause() external onlyTempAuth {
        _unpause();
    }
}
