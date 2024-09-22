// SPDX-License-Identifier: MIT
pragma solidity ^0.5.5;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/crowdsale/Crowdsale.sol";
import "@openzeppelin/contracts/crowdsale/emission/AllowanceCrowdsale.sol";
import "@openzeppelin/contracts/crowdsale/validation/CappedCrowdsale.sol";
import "@openzeppelin/contracts/crowdsale/validation/TimedCrowdsale.sol";
import "@openzeppelin/contracts/crowdsale/distribution/RefundableCrowdsale.sol";

contract MyRefundableCrowdsale is Crowdsale, CappedCrowdsale, TimedCrowdsale, RefundableCrowdsale {
    constructor(
        uint256 rate,              
        address payable wallet,
        IERC20 token,
        uint256 goal,
        uint256 openingTime,
        uint256 closingTime,
        uint256 cap
    )
        Crowdsale(rate, wallet, token)
        CappedCrowdsale(cap)
        TimedCrowdsale(openingTime, closingTime)
        RefundableCrowdsale(goal)
        public // Dodaj specyfikator widoczności
    {
        require(goal <= cap, "Goal must be less than or equal to cap");
    }
}



