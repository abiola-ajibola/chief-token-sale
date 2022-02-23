const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { ethers } = require("hardhat");
const { solidity } = require("ethereum-waffle");
const { initialSetup } = require("./test-utils");
require("dotenv").config();

chai.use(chaiAsPromised);
chai.use(solidity);

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
  const numberOfTokens = 3;
  this.beforeAll(async () => {
    const MintableToken = await ethers.getContractFactory("MyERC20Mintable");
    mintableToken = await MintableToken.deploy();

    await mintableToken.deployed();

    ({ signer, signers, signerAddress, signersAddresses, wallet1, wallet2 } =
      await initialSetup(mintableToken));
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

  it("Should allow minters to mint token and emit Transfer events", async function () {
    // mint some tokens with default wallet
    await expect(
      mintableToken.mint(signersAddresses[1], numberOfTokens),
      "It should allow the default address to mint tokens"
    )
      .to.be.fulfilled.and.to.emit(mintableToken, "Transfer")
      .withArgs(
        ethers.constants.AddressZero,
        signersAddresses[1],
        numberOfTokens
      );
    // mint some more tokens with the new wallet1
    await expect(
      mintableToken.connect(wallet1).mint(signersAddresses[1], numberOfTokens),
      "It should allow wallet1 to mint tokens"
    )
      .to.be.fulfilled.and.to.emit(mintableToken, "Transfer")
      .withArgs(
        ethers.constants.AddressZero,
        signersAddresses[1],
        numberOfTokens
      );

    await expect(
      mintableToken.connect(wallet2).mint(signersAddresses[1], numberOfTokens),
      "It should not allow wallet2 to mint tokens"
    ).not.to.be.fulfilled;

    expect(
      await mintableToken.balanceOf(signersAddresses[1]),
      "Tokens minted with both wallets should be in signerAddresses[1] balance"
    ).to.be.equal(BigNumber.from(numberOfTokens).mul(2));
  });

  it(`Should have a total supply of ${numberOfTokens * 2}`, async function () {
    expect(await mintableToken.totalSupply()).to.be.equal(
      BigNumber.from(numberOfTokens * 2)
    );
  });

  it(`Should have minted ${
    2 * numberOfTokens
  } tokens to signersAddresses[1]`, async function () {
    expect(await mintableToken.balanceOf(signersAddresses[1])).to.be.equal(
      BigNumber.from(2 * numberOfTokens)
    );
  });
});
