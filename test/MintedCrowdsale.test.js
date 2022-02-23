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

describe("MintedCrowdsale", async function () {
  let mintedCrowdsale,
    mintableToken,
    signer,
    signerAddress,
    signersAddresses,
    signers,
    wallet1,
    wallet2;
  const numberOfTokens = 3;

  this.beforeAll(async () => {
    try {
      const MintableToken = await ethers.getContractFactory("MyERC20Mintable");
      mintableToken = await MintableToken.deploy();
      await mintableToken.deployed();
    } catch (e) {
      console.log("MintableToken:");
      console.log({ e });
    }

    ({ signer, signers, signerAddress, signersAddresses, wallet1, wallet2 } =
      await initialSetup(mintableToken));

    try {
      const MintedCrowdsale = await ethers.getContractFactory(
        "MintedCrowdsale"
      );
      mintedCrowdsale = await MintedCrowdsale.deploy(
        1,
        signerAddress,
        mintableToken.address
      );
    } catch (e) {
      console.log("MintedCrowdsale:");
      console.log({ e });
    }

    await mintedCrowdsale.deployed();

    // add MintedCrowdsale as minter
    await mintableToken.addMinter(mintedCrowdsale.address);
  });

  it("Should have all the constants", async function () {
    expect(
      await mintedCrowdsale.token(),
      `The address of the token should be  ${mintableToken.address}`
    ).to.be.equal(mintableToken.address);

    expect(await mintedCrowdsale.rate()).to.be.equal(1);
    expect(await mintedCrowdsale.wallet()).to.be.equal(signerAddress);
  });

  it("Should set MintedCrowdsale contract as a minter", async function () {
    expect(await mintableToken.isMinter(mintedCrowdsale.address)).to.be.true;
  });

  it("Should send token and emit TokensPurchased event when cryptocurrency is sent to MintedCrowdsale, and then send the crypto to the deployer's account", async function () {
    const decimals = await mintableToken.decimals();

    const ownerBalanceBefore_1 = await mintableToken.provider.getBalance(
      signerAddress
    );

    await expect(
      wallet1.sendTransaction({
        to: mintedCrowdsale.address,
        value: BigNumber.from(numberOfTokens * 10 ** decimals),
      })
    ).to.be.fulfilled;

    const ownerBalanceAfter_1 = await mintableToken.provider.getBalance(
      signerAddress
    );

    expect(
      ownerBalanceAfter_1.sub(ownerBalanceBefore_1),
      "The amount paid for the tokens must have been transferred to the deployer account"
    ).to.be.equal(BigNumber.from(numberOfTokens * 10 ** decimals));

    const ownerBalanceBefore_2 = await mintableToken.provider.getBalance(
      signerAddress
    );

    await expect(
      wallet1.sendTransaction({
        to: mintedCrowdsale.address,
      })
    ).to.be.revertedWith("Crowdsale: weiAmount is 0");

    const ownerBalanceAfter_2 = await mintableToken.provider.getBalance(
      signerAddress
    );

    expect(
      ownerBalanceAfter_2,
      "No crytpo should be sent to the deployer account, because the transaction failed"
    ).to.be.equal(ownerBalanceBefore_2);

    await expect(
      mintedCrowdsale.buyTokens(signer.address, {
        value: BigNumber.from(numberOfTokens * 10 ** decimals),
      })
    )
      .to.emit(mintedCrowdsale, "TokensPurchased")
      .withArgs(
        signer.address,
        signer.address,
        numberOfTokens * 10 ** decimals,
        numberOfTokens * 10 ** decimals // On the client side, this value should be divided by 10 ** decimals
      );
  });

  it("Should record the correct amount of crytpo raised", async function () {
    const decimals = await mintableToken.decimals();

    // two times the price of purchasing numberOfTokens tokens because we have bought tokens twice so far
    expect(await mintedCrowdsale.weiRaised()).to.be.equal(
      2 * numberOfTokens * 10 ** decimals
    );
  });
});

// });
