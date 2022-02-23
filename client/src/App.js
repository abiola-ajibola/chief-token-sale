import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { BrowserRouter } from "react-router-dom";

import NavBar from "./components/NavBar/NavBar";
import MyRouter from "./components/Router/Router";
import myToken from "./artifacts/contracts/MyERC20Mintable.sol/MyERC20Mintable.json";
import myCrowdsale from "./artifacts/contracts/MintedCrowdsale.sol/MintedCrowdsale.json";
import contractAddresses from "./artifacts/contractAdresses.json";

import "./App.css";

function App() {
  const [signerAddress, setSignerAddress] = useState("");
  const [isMinter, setIsMinter] = useState(false);
  const myTokenAbi = myToken.abi;
  const myCrowdsaleAbi = myCrowdsale.abi;
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  // const provider = new ethers.providers.JsonRpcProvider();
  const { myTokenContractAddress, myCrowdsaleContractAdress } =
    contractAddresses;

  useEffect(() => {
    (async () => await provider.send("eth_requestAccounts", []))();
  }, []);
  const signer = provider.getSigner();
  const myTokenContract = new ethers.Contract(
    myTokenContractAddress,
    myTokenAbi,
    provider
  );

  const myCrowdsaleContract = new ethers.Contract(
    myCrowdsaleContractAdress,
    myCrowdsaleAbi,
    provider
  );
  useEffect(() => {
    // set the signer as signerAddress
    (async () => {
      setSignerAddress(await signer.getAddress());
    })();
  }, []);

  useEffect(() => {
    (async () => {
      signerAddress && setIsMinter(await myTokenContract.isMinter(signerAddress));
    })();
  }, [signerAddress]);

  const myTokenContract_signed = myTokenContract.connect(signer);
  const myCrowdsaleContract_signed = myCrowdsaleContract.connect(signer);

  return (
    <div className="App">
      <BrowserRouter>
        <NavBar isMinter={isMinter} />
        <MyRouter
          isMinter={isMinter}
          signerAddress={signerAddress}
          signer={signer}
          instances={{
            myCrowdsaleContract: myCrowdsaleContract_signed,
            myTokenContract: myTokenContract_signed,
          }}
        ></MyRouter>
      </BrowserRouter>
    </div>
  );
}

export default App;
