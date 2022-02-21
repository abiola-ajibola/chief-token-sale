# Minted Crowdsale

A Web3 contract that makes you able to purchase ERC20 tokens using a React frontend.

## How To Run Locally

- Install dependencies

  ```shell
  yarn install && cd client && yarn install
  ```

  This installs the dependencies for the smart contracts and the react frontend

- Start react app

  ```shell
  cd client && yarn start
  ```

- To start a development blockchain node (using the built in node for hardhat)

  ```shell
  yarn start-node
  ```

- To compile the smart contracts

  ```shell
  yarn compile
  ```

- To deploy the smart contracts to the local node
  ```shell
  yarn deploy-local
  ```
