import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const MNEMONIC = process.env.MNEMONIC;

if (!MNEMONIC) {
  throw new Error("Please set your MNEMONIC in a .env file");
}

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      accounts: {
        mnemonic: "your custom mnemonic here",
        count: 10, // number of accounts to generate
        accountsBalance: "10000000000000000000000", // 10000 ETH per account
      },
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
      },
    },
    flowMainnet: {
      url: "https://mainnet.evm.nodes.onflow.org",
      chainId: 747,
      accounts: {
        mnemonic: MNEMONIC,
      },
      gasPrice: 1000000000, // 1 gwei
    },
    flowTestnet: {
      url: "https://testnet.evm.nodes.onflow.org",
      chainId: 545,
      accounts: {
        mnemonic: MNEMONIC,
      },
      gasPrice: 1000000000, // 1 gwei
    },
    zircuitMainnet: {
      url: "https://mainnet.zircuit.com",
      chainId: 48900,
      accounts: {
        mnemonic: MNEMONIC,
      },
    },
  },
};

export default config;
