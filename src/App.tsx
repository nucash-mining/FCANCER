import React, { useState } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import StakingPanel from './components/StakingPanel';
import CrossChainBridge from './components/CrossChainBridge';
import LiquidityPool from './components/LiquidityPool';
import ChainSelector from './components/ChainSelector';
import SwapinDEX from './components/SwapinDEX';
import WALTBridge from './components/WALTBridge';
import { ArrowRightLeft, Coins } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState<'main' | 'swapin' | 'walt-bridge'>('main');

  if (currentPage === 'swapin') {
    return (
      <div className="min-h-screen">
        <SwapinDEX />
        <button
          onClick={() => setCurrentPage('main')}
          className="fixed top-4 left-4 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-2"
        >
          <ArrowRightLeft className="h-4 w-4" />
          <span>Back to FCNCR</span>
        </button>
      </div>
    );
  }

  if (currentPage === 'walt-bridge') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Header />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              wALT Bridge
            </h1>
            <p className="text-xl text-gray-600 mb-2">Cross-Chain wALT Token Bridge</p>
            <p className="text-lg text-gray-500 max-w-3xl mx-auto mb-6">
              Bridge wALT tokens seamlessly across all supported blockchain networks with 
              deterministic contract addresses and advanced security features.
            </p>
            
            {/* Navigation */}
            <div className="flex justify-center space-x-4 mb-8">
              <button
                onClick={() => setCurrentPage('main')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
              >
                <Coins className="h-5 w-5" />
                <span>Back to FCNCR</span>
              </button>
              <button
                onClick={() => setCurrentPage('swapin')}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
              >
                <img src="/image.png" alt="Swapin" className="h-5 w-5" />
                <span>Open Swapin.co DEX</span>
              </button>
            </div>
          </div>

          {/* wALT Bridge Component */}
          <WALTBridge />

          {/* Features */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="bg-green-100 p-3 rounded-lg w-fit mb-4">
                <ArrowRightLeft className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Same Address</h3>
              <p className="text-gray-600 text-sm">
                Deterministic deployment ensures the same contract address across all supported chains.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="bg-blue-100 p-3 rounded-lg w-fit mb-4">
                <Coins className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Low Fees</h3>
              <p className="text-gray-600 text-sm">
                Only 0.05% bridge fee with no hidden costs. Fast and secure cross-chain transfers.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="bg-purple-100 p-3 rounded-lg w-fit mb-4">
                <ArrowRightLeft className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Multi-Chain</h3>
              <p className="text-gray-600 text-sm">
                Bridge across 9 blockchain networks including Ethereum, Fantom, Sonic, and more.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Fuck Cancer Token
          </h1>
          <p className="text-xl text-gray-600 mb-2">FCNCR - Fighting Cancer Through Blockchain</p>
          <p className="text-lg text-gray-500 max-w-3xl mx-auto mb-6">
            A cross-chain token with Bitcoin-like halving mechanics, designed to support cancer research 
            while rewarding ALT stakers across multiple blockchain networks.
          </p>
          
          {/* Navigation */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setCurrentPage('swapin')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
            >
              <img src="/image.png" alt="Swapin" className="h-5 w-5" />
              <span>Open Swapin.co DEX</span>
            </button>
            <button
              onClick={() => setCurrentPage('walt-bridge')}
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
            >
              <ArrowRightLeft className="h-5 w-5" />
              <span>wALT Bridge</span>
            </button>
          </div>
        </div>

        {/* Dashboard */}
        <Dashboard />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <StakingPanel />
          <CrossChainBridge />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <LiquidityPool />
          <ChainSelector />
        </div>

        {/* Footer */}
        <footer className="mt-16 py-8 border-t border-gray-200">
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              FCNCR Token - Decentralized, Cross-Chain, Community-Driven
            </p>
            <p className="text-sm text-gray-500">
              Total Supply: 21,000,000 FCNCR • Halving Schedule: Every 210,000 blocks
            </p>
            <div className="flex justify-center space-x-6 mt-4">
              <a href="#" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                Whitepaper
              </a>
              <a href="#" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                Documentation
              </a>
              <a href="#" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                GitHub
              </a>
              <a href="#" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                Community
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;