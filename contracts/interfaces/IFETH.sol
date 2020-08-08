pragma solidity ^0.6.2;

interface IFETH {
   function mint(address holder, uint256 amount) external;
   function burn(address holder, uint256 amount) external;
   function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
   function withdrawFETH(uint256 amount) external returns(uint);
}