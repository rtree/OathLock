import React from 'react'
import { useWeb3 } from '../contexts/Web3Context'
import './WalletConnect.css'

const WalletConnect = () => {
  const { account, isConnected, isLoading, connect, disconnect, formatUSDCAmount, usdcBalance } = useWeb3()

  const handleConnect = async () => {
    try {
      await connect()
    } catch (error) {
      alert('Failed to connect wallet: ' + error.message)
    }
  }

  const truncateAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!isConnected) {
    return (
      <div className="wallet-connect">
        <button 
          className="connect-btn"
          onClick={handleConnect}
          disabled={isLoading}
        >
          {isLoading ? 'Connecting...' : 'Connect Wallet'}
        </button>
        <p className="wallet-note">Connect your wallet to use OathLock on Flow Testnet</p>
      </div>
    )
  }

  return (
    <div className="wallet-info">
      <div className="wallet-details">
        <div className="address-section">
          <span className="label">Connected:</span>
          <span className="address">{truncateAddress(account)}</span>
        </div>
        <div className="balance-section">
          <span className="label">USDC Balance:</span>
          <span className="balance">{formatUSDCAmount(usdcBalance)} USDC</span>
        </div>
      </div>
      <button className="disconnect-btn" onClick={disconnect}>
        Disconnect
      </button>
    </div>
  )
}

export default WalletConnect
