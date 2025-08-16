import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const OathLockModule = buildModule("OathLockModule", (m) => {
  // Get current network from Hardhat Runtime Environment
  const network = m.getParameter("network", "localhost") as unknown as string;

  let usdcToken;
  
  if (network === "flowMainnet") {
    usdcToken = m.contractAt("IERC20", "0xF1815bd50389c46847f0Bda824eC8da914045D14"); // stgUSDC
  } else if (network === "zircuitMainnet") {
    usdcToken = m.contractAt("IERC20", "0x3b952c8C9C44e8Fe201e2b26F6B2200203214cfF"); // USDC.e
  } else {
    // If the network is not recognized, use a mock contract for testing purposes
    usdcToken = m.contract("MockUSDC", []);
  }

  const oathLock = m.contract("OathLock", [usdcToken]);

  return { oathLock, usdcToken };
});

export default OathLockModule;