import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import DepositPage from './components/DepositPage'
import Web3Provider from './contexts/Web3Context'
import './App.css'

function App() {
  return (
    <Web3Provider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<DepositPage />} />
            <Route path="/deposit" element={<DepositPage />} />
          </Routes>
        </div>
      </Router>
    </Web3Provider>
  )
}

export default App
