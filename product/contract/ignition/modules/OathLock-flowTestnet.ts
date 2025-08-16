import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const OathLockModule = buildModule("OathLockModule", (m) => {

  let NETWORK = "flowTestnet";

  let usdcToken;
  switch(NETWORK) {
    case "flowMainnet":
      usdcToken = m.contractAt("IERC20", "0xF1815bd50389c46847f0Bda824eC8da914045D14"); // stgUSDC 
      break;
    case "zircuitMainnet":
      usdcToken = m.contractAt("IERC20", "0x3b952c8C9C44e8Fe201e2b26F6B2200203214cfF"); // Zircuit Mainnet (USDC.e)
      break;
    default:
      // For local or testnet networks, deploy a mock USDC contract
      usdcToken = m.contract("MockUSDC", []);
  }

  const oathLock = m.contract("OathLock", [usdcToken]);
  return { oathLock, usdcToken };
});

export default OathLockModule;