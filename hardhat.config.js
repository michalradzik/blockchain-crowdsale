require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
require("dotenv").config();

const { PRIVATE_KEYS, ALCHEMY_API_KEY, ETHERSCAN_API_KEY } = process.env;

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.5.5", 
      },
      {
        version: "0.8.9",
      },
    ],
  },
  networks: {
    localhost: {},
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: PRIVATE_KEYS ? PRIVATE_KEYS.split(",") : [],
    },
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
    },
  },
};

