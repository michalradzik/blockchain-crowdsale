//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract Crowdsale {
    enum SaleState { Open, Closed }
    address public owner;
    Token public token;
    uint256 public price;
    uint256 public maxTokens;
    uint256 public tokensSold;
    SaleState public saleState;
    uint256 public startTime;
    uint256 public endTime;
    mapping(address => bool) public whiteList;

    event Buy(uint256 amount, address buyer);
    event Finalize(uint256 tokensSold, uint256 ethRaised);

   constructor(
        Token _token,
        uint256 _price,
        uint256 _maxTokens
    ) {
        owner = msg.sender;
        token = _token;
        price = _price;
        maxTokens = _maxTokens;
        saleState = SaleState.Closed;

        startTime = block.timestamp;
        endTime = block.timestamp + 7 days;
    
    }

      modifier saleActive() {
        require(block.timestamp >= startTime, "Sale has not started yet");
        require(block.timestamp <= endTime, "Sale has ended");
        saleState = SaleState.Open;
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    // Buy tokens directly by sending Ether
    // --> https://docs.soliditylang.org/en/v0.8.15/contracts.html#receive-ether-function

    receive() external payable {
        uint256 amount = msg.value / price;
        buyTokens(amount * 1e18);
    }

    function addToWhitelist(address _user) public onlyOwner {

    whiteList[_user] = true;
}
    function getState() public view returns (SaleState) {
        return saleState;
    }

function isWhitelisted(address _user) public view returns (bool) {
    return whiteList[_user];
}

    function buyTokens(uint256 _amount) public payable saleActive {
        addToWhitelist(msg.sender);
        require(whiteList[msg.sender], "User is not whitelisted");
        require(msg.value == (_amount / 1e18) * price);
        require(token.balanceOf(address(this)) >= _amount);
        require(token.transfer(msg.sender, _amount));
        require(block.timestamp >= startTime, "Sale has not started yet");
        require(getState()==SaleState.Open, "Sale has closed");
        tokensSold += _amount;

        emit Buy(_amount, msg.sender);
    }

    function setPrice(uint256 _price) public onlyOwner {
        price = _price;
    }

    // Finalize Sale
    function finalize() public onlyOwner {
        require(token.transfer(owner, token.balanceOf(address(this))));

        uint256 value = address(this).balance;
        (bool sent, ) = owner.call{value: value}("");
        require(sent);

        emit Finalize(tokensSold, value);
    }
}
