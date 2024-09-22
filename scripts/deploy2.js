async function main() {
    const { ethers } = require("hardhat");
    const { parseUnits } = ethers;
    
    console.log("Ethers version:", ethers.version);

    const [deployer] = await ethers.getSigners();
    
    console.log("Deploying contracts with the account:", deployer.address);

    const MyToken = await ethers.getContractFactory("MyToken");
    const initialSupply = parseUnits('1000000', 18);

    console.log("Initial supply:", initialSupply.toString());

    try {
        const token = await MyToken.deploy(initialSupply);
        console.log("Token deployed to:", token.target);

        const MyRefundableCrowdsale = await ethers.getContractFactory("MyRefundableCrowdsale");

        const rate = 100;
        const wallet = deployer.address;
        const goal = parseUnits('100', 'ether');
        const cap = parseUnits('500', 'ether');
        const openingTime = Math.floor(Date.now() / 1000) + 60;
        const closingTime = openingTime + 86400 * 7;

        const crowdsale = await MyRefundableCrowdsale.deploy(
            rate,
            wallet,
            token.target,
            goal,
            openingTime,
            closingTime,
            cap
        );
        console.log("Crowdsale deployed to:", crowdsale.target);

        await token.transfer(crowdsale.target, initialSupply);
        console.log("Tokens transferred to crowdsale contract");

    } catch (error) {
        console.error("Deployment failed:", error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});






