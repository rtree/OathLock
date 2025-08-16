import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const OathLockModule = buildModule("OathLockModule", (m) => {
  // For the purpose of deployment, we'll deploy a mock USDC token.
  // In a real-world scenario, you would use the actual USDC contract address.
  const mockUSDC = m.contract("MockERC20", ["MockUSDC", "mUSDC"]);

  const oathLock = m.contract("OathLock", [mockUSDC]);

  return { oathLock };
});

// A simple mock ERC20 contract for testing purposes
const MockERC20Module = buildModule("MockERC20Module", (m) => {
    const token = m.contract("MockERC20", ["MockUSDC", "mUSDC"]);
    return { token };
    }
);

export default OathLockModule;
