import React, { useState } from 'react';
import { Droplets, Plus, Minus, TrendingUp } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { SUPPORTED_CHAINS } from '../constants/chains';

const LiquidityPool: React.FC = () => {
  const { wallet } = useWallet();
  const [fcncrAmount, setFcncrAmount] = useState('');
  const [altAmount, setAltAmount] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [activeTab, setActiveTab] = useState<'add' | 'remove'>('add');

  // Get current chain info
  const currentChain = SUPPORTED_CHAINS.find(chain => chain.id === wallet.chainId);
  const getNetworkSymbol = () => {
    if (!currentChain) return 'ALT';
    
    switch (currentChain.id) {
      case 1: return 'ETH';
      case 61803: return 'EGAZ';
      case 7070: return 'PLQ';
      case 800001: return 'OCTA';
      case 2000: return 'WDOGE';
      case 146: return 'S';
      case 250: return 'FTM';
      case 2330: return 'ALT';
      case 1313161554: return 'ETHO';
      default: return 'ALT';
    }
  };

  // Mock data
  const poolStats = {
    totalLiquidity: 1250000,
    yourLiquidity: 5000,
    fcncrReserve: 625000,
    altReserve: 312500,
    apy: 45.2,
    volume24h: 89000
  };

  const handleAddLiquidity = async () => {
    if (!wallet.isConnected || !fcncrAmount || !altAmount) return;
    
    setIsAdding(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsAdding(false);
    setFcncrAmount('');
    setAltAmount('');
  };

  const handleRemoveLiquidity = async () => {
    if (!wallet.isConnected) return;
    
    setIsRemoving(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRemoving(false);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    }
    return num.toFixed(2);
  };

  const networkSymbol = getNetworkSymbol();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-2 rounded-lg">
            <Droplets className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">FCNCR/{networkSymbol} Liquidity Pool</h2>
        </div>
        
        {/* Network Indicator */}
        {currentChain && (
          <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: currentChain.color }}
            />
            <span className="text-sm font-medium text-gray-700">{currentChain.name}</span>
          </div>
        )}
      </div>

      {/* Pool Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Total Liquidity</p>
          <p className="text-lg font-bold text-gray-900">${formatNumber(poolStats.totalLiquidity)}</p>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">APY</p>
          <p className="text-lg font-bold text-green-600">{poolStats.apy}%</p>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">24h Volume</p>
          <p className="text-lg font-bold text-gray-900">${formatNumber(poolStats.volume24h)}</p>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Your Liquidity</p>
          <p className="text-lg font-bold text-gray-900">${formatNumber(poolStats.yourLiquidity)}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('add')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'add'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Add Liquidity
        </button>
        <button
          onClick={() => setActiveTab('remove')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'remove'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Remove Liquidity
        </button>
      </div>

      {activeTab === 'add' ? (
        <div className="space-y-4">
          {/* FCNCR Input */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">FCNCR Amount</label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={fcncrAmount}
                onChange={(e) => setFcncrAmount(e.target.value)}
                placeholder="0.0"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="text-xs font-medium text-blue-600 hover:text-blue-700 px-2">
                MAX
              </button>
            </div>
          </div>

          {/* Network Token Input */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{networkSymbol} Amount</label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={altAmount}
                onChange={(e) => setAltAmount(e.target.value)}
                placeholder="0.0"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="text-xs font-medium text-blue-600 hover:text-blue-700 px-2">
                MAX
              </button>
            </div>
          </div>

          {/* Pool Share Info */}
          {fcncrAmount && altAmount && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Pool Share</span>
                <span className="font-medium">0.25%</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">FCNCR per {networkSymbol}</span>
                <span className="font-medium">2.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{networkSymbol} per FCNCR</span>
                <span className="font-medium">0.50</span>
              </div>
            </div>
          )}

          <button
            onClick={handleAddLiquidity}
            disabled={!wallet.isConnected || !fcncrAmount || !altAmount || isAdding}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            {isAdding ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
            <span>{isAdding ? 'Adding Liquidity...' : 'Add Liquidity'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Your Position */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Your Position</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pool Tokens</span>
                <span className="font-medium">125.45 LP</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">FCNCR</span>
                <span className="font-medium">2,500.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{networkSymbol}</span>
                <span className="font-medium">1,250.00</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleRemoveLiquidity}
            disabled={!wallet.isConnected || poolStats.yourLiquidity === 0 || isRemoving}
            className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 rounded-lg hover:from-red-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            {isRemoving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <Minus className="h-5 w-5" />
            )}
            <span>{isRemoving ? 'Removing Liquidity...' : 'Remove All Liquidity'}</span>
          </button>
        </div>
      )}

      {/* Rewards Info */}
      <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <TrendingUp className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">Liquidity Rewards</span>
        </div>
        <p className="text-sm text-green-700">
          Earn additional FCNCR tokens by providing liquidity. Current rewards: 
          <span className="font-medium ml-1">0.0245 FCNCR/day</span>
        </p>
      </div>

      {/* Network Info */}
      {!wallet.isConnected && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 mb-2">
            <strong>Connect your wallet to provide liquidity!</strong>
          </p>
          <p className="text-xs text-blue-600">
            Available on: ETH, EGAZ, PLQ, OCTA, WDOGE, S, FTM, ALT, ETHO networks
          </p>
        </div>
      )}

      {/* Swapin.co Integration Info */}
      {wallet.isConnected && currentChain && (
        <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: currentChain.color }}
            />
            <span className="text-sm font-medium text-indigo-800">
              Powered by Swapin.co on {currentChain.name}
            </span>
          </div>
          <div className="text-xs text-indigo-600 space-y-1">
            <div>Factory: <span className="font-mono">{currentChain.factory?.slice(0, 10)}...</span></div>
            <div>Router: <span className="font-mono">{currentChain.router?.slice(0, 10)}...</span></div>
            <div>Pair: <span className="font-mono">FCNCR/{networkSymbol}</span></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiquidityPool;