import { 
  connect, 
  disconnect, 
  getAccount, 
  getBalance,
  switchChain,
  writeContract,
  readContract,
  waitForTransactionReceipt
} from '@wagmi/core'
import { injected } from '@wagmi/core/connectors'
import { parseUnits, formatUnits } from 'viem'
import { config } from '../config/wagmi.js'
import { flowTestnet, CONTRACTS, DEPOSIT_AMOUNT } from '../config/chains.js'
import { MOCK_USDC_ABI, OATH_LOCK_EAS_ABI } from '../config/abis.js'

// Wallet connection functions
export const connectWallet = async () => {
  try {
    const result = await connect(config, { connector: injected() })
    return result
  } catch (error) {
    console.error('Failed to connect wallet:', error)
    throw error
  }
}

export const disconnectWallet = async () => {
  try {
    await disconnect(config)
  } catch (error) {
    console.error('Failed to disconnect wallet:', error)
    throw error
  }
}

export const getWalletAccount = () => {
  return getAccount(config)
}

export const getWalletBalance = async (address) => {
  try {
    const balance = await getBalance(config, { address })
    return balance
  } catch (error) {
    console.error('Failed to get balance:', error)
    throw error
  }
}

// Network functions
export const switchToFlowTestnet = async () => {
  try {
    await switchChain(config, { chainId: flowTestnet.id })
  } catch (error) {
    console.error('Failed to switch to Flow Testnet:', error)
    throw error
  }
}

// USDC functions
export const getUSDCBalance = async (address) => {
  try {
    const balance = await readContract(config, {
      address: CONTRACTS.MOCK_USDC,
      abi: MOCK_USDC_ABI,
      functionName: 'balanceOf',
      args: [address]
    })
    return balance
  } catch (error) {
    console.error('Failed to get USDC balance:', error)
    throw error
  }
}

export const getUSDCAllowance = async (owner, spender) => {
  try {
    const allowance = await readContract(config, {
      address: CONTRACTS.MOCK_USDC,
      abi: MOCK_USDC_ABI,
      functionName: 'allowance',
      args: [owner, spender]
    })
    return allowance
  } catch (error) {
    console.error('Failed to get USDC allowance:', error)
    throw error
  }
}

export const approveUSDC = async (spender, amount) => {
  try {
    const hash = await writeContract(config, {
      address: CONTRACTS.MOCK_USDC,
      abi: MOCK_USDC_ABI,
      functionName: 'approve',
      args: [spender, amount]
    })
    
    const receipt = await waitForTransactionReceipt(config, { hash })
    return receipt
  } catch (error) {
    console.error('Failed to approve USDC:', error)
    throw error
  }
}

export const mintUSDC = async (to, amount) => {
  try {
    const hash = await writeContract(config, {
      address: CONTRACTS.MOCK_USDC,
      abi: MOCK_USDC_ABI,
      functionName: 'mint',
      args: [to, amount]
    })
    
    const receipt = await waitForTransactionReceipt(config, { hash })
    return receipt
  } catch (error) {
    console.error('Failed to mint USDC:', error)
    throw error
  }
}

// OathLock functions
export const createOath = async (seller, amount, expiry) => {
  try {
    const hash = await writeContract(config, {
      address: CONTRACTS.OATH_LOCK_EAS,
      abi: OATH_LOCK_EAS_ABI,
      functionName: 'createOath',
      args: [seller, amount, expiry]
    })
    
    const receipt = await waitForTransactionReceipt(config, { hash })
    return receipt
  } catch (error) {
    console.error('Failed to create oath:', error)
    throw error
  }
}

export const sellerShip = async (oathId, shipDeadline, trackingHash) => {
  try {
    const hash = await writeContract(config, {
      address: CONTRACTS.OATH_LOCK_EAS,
      abi: OATH_LOCK_EAS_ABI,
      functionName: 'sellerShip',
      args: [oathId, shipDeadline, trackingHash]
    })
    
    const receipt = await waitForTransactionReceipt(config, { hash })
    return receipt
  } catch (error) {
    console.error('Failed to ship oath:', error)
    throw error
  }
}

export const getOath = async (oathId) => {
  try {
    const oath = await readContract(config, {
      address: CONTRACTS.OATH_LOCK_EAS,
      abi: OATH_LOCK_EAS_ABI,
      functionName: 'oaths',
      args: [oathId]
    })
    return oath
  } catch (error) {
    console.error('Failed to get oath:', error)
    throw error
  }
}

// Helper functions
export const formatUSDC = (amount) => {
  return formatUnits(amount, 6) // USDC has 6 decimals
}

export const parseUSDC = (amount) => {
  return parseUnits(amount, 6) // USDC has 6 decimals
}

// Get fixed deposit amount
export const getDepositAmount = () => {
  return DEPOSIT_AMOUNT // Already in wei (6 decimals)
}

export const getDepositAmountFormatted = () => {
  return formatUSDC(DEPOSIT_AMOUNT) // "0.0001"
}
