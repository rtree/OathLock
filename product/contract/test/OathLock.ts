import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { ethers } from "ethers";

describe("OathLock", function () {
  async function deployOathLockFixture() {
    const [owner, alice, bob] = await hre.ethers.getSigners();

    // Deploy MockUSDC
    const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
    const usdc = await MockERC20.deploy("MockUSDC", "mUSDC");
    
    // Deploy OathLock
    const OathLock = await hre.ethers.getContractFactory("OathLock");
    const oathLock = await OathLock.deploy(await usdc.getAddress());

    // Mint some USDC for Alice
    const depositAmount = hre.ethers.parseUnits("0.0001", 6); // USDC has 6 decimals
    await usdc.mint(alice.address, depositAmount);

    // Approve OathLock to spend Alice's USDC
    await usdc.connect(alice).approve(await oathLock.getAddress(), depositAmount);

    return { oathLock, usdc, owner, alice, bob, depositAmount };
  }

  describe("Scenarios", function () {
    it("Scenario 1: Peaceful transaction", async function () {
      const { oathLock, usdc, alice, bob, depositAmount } = await loadFixture(deployOathLockFixture);
      const bobInitialBalance = await usdc.balanceOf(bob.address);

      const expiry = (await time.latest()) + time.duration.days(7);
      const shipDeadline = (await time.latest()) + time.duration.days(3);

      // 1. Alice deposits 0.0001 USDC to OathLock
      const createTx = await oathLock.connect(alice).createOath(bob.address, depositAmount, expiry);
      const receipt = await createTx.wait();
      const oathId = receipt.logs[1].args[0];

      expect(await usdc.balanceOf(await oathLock.getAddress())).to.equal(depositAmount);

      // 2. Bob ships product to Alice
      const trackingHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("TRACKING123"));
      await oathLock.connect(bob).sellerShip(oathId, shipDeadline, trackingHash);
      const oath = await oathLock.oaths(oathId);
      expect(oath.status).to.equal(1); // Shipped

      // 3. Alice accepts peacefully and closes
      await oathLock.connect(alice).buyerApprove(oathId);
      
      const oathAfter = await oathLock.oaths(oathId);
      expect(oathAfter.status).to.equal(2); // Approved
      expect(await usdc.balanceOf(bob.address)).to.equal(bobInitialBalance + depositAmount);
      expect(await usdc.balanceOf(await oathLock.getAddress())).to.equal(0);
    });

    it("Scenario 2: Malicious seller and dispute", async function () {
        const { oathLock, usdc, alice, bob, depositAmount } = await loadFixture(deployOathLockFixture);
        const bobInitialBalance = await usdc.balanceOf(bob.address);
  
        const expiry = (await time.latest()) + time.duration.days(7);
        const shipDeadline = (await time.latest()) + time.duration.days(3);
  
        // 1. Alice deposits 0.0001 USDC to OathLock
        const createTx = await oathLock.connect(alice).createOath(bob.address, depositAmount, expiry);
        const receipt = await createTx.wait();
        const oathId = receipt.logs[1].args[0];

        expect(await usdc.balanceOf(await oathLock.getAddress())).to.equal(depositAmount);
  
        // 2. Bob is malicious, he ships a stone to Alice
        const trackingHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("FAKETRACKING"));
        await oathLock.connect(bob).sellerShip(oathId, shipDeadline, trackingHash);

        // 3. Alice opens disputes
        const evidenceURL = "https://example.com/evidence.jpg";
        await oathLock.connect(alice).buyerDispute(oathId, evidenceURL);
        
        const oath = await oathLock.oaths(oathId);
        expect(oath.status).to.equal(3); // Disputed
        expect(oath.evidenceURL).to.equal(evidenceURL);

        // 4. Time passes, and the oath expires
        await time.increaseTo(expiry + 1);

        // 5. Anyone can settle the transaction
        await oathLock.settle(oathId);

        // Bog gets USDC with bad reputation
        const oathAfter = await oathLock.oaths(oathId);
        expect(oathAfter.status).to.equal(4); // Settled
        expect(await usdc.balanceOf(bob.address)).to.equal(bobInitialBalance + depositAmount);
        expect(await usdc.balanceOf(await oathLock.getAddress())).to.equal(0);
      });
  });
});
