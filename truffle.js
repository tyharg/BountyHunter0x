var HDWalletProvider = require("truffle-hdwallet-provider");

var mnemonic = "your_mnemoic_here";

module.exports = {
  networks: {
    live: {
      network_id: 1,
      provider: new HDWalletProvider(mnemonic, "your_mainnet_infura_link_here"),
      gas: "5000000",           // 4.7M
      gasPrice: "6000000000"  

    },
      ropsten: {
      provider: new HDWalletProvider(mnemonic, "your_ropsten_infura_link_here"),
      network_id: 3,
      gas: "4000000",           // 4M
      gasPrice: "4000000000"
    }
  }
};
