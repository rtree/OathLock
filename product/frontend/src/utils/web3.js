import { createPublicClient, createWalletClient, custom, http } from 'viem'
import { parseUnits, formatUnits, getAddress } from 'viem'

// Flow Testnet Configuration
export const flowTestnetConfig = {
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
    default: { name: 'Flow Scan', url: 'https://evm-testnet.flowscan.io' },
  },
}

// Contract Addresses on Flow Testnet
export const CONTRACTS = {
  MOCK_USDC: '0xFB80FF7525935fD13775B4feE34fd67022a5CA68',
  OATH_LOCK_EAS: '0x42747984FD172a03550Ea58bEC0f91c690f794a9',
  IEAS: '0xBCF2dA8f82fb032A2474c92Ec5b70C95A83fc0cc',
  SCHEMA_REGISTRY: '0x97900F59828Da4187607Cb8F84f49e3944199d18'
}

// USDC Amount: $0.0001 (6 decimals)
export const DEPOSIT_AMOUNT = parseUnits('0.0001', 6)

// ABI definitions
export const MOCK_USDC_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "account", "type": "address"}
    ],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "address", "name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
]

export const OATH_LOCK_EAS_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "seller", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "uint256", "name": "expiry", "type": "uint256"}
    ],
    "name": "createOath",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "id", "type": "uint256"},
      {"internalType": "uint256", "name": "shipDeadline", "type": "uint256"},
      {"internalType": "bytes32", "name": "trackingHash", "type": "bytes32"}
    ],
    "name": "sellerShip",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "name": "oaths",
    "outputs": [
      {"internalType": "uint256", "name": "id", "type": "uint256"},
      {"internalType": "address", "name": "buyer", "type": "address"},
      {"internalType": "address", "name": "seller", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "address", "name": "token", "type": "address"},
      {"internalType": "uint256", "name": "expiry", "type": "uint256"},
      {"internalType": "uint256", "name": "shipDeadline", "type": "uint256"},
      {"internalType": "bytes32", "name": "trackingHash", "type": "bytes32"},
      {"internalType": "string", "name": "evidenceURL", "type": "string"},
      {"internalType": "uint8", "name": "status", "type": "uint8"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "id", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "buyer", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "seller", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "uint256", "name": "expiry", "type": "uint256"}
    ],
    "name": "OathCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "id", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "shipDeadline", "type": "uint256"},
      {"indexed": false, "internalType": "bytes32", "name": "trackingHash", "type": "bytes32"}
    ],
    "name": "SellerShipped",
    "type": "event"
  }
]

// Create clients
export const publicClient = createPublicClient({
  chain: flowTestnetConfig,
  transport: http('https://testnet.evm.nodes.onflow.org')
})

export const createWalletClientFromWindow = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return createWalletClient({
      chain: flowTestnetConfig,
      transport: custom(window.ethereum)
    })
  }
  return null
}

// Utility functions
export const checkUSDCBalance = async (address) => {
  try {
    const checksummedAddress = getAddress(address)
    const balance = await publicClient.readContract({
      address: CONTRACTS.MOCK_USDC,
      abi: MOCK_USDC_ABI,
      functionName: 'balanceOf',
      args: [checksummedAddress]
    })
    return balance
  } catch (error) {
    console.error('Error checking USDC balance:', error)
    return 0n
  }
}

export const checkUSDCAllowance = async (owner, spender) => {
  try {
    const checksummedOwner = getAddress(owner)
    const checksummedSpender = getAddress(spender)
    const allowance = await publicClient.readContract({
      address: CONTRACTS.MOCK_USDC,
      abi: MOCK_USDC_ABI,
      functionName: 'allowance',
      args: [checksummedOwner, checksummedSpender]
    })
    return allowance
  } catch (error) {
    console.error('Error checking USDC allowance:', error)
    return 0n
  }
}

export const mintUSDC = async (walletClient, account, amount) => {
  try {
    const checksummedAccount = getAddress(account)
    const { request } = await publicClient.simulateContract({
      address: CONTRACTS.MOCK_USDC,
      abi: MOCK_USDC_ABI,
      functionName: 'mint',
      args: [checksummedAccount, amount],
      account: checksummedAccount
    })
    
    const hash = await walletClient.writeContract(request)
    return hash
  } catch (error) {
    console.error('Error minting USDC:', error)
    throw error
  }
}

