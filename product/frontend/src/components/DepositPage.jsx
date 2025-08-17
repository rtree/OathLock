import React, { useState, useEffect } from 'react'
import { useWeb3 } from '../contexts/Web3Context'
import WalletConnect from './WalletConnect'
import { 
  mintUSDC, 
  approveUSDC, 
  createOath,
  sellerShip,
  getOath,
  parseOathIdFromLogs,
  buyerApprove,
  buyerDispute,
  CONTRACTS, 
  formatUSDCAmount, 
  publicClient
} from '../utils/web3'
import { getAddress, keccak256, toHex } from 'viem'
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
  const [urlOathId, setUrlOathId] = useState(null)
  const [oathData, setOathData] = useState(null)
  const [isSellerView, setIsSellerView] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [showDisputeForm, setShowDisputeForm] = useState(false)
  const [disputeCategory, setDisputeCategory] = useState(0) // 0:Counterfeit, 1:Damaged, 2:Undelivered
  const [evidenceURL, setEvidenceURL] = useState('')

  // Demo seller address (using checksummed address)
  const DEMO_SELLER = getAddress('0x5E9041E731E10727d923d79b1e83290f6E83a221')

  // Check URL for oath ID on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const oathIdParam = urlParams.get('oathId')
    if (oathIdParam) {
      setUrlOathId(oathIdParam)
      loadOathData(oathIdParam)
    }
  }, [])

  // Check if current user is seller when wallet connects
  useEffect(() => {
    if (account && oathData && account.toLowerCase() === oathData[2].toLowerCase()) {
      setIsSellerView(true)
    } else {
      setIsSellerView(false)
    }
  }, [account, oathData])

  const loadOathData = async (oathId) => {
    try {
      const oath = await getOath(BigInt(oathId))
      setOathData(oath)
      console.log('Loaded oath data:', oath)
    } catch (error) {
      console.error('Error loading oath data:', error)
    }
  }

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

  const handleSellerShip = async () => {
    if (!isConnected || !walletClient || !account) {
      alert('Please connect your wallet first')
      return
    }

    if (!urlOathId) {
      alert('No oath ID found in URL')
      return
    }

    if (!trackingNumber.trim()) {
      alert('Please enter a tracking number')
      return
    }

    try {
      setIsProcessing(true)
      setCurrentStep('Preparing shipment...')

      // Set ship deadline to 7 days from now
      const shipDeadline = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
      
      // Create tracking hash from tracking number
      const trackingHash = keccak256(toHex(trackingNumber))

      setCurrentStep('Calling seller ship...')
      const hash = await sellerShip(walletClient, account, BigInt(urlOathId), BigInt(shipDeadline), trackingHash)
      setTransactionHash(hash)
      
      setCurrentStep('Waiting for confirmation...')
      await publicClient.waitForTransactionReceipt({ hash })
      
      setCurrentStep('Item shipped successfully!')
      
      // Refresh oath data
      await loadOathData(urlOathId)
      
      setTimeout(() => {
        setCurrentStep('')
        setTransactionHash('')
      }, 5000)
      
    } catch (error) {
      console.error('Error shipping item:', error)
      alert('Failed to ship item: ' + error.message)
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
      let parsedOathId = null
      try {
        parsedOathId = parseOathIdFromLogs(receipt.logs)
      } catch (e) {
        console.log('Could not parse oath ID from logs')
      }
      
      setCurrentStep('Oath created successfully!')
      
      if (parsedOathId) {
        setOathId(parsedOathId.toString())
        // Redirect to URL with oath ID
        window.location.href = `${window.location.origin}${window.location.pathname}?oathId=${parsedOathId.toString()}`
      } else {
        // Fallback: use transaction hash as ID for demo
        setOathId(createHash)
        window.location.href = `${window.location.origin}${window.location.pathname}?oathId=${createHash}`
      }
      
      await refreshBalances()
      
    } catch (error) {
      console.error('Error creating deposit:', error)
      alert('Failed to create deposit: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBuyerApprove = async () => {
    if (!isConnected || !walletClient || !account) {
      alert('Please connect your wallet first')
      return
    }

    if (!urlOathId) {
      alert('No oath ID found in URL')
      return
    }

    try {
      setIsProcessing(true)
      setCurrentStep('Confirming receipt...')

      const hash = await buyerApprove(walletClient, account, BigInt(urlOathId))
      setTransactionHash(hash)
      
      setCurrentStep('Waiting for confirmation...')
      await publicClient.waitForTransactionReceipt({ hash })
      
      setCurrentStep('Item receipt confirmed!')
      
      // Refresh oath data
      await loadOathData(urlOathId)
      
      setTimeout(() => {
        setCurrentStep('')
        setTransactionHash('')
      }, 5000)
      
    } catch (error) {
      console.error('Error confirming receipt:', error)
      alert('Failed to confirm receipt: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDisputeSubmit = async () => {
    if (!isConnected || !walletClient || !account) {
      alert('Please connect your wallet first')
      return
    }

    if (!urlOathId) {
      alert('No oath ID found in URL')
      return
    }

    if (!evidenceURL.trim()) {
      alert('Please provide evidence URL for the dispute')
      return
    }

    try {
      setIsProcessing(true)
      setCurrentStep('Filing dispute...')

      // Create evidence hash from URL
      const evidenceHash = keccak256(toHex(evidenceURL))

      const hash = await buyerDispute(walletClient, account, BigInt(urlOathId), disputeCategory, evidenceHash, evidenceURL)
      setTransactionHash(hash)
      
      setCurrentStep('Waiting for confirmation...')
      await publicClient.waitForTransactionReceipt({ hash })
      
      setCurrentStep('Dispute filed successfully!')
      setShowDisputeForm(false)
      
      // Refresh oath data
      await loadOathData(urlOathId)
      
      setTimeout(() => {
        setCurrentStep('')
        setTransactionHash('')
      }, 5000)
      
    } catch (error) {
      console.error('Error filing dispute:', error)
      alert('Failed to file dispute: ' + error.message)
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
          {urlOathId && (
            <div className="oath-id">
              <span>Current Oath ID: {urlOathId}</span>
            </div>
          )}
          {oathData && (
            <div className="oath-info">
              <div>Status: {['Created', 'Shipped', 'Delivered', 'Disputed', 'Resolved'][oathData[9]]}</div>
              <div>Amount: {formatUSDCAmount(oathData[3])} USDC</div>
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
              
              {/* Test USDC Section - only show for buyers without oath ID */}
              {isConnected && !urlOathId && usdcBalance < DEPOSIT_AMOUNT && (
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
              
              {/* Seller Ship Section */}
              {urlOathId && isSellerView && oathData && oathData[9] === 0 && (
                <div className="ship-section">
                  <h4>Ship Item</h4>
                  <input
                    className="tracking-input"
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number (e.g., 1Z999AA1234567890)"
                    disabled={isProcessing}
                  />
                  <button 
                    className={`ship-btn ${(!isConnected || isProcessing || !trackingNumber.trim()) ? 'disabled' : ''}`}
                    onClick={handleSellerShip}
                    disabled={!isConnected || isProcessing || !trackingNumber.trim()}
                  >
                    {isProcessing ? 'Processing...' : 'Send (Ship)'}
                  </button>
                </div>
              )}
              
              {/* Buyer Deposit Section - only show if no oath ID or not seller view */}
              {!urlOathId && (
                <div className="status-buttons">
                  <button 
                    className={`status-btn ${(!isConnected || isProcessing || usdcBalance < DEPOSIT_AMOUNT) ? 'disabled' : 'active'}`}
                    onClick={handleDeposit}
                    disabled={!isConnected || isProcessing || usdcBalance < DEPOSIT_AMOUNT}
                  >
                    {isProcessing ? 'Processing...' : 'Deposit'}
                  </button>
                </div>
              )}
              
              {/* Status message for completed oath */}
              {urlOathId && oathData && oathData[9] === 1 && (
                <div className="status-message">
                  <div className="shipped-status">✅ Item has been shipped!</div>
                  {isSellerView && (
                    <div className="tracking-display">
                      Tracking Hash: {oathData[7]}
                    </div>
                  )}
                  
                  {/* Buyer actions for shipped items */}
                  {!isSellerView && oathData[9] === 1 && (
                    <div className="buyer-actions">
                      <div className="buyer-buttons">
                        <button 
                          className={`status-btn received-btn ${(!isConnected || isProcessing) ? 'disabled' : 'active'}`}
                          onClick={handleBuyerApprove}
                          disabled={!isConnected || isProcessing}
                        >
                          {isProcessing && currentStep.includes('receipt') ? 'Processing...' : 'Received'}
                        </button>
                        <button 
                          className={`status-btn dispute-btn ${(!isConnected || isProcessing) ? 'disabled' : 'active'}`}
                          onClick={() => setShowDisputeForm(!showDisputeForm)}
                          disabled={!isConnected || isProcessing}
                        >
                          RAISE DISPUTE
                        </button>
                      </div>
                      
                      {/* Dispute Form */}
                      {showDisputeForm && (
                        <div className="dispute-form">
                          <h4>File a Dispute</h4>
                          <div className="dispute-categories">
                            <label className="dispute-category">
                              <input
                                type="radio"
                                name="disputeCategory"
                                value={0}
                                checked={disputeCategory === 0}
                                onChange={() => setDisputeCategory(0)}
                              />
                              <span>Counterfeit - Product is not authentic</span>
                            </label>
                            <label className="dispute-category">
                              <input
                                type="radio"
                                name="disputeCategory"
                                value={1}
                                checked={disputeCategory === 1}
                                onChange={() => setDisputeCategory(1)}
                              />
                              <span>Damaged - Product arrived broken</span>
                            </label>
                            <label className="dispute-category">
                              <input
                                type="radio"
                                name="disputeCategory"
                                value={2}
                                checked={disputeCategory === 2}
                                onChange={() => setDisputeCategory(2)}
                              />
                              <span>Undelivered - Product not received</span>
                            </label>
                          </div>
                          <input
                            type="text"
                            className="evidence-input"
                            placeholder="Evidence URL (photos, documentation, etc.)"
                            value={evidenceURL}
                            onChange={(e) => setEvidenceURL(e.target.value)}
                          />
                          <div className="dispute-form-buttons">
                            <button 
                              className="submit-dispute-btn"
                              onClick={handleDisputeSubmit}
                              disabled={!evidenceURL.trim() || isProcessing}
                            >
                              {isProcessing && currentStep.includes('dispute') ? 'Filing...' : 'Submit Dispute'}
                            </button>
                            <button 
                              className="cancel-dispute-btn"
                              onClick={() => {
                                setShowDisputeForm(false)
                                setEvidenceURL('')
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {isConnected && !urlOathId && (
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
