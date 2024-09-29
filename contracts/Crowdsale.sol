// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

							 
import "./Token.sol";

contract Crowdsale {
    enum SaleState { Open, Closed }
    address public owner;
    Token public token;
    uint256 public price;
    uint256 public maxTokens;
    uint256 public minTokens;
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
        uint256 _maxTokens,
        uint256 _minTokens,
        uint256 _maxPurchaseTokens
    ) {
        owner = msg.sender;
        token = _token;
        price = _price;
        maxTokens = _maxPurchaseTokens;
        minTokens = _minTokens;
        saleState = SaleState.Open;

        startTime = block.timestamp;
        endTime = block.timestamp + 365 days;

        whiteList[owner] = true;
    }

    modifier saleActive() {
        require(block.timestamp >= startTime, "Sale has not started yet");
        require(block.timestamp <= endTime, "Sale has ended");
        require(saleState == SaleState.Open, "Sale has ended");
        _; 
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _; 
    }

    function setSaleState(uint _state) public onlyOwner {
        require(_state == 0 || _state == 1, "Invalid state");
        saleState = SaleState(_state);
    }

    function setPrice(uint256 _price) external onlyOwner {
        price = _price;
    }

    receive() external payable {
        uint256 amount = msg.value / price;
        buyTokens(amount * 1e18);
    }

    function addToWhitelist(address _user) public onlyOwner {
        whiteList[_user] = true;
    }

    function isWhitelisted(address _user) public view returns (bool) {
        return whiteList[_user];
    }

    function getState() public view returns (SaleState) {
        if (block.timestamp >= startTime && block.timestamp <= endTime) {
            return SaleState.Open;
        }
        return SaleState.Closed;
    }														 
																		 
    function buyTokens(uint256 _amount) public payable saleActive {
        require(whiteList[msg.sender], "User is not whitelisted");
        require(msg.value == (_amount / 1e18) * price, "Incorrect ETH amount sent");
        require(token.balanceOf(address(this)) >= _amount, "Not enough tokens available");
        require(_amount >= minTokens, "Amount is less than minimum purchase amount");
        require(_amount <= maxTokens, "Amount exceeds maximum purchase amount");
        require(token.transfer(msg.sender, _amount), "Token transfer failed");

        tokensSold += _amount;

        emit Buy(_amount, msg.sender);
    }

    function setMinTokens(uint256 _minTokens) public onlyOwner {
        minTokens = _minTokens;
    }												

    function finalize() public onlyOwner {
        require(token.transfer(owner, token.balanceOf(address(this))));

        uint256 value = address(this).balance;
        (bool sent, ) = owner.call{value: value}("");
        require(sent);

        emit Finalize(tokensSold, value);
    }
}
