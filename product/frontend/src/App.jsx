import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import DepositPage from './components/DepositPage'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<DepositPage />} />
          <Route path="/deposit" element={<DepositPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
