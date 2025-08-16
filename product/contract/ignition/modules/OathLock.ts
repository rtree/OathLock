import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// Mock USDC address for local testing (you can use any address for local deployment)
const MOCK_USDC_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const OathLockModule = buildModule("OathLockModule", (m) => {
  const usdcToken = m.getParameter("usdcToken", MOCK_USDC_ADDRESS);

  const oathLock = m.contract("OathLock", [usdcToken]);

  return { oathLock };
});

export default OathLockModule;