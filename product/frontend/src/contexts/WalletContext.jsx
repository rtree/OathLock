import React, { createContext, useContext, useState, useEffect } from 'react'
import { 
  connectWallet, 
  disconnectWallet, 
  getWalletAccount, 
  switchToFlowTestnet,
  getUSDCBalance,
  formatUSDC
} from '../utils/web3Utils.js'

const WalletContext = createContext()

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

export const WalletProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [usdcBalance, setUsdcBalance] = useState('0')
  const [chainId, setChainId] = useState(null)

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkConnection = () => {
      const account = getWalletAccount()
      if (account.isConnected) {
        setIsConnected(true)
        setAddress(account.address)
        setChainId(account.chainId)
        if (account.address) {
          loadUSDCBalance(account.address)
        }
      }
    }
    
    checkConnection()
  }, [])

  const loadUSDCBalance = async (userAddress) => {
    try {
      const balance = await getUSDCBalance(userAddress)
      setUsdcBalance(formatUSDC(balance))
    } catch (error) {
      console.error('Failed to load USDC balance:', error)
      setUsdcBalance('0')
    }
  }

  const connect = async () => {
    setIsConnecting(true)
    try {
      const result = await connectWallet()
      setIsConnected(true)
      setAddress(result.accounts[0])
      setChainId(result.chainId)
      
      // Switch to Flow Testnet if not already on it
      if (result.chainId !== 545) {
        await switchToFlowTestnet()
        setChainId(545)
      }
      
      // Load USDC balance
      await loadUSDCBalance(result.accounts[0])
      
      return result
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      throw error
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = async () => {
    try {
      await disconnectWallet()
      setIsConnected(false)
      setAddress(null)
      setChainId(null)
      setUsdcBalance('0')
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }
  }

  const refreshBalance = async () => {
    if (address) {
      await loadUSDCBalance(address)
    }
  }

  const value = {
    isConnected,
    address,
    isConnecting,
    usdcBalance,
    chainId,
    connect,
    disconnect,
    refreshBalance
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}
