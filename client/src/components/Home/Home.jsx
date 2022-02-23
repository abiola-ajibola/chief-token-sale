import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

export default function Home({
  myTokenContract,
  myCrowdsaleContract,
  signerAddress,
  signer,
}) {
  const [numberOfTokens, setNumberOfTokens] = useState("");
  const [message, setMessage] = useState("");
  const [tokenData, setTokenData] = useState({
    name: "",
    symbol: "",
    decimals: 0,
    rateInWei: 0,
  });
  const [tokenBalance, setTokenBalance] = useState({
    balance: 0n,
    totalSupply: 0n,
  });

  useEffect(() => {
    signerAddress &&
      myTokenContract.on("Transfer", async () => {
        /* eslint-disable no-console */
        let balance, totalSupply;
        try {
          balance = signerAddress
            ? (await myTokenContract.balanceOf(signerAddress)).toBigInt()
            : 0n;
        } catch (e) {
          console.error("getBalance:");
          console.error({ e });
        }

        try {
          totalSupply = signerAddress ? await myTokenContract.totalSupply() : 0n;
        } catch (e) {
          console.error("getTotalSupply:");
          console.error(e);
        }
        setTokenBalance({ balance, totalSupply });
        setMessage("Token purchase succesful");
        setNumberOfTokens("");
        setTimeout(() => setMessage(""), 5000);
      });
    (async () => {
      try {
        const symbol = await myTokenContract.symbol();
        const name = await myTokenContract.name();
        const balance = (
          await myTokenContract.balanceOf(signerAddress)
        ).toBigInt();
        const rateInWei = (await myCrowdsaleContract.rate()).toNumber();
        const decimals = await myTokenContract.decimals();
        const totalSupply = await myTokenContract.totalSupply();
        setTokenData({
          symbol,
          name,
          rateInWei,
          decimals,
        });
        setTokenBalance({ balance, totalSupply });
      } catch (e) {
        console.error(e);
      }
    })();
  }, [signerAddress]);

  async function buyTokens(amount) {
    const amountBN = ethers.BigNumber.from(amount);
    const cost = amountBN.mul(tokenData?.rateInWei);
    await signer.sendTransaction({
      to: myCrowdsaleContract.address,
      value: cost,
    });
  }

  function handleNumberOfTokens(value) {
    let _value = value;
    if (value === "e") _value = "";
    if (Number(value) < 0) _value = "";
    setNumberOfTokens(_value);
  }

  return (
    <div className="App">
      {!tokenData ? (
        <h1>Loading ...</h1>
      ) : (
        <>
          <h1>
            Welcome to the {tokenData?.name} {tokenData?.symbol} dashboard
          </h1>
          <h3>Total supply: {tokenBalance?.totalSupply?.toString() || 0}</h3>
          <h2>Purchase {tokenData?.symbol}</h2>
          <p>You have: {tokenBalance?.balance?.toString() || 0} CTK</p>
          <p>
            Enter the amount of tokens you want and click "Buy Tokens" to
            purchase {tokenBalance?.balance ? "more" : "some"} tokens
          </p>
          <p>
            <em>
              <strong>
                Please note that each CTK costs{" "}
                {(
                  10 ** -18 *
                  tokenData?.rateInWei *
                  10 ** tokenData?.decimals
                ).toPrecision(2)}{" "}
                ethers or {tokenData?.rateInWei * 10 ** tokenData?.decimals} Wei
              </strong>
            </em>
          </p>
          <p>{message}</p>
          <div>
            <input
              max={1000}
              min={0}
              type="number"
              id="number"
              value={numberOfTokens}
              placeholder="Amount of tokens"
              onInput={(e) => handleNumberOfTokens(e.target.value)}
              style={{ width: "200px" }}
            />
          </div>
          <div>
            <button type="button" onClick={() => buyTokens(numberOfTokens)}>
              Buy Tokens
            </button>
          </div>
        </>
      )}
    </div>
  );
}
