import React, { useState } from 'react'
import './DepositPage.css'

const DepositPage = () => {
  const [depositClicked, setDepositClicked] = useState(false)

  const handleDepositClick = () => {
    setDepositClicked(true)
    // In the original, this navigates to sent.html
    // You can implement navigation here if needed
    console.log('Deposit button clicked')
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
      <div className="dispute-card">
        <div className="header">
          {/* Buyer Section */}
          <div className="participant buyer">
            <h3>BUYER</h3>
            <div className="avatar">
              <div className="profile-icon female"></div>
            </div>
            <h4>A. Jones</h4>
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
              <div className="price">$120.00</div>
              <div className="status-buttons">
                <button 
                  className={`status-btn ${depositClicked ? 'clicked' : 'active'}`}
                  onClick={handleDepositClick}
                >
                  Deposit
                </button>
              </div>
            </div>
          </div>

          {/* Seller Section */}
          <div className="participant seller">
            <h3>SELLER</h3>
            <div className="avatar">
              <div className="profile-icon"></div>
            </div>
            <h4>B. Carter</h4>
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
