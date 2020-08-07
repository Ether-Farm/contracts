pragma solidity ^0.6.2;

interface IVOT {
   function mint(address holder, uint256 amount) external;
   function burn(address holder, uint256 amount) external;
   function freeze(address holder) external;
   function isFreezed(address holder) external view returns (bool freezed);
   function setFreezeInterval(uint256 interval) external;
   function totalSupply() external view returns (uint256);
   function balanceOf(address account) external view returns (uint256);
}