// Flow EVM Testnet Configuration
export const flowTestnet = {
  id: 545,
  name: 'Flow EVM Testnet',
  network: 'flow-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'FLOW',
    symbol: 'FLOW',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.evm.nodes.onflow.org'],
    },
    public: {
      http: ['https://testnet.evm.nodes.onflow.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Flow EVM Testnet Explorer',
      url: 'https://evm-testnet.flowscan.io',
    },
  },
  testnet: true,
}

// Contract addresses for Flow Testnet
export const CONTRACTS = {
  // From chain-545 deployment
  MOCK_USDC: '0xFB80FF7525935fD13775B4feE34fd67022a5CA68',
  OATH_LOCK_EAS: '0x42747984FD172a03550Ea58bEC0f91c690f794a9',
  EAS: '0xBCF2dA8f82fb032A2474c92Ec5b70C95A83fc0cc',
  SCHEMA_REGISTRY: '0x97900F59828Da4187607Cb8F84f49e3944199d18'
}

// Fixed price: $0.0001 = 0.0001 USDC (6 decimals)
export const DEPOSIT_AMOUNT = '100' // 0.0001 * 10^6 = 100 in wei (6 decimals)