export const approveUSDC = async (walletClient, account, spender, amount) => {
  try {
    const checksummedAccount = getAddress(account)
    const checksummedSpender = getAddress(spender)
    const { request } = await publicClient.simulateContract({
      address: CONTRACTS.MOCK_USDC,
      abi: MOCK_USDC_ABI,
      functionName: 'approve',
      args: [checksummedSpender, amount],
      account: checksummedAccount
    })
    
    const hash = await walletClient.writeContract(request)
    return hash
  } catch (error) {
    console.error('Error approving USDC:', error)
    throw error
  }
}

export const createOath = async (walletClient, account, seller, amount, expiry) => {
  try {
    // Ensure addresses are properly checksummed
    const checksummedSeller = getAddress(seller)
    const checksummedAccount = getAddress(account)
    
    const { request } = await publicClient.simulateContract({
      address: CONTRACTS.OATH_LOCK_EAS,
      abi: OATH_LOCK_EAS_ABI,
      functionName: 'createOath',
      args: [checksummedSeller, amount, expiry],
      account: checksummedAccount
    })
    
    const hash = await walletClient.writeContract(request)
    return hash
  } catch (error) {
    console.error('Error creating oath:', error)
    throw error
  }
}

export const sellerShip = async (walletClient, account, oathId, shipDeadline, trackingHash) => {
  try {
    const checksummedAccount = getAddress(account)
    
    const { request } = await publicClient.simulateContract({
      address: CONTRACTS.OATH_LOCK_EAS,
      abi: OATH_LOCK_EAS_ABI,
      functionName: 'sellerShip',
      args: [oathId, shipDeadline, trackingHash],
      account: checksummedAccount
    })
    
    const hash = await walletClient.writeContract(request)
    return hash
  } catch (error) {
    console.error('Error seller shipping:', error)
    throw error
  }
}

export const getOath = async (oathId) => {
  try {
    const oath = await publicClient.readContract({
      address: CONTRACTS.OATH_LOCK_EAS,
      abi: OATH_LOCK_EAS_ABI,
      functionName: 'oaths',
      args: [oathId]
    })
    return oath
  } catch (error) {
    console.error('Error getting oath:', error)
    throw error
  }
}

// Parse oath ID from OathCreated event logs
export const parseOathIdFromLogs = (logs) => {
  try {
    // Look for OathCreated event: event OathCreated(uint256 indexed id, address indexed buyer, address indexed seller, uint256 amount, uint256 expiry)
    const oathCreatedTopic = '0x4b3b3d85dd6a0c5b99e1f3c5c36e6d3d5a1e9e3b9e1e9e3b9e1e9e3b9e1e9e3b' // This would be the actual hash
    
    for (const log of logs) {
      // In a real implementation, you'd need the actual event signature hash
      // For now, we'll use a different approach - parse by log structure
      if (log.topics && log.topics.length >= 4) {
        // The first topic after event signature is the oath ID (indexed)
        const oathId = BigInt(log.topics[1])
        console.log('Found oath ID:', oathId.toString())
        return oathId
      }
    }
    return null
  } catch (error) {
    console.error('Error parsing oath ID from logs:', error)
    return null
  }
}

export const formatUSDCAmount = (amount) => {
  return formatUnits(amount, 6)
}

// Connect wallet utility
export const connectWallet = async () => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      })
      
      // Switch to Flow Testnet
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x221' }], // 545 in hex
        })
      } catch (switchError) {
        // Chain not added, try to add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x221',
              chainName: 'Flow EVM Testnet',
              nativeCurrency: {
                name: 'FLOW',
                symbol: 'FLOW',
                decimals: 18
              },
              rpcUrls: ['https://testnet.evm.nodes.onflow.org'],
              blockExplorerUrls: ['https://evm-testnet.flowscan.io']
            }]
          })
        }
      }
      
      return accounts[0]
    } catch (error) {
      console.error('Error connecting wallet:', error)
      throw error
    }
  } else {
    throw new Error('MetaMask is not installed')
  }
}
