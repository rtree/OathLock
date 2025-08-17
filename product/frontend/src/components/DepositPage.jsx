import React, { useState } from 'react'
import { useWeb3 } from '../contexts/Web3Context'
import WalletConnect from './WalletConnect'
import { 
  mintUSDC, 
  approveUSDC, 
  createOath, 
  CONTRACTS, 
  formatUSDCAmount, 
  publicClient
} from '../utils/web3'
import { getAddress } from 'viem'
import './DepositPage.css'

const DepositPage = () => {
  const { 
    account, 
    walletClient, 
    usdcBalance, 
    usdcAllowance, 
    isConnected, 
    refreshBalances,
    DEPOSIT_AMOUNT
  } = useWeb3()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactionHash, setTransactionHash] = useState('')
  const [currentStep, setCurrentStep] = useState('')
  const [oathId, setOathId] = useState('')

  // Demo seller address (using checksummed address)
  const DEMO_SELLER = getAddress('0x742d35Cc6634C0532925a3b8D1b9d391C2c2A0Ac')

  const handleMintUSDC = async () => {
    if (!isConnected || !walletClient || !account) {
      alert('Please connect your wallet first')
      return
    }

    try {
      setIsProcessing(true)
      setCurrentStep('Minting test USDC...')
      
      // Mint 1 USDC for testing
      const mintAmount = BigInt('1000000') // 1 USDC (6 decimals)
      const hash = await mintUSDC(walletClient, account, mintAmount)
      
      setTransactionHash(hash)
      setCurrentStep('Waiting for confirmation...')
      
      // Wait for transaction
      await publicClient.waitForTransactionReceipt({ hash })
      
      setCurrentStep('USDC minted successfully!')
      await refreshBalances()
      
      setTimeout(() => {
        setCurrentStep('')
        setTransactionHash('')
      }, 3000)
      
    } catch (error) {
      console.error('Error minting USDC:', error)
      alert('Failed to mint USDC: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeposit = async () => {
    if (!isConnected || !walletClient || !account) {
      alert('Please connect your wallet first')
      return
    }

    if (usdcBalance < DEPOSIT_AMOUNT) {
      alert(`Insufficient USDC balance. You need ${formatUSDCAmount(DEPOSIT_AMOUNT)} USDC`)
      return
    }

    try {
      setIsProcessing(true)
      
      // Step 1: Check and approve USDC if needed
      if (usdcAllowance < DEPOSIT_AMOUNT) {
        setCurrentStep('Approving USDC...')
        const approveHash = await approveUSDC(walletClient, account, CONTRACTS.OATH_LOCK_EAS, DEPOSIT_AMOUNT)
        setTransactionHash(approveHash)
        
        setCurrentStep('Waiting for approval confirmation...')
        await publicClient.waitForTransactionReceipt({ hash: approveHash })
        await refreshBalances()
      }

      // Step 2: Create Oath
      setCurrentStep('Creating Oath...')
      const expiry = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days from now
      
      console.log('Creating oath with params:', {
        seller: DEMO_SELLER,
        amount: DEPOSIT_AMOUNT.toString(),
        expiry,
        account
      })
      
      const createHash = await createOath(walletClient, account, DEMO_SELLER, DEPOSIT_AMOUNT, BigInt(expiry))
      setTransactionHash(createHash)
      
      setCurrentStep('Waiting for oath creation...')
      const receipt = await publicClient.waitForTransactionReceipt({ hash: createHash })
      
      // Parse the OathCreated event to get the oath ID
      try {
        const logs = receipt.logs
        // Look for OathCreated event in logs
        for (const log of logs) {
          if (log.topics[0] === '0x8b8c8f2c0c8b8a8f8e8d8c8b8a8988878685848382818079787776757473727170') {
            // This is a simplified way - in production you'd properly decode the event
            console.log('Oath created, log:', log)
          }
        }
      } catch (e) {
        console.log('Could not parse oath ID from logs')
      }
      
      setCurrentStep('Oath created successfully!')
      setOathId(createHash) // Using tx hash as ID for demo
      await refreshBalances()
      
      setTimeout(() => {
        setCurrentStep('')
        setTransactionHash('')
      }, 5000)
      
    } catch (error) {
      console.error('Error creating deposit:', error)
      alert('Failed to create deposit: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const truncateHash = (hash) => {
    if (!hash) return ''
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`
  }

  return (
    <div className="container">
      <img 
        src="/img/oathlock-logo.png" 
        alt="OATHLOCK" 
        className="dispute-logo"
        onError={(e) => {
          e.target.style.display = 'none'
        }}
      />
      
      <WalletConnect />
      
      {/* Transaction Status */}
      {(currentStep || transactionHash) && (
        <div className="transaction-status">
          {currentStep && <div className="status-text">{currentStep}</div>}
          {transactionHash && (
            <div className="tx-hash">
              <span>Tx: </span>
              <a 
                href={`https://evm-testnet.flowscan.io/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {truncateHash(transactionHash)}
              </a>
            </div>
          )}
          {oathId && (
            <div className="oath-id">
              <span>Oath ID: {oathId.slice(0, 16)}...</span>
            </div>
          )}
        </div>
      )}
      
      <div className="dispute-card">
        <div className="header">
          {/* Buyer Section */}
          <div className="participant buyer">
            <h3>BUYER</h3>
            <div className="avatar">
              <div className="profile-icon female"></div>
            </div>
            <h4>{isConnected ? `${account?.slice(0, 6)}...${account?.slice(-4)}` : 'A. Jones'}</h4>
            <div className="stats">
              <div className="stat transactions-stat">
                <span className="stat-icon">📊</span>
                <span className="value">60</span>
                <span className="label">Trades</span>
              </div>
              <div className="stat complaints-stat">
                <span className="stat-icon">⚠️</span>
                <span className="value">1</span>
                <span className="label">Issues</span>
              </div>
            </div>
            <div className="issues">
              <div className="issue-item">
                <div className="lock-icon"></div>
                <span className="issue-label">Undelivered</span>
                <span className="issue-count">1</span>
              </div>
            </div>
          </div>

          {/* Transaction Center */}
          <div className="transaction-center">
            <div className="transaction-info">
              <h3>TRANSACTION</h3>
              <div className="product-image">
                <img 
                  src="/img/polo-outfit.jpg" 
                  alt="Polo PremiumGlobal Lauren セットアップ" 
                  className="product-img"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.parentNode.classList.add('no-image')
                  }}
                />
                <div className="placeholder-text">商品画像</div>
              </div>
              <div className="price">$0.0001</div>
              <div className="price-note">Flow Testnet • MockUSDC</div>
              
              {/* Test USDC Section */}
              {isConnected && usdcBalance < DEPOSIT_AMOUNT && (
                <div className="test-section">
                  <button 
                    className="test-btn"
                    onClick={handleMintUSDC}
                    disabled={isProcessing}
                  >
                    Get Test USDC
                  </button>
                  <div className="test-note">Mint test USDC for this demo</div>
                </div>
              )}
              
              <div className="status-buttons">
                <button 
                  className={`status-btn ${(!isConnected || isProcessing || usdcBalance < DEPOSIT_AMOUNT) ? 'disabled' : 'active'}`}
                  onClick={handleDeposit}
                  disabled={!isConnected || isProcessing || usdcBalance < DEPOSIT_AMOUNT}
                >
                  {isProcessing ? 'Processing...' : 'Deposit'}
                </button>
              </div>
              
              {isConnected && (
                <div className="balance-info">
                  <div className="balance-item">
                    <span>Your Balance: {formatUSDCAmount(usdcBalance)} USDC</span>
                  </div>
                  <div className="balance-item">
                    <span>Required: {formatUSDCAmount(DEPOSIT_AMOUNT)} USDC</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Seller Section */}
          <div className="participant seller">
            <h3>SELLER</h3>
            <div className="avatar">
              <div className="profile-icon"></div>
            </div>
            <h4>{DEMO_SELLER.slice(0, 6)}...{DEMO_SELLER.slice(-4)}</h4>
            <div className="stats">
              <div className="stat transactions-stat">
                <span className="stat-icon">📊</span>
                <span className="value">320</span>
                <span className="label">Trades</span>
              </div>
              <div className="stat complaints-stat">
                <span className="stat-icon">⚠️</span>
                <span className="value">12</span>
                <span className="label">Issues</span>
              </div>
            </div>
            <div className="issues">
              <div className="issue-item">
                <div className="diamond-icon"></div>
                <span className="issue-label">Counterfeit</span>
                <span className="issue-count">3</span>
              </div>
              <div className="issue-item">
                <div className="damaged-icon"></div>
                <span className="issue-label">Damaged</span>
                <span className="issue-count">5</span>
              </div>
              <div className="issue-item">
                <div className="box-icon"></div>
                <span className="issue-label">Undelivered</span>
                <span className="issue-count">4</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DepositPage
