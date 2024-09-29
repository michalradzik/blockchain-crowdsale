const { expect } = require('chai');
const { ethers } = require('hardhat');
const { parseUnits } = ethers;
const tokens = (n) => {
  return parseUnits(n.toString(), 'ether');
};

const ether = tokens;

describe('Crowdsale', () => {
  let token, crowdsale;
  let deployer, user1;

  beforeEach(async () => {
    const Crowdsale = await ethers.getContractFactory('contracts/Crowdsale.sol:Crowdsale');
    const Token = await ethers.getContractFactory('contracts/Token.sol:Token');

    token = await Token.deploy('Dapp University', 'DAPP', '1000000');
    await token.waitForDeployment();

    accounts = await ethers.getSigners();
    deployer = accounts[0];
    user1 = accounts[1];

    crowdsale = await Crowdsale.deploy(
      token.target,
      ether(1),
      tokens(1000000),
      tokens(10),
      tokens(100)
    );
    await crowdsale.waitForDeployment();

    let transaction = await token.connect(deployer).transfer(crowdsale.target, tokens(1000000));
    await transaction.wait();

    await crowdsale.connect(deployer).addToWhitelist(user1.address);
  });

  describe('Deployment', () => {
    it('sends tokens to the Crowdsale contract', async () => {
      expect(await token.balanceOf(crowdsale.target)).to.equal(tokens(1000000));
    });

    it('returns the price', async () => {
      expect(await crowdsale.price()).to.equal(ether(1));
    });

    it('returns token address', async () => {
      expect(await crowdsale.token()).to.equal(token.target);
    });
  });

  describe('Buying Tokens', () => {
    let transaction, result;
    let amount = tokens(10);

    describe('Success', () => {
      beforeEach(async () => {
        transaction = await crowdsale.connect(user1).buyTokens(amount, { value: ether(10) });
        result = await transaction.wait();
      });

      it('transfers tokens', async () => {
        expect(await token.balanceOf(crowdsale.target)).to.equal(tokens(999990));
        expect(await token.balanceOf(user1.address)).to.equal(amount);
      });

      it('updates tokensSold', async () => {
        expect(await crowdsale.tokensSold()).to.equal(amount);
      });

      it('emits a buy event', async () => {
        await expect(transaction).to.emit(crowdsale, "Buy").withArgs(amount, user1.address);
      });
    });

    describe('Failure', () => {
      it('rejects insufficient ETH', async () => {
        await expect(crowdsale.connect(user1).buyTokens(tokens(10), { value: 0 })).to.be.reverted;
      });
    });
  });

  describe('Buying Tokens - Min Tokens Restriction', () => {
    it('rejects purchase below the minimum token limit', async () => {
      await expect(crowdsale.connect(user1).buyTokens(tokens(5), { value: ether(5) }))
        .to.be.revertedWith('Amount is less than minimum purchase amount');
    });
  });

  describe('Buying Tokens - Max Tokens Restriction', () => {
    it('rejects purchase above the maximum token limit', async () => {
      await expect(crowdsale.connect(user1).buyTokens(tokens(101), { value: ether(101) }))
        .to.be.revertedWith('Amount exceeds maximum purchase amount');
    });
  });

  describe('Sale State - Closed Sale', () => {
    it('prevents token purchase when the sale is closed', async () => {
      await crowdsale.connect(deployer).setSaleState(1);
      await expect(crowdsale.connect(user1).buyTokens(tokens(10), { value: ether(10) }))
        .to.be.revertedWith('Sale has ended');
    });
  });

  describe('Sending ETH', () => {
    let transaction, result;
    let amount = ether(10);

    describe('Success', () => {
      beforeEach(async () => {
        transaction = await user1.sendTransaction({ to: crowdsale.target, value: amount });
        result = await transaction.wait();
      });

      it('updates contract\'s ether balance', async () => {
        expect(await ethers.provider.getBalance(crowdsale.target)).to.equal(amount);
      });

      it('updates user token balance', async () => {
        expect(await token.balanceOf(user1.address)).to.equal(amount);
      });
    });
  });

  describe('Updating Price', () => {
    let transaction, result;
    let price = ether(2);

    describe('Success', () => {
      beforeEach(async () => {
        transaction = await crowdsale.connect(deployer).setPrice(ether(2));
        result = await transaction.wait();
      });

      it('updates the price', async () => {
        expect(await crowdsale.price()).to.equal(ether(2));
      });
    });

    describe('Failure', () => {
      it('prevents non-owner from updating price', async () => {
        await expect(crowdsale.connect(user1).setPrice(price)).to.be.reverted;
      });
    });
  });

  describe('Finalizing Sale', () => {
    let transaction, result;
    let amount = tokens(10);
    let value = ether(10);

    describe('Success', () => {
      beforeEach(async () => {
        transaction = await crowdsale.connect(user1).buyTokens(amount, { value: value });
        result = await transaction.wait();

        transaction = await crowdsale.connect(deployer).finalize();
        result = await transaction.wait();
      });

      it('transfers remaining tokens to owner', async () => {
        expect(await token.balanceOf(crowdsale.target)).to.equal(0);
        expect(await token.balanceOf(deployer.address)).to.equal(tokens(999990));
      });

      it('transfers ETH balance to owner', async () => {
        expect(await ethers.provider.getBalance(crowdsale.target)).to.equal(0);
      });

      it('emits Finalize event', async () => {
        await expect(transaction).to.emit(crowdsale, "Finalize").withArgs(amount, value);
      });
    });

    describe('Failure', () => {
      it('prevents non-owner from finalizing', async () => {
        await expect(crowdsale.connect(user1).finalize()).to.be.reverted;
      });
    });
  });
});
