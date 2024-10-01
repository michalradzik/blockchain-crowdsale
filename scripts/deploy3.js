const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  const { parseUnits } = ethers;
const token = '0x288eC6A7863576B6B219af51713E3859c5BB2191';
const tokenABI = await hre.ethers.getContractFactory("contracts/Token.sol:Token");
const tokenDeployed = await tokenABI.attach(token);
  const MAX_SUPPLY = '1000000';

  const PRICE = parseUnits('0.025', 'ether');
  const MIN_TOKENS = parseUnits('1', 'ether');
  const MAX_TOKENS = parseUnits('5', 'ether');

  const Crowdsale = await hre.ethers.getContractFactory("contracts/Crowdsale.sol:Crowdsale");

  const crowdsale = await Crowdsale.deploy(
    token,
    PRICE, 
    parseUnits(MAX_SUPPLY, 'ether'),
    MIN_TOKENS,
    MAX_TOKENS
  );
  console.log(`Crowdsale deployed to: ${crowdsale.target}\n`);

  const transaction = await tokenDeployed.transfer(crowdsale.target, parseUnits(MAX_SUPPLY, 'ether'));
  await transaction.wait();

  console.log(`Tokens transferred to Crowdsale\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});