# Performance Based Smart Contracts

This code was developed in a master thesis at [ETH Zurich, chair of innovative and industrial construction](https://ic.ibi.ethz.ch/) during 2019-2020 by Mahshid Motie, under the supervision of Jens Hunhevicz and Prof. Dr. Daniel Hall.

License: [MIT](./LICENSE)

***Important***: We do not guarantee any functionality. The system would need to be reviewed and tested carefully. Do not use for production!

## Functionality

The goal of the research was to test performance based smart contracts in the built environment through connecting real-time performance sensor data of a building to a blockchain-based smart contract. This proof-of-concept solution used sensor data of the [Aspern technology center](https://www.ascr.at/en/technology-centre/) in Vienna and the [Siemens building twin platform](https://new.siemens.com/global/en/products/buildings/digital-building-lifecycle/building-twin.html). The smart contracts were deployed to the [Rinkeby](https://www.rinkeby.io/#stats) test network of [Ethereum](https://ethereum.org/). You can find the deployed contract [here](https://rinkeby.etherscan.io/address/0x2b8aaf9B539fA288e1dFEa8866B6b51d1cD804B3).

You can read more here :
[Digital Building Twins and Blockchain for Performance-Based (Smart) Contracts](https://arxiv.org/abs/2105.05192)

## Run the application
Unfortunately, running the full application needs access to the digital building twin. Nevertheless, we hope the code can be helpful to inspire your own implementation.

To get started with the application, clone this repository, access it in the terminal, and run:

```
npm install
```

### Deploy the smart contract
We use the [Ganache Local Blockchain](http://truffleframework.com/ganache/) that comes in the [Truffle Framework](http://truffleframework.com/).

First you need to install truffle. To deploy the smart contrats to the local network, open the terminal and run inside this repo:

```
truffle develop
compile
migrate
```

If you want to deploy to the Rinkeby network, use after compiling the following command instead:

```
migrate --network rinkeby
```

### Run the web application
For deploying the smart contracts, you need a browser with [Metamask](https://metamask.io/) installed.

Move to the `client` folder to start the app with:

```
npm run start
```
Unlock Metamask, point it to the right port (usually port: 7545 or 8545), and you are ready to go.

### Run the server

Move to the `server` folder to start the app with:

```
npm run dev
```

### Connect to the building twin

You need to create an .env file with the following content:

```
PORT=3000

MODE="development"

LOCAL_NODE="http://localhost:8545"

TOKEN_ENDPOINT=

TOKEN_AUDIENCE=

CLIENT_ID=

CLIENT_SECRET=

BASE_PATH="/core/buildings"

API_DOMAIN="api.buildingtwin.siemens.com"

ORACLE_ACCOUNTMNEMONIC= 

ORACLE_ACCOUNTPRIVATE_KEY=

Infura_API_Key=

ORACLE_RinkebyACCOUNTMNEMONIC=


FORCE_PROXY=1

HTTP_PROXY=

HTTPS_PROXY=
```