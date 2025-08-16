import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  const Sample = await hre.ethers.getContractFactory("Sample");
  const sample = await Sample.deploy("Hello, Hardhat!");

  await sample.waitForDeployment();

  console.log("Sample contract deployed to:", await sample.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });