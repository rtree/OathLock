import { expect } from "chai";
import { ethers, network } from "hardhat";
import { OathLockEAS, MockUSDC } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import fs from "fs";
import path from "path";

describe("OathLockEAS", function () {
  let oathLockEAS: OathLockEAS;
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

    const deployedAddresses = getDeployedAddresses();
    
    if (deployedAddresses && deployedAddresses["OathLockModule#OathLockEAS"]) {
      console.log("Using deployed contracts...");
      const oathLockEASAddress = deployedAddresses["OathLockModule#OathLockEAS"];
      
      oathLockEAS = await ethers.getContractAt("OathLockEAS", oathLockEASAddress);
      console.log(`OathLockEAS at: ${oathLockEASAddress}`);
      
      // ネットワークに応じてUSDCトークンを設定
      if (network.name === "flowMainnet") {
        // Flow Mainnet: 本物のstgUSDCを使用
        const stgUSDCAddress = "0xF1815bd50389c46847f0Bda824eC8da914045D14";
        mockUSDC = await ethers.getContractAt("IERC20", stgUSDCAddress) as any;
        console.log(`Using real stgUSDC at: ${stgUSDCAddress}`);
        
        // 本物のUSDCの場合、既存残高をチェック
        const aliceBalance = await mockUSDC.balanceOf(alice.address);
        console.log(`Alice stgUSDC balance: ${ethers.formatUnits(aliceBalance, 6)} stgUSDC`);
        
        if (aliceBalance < AMOUNT) {
          throw new Error(`Alice needs at least ${ethers.formatUnits(AMOUNT, 6)} stgUSDC for this test`);
        }
        
      } else if (network.name === "zircuitMainnet") {
        // Zircuit Mainnet: 本物のUSDC.eを使用
        const usdcAddress = "0x3b952c8C9C44e8Fe201e2b26F6B2200203214cfF";
        mockUSDC = await ethers.getContractAt("IERC20", usdcAddress) as any;
        console.log(`Using real USDC.e at: ${usdcAddress}`);
        
        // 本物のUSDCの場合、既存残高をチェック
        const aliceBalance = await mockUSDC.balanceOf(alice.address);
        console.log(`Alice USDC.e balance: ${ethers.formatUnits(aliceBalance, 6)} USDC.e`);
        
        if (aliceBalance < AMOUNT) {
          throw new Error(`Alice needs at least ${ethers.formatUnits(AMOUNT, 6)} USDC.e for this test`);
        }
        
      } else if (network.name === "flowTestnet") {
        // Flow Testnet: MockUSDCを使用
        const mockUSDCAddress = deployedAddresses["OathLockModule#MockUSDC"];
        mockUSDC = await ethers.getContractAt("MockUSDC", mockUSDCAddress);
        console.log(`Using MockUSDC at: ${mockUSDCAddress}`);
        
        // MockUSDCの場合、必要に応じてmint
        const aliceBalance = await mockUSDC.balanceOf(alice.address);
        if (aliceBalance < ethers.parseUnits("1", 6)) {
          await mockUSDC.connect(alice).mint(alice.address, ethers.parseUnits("1", 6));
          console.log("Minted USDC to Alice");
        }
      } else {
        // その他のテストネット: MockUSDCを使用
        const mockUSDCAddress = deployedAddresses["OathLockModule#MockUSDC"];
        if (mockUSDCAddress) {
          mockUSDC = await ethers.getContractAt("MockUSDC", mockUSDCAddress);
          console.log(`Using MockUSDC at: ${mockUSDCAddress}`);
          
          // MockUSDCの場合、必要に応じてmint
          const aliceBalance = await mockUSDC.balanceOf(alice.address);
          if (aliceBalance < ethers.parseUnits("1", 6)) {
            await mockUSDC.connect(alice).mint(alice.address, ethers.parseUnits("1", 6));
            console.log("Minted USDC to Alice");
          }
        } else {
          throw new Error("MockUSDC not found in deployment");
        }
      }
      
      // Approve OathLockEAS
      await mockUSDC.connect(alice).approve(oathLockEASAddress, ethers.parseUnits("1", 6));
      
    } else {
      throw new Error("OathLockEAS not found in deployment. Please deploy first using: npx hardhat ignition deploy ./ignition/modules/OathLock-flowTestnet.ts --network flowTestnet");
    }
  });

  it("Should execute complete Alice-Bob shipping scenario with EAS attestations", async function () {
    const currentTime = await ethers.provider.getBlock("latest").then(b => b!.timestamp);
    const expiry = currentTime + ONE_MONTH;
    const shipDeadline = currentTime + (7 * 24 * 60 * 60); // 7 days from now

    // 1. Alice creates Oath for Bob
    console.log("Step 1: Alice creates Oath...");
    const createTx = await oathLockEAS.connect(alice).createOath(
      bob.address,
      AMOUNT,
      expiry
      // shipDeadline は削除（契約では sellerShip で設定）
    );

    const receipt = await createTx.wait();
    console.log(`Transaction hash: ${receipt?.hash}`);
    
    // Get the oath ID from the event
    const oathCreatedEvent = receipt?.logs.find(log => {
      try {
        const parsed = oathLockEAS.interface.parseLog({
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
      const parsed = oathLockEAS.interface.parseLog({
        topics: oathCreatedEvent.topics as string[],
        data: oathCreatedEvent.data
      });
      oathId = parsed?.args[0]; // First argument is the oath ID
    } else {
      oathId = 1n; // Fallback to 1 for first oath
    }

    console.log(`Oath ID: ${oathId}`);

    // Verify oath creation
    const oath = await oathLockEAS.oaths(oathId);
    expect(oath.buyer).to.equal(alice.address);
    expect(oath.seller).to.equal(bob.address);
    expect(oath.amount).to.equal(AMOUNT);
    expect(oath.status).to.equal(0); // Status.Created

    // Check that USDC was transferred to contract
    expect(await mockUSDC.balanceOf(await oathLockEAS.getAddress())).to.equal(AMOUNT);
    console.log("✓ Oath created successfully with EAS attestation");

    // 2. Bob declares he shipped
    console.log("Step 2: Bob declares shipment...");
    const trackingHash = ethers.keccak256(ethers.toUtf8Bytes("TRACKING123456"));

    const shipTx = await oathLockEAS.connect(bob).sellerShip(
      oathId, 
      shipDeadline,  // 正しい順序：shipDeadline が2番目
      trackingHash   // trackingHash が3番目、carrierCode は削除
    );
    const shipReceipt = await shipTx.wait();
    console.log(`Ship transaction hash: ${shipReceipt?.hash}`);

    // Verify shipment declaration
    const shippedOath = await oathLockEAS.oaths(oathId);
    expect(shippedOath.status).to.equal(1); // Status.Shipped
    expect(shippedOath.trackingHash).to.equal(trackingHash);
    expect(shippedOath.shipDeadline).to.equal(shipDeadline); // shipDeadline の検証も追加
    console.log("✓ Shipment declared successfully with EAS attestation");

    // 3. Alice confirms arrival
    console.log("Step 3: Alice confirms arrival...");
    const bobInitialBalance = await mockUSDC.balanceOf(bob.address);
    
    const approveTx = await oathLockEAS.connect(alice).buyerApprove(oathId);
    const approveReceipt = await approveTx.wait();
    console.log(`Approve transaction hash: ${approveReceipt?.hash}`);

    // Verify approval and payment
    const approvedOath = await oathLockEAS.oaths(oathId);
    expect(approvedOath.status).to.equal(2); // Status.Approved

    // Check that Bob received the payment
    const bobFinalBalance = await mockUSDC.balanceOf(bob.address);
    expect(bobFinalBalance - bobInitialBalance).to.equal(AMOUNT);

    // Check that contract balance is now zero
    expect(await mockUSDC.balanceOf(await oathLockEAS.getAddress())).to.equal(0);
    console.log("✓ Payment completed successfully with EAS settlement attestation");

    console.log("\n=== Test Summary ===");
    console.log(`Network: ${network.name} (Chain ID: ${network.config.chainId})`);
    console.log(`Amount locked: ${ethers.formatUnits(AMOUNT, 6)} USDC`);
    console.log(`Alice (buyer): ${alice.address}`);
    console.log(`Bob (seller): ${bob.address}`);
    console.log(`Final Bob balance: ${ethers.formatUnits(bobFinalBalance, 6)} USDC`);
    console.log(`OathLockEAS contract: ${await oathLockEAS.getAddress()}`);
    
    // ネットワークに応じてトークン名を表示
    let tokenName = "USDC";
    if (network.name === "flowMainnet") {
      tokenName = "stgUSDC";
    } else if (network.name === "zircuitMainnet") {
      tokenName = "USDC.e";
    } else if (network.name === "flowTestnet") {
      tokenName = "MockUSDC";
    }
    
    console.log(`Token contract: ${await mockUSDC.getAddress()} (${tokenName})`);
    console.log("✓ All steps completed successfully with EAS attestations!");
  });
});