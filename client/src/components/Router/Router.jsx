import React from "react";
import { Routes, Route } from "react-router-dom";
import Admin from "../Admin/Admin";
import Home from "../Home/Home";

export default function MyRouter({ isMinter, signerAddress, instances, signer }) {
  const { myTokenContract, myCrowdsaleContract } = instances;

  return (
    <Routes>
      <Route
        path="/admin"
        element={
          <>
            {isMinter ? (
              <Admin
                signerAddress={signerAddress}
                myTokenContract={myTokenContract}
              />
            ) : (
              <h2>You are not allowed to view this page</h2>
            )}
          </>
        }
      />
      <Route
        exact
        path="/"
        element={
          <Home
            signerAddress={signerAddress}
            myTokenContract={myTokenContract}
            myCrowdsaleContract={myCrowdsaleContract}
            signer={signer}
          />
        }
      />
    </Routes>
  );
}
