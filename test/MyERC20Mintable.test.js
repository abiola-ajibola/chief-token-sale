const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { ethers } = require("hardhat");
require("dotenv").config();

chai.use(chaiAsPromised);

const { BigNumber } = ethers;
const { expect } = chai;
describe("MyERC20Mintable", function () {
  let mintableToken,
    signer,
    signerAddress,
    signersAddresses,
    signers,
    wallet1,
    wallet2;
  const numberOfTokenns = 3;
  this.beforeAll(async () => {
    [signer, ...signers] = await ethers.getSigners();
    signerAddress = signer.address;
    signersAddresses = signers.map((signer) => signer.address);

    const MintableToken = await ethers.getContractFactory("MyERC20Mintable");
    mintableToken = await MintableToken.deploy();

    await mintableToken.deployed();

    // Use private keys to create new wallets (not a Voidable wallets)
    // The wallets from signersAddresses are all Voidable and cannot be used to sign a transaction
    const privateKey1 = process.env.PRIVATE_KEY;
    const privateKey2 = process.env.PRIVATE_KEY_2;
    wallet1 = new ethers.Wallet(privateKey1, mintableToken.provider);
    wallet2 = new ethers.Wallet(privateKey2, mintableToken.provider);

    // Send 20 ethers to the new wallets
    await signers[0].sendTransaction({
      to: wallet1.address,
      value: ethers.utils.parseEther("20"),
    });
    await signers[0].sendTransaction({
      to: wallet2.address,
      value: ethers.utils.parseEther("20"),
    });
  });
  it("Should have all the contract's constants", async function () {
    expect(await mintableToken.symbol()).to.equal("CTK");
    expect(await mintableToken.name()).to.equal("Chief Token");
    expect(await mintableToken.decimals()).to.be.equal(BigNumber.from(2));
  });

  it("Should set deployer (signer during deployment) address as minter", async function () {
    expect(await mintableToken.isMinter(signerAddress)).to.be.true;
  });

  it("Should not see another address as a minter", async function () {
    expect(await mintableToken.isMinter(signersAddresses[0])).not.to.be.true;
  });

  it("Should add another address as a minter", async function () {
    // Add the new wallet1 as minter
    await mintableToken.addMinter(wallet1.address);
    expect(await mintableToken.isMinter(wallet1.address)).to.be.true;
  });

  it("Should allow minters to mint token", async function () {
    // mint some tokens with default wallet
    expect(
      mintableToken.mint(signersAddresses[1], numberOfTokenns),
      "It should allow the default address to mint tokens"
    ).to.be.fulfilled;
    // mint some more tokens with the new wallet1
    await expect(
      mintableToken.connect(wallet1).mint(signersAddresses[1], numberOfTokenns),
      "It should allow wallet1 to mint tokens"
    ).to.be.fulfilled;

    await expect(
      mintableToken.connect(wallet2).mint(signersAddresses[1], numberOfTokenns),
      "It should not allow wallet2 to mint tokens"
    ).not.to.be.fulfilled;

    expect(
      await mintableToken.balanceOf(signersAddresses[1]),
      "Tokens minted with both wallets should be in signerAddresses[1] balance"
    ).to.be.equal(BigNumber.from(numberOfTokenns).mul(2));
  });

  it(`Should have a total supply of ${numberOfTokenns * 2}`, async function () {
    expect(await mintableToken.totalSupply()).to.be.equal(
      BigNumber.from(numberOfTokenns * 2)
    );
  });

  it(`Should have minted ${
    2 * numberOfTokenns
  } tokens to signersAddresses[1]`, async function () {
    expect(await mintableToken.balanceOf(signersAddresses[1])).to.be.equal(
      BigNumber.from(2 * numberOfTokenns)
    );
  });
});
