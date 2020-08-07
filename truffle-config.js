require("dotenv").config();

const HDWalletProvider = require('@truffle/hdwallet-provider');
const infuraProjectId = process.env.INFURA_PROJECT_ID;

module.exports = {
  plugins: [
    "solidity-coverage"
  ],
  mocha: {
    reporter: 'eth-gas-reporter',
    reporterOptions : { excludeContracts: ['Migrations'] }
  },
  networks: {
   ganache: {
     host: "localhost",
     port: 8545,
     network_id: "*"
   },
   ropsten: {
    provider: () => new HDWalletProvider(process.env.DEV_MNEMONIC, "https://ropsten.infura.io/v3/" + infuraProjectId),
    network_id: 3,       // Ropsten's id
   },
   rinkeby: {
    provider: () => new HDWalletProvider(process.env.DEV_MNEMONIC, "https://rinkeby.infura.io/v3/" + infuraProjectId),
    network_id: 4,       // Rinkeby's id
   },
   kovan: {
    provider: () => new HDWalletProvider(process.env.DEV_MNEMONIC, "https://kovan.infura.io/v3/" + infuraProjectId),
    network_id: 42,       // Kovan's id
   },
   goerli: {
     provider: () => new HDWalletProvider(process.env.DEV_MNEMONIC, "https://goerli.infura.io/v3/" + infuraProjectId),
     network_id: 5,       // Goerli's id
     gas: 8000000,
   }
  },
  compilers: {
    solc: {
      version: "0.6.8",
    }
  }
};