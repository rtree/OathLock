// EASSchemas-flowTestnet.ts
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const EASSchemas = buildModule("EASSchemas", (m) => {

  let NETWORK = "flowTestnet";

  let schemaRegistryAddr; let eas; let resolver;
  switch(NETWORK) {
    case "flowMainnet":
      schemaRegistryAddr = "0xB0cF748a05AEA8D59e15834446CFC95bcFF510F0";
      resolver           = "0x0000000000000000000000000000000000000000";
      eas                = "0xc6376222F6E009A705a34dbF1dF72fEf8efB3964";
      break;
    case "flowTestnet":
      schemaRegistryAddr = "0x97900F59828Da4187607Cb8F84f49e3944199d18"; 
      resolver           = "0x0000000000000000000000000000000000000000";
      eas                = "0xBCF2dA8f82fb032A2474c92Ec5b70C95A83fc0cc";
      break;
    default:
      schemaRegistryAddr = "";
      resolver           = "0x0000000000000000000000000000000000000000";
      eas                = "";
  }
  const SCHEMA_REGISTRY_ADDRESS = schemaRegistryAddr
  const registry = m.contractAt("ISchemaRegistry", SCHEMA_REGISTRY_ADDRESS);

  const ORDER_OPENED =
    "uint256 oathId,address buyer,address seller,address token,uint256 amount,uint64 expiry,uint64 shipDeadline,bytes32 trackingHash";
  const SHIPMENT_DECLARED =
    "uint256 oathId,bytes32 trackingHash,uint64 shippedAt,string carrierCode";
  const DISPUTE_FILED =
    "uint256 oathId,address buyer,address seller,uint8 category,bytes32 evidenceHash,string evidenceURI";
  const REPUTATION_TAG =
    "uint256 oathId,address subject,uint8 kind,int8 polarity,uint8 category";
  const SETTLEMENT_EXECUTED =
    "uint256 oathId,address beneficiary,uint8 outcome,string notesURI";

  const EAS_ADDRESS             = eas;
  const easContract             = m.contractAt("IEAS", EAS_ADDRESS);
  // const UID_ORDER_OPENED        = m.call(registry, "register", [ORDER_OPENED, resolver, false]);
  // const UID_SHIPMENT_DECLARED   = m.call(registry, "register", [SHIPMENT_DECLARED, resolver, false]);
  // const UID_DISPUTE_FILED       = m.call(registry, "register", [DISPUTE_FILED, resolver, false]);
  // const UID_REPUTATION_TAG      = m.call(registry, "register", [REPUTATION_TAG, resolver, false]);
  // const UID_SETTLEMENT_EXECUTED = m.call(registry, "register", [SETTLEMENT_EXECUTED, resolver, false]);
  
  return {
    registry,
    easContract,
  };
});

export default EASSchemas;
