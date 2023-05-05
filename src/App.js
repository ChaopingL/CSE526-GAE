import logo from './logo.svg';
import './App.css';
import Web3 from 'web3'
import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Userpage from './component/Userpage'
import Dashboard from './component/Dashboard'
import Inventory from './component/Inventory'
import Trading from './component/Trading'
import Create from './component/Create'
function App() {
  //Route
  return (
    <div className="App">
      <Router>
        <div>
          <Routes>
            <Route path="/" element={<Userpage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/trading" element={<Trading />} />
            <Route path="/create" element={<Create />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
