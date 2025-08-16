import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SampleModule = buildModule("SampleModule", (m) => {
  const initialMessage = m.getParameter("initialMessage", "Hello, Hardhat!");
  
  const sample = m.contract("Sample", [initialMessage]);

  return { sample };
});

export default SampleModule;