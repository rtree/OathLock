import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const sample = await ethers.deployContract("Sample", ["Hello, Hardhat!"]);

  console.log("Sample contract deployed to:", await sample.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
