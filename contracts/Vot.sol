pragma solidity ^0.6.2;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract Vot is ERC20, Ownable {
    uint256 private freeze_interval = 120;

    address public farm;
    mapping (address => uint256) private freezeAsset; //unfreeze blocknumber;

    event Farm(address farmAddr);

    modifier onlyFarm() {
        require(msg.sender == farm, "caller is not the farm");
        _;
    }

    modifier onlyFarmOrOwner() {
        require(msg.sender == farm || msg.sender == owner(), "caller is not the farm or owner");
        _;
    }
    constructor() public ERC20("Vote", "VOT") {}

    function setFarm(address farmAddr) external onlyOwner {
        farm = farmAddr;
        emit Farm(farm);
    }

    function mint(address holder, uint256 amount) external onlyFarm {
        _mint(holder, amount);
    }

    function burn(address holder, uint256 amount) external onlyFarm {
        _burn(holder, amount);
    }

    function freeze(address holder) external onlyFarm {
        freezeAsset[holder] = block.number + freeze_interval; 
    }

    function isFreezed(address holder) external view returns (bool freezed) {
       freezed = block.number < freezeAsset[holder];
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override {
        require(block.number >= freezeAsset[from], "asset is freezed");
    }

    function setFreezeInterval(uint256 interval) external onlyFarmOrOwner {
        require(interval <= 240);
        require(interval >= 5);
        freeze_interval = interval;
    }
    function freezeInterval() external view returns (uint256 interval){
        interval = freeze_interval;
    }
}
