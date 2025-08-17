import { ethers } from "hardhat";

async function main() {
  // Flow Testnet EAS addresses
  const SCHEMA_REGISTRY_ADDRESS = "0x97900F59828Da4187607Cb8F84f49e3944199d18";
  const RESOLVER_ADDRESS = "0x0000000000000000000000000000000000000000";

  // Schema Registry contract ABI (最低限必要な部分)
  const schemaRegistryABI = [
    "function register(string schema, address resolver, bool revocable) external returns (bytes32)"
  ];

  // Connect to the schema registry
  const [deployer] = await ethers.getSigners();
  const schemaRegistry = new ethers.Contract(
    SCHEMA_REGISTRY_ADDRESS,
    schemaRegistryABI,
    deployer
  );

  // Schema definitions
  const schemas = {
    ORDER_OPENED: "uint256 oathId,address buyer,address seller,address token,uint256 amount,uint64 expiry,uint64 shipDeadline,bytes32 trackingHash",
    SHIPMENT_DECLARED: "uint256 oathId,bytes32 trackingHash,uint64 shippedAt,string carrierCode",
    DISPUTE_FILED: "uint256 oathId,address buyer,address seller,uint8 category,bytes32 evidenceHash,string evidenceURI",
    REPUTATION_TAG: "uint256 oathId,address subject,uint8 kind,int8 polarity,uint8 category",
    SETTLEMENT_EXECUTED: "uint256 oathId,address beneficiary,uint8 outcome,string notesURI"
  };

  console.log("Registering schemas...");
  const schemaUIDs: { [key: string]: string } = {};

  for (const [name, schema] of Object.entries(schemas)) {
    try {
      console.log(`Registering ${name}...`);
      const tx = await schemaRegistry.register(schema, RESOLVER_ADDRESS, false);
      const receipt = await tx.wait();
      
      // Get the schema UID from the event logs
      const schemaUID = receipt.logs[0].topics[1];
      schemaUIDs[name] = schemaUID;
      
      console.log(`✅ ${name}: ${schemaUID}`);
    } catch (error) {
      console.error(`❌ Failed to register ${name}:`, error);
    }
  }

  console.log("\n📝 Schema UIDs:");
  console.log(JSON.stringify(schemaUIDs, null, 2));

  // Save to file for later use
  const fs = require('fs');
  const path = require('path');
  
  // Ignitionのdeploymentsディレクトリに保存
  const deploymentsDir = './ignition/deployments';
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const filePath = path.join(deploymentsDir, 'eas-schema-uids.json');
  fs.writeFileSync(filePath, JSON.stringify(schemaUIDs, null, 2));
  
  console.log(`\n💾 Schema UIDs saved to ${filePath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });