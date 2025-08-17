import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const OathLockModule = buildModule("OathLockModule", (m) => {

  let NETWORK = "flowTestnet";

  let usdcToken; let schemaRegistryAddr; let eas; let resolver;
  switch(NETWORK) {
    case "flowMainnet":
      usdcToken = m.contractAt("IERC20", "0xF1815bd50389c46847f0Bda824eC8da914045D14"); // stgUSDC
      schemaRegistryAddr = "0xB0cF748a05AEA8D59e15834446CFC95bcFF510F0";
      resolver           = "0x0000000000000000000000000000000000000000";
      eas                = "0xc6376222F6E009A705a34dbF1dF72fEf8efB3964";
      break;
    case "flowTestnet":
      usdcToken = m.contract("MockUSDC", []);
      schemaRegistryAddr = "0x97900F59828Da4187607Cb8F84f49e3944199d18"; 
      resolver           = "0x0000000000000000000000000000000000000000";
      eas                = "0xBCF2dA8f82fb032A2474c92Ec5b70C95A83fc0cc";
      break;
    case "zircuitMainnet":
      usdcToken = m.contractAt("IERC20", "0x3b952c8C9C44e8Fe201e2b26F6B2200203214cfF"); // Zircuit Mainnet (USDC.e)
      schemaRegistryAddr = "";
      resolver           = "0x0000000000000000000000000000000000000000";
      eas                = "";
      break;
    default:
      // For local or testnet networks, deploy a mock USDC contract
      usdcToken = m.contract("MockUSDC", []);
      schemaRegistryAddr = "";
      resolver           = "0x0000000000000000000000000000000000000000";
      eas                = "";
  }

  // EAS contracts
  const easContract = m.contractAt("IEAS", eas);
  const registry = m.contractAt("ISchemaRegistry", schemaRegistryAddr);

  // Schema definitions
  // const ORDER_OPENED =
  //   "uint256 oathId,address buyer,address seller,address token,uint256 amount,uint64 expiry,uint64 shipDeadline,bytes32 trackingHash";
  // const SHIPMENT_DECLARED =
  //   "uint256 oathId,bytes32 trackingHash,uint64 shippedAt,string carrierCode";
  // const DISPUTE_FILED =
  //   "uint256 oathId,address buyer,address seller,uint8 category,bytes32 evidenceHash,string evidenceURI";
  // const REPUTATION_TAG =
  //   "uint256 oathId,address subject,uint8 kind,int8 polarity,uint8 category";
  // const SETTLEMENT_EXECUTED =
  //   "uint256 oathId,address beneficiary,uint8 outcome,string notesURI";
  const SCHEMAS ={
    "ORDER_OPENED": "0xff882f8b3aa4e431c6b6de0b9b340949f4936802c9ee9b15742bb972e5c32077",
    "SHIPMENT_DECLARED": "0xbbbb0022dd3f65424a4498a03347095b542f76d7b4c3d19529e2a7f384f5fa57",
    "DISPUTE_FILED": "0xe84bde5f4426c38052411e7f0bbb69b411c7bb51477a014bfaa12b461dfb94be",
    "REPUTATION_TAG": "0xf6bc7b8f558388212ae8d902de2e592f0873e89688a5ae25da616caedb1f1276",
    "SETTLEMENT_EXECUTED": "0x74b39c9d6f3db4275f201d2a199c1c02db949fcfcde3ac1cadbc73903cfb004a"
  }

  const oathLockEAS = m.contract("OathLockEAS",
         [usdcToken, 
          easContract,
          SCHEMAS.ORDER_OPENED,
          SCHEMAS.SHIPMENT_DECLARED,
          SCHEMAS.DISPUTE_FILED,
          SCHEMAS.REPUTATION_TAG,
          SCHEMAS.SETTLEMENT_EXECUTED
         ]);
  
  return { 
    oathLockEAS, 
    usdcToken,
    easContract,
    registry 
  };
});

export default OathLockModule;