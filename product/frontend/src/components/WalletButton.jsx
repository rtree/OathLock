import React from 'react'
import { useWallet } from '../contexts/WalletContext'
import './WalletButton.css'

const WalletButton = () => {
  const { isConnected, address, isConnecting, usdcBalance, connect, disconnect } = useWallet()

  const formatAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (isConnected) {
    return (
      <div className="wallet-connected">
        <div className="wallet-info">
          <div className="wallet-address">{formatAddress(address)}</div>
          <div className="wallet-balance">{parseFloat(usdcBalance).toFixed(4)} MockUSDC</div>
        </div>
        <button className="wallet-disconnect-btn" onClick={disconnect}>
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div className="wallet-connect">
      <button 
        className="wallet-connect-btn" 
        onClick={connect}
        disabled={isConnecting}
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    </div>
  )
}

export default WalletButton
