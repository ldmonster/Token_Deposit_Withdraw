//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Context.sol";

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract TokenWallet is Context{

    address private tokenAddress;

    constructor(address _address) {
        tokenAddress = _address;
    }

    function GetTokenAddress() public view returns (address) {
        return tokenAddress;
    }

    function GetTokenBalance() public view returns (uint256) {
        return IERC20(tokenAddress).balanceOf(address(this));
    }

    function Deposit(uint256 amount) public returns (bool) {
        require(IERC20(tokenAddress).balanceOf(_msgSender()) >= amount , "You have not enougth tokens on your balance");
        require(IERC20(tokenAddress).allowance(_msgSender(), address(this)) >= amount, "You need to give an allowance to this contract");
        return IERC20(tokenAddress).transferFrom(_msgSender(), address(this), amount);
    }

    function Withdraw(uint256 amount) public returns(bool){
        require(IERC20(tokenAddress).balanceOf(address(this)) >= amount , "Smart contract have not enougth tokens on balance");
        return IERC20(tokenAddress).transfer(_msgSender(), amount);
    }
}
