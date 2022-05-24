const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenERC", function () {

  it("Deploy", async function () {
    const [signer] = await ethers.getSigners();
    const TokenERC = await ethers.getContractFactory("ERC20");
    const tokenERC = await TokenERC.deploy("Test", "TEST");
  });

  it("Mint 1 000 000", async function () {
    const [signer] = await ethers.getSigners();
    const TokenERC = await ethers.getContractFactory("ERC20");
    const tokenERC = await TokenERC.deploy("Test", "TEST");

    const setMintTx = await tokenERC.Mint(signer.address, 1000000);
    await setMintTx.wait();

    const signerBalance = await tokenERC.balanceOf(signer.address);
    expect(signerBalance).to.equal(1000000);
  });
});

describe("TokenWallet", function () {

  describe("Setup", function () {

    it("Deploy", async function () {
      const [signer] = await ethers.getSigners();
      const TokenERC = await ethers.getContractFactory("ERC20");
      const tokenERC = await TokenERC.deploy("Test", "TEST");

      const TokenWallet = await ethers.getContractFactory("TokenWallet");
      const tokenWallet = await TokenWallet.deploy(tokenERC.address);
      await tokenWallet.deployed();
      expect(await tokenWallet.address).to.not.empty;
    });

    it("Correct initialization", async function () {
      const [signer] = await ethers.getSigners();
      const TokenERC = await ethers.getContractFactory("ERC20");
      const tokenERC = await TokenERC.deploy("Test", "TEST");

      const TokenWallet = await ethers.getContractFactory("TokenWallet");
      const tokenWallet = await TokenWallet.deploy(tokenERC.address);
      await tokenWallet.deployed();

      const tokenAddress = await tokenWallet.GetTokenAddress();
      const tokenBalance = await tokenWallet.GetTokenBalance();

      expect(tokenAddress).to.equal(tokenERC.address);
      expect(tokenBalance).to.equal(0);
    });
  });

  describe("Main functional test", function () {
     
    it("Deposit error not allowed", async function () {
      const [signer] = await ethers.getSigners();

      const TokenERC = await ethers.getContractFactory("ERC20");
      const tokenERC = await TokenERC.deploy("Test", "TEST");

      const setMintTx = await tokenERC.Mint(signer.address, 1000000);
      await setMintTx.wait();

      const TokenWallet = await ethers.getContractFactory("TokenWallet");
      const tokenWallet = await TokenWallet.deploy(tokenERC.address);
      await tokenWallet.deployed();

      const depositAmount = 50000;

      await expect(tokenWallet.connect(signer).Deposit(depositAmount))
        .to.be.revertedWith('You need to give an allowance to this contract');
    });

    it("Deposit error not enougth tokens", async function () {
      const [signer] = await ethers.getSigners();

      const TokenERC = await ethers.getContractFactory("ERC20");
      const tokenERC = await TokenERC.deploy("Test", "TEST");

      const TokenWallet = await ethers.getContractFactory("TokenWallet");
      const tokenWallet = await TokenWallet.deploy(tokenERC.address);
      await tokenWallet.deployed();
      
      const depositAmount = 50000;

      const allowSend = await tokenERC.connect(signer).approve(tokenWallet.address, depositAmount);
      await allowSend.wait();
      expect(await tokenERC.allowance(signer.address, tokenWallet.address)).to.equal(depositAmount);

      await expect(tokenWallet.connect(signer).Deposit(depositAmount))
        .to.be.revertedWith('You have not enougth tokens on your balance');
    });

    it("Deposit token", async function () {
      const [signer] = await ethers.getSigners();

      const TokenERC = await ethers.getContractFactory("ERC20");
      const tokenERC = await TokenERC.deploy("Test", "TEST");

      const setMintTx = await tokenERC.Mint(signer.address, 1000000);
      await setMintTx.wait();

      const TokenWallet = await ethers.getContractFactory("TokenWallet");
      const tokenWallet = await TokenWallet.deploy(tokenERC.address);
      await tokenWallet.deployed();

      const depositAmount = 50000;

      const allowSend = await tokenERC.approve(tokenWallet.address, depositAmount);
      await allowSend.wait();
      expect(await tokenERC.allowance(signer.address, tokenWallet.address)).to.equal(depositAmount);

      const setDepositTx = await tokenWallet.connect(signer).Deposit(depositAmount);
      await setDepositTx.wait();

      const tokenWalletBalance = await tokenWallet.GetTokenBalance();
      expect(tokenWalletBalance).to.equal(depositAmount);
    });

    it("Withdraw token error not enougth tokens", async function () {
      const [signer] = await ethers.getSigners();

      const TokenERC = await ethers.getContractFactory("ERC20");
      const tokenERC = await TokenERC.deploy("Test", "TEST");

      const setMintTx = await tokenERC.Mint(signer.address, 1000000);
      await setMintTx.wait();

      const TokenWallet = await ethers.getContractFactory("TokenWallet");
      const tokenWallet = await TokenWallet.deploy(tokenERC.address);
      await tokenWallet.deployed();

      const withdrawAmount = 25000;

      await expect(tokenWallet.connect(signer).Withdraw(withdrawAmount))
      .to.be.revertedWith('Smart contract have not enougth tokens on balance');
    });

    it("Withdraw token", async function () {
      const [signer] = await ethers.getSigners();

      const TokenERC = await ethers.getContractFactory("ERC20");
      const tokenERC = await TokenERC.deploy("Test", "TEST");

      const setMintTx = await tokenERC.Mint(signer.address, 1000000);
      await setMintTx.wait();

      const TokenWallet = await ethers.getContractFactory("TokenWallet");
      const tokenWallet = await TokenWallet.deploy(tokenERC.address);
      await tokenWallet.deployed();

      const depositAmount = 50000;

      const withdrawAmount = 25000;

      const allowSend = await tokenERC.approve(tokenWallet.address, depositAmount);
      await allowSend.wait();

      const setDepositTx = await tokenWallet.connect(signer).Deposit(depositAmount);
      await setDepositTx.wait();

      const setWithdrawTx = await tokenWallet.connect(signer).Withdraw(withdrawAmount);
      await setWithdrawTx.wait();

      const tokenWalletBalance = await tokenWallet.GetTokenBalance();
      expect(tokenWalletBalance).to.equal(withdrawAmount);
    });
  });
});
