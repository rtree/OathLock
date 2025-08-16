import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";
import { ethers } from "ethers";

const MNEMONIC     = process.env.MNEMONIC;
const MNEMONIC_BOB = process.env.MNEMONIC_BOB;
if (!MNEMONIC || !MNEMONIC_BOB) {
  throw new Error("Please set your MNEMONIC in a .env file");
}
const mnemonic     = ethers.Mnemonic.fromPhrase(MNEMONIC);
const mnemonic_bob = ethers.Mnemonic.fromPhrase(MNEMONIC_BOB);
const aliceWallet  = ethers.HDNodeWallet.fromMnemonic(mnemonic, "m/44'/60'/0'/0/0");//MetaMask path
const bobWallet    = ethers.HDNodeWallet.fromMnemonic(mnemonic_bob, "m/44'/60'/0'/0/0");//MetaMask path
console.log(`Alice address: ${aliceWallet.address}`);
console.log(`Bob address  : ${bobWallet.address}`);

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
      accounts: [aliceWallet.privateKey, bobWallet.privateKey],
      gasPrice: 1000000000, // 1 gwei
    },
    flowTestnet: {
      url: "https://testnet.evm.nodes.onflow.org",
      chainId: 545,
      accounts: [aliceWallet.privateKey, bobWallet.privateKey],
      gasPrice: 1000000000, // 1 gwei
    },
    zircuitMainnet: {
      url: "https://mainnet.zircuit.com",
      chainId: 48900,
      accounts: [aliceWallet.privateKey, bobWallet.privateKey],
    },
  },
};

export default config;
