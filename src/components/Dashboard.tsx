import React from 'react';
import { TrendingUp, Coins, Users, Zap, RefreshCw } from 'lucide-react';
import { useTokenStats } from '../hooks/useTokenStats';
import { useWallet } from '../hooks/useWallet';
import { SUPPORTED_CHAINS } from '../constants/chains';

const Dashboard: React.FC = () => {
  const { stats, isLoading, updateStats } = useTokenStats();
  const { wallet } = useWallet();

  // Get current chain info for dynamic ticker
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

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    }
    return num.toFixed(2);
  };

  const blocksToHalving = stats.nextHalving - stats.currentBlock;
  const halvingProgress = stats.currentBlock > 0 ? ((stats.currentBlock % 210000) / 210000) * 100 : 0;
  const networkSymbol = getNetworkSymbol();

  return (
    <div className="space-y-6">
      {/* Real-time Status Indicator */}
      <div className="flex items-center justify-between bg-white rounded-xl shadow-lg p-4 border border-gray-100">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${wallet.isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-sm font-medium text-gray-700">
            {wallet.isConnected ? `Live data from ${currentChain?.name || 'Unknown Network'}` : 'Connect wallet for live data'}
          </span>
          {currentChain && (
            <div className="flex items-center space-x-2 bg-gray-100 px-2 py-1 rounded-full">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: currentChain.color }}
              />
              <span className="text-xs font-medium text-gray-600">{networkSymbol}</span>
            </div>
          )}
        </div>
        <button
          onClick={updateStats}
          disabled={!wallet.isConnected || isLoading}
          className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="text-sm">Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Current Block</p>
              <p className="text-2xl font-bold text-gray-900">
                {wallet.isConnected ? stats.currentBlock.toLocaleString() : '---'}
              </p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                {wallet.isConnected ? 'Live updating' : 'Connect wallet'}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Block Reward</p>
              <p className="text-2xl font-bold text-gray-900">
                {wallet.isConnected ? `${stats.currentReward} FCNCR` : '--- FCNCR'}
              </p>
              <p className="text-xs text-blue-600">
                {wallet.isConnected ? `${blocksToHalving.toLocaleString()} blocks to halving` : 'Connect for live data'}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Coins className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          {wallet.isConnected && (
            <div className="mt-4">
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${halvingProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {halvingProgress.toFixed(1)}% to next halving
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Your Staked {networkSymbol}</p>
              <p className="text-2xl font-bold text-gray-900">
                {wallet.isConnected ? formatNumber(stats.stakedAmount) : '---'}
              </p>
              <p className="text-xs text-green-600">
                {wallet.isConnected && stats.stakedAmount > 0 ? 'Earning rewards' : 'No stake yet'}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Claimable FCNCR</p>
              <p className="text-2xl font-bold text-gray-900">
                {wallet.isConnected ? stats.claimableRewards.toFixed(4) : '---'}
              </p>
              <p className="text-xs text-orange-600">
                {wallet.isConnected && stats.claimableRewards > 0 ? 'Ready to claim' : 'No rewards yet'}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;