async function initialSetup(deployedContract) {
  [signer, ...signers] = await ethers.getSigners();
  signerAddress = signer.address;
  signersAddresses = signers.map((signer) => signer.address);

  // Use private keys to create new wallets (not a Voidable wallets)
  // The wallets from signersAddresses are all Voidable and cannot be used to sign a transaction
  const privateKey1 = process.env.PRIVATE_KEY;
  const privateKey2 = process.env.PRIVATE_KEY_2;
  wallet1 = new ethers.Wallet(privateKey1, deployedContract.provider);
  wallet2 = new ethers.Wallet(privateKey2, deployedContract.provider);

  // Send 20 ethers to the new wallets
  await signers[0].sendTransaction({
    to: wallet1.address,
    value: ethers.utils.parseEther("20"),
  });
  await signers[0].sendTransaction({
    to: wallet2.address,
    value: ethers.utils.parseEther("20"),
  });
  return {
    signer,
    signers,
    signerAddress,
    signersAddresses,
    wallet1,
    wallet2,
  };
}

module.exports = { initialSetup };
