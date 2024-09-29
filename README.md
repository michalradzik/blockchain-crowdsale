DApp Token Crowdsale
This project is a decentralized application (DApp) for token crowdsale with whitelist functionality. It allows users to buy tokens during an open sale period, and the owner can whitelist addresses for participation. Additionally, the project includes capped, timed, and refundable crowdsale functionality.

Features
Token Sale: Users can purchase tokens during the sale period by sending ETH or using the buy function.
Whitelist: Only whitelisted addresses are allowed to buy tokens.
Token Price Setting: The owner can adjust the token price at any time.
Purchase Limits: Minimum and maximum token purchase amounts are enforced to prevent under- or over-buying.
Sale State: The owner can open or close the sale by adjusting the sale state.
Automatic ETH Handling: Users can send ETH directly to the crowdsale contract to automatically buy tokens.
Finalize Sale: The owner can finalize the sale, transferring all remaining tokens and ETH balance back to their account.
Token Balance Transfers: Users can transfer tokens between accounts or approve others to spend tokens on their behalf.
Capped Crowdsale: The crowdsale has a maximum cap on the total amount of tokens sold.
Timed Crowdsale: The crowdsale runs within a predefined start and end time, automatically preventing transactions outside this period.
Refundable Crowdsale: Users can get their ETH refunded if the fundraising goal is not met.
Refund Goal Check: The goal must be less than or equal to the cap, ensuring a valid crowdsale setup.
Token Minting: Tokens can be minted by the owner, providing flexibility in total supply control.
Extensive Testing: Includes tests for all functionalities like whitelist, min/max purchase, capped crowdsale, refundable goal, and more.
Smart Contracts
MyToken: An ERC20 token with minting capability, deployed using OpenZeppelin's ERC20 and Ownable modules.
MyRefundableCrowdsale: A custom crowdsale contract that integrates multiple features like:
CappedCrowdsale: Enforces a maximum amount of tokens to be sold.
TimedCrowdsale: Ensures the crowdsale only operates within a certain timeframe.
RefundableCrowdsale: Allows participants to get refunds if the funding goal is not met.
AllowanceCrowdsale: Allows token sales to be restricted by an allowance set by the token owner.
Frontend
UI: A user interface built with React and Bootstrap.
Timer: Countdown timer displays the remaining sale period.
Blockchain Integration: Integrated with the Ethereum blockchain using Ethers.js.
Requirements
Node.js
Hardhat
OpenZeppelin Contracts
Ethers.js
Bootstrap
How to Run
Clone the repository.
Install dependencies: Run the npm install command.
Deploy the smart contracts using either deploy or deploy2 scripts.
Using deploy Script
To deploy the smart contracts using the deploy.js script, run the following command:

npx hardhat run scripts/deploy.js --network <your_network>

The deploy.js script deploys both the Token and Crowdsale contracts with the following parameters:

Token Name: "Dapp University"
Symbol: "DAPP"
Max Supply: 1,000,000 tokens
Price: 0.025 ETH per token
Min Purchase: 1 token (1 ETH)
Max Purchase: 5 tokens (5 ETH)
The script also transfers the entire token supply to the crowdsale contract after deployment.

Using deploy2 Script
A specific script named deploy2 is available for deployment. Here's how to use it:

To deploy the smart contracts using the deploy2.js script, run the following command:

npx hardhat run scripts/deploy2.js --network <your_network>

The deploy2.js script deploys both the MyToken and MyRefundableCrowdsale contracts with the following parameters:

Rate: 100 (1 ETH = 100 tokens)
Wallet: The deployer's address will be the wallet.
Goal: 100 ETH is the minimum amount to raise.
Cap: 500 ETH is the maximum amount to raise.
Opening Time: Starts 60 seconds after deployment.
Closing Time: 7 days after the opening time.
The script also automatically transfers the entire token supply to the crowdsale contract after deployment.