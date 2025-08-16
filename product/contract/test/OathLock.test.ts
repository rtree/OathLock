import { expect } from "chai";
import { ethers, network } from "hardhat";
import { OathLock, MockUSDC } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import fs from "fs";
import path from "path";

describe("OathLock", function () {
  let oathLock: OathLock;
  let mockUSDC: MockUSDC;
  let alice: HardhatEthersSigner;
  let bob: HardhatEthersSigner;
  
  const AMOUNT = ethers.parseUnits("0.000001", 6); // 0.000001 USDC (6 decimals)
  const ONE_MONTH = 30 * 24 * 60 * 60; // 30 days in seconds

  // Function to get deployed contract addresses
  function getDeployedAddresses() {
    const chainId = network.config.chainId;
    const deploymentPath = path.join(__dirname, `../ignition/deployments/chain-${chainId}/deployed_addresses.json`);
    
    if (fs.existsSync(deploymentPath)) {
      const addresses = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
      console.log(`Reading deployed addresses from: ${deploymentPath}`);
      console.log('Deployed addresses:', addresses);
      return addresses;
    } else {
      console.log(`No deployment file found at: ${deploymentPath}`);
      return null;
    }
  }

  beforeEach(async function () {
    [alice, bob] = await ethers.getSigners();

    console.log(`Testing on network: ${network.name} (Chain ID: ${network.config.chainId})`);
    console.log(`Alice address: ${alice.address}`);
    console.log(`Bob address: ${bob.address}`);

    // Try to get deployed addresses first
    const deployedAddresses = getDeployedAddresses();
    
    if (deployedAddresses && 
        deployedAddresses["OathLockModule#OathLock"] && 
        deployedAddresses["OathLockModule#MockUSDC"]) {
      
      // Use deployed contracts
      console.log("Using deployed contracts...");
      const oathLockAddress = deployedAddresses["OathLockModule#OathLock"];
      const mockUSDCAddress = deployedAddresses["OathLockModule#MockUSDC"];
      
      oathLock = await ethers.getContractAt("OathLock", oathLockAddress);
      mockUSDC = await ethers.getContractAt("MockUSDC", mockUSDCAddress);
      
      console.log(`OathLock at: ${oathLockAddress}`);
      console.log(`MockUSDC at: ${mockUSDCAddress}`);
      
      // Check if Alice already has USDC, if not mint some
      const aliceBalance = await mockUSDC.balanceOf(alice.address);
      if (aliceBalance < ethers.parseUnits("1", 6)) {
        await mockUSDC.connect(alice).mint(alice.address, ethers.parseUnits("1", 6));
      }
      
      // Approve OathLock
      await mockUSDC.connect(alice).approve(oathLockAddress, ethers.parseUnits("1", 6));
      
    } else {
      // Deploy new contracts (for local testing)
      console.log("Deploying new contracts for local testing...");
      
      const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
      mockUSDC = await MockUSDCFactory.deploy();

      const OathLockFactory = await ethers.getContractFactory("OathLock");
      oathLock = await OathLockFactory.deploy(await mockUSDC.getAddress());

      // Mint USDC to Alice and approve OathLock
      await mockUSDC.mint(alice.address, ethers.parseUnits("1", 6)); // 1 USDC
      await mockUSDC.connect(alice).approve(await oathLock.getAddress(), ethers.parseUnits("1", 6));
    }
  });

  it("Should execute complete Alice-Bob shipping scenario", async function () {
    const currentTime = await ethers.provider.getBlock("latest").then(b => b!.timestamp);
    const expiry = currentTime + ONE_MONTH;

    // 1. Alice creates Oath for Bob
    console.log("Step 1: Alice creates Oath...");
    const createTx = await oathLock.connect(alice).createOath(
      bob.address,
      AMOUNT,
      expiry
    );

    const receipt = await createTx.wait();
    console.log(`Transaction hash: ${receipt?.hash}`);
    
    // Get the oath ID from the event
    const oathCreatedEvent = receipt?.logs.find(log => {
      try {
        const parsed = oathLock.interface.parseLog({
          topics: log.topics as string[],
          data: log.data
        });
        return parsed?.name === 'OathCreated';
      } catch {
        return false;
      }
    });
    
    let oathId: bigint;
    if (oathCreatedEvent) {
      const parsed = oathLock.interface.parseLog({
        topics: oathCreatedEvent.topics as string[],
        data: oathCreatedEvent.data
      });
      oathId = parsed?.args[0]; // First argument is the oath ID
    } else {
      oathId = 1n; // Fallback to 1 for first oath
    }

    console.log(`Oath ID: ${oathId}`);

    // Verify oath creation
    const oath = await oathLock.oaths(oathId);
    expect(oath.buyer).to.equal(alice.address);
    expect(oath.seller).to.equal(bob.address);
    expect(oath.amount).to.equal(AMOUNT);
    expect(oath.status).to.equal(0); // Status.Created

    // Check that USDC was transferred to contract
    expect(await mockUSDC.balanceOf(await oathLock.getAddress())).to.equal(AMOUNT);
    console.log("✓ Oath created successfully");

    // 2. Bob declares he shipped
    console.log("Step 2: Bob declares shipment...");
    const shipDeadline = currentTime + (7 * 24 * 60 * 60); // 7 days from now
    const trackingHash = ethers.keccak256(ethers.toUtf8Bytes("TRACKING123456"));

    const shipTx = await oathLock.connect(bob).sellerShip(oathId, shipDeadline, trackingHash);
    const shipReceipt = await shipTx.wait();
    console.log(`Ship transaction hash: ${shipReceipt?.hash}`);

    // Verify shipment declaration
    const shippedOath = await oathLock.oaths(oathId);
    expect(shippedOath.status).to.equal(1); // Status.Shipped
    expect(shippedOath.shipDeadline).to.equal(shipDeadline);
    expect(shippedOath.trackingHash).to.equal(trackingHash);
    console.log("✓ Shipment declared successfully");

    // 3. Alice confirms arrival
    console.log("Step 3: Alice confirms arrival...");
    const bobInitialBalance = await mockUSDC.balanceOf(bob.address);
    
    const approveTx = await oathLock.connect(alice).buyerApprove(oathId);
    const approveReceipt = await approveTx.wait();
    console.log(`Approve transaction hash: ${approveReceipt?.hash}`);

    // Verify approval and payment
    const approvedOath = await oathLock.oaths(oathId);
    expect(approvedOath.status).to.equal(2); // Status.Approved

    // Check that Bob received the payment
    const bobFinalBalance = await mockUSDC.balanceOf(bob.address);
    expect(bobFinalBalance - bobInitialBalance).to.equal(AMOUNT);

    // Check that contract balance is now zero
    expect(await mockUSDC.balanceOf(await oathLock.getAddress())).to.equal(0);
    console.log("✓ Payment completed successfully");

    console.log("\n=== Test Summary ===");
    console.log(`Network: ${network.name} (Chain ID: ${network.config.chainId})`);
    console.log(`Amount locked: ${ethers.formatUnits(AMOUNT, 6)} USDC`);
    console.log(`Alice (buyer): ${alice.address}`);
    console.log(`Bob (seller): ${bob.address}`);
    console.log(`Final Bob balance: ${ethers.formatUnits(bobFinalBalance, 6)} USDC`);
    console.log(`OathLock contract: ${await oathLock.getAddress()}`);
    console.log(`MockUSDC contract: ${await mockUSDC.getAddress()}`);
    console.log("✓ All steps completed successfully!");
  });
});