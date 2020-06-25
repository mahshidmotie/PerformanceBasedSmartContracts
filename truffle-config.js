require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');
module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      provider: () => new HDWalletProvider(process.env.ORACLE_RinkebyACCOUNTMNEMONIC, process.env.Infura_API_Key),
      host: "localhost",
      port: 8545,
      network_id: "4", // Rinkeby ID 4
      from: "0x5bD14b0aC08a7976af473a08E05A1e681C60cB23", // account from which to deploy
      gas: 10000000,        // Rinkeby has a lower block limit than mainnet
      gasPrice: 10000000000
    }
  },
   solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
}
