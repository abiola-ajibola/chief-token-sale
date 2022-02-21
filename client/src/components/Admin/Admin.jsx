import React, { useEffect, useState } from "react";

export default function Admin({ myTokenContract, currentUser }) {
  const [minterAddress, setMinterAddress] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    myTokenContract.once("MinterAdded", (account) => {
      setMessage(`Successfully added ${account} to minters list`);
      setTimeout(() => setMessage(""), 5000);
      setMinterAddress("");
    });
    myTokenContract.once("MinterRemoved", (account) => {
      setMessage(`Successfully removed ${account} from minters list`);
      setTimeout(() => setMessage(""), 5000);
      setMinterAddress("");
    });
    return () => myTokenContract.removeAllListeners();
  }, []);

  function handleMinterAddress(e) {
    setMinterAddress(e.target.value);
  }

  async function addToWhiteList() {
    try {
      await myTokenContract.addMinter(minterAddress);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error({ err });
      setMessage(err.data.message);
      setTimeout(() => setMessage(""), 5000);
    }
  }

  async function removeFromWhitelist() {
    try {
      await myTokenContract.removeMinter(minterAddress);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error({ err });
      setMessage(err.data.message);
      setTimeout(() => setMessage(""), 5000);
    }
  }
  return (
    <section className="App">
      <h1>This is the Admin page</h1>
      <h2>
        Please enter a contract address below and click 'Add minter' or 'Remove
        minter' to add or remove the address to your list of minters
      </h2>
      {message ? <p>{message}</p> : null}
      <form>
        <p>Enter a valid Adrress</p>
        <div>
          <input
            type="text"
            name="minterAddress"
            onChange={handleMinterAddress}
            value={minterAddress}
            placeholder="0x234..."
          />
        </div>
        <div>
          <button type="button" onClick={addToWhiteList}>
            Add minter
          </button>
        </div>
        <div>
          <button type="button" onClick={removeFromWhitelist}>
            Remove minter
          </button>
        </div>
      </form>
    </section>
  );
}
