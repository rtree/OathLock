import { expect } from "chai";
import { ethers } from "hardhat";
import { OathLock, MockUSDC } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("OathLock", function () {
  let oathLock: OathLock;
  let mockUSDC: MockUSDC;
  let alice   : HardhatEthersSigner;
  let bob     : HardhatEthersSigner;
  
  const AMOUNT = ethers.parseUnits("0.000001", 6); // 0.000001 USDC (6 decimals)
  const ONE_MONTH = 30 * 24 * 60 * 60; // 30 days in seconds

  beforeEach(async function () {
    [alice, bob] = await ethers.getSigners();

    // Deploy MockUSDC
    const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDCFactory.deploy();

    // Deploy OathLock
    const OathLockFactory = await ethers.getContractFactory("OathLock");
    oathLock = await OathLockFactory.deploy(await mockUSDC.getAddress());

    // Mint USDC to Alice and approve OathLock
    await mockUSDC.mint(alice.address, ethers.parseUnits("1", 6)); // 1 USDC
    await mockUSDC.connect(alice).approve(await oathLock.getAddress(), ethers.parseUnits("1", 6));
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
    const oathId = 1; // First oath gets ID 1

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

    await oathLock.connect(bob).sellerShip(oathId, shipDeadline, trackingHash);

    // Verify shipment declaration
    const shippedOath = await oathLock.oaths(oathId);
    expect(shippedOath.status).to.equal(1); // Status.Shipped
    expect(shippedOath.shipDeadline).to.equal(shipDeadline);
    expect(shippedOath.trackingHash).to.equal(trackingHash);
    console.log("✓ Shipment declared successfully");

    // 3. Alice confirms arrival
    console.log("Step 3: Alice confirms arrival...");
    const bobInitialBalance = await mockUSDC.balanceOf(bob.address);
    
    await oathLock.connect(alice).buyerApprove(oathId);

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
    console.log(`Amount locked: ${ethers.formatUnits(AMOUNT, 6)} USDC`);
    console.log(`Alice (buyer): ${alice.address}`);
    console.log(`Bob (seller): ${bob.address}`);
    console.log(`Final Bob balance: ${ethers.formatUnits(bobFinalBalance, 6)} USDC`);
    console.log("✓ All steps completed successfully!");
  });
});