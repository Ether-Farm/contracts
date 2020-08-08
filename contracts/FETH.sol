pragma solidity ^0.6.2;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract FETH is ERC20 {
    address public owner;

    event AirDrop(address receptor, address token, uint256 amount);
    event AirDropETH(address receptor, uint256 amount);
    event WithDraw(address receiver, uint256 amount);

    modifier onlyOwner {
        require(owner == msg.sender, "Ownable: caller is not the owner");
        _;
    }
    constructor() public ERC20("fake eth", "FETH") {
        owner = msg.sender;
    }
    //airDrop token
    function airdrop(address[] calldata receptors, address token, uint256 amount) external onlyOwner {
        for (uint i = 0; i < receptors.length; i++) {
            if (token != address(this)) {
                //airDrop token
                ERC20(token).transferFrom(msg.sender, receptors[i], amount);
            } else {
                //airDrop self
                _mint(receptors[i], amount);
            }

            emit AirDrop(receptors[i], token, amount);
        }
    }
    //airdrop eth
	function airdropETH(address[] calldata receptors, uint256 amount) external payable onlyOwner returns(bool) {
        require(amount * receptors.length <= msg.value, "Insufficient balance");

        for (uint i = 0; i < receptors.length; i++) {
            payable(receptors[i]).transfer(amount);
            emit AirDropETH(receptors[i], amount);
        }
        return true;
	}
    //withdraw eth
    function withdraw() external onlyOwner returns(uint) {
        payable(owner).transfer(address(this).balance);
        emit WithDraw(owner, address(this).balance);
    }
    function withdrawFETH(uint256 amount) external returns(uint) {
        _burn(msg.sender, amount);
        payable(msg.sender).transfer(amount);
        emit WithDraw(owner, amount);
    }
    receive() external payable {}
}
