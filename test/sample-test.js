const { expect } = require("chai");
const { ethers } = require("hardhat");
let tokenERC;
let tokenWallet;

describe("TokenERC", function () {

  it("Deploy", async function () {
    const [signer] = await ethers.getSigners();
    const TokenERC = await ethers.getContractFactory("ERC20");
    tokenERC = await TokenERC.deploy("Test", "TEST");
  });

  it("Mint 1 000 000", async function () {
    const [signer] = await ethers.getSigners();

    const setMintTx = await tokenERC.Mint(signer.address, 1000000);
    await setMintTx.wait();

    const signerBalance = await tokenERC.balanceOf(signer.address);
    expect(signerBalance).to.equal(1000000);
  });
});

describe("TokenWallet", function () {

  describe("Setup", function () {

    it("Deploy", async function () {
      const TokenWallet = await ethers.getContractFactory("TokenWallet");

      tokenWallet = await TokenWallet.deploy(tokenERC.address);
      await tokenWallet.deployed();
      expect(await tokenWallet.address).to.not.empty;
    });

    it("Correct initialization", async function () {
      const tokenAddress = await tokenWallet.GetTokenAddress();
      const tokenBalance = await tokenWallet.GetTokenBalance();

      expect(tokenAddress).to.equal(tokenERC.address);
      expect(tokenBalance).to.equal(0);
    });
  });

  describe("Main functional test", function () {
     
    it("Deposit token", async function () {
      const [signer] = await ethers.getSigners();
      const depositAmount = 50000;

      const allowSend = await tokenERC.approve(tokenWallet.address, depositAmount);
      await allowSend.wait();
      expect(await tokenERC.allowance(signer.address, tokenWallet.address)).to.equal(depositAmount);

      const setDepositTx = await tokenWallet.connect(signer).Deposit(depositAmount);
      await setDepositTx.wait();

      const tokenWalletBalance = await tokenWallet.GetTokenBalance();
      expect(tokenWalletBalance).to.equal(depositAmount);
    });

    it("Withdraw token", async function () {
      const [signer] = await ethers.getSigners();
      const withdrawAmount = 25000;

      const setWithdrawTx = await tokenWallet.connect(signer).Withdraw(withdrawAmount);
      await setWithdrawTx.wait();

      const tokenWalletBalance = await tokenWallet.GetTokenBalance();
      expect(tokenWalletBalance).to.equal(withdrawAmount);
    });
  });
});
