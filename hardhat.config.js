require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.5.5",  // Dla kontraktów OpenZeppelin Crowdsale
      },
      {
        version: "0.8.9",  // Dla nowych kontraktów w wersji 0.8.x
      },
    ],
  },
};

