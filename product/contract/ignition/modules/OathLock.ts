import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const OathLockModule = buildModule("OathLockModule", (m) => {
  // Get current network from Hardhat Runtime Environment
  const network = m.getParameter("network") as unknown as string;

  //"flowMainnet": "0xF1815bd50389c46847f0Bda824eC8da914045D14",    // stgUSDC
  //"zircuitMainnet": "0x3b952c8C9C44e8Fe201e2b26F6B2200203214cfF", // USDC.e

  let usdcToken;
  usdcToken = ""
  if (network=="flowMainnet")    usdcToken = m.contractAt("IERC20", "0xF1815bd50389c46847f0Bda824eC8da914045D14");// stgUSDC
  if (network=="zircuitMainnet") usdcToken = m.contractAt("IERC20", "0x3b952c8C9C44e8Fe201e2b26F6B2200203214cfF");// USDC.e
  if (usdcToken == "") {
    usdcToken = m.contract("MockUSDC", []);
  }else {
    // If the network is not recognized, we can still use a mock contract for testing purposes
    usdcToken = m.contractAt("IERC20", usdcToken);
  }

  const oathLock = m.contract("OathLock", [usdcToken]);

  return { oathLock, usdcToken };
});

export default OathLockModule;