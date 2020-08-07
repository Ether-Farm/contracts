
pragma solidity ^0.6.2;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract XToken is ERC20 {
	mapping (address => uint) balances;

	event Transfer(address indexed _from, address indexed _to, uint256 _value);

    constructor() public ERC20('X Token', 'XTO') {
        _mint(msg.sender, 100000000000000000000);
    }
}
