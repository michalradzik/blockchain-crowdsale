const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  const { parseUnits } = ethers;

  const NAME = 'Dapp University';
  const SYMBOL = 'DAPP';
  const MAX_SUPPLY = '1000000';
  const PRICE = parseUnits('0.025', 'ether');
  const MIN_TOKENS = parseUnits('1', 'ether');  // Minimalna liczba tokenów
  const MAX_TOKENS = parseUnits('5', 'ether');  // Maksymalna liczba tokenów

  // Deploy Token
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy(NAME, SYMBOL, MAX_SUPPLY);
  console.log(`Token deployed to: ${token.target}\n`);

  // Używamy pełnej kwalifikacji, aby odwołać się do Twojego kontraktu Crowdsale
  const Crowdsale = await ethers.getContractFactory("contracts/Crowdsale.sol:Crowdsale");

  // Deploy Crowdsale (teraz z dodanymi parametrami minTokens i maxTokens)
  const crowdsale = await Crowdsale.deploy(
    token.target,  // Adres wdrożonego tokena
    PRICE, 
    parseUnits(MAX_SUPPLY, 'ether'),
    MIN_TOKENS,  // Minimalna liczba tokenów
    MAX_TOKENS   // Maksymalna liczba tokenów
  );
  console.log(`Crowdsale deployed to: ${crowdsale.target}\n`);

  // Przekazanie tokenów na kontrakt crowdsale
  const transaction = await token.transfer(crowdsale.target, parseUnits(MAX_SUPPLY, 'ether'));
  await transaction.wait();

  console.log(`Tokens transferred to Crowdsale\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


