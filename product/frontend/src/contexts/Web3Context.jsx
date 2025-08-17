import React, { createContext, useContext, useState, useEffect } from 'react'
import { 
  connectWallet, 
  createWalletClientFromWindow,
  checkUSDCBalance,
  checkUSDCAllowance,
  CONTRACTS,
  DEPOSIT_AMOUNT,
  formatUSDCAmount
} from '../utils/web3'

const Web3Context = createContext()

export const useWeb3 = () => {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
}

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null)
  const [walletClient, setWalletClient] = useState(null)
  const [usdcBalance, setUsdcBalance] = useState(0n)
  const [usdcAllowance, setUsdcAllowance] = useState(0n)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize wallet connection on page load
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' })
          if (accounts.length > 0) {
            setAccount(accounts[0])
            setIsConnected(true)
            const client = createWalletClientFromWindow()
            setWalletClient(client)
            await updateBalances(accounts[0])
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error)
        }
      }
    }
    
    checkConnection()
  }, [])

  // Listen to account changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          setAccount(null)
          setIsConnected(false)
          setWalletClient(null)
          setUsdcBalance(0n)
          setUsdcAllowance(0n)
        } else {
          setAccount(accounts[0])
          setIsConnected(true)
          const client = createWalletClientFromWindow()
          setWalletClient(client)
          updateBalances(accounts[0])
        }
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [])

  const updateBalances = async (address) => {
    try {
      const [balance, allowance] = await Promise.all([
        checkUSDCBalance(address),
        checkUSDCAllowance(address, CONTRACTS.OATH_LOCK_EAS)
      ])
      setUsdcBalance(balance)
      setUsdcAllowance(allowance)
    } catch (error) {
      console.error('Error updating balances:', error)
    }
  }

  const connect = async () => {
    try {
      setIsLoading(true)
      const connectedAccount = await connectWallet()
      setAccount(connectedAccount)
      setIsConnected(true)
      const client = createWalletClientFromWindow()
      setWalletClient(client)
      await updateBalances(connectedAccount)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = () => {
    setAccount(null)
    setIsConnected(false)
    setWalletClient(null)
    setUsdcBalance(0n)
    setUsdcAllowance(0n)
  }

  const refreshBalances = async () => {
    if (account) {
      await updateBalances(account)
    }
  }

  const value = {
    account,
    walletClient,
    usdcBalance,
    usdcAllowance,
    isConnected,
    isLoading,
    connect,
    disconnect,
    refreshBalances,
    formatUSDCAmount,
    DEPOSIT_AMOUNT
  }

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  )
}

export default Web3Provider
