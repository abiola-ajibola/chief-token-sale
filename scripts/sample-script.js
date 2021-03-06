// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const fs = require("fs").promises;

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const MyMintableToken = await hre.ethers.getContractFactory(
    "MyERC20Mintable"
  );
  const MintedCrowdSale = await hre.ethers.getContractFactory(
    "MintedCrowdsale"
  );
  const myMintableToken = await MyMintableToken.deploy();
  myMintableToken.address && console.log("Deployed Token");
  const account = (await hre.ethers.getSigner()).address;
  console.log({
    address: myMintableToken.address,
    account,
  });

  const mintedCrowdSale = await MintedCrowdSale.deploy(
    1,
    account,
    myMintableToken.address
  );

  mintedCrowdSale.address && console.log("Deployed MintedCrowdsale");

  // await greeter.deployed();

  // Automatically add mintedCrowdSale as minter
  await myMintableToken.addMinter(mintedCrowdSale.address);

  console.log("MintedCrowdsale deployed to:", mintedCrowdSale.address);
  // Store the contract addresses in the asrtifacts folder.
  // Artifacts are stored in client/src folder so that they will be easy to import into the client app
  await fs.writeFile(
    "./client/src/artifacts/contractAdresses.json",
    JSON.stringify(
      {
        myTokenContractAddress: myMintableToken.address,
        myCrowdsaleContractAdress: mintedCrowdSale.address,
      },
      null,
      2
    )
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
