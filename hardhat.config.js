require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    altcoinchain: {
      url: "http://99.248.100.186:8645",
      chainId: 2330,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    etica: {
      url: "https://eticamainnet.eticascan.org",
      chainId: 61803,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    planq: {
      url: "https://evm-rpc.planq.network",
      chainId: 7070,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    octaspace: {
      url: "https://rpc.octa.space",
      chainId: 800001,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    dogechain: {
      url: "https://rpc.dogechain.dog",
      chainId: 2000,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    sonic: {
      url: "https://rpc.soniclabs.com",
      chainId: 146,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    fantom: {
      url: "https://rpc.ftm.tools",
      chainId: 250,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  },
  etherscan: {
    apiKey: {
      // Add API keys for verification if needed
    }
  }
};