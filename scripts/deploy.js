const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  const { parseUnits } = ethers;

  const NAME = 'Dapp University';
  const SYMBOL = 'DAPP';
  const MAX_SUPPLY = '1000000';
  const PRICE = parseUnits('0.025', 'ether');
  const MIN_TOKENS = parseUnits('1', 'ether');
  const MAX_TOKENS = parseUnits('5', 'ether');

  const Token = await hre.ethers.getContractFactory("Token");
  const token = await Token.deploy(NAME, SYMBOL, MAX_SUPPLY);
  console.log(`Token deployed to: ${token.target}\n`);

  const Crowdsale = await hre.ethers.getContractFactory("contracts/Crowdsale.sol:Crowdsale");

  const crowdsale = await Crowdsale.deploy(
    token.target,
    PRICE, 
    parseUnits(MAX_SUPPLY, 'ether'),
    MIN_TOKENS,
    MAX_TOKENS
  );
  console.log(`Crowdsale deployed to: ${crowdsale.target}\n`);

  const transaction = await token.transfer(crowdsale.target, parseUnits(MAX_SUPPLY, 'ether'));
  await transaction.wait();

  console.log(`Tokens transferred to Crowdsale\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});