import React, { useState } from 'react';
import { Shield, Plus, Minus, Award, TrendingUp } from 'lucide-react';
import { useTokenStats } from '../hooks/useTokenStats';
import { useWallet } from '../hooks/useWallet';
import { useContracts } from '../hooks/useContracts';
import { SUPPORTED_CHAINS } from '../constants/chains';
import CrossChainStakingPanel from './CrossChainStakingPanel';

const StakingPanel: React.FC = () => {
  const { stats, updateStats } = useTokenStats();
  const { wallet } = useWallet();
  const { stakeALT, unstakeALT, claimRewards, mineBlock } = useContracts();
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isMining, setIsMining] = useState(false);
  const [useCrossChain, setUseCrossChain] = useState(true); // Default to cross-chain

  // Get current chain info and dynamic ticker
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

  const networkSymbol = getNetworkSymbol();

  const handleStake = async () => {
    if (!wallet.isConnected || !stakeAmount) return;
    
    try {
      setIsStaking(true);
      await stakeALT(stakeAmount);
      setStakeAmount('');
      await updateStats();
    } catch (error) {
      console.error('Staking failed:', error);
      alert('Staking failed. Please check your balance and try again.');
    } finally {
      setIsStaking(false);
    }
  };

  const handleUnstake = async () => {
    if (!wallet.isConnected || !unstakeAmount) return;
    
    try {
      setIsUnstaking(true);
      await unstakeALT(unstakeAmount);
      setUnstakeAmount('');
      await updateStats();
    } catch (error) {
      console.error('Unstaking failed:', error);
      alert('Unstaking failed. Please check your staked amount and try again.');
    } finally {
      setIsUnstaking(false);
    }
  };

  const handleClaim = async () => {
    if (!wallet.isConnected) return;
    
    try {
      setIsClaiming(true);
      await claimRewards();
      await updateStats();
    } catch (error) {
      console.error('Claiming failed:', error);
      alert('Claiming failed. Please try again.');
    } finally {
      setIsClaiming(false);
    }
  };

  const handleMineBlock = async () => {
    if (!wallet.isConnected) return;
    
    try {
      setIsMining(true);
      await mineBlock();
      await updateStats();
    } catch (error) {
      console.error('Mining failed:', error);
      alert('Mining failed. Please try again.');
    } finally {
      setIsMining(false);
    }
  };

  const maxStake = () => {
    setStakeAmount('1000'); // This should be replaced with actual token balance
  };

  const maxUnstake = () => {
    setUnstakeAmount(stats.stakedAmount.toString());
  };

  // Use cross-chain staking by default
  if (useCrossChain) {
    return <CrossChainStakingPanel />;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{networkSymbol} Staking</h2>
        </div>
        
        {/* Staking Mode Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setUseCrossChain(false)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              !useCrossChain 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            Legacy
          </button>
          <button
            onClick={() => setUseCrossChain(true)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              useCrossChain 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            Cross-Chain
          </button>
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

      <div className="space-y-6">
        {/* Mine Block Button */}
        <button
          onClick={handleMineBlock}
          disabled={!wallet.isConnected || isMining}
          className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-3 rounded-lg hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
        >
          {isMining ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          ) : (
            <Plus className="h-5 w-5" />
          )}
          <span>{isMining ? 'Mining...' : 'Mine Block'}</span>
        </button>

        {/* Staking Input */}
        <div className="bg-gray-50 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stake {networkSymbol} Amount
          </label>
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="0.0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={maxStake}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-medium text-purple-600 hover:text-purple-700"
              >
                MAX
              </button>
            </div>
            <button
              onClick={handleStake}
              disabled={!wallet.isConnected || !stakeAmount || isStaking}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
            >
              {isStaking ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span>{isStaking ? 'Deploying...' : `DEPLOY ${networkSymbol}`}</span>
            </button>
          </div>
        </div>

        {/* Unstaking Input */}
        {stats.stakedAmount > 0 && (
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <label className="block text-sm font-medium text-red-700 mb-2">
              Remove {networkSymbol} Amount
            </label>
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <input
                  type="number"
                  value={unstakeAmount}
                  onChange={(e) => setUnstakeAmount(e.target.value)}
                  placeholder="0.0"
                  max={stats.stakedAmount}
                  className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <button
                  onClick={maxUnstake}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-medium text-red-600 hover:text-red-700"
                >
                  MAX
                </button>
              </div>
              <button
                onClick={handleUnstake}
                disabled={!wallet.isConnected || !unstakeAmount || isUnstaking || parseFloat(unstakeAmount) > stats.stakedAmount}
                className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-red-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
              >
                {isUnstaking ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <Minus className="h-4 w-4" />
                )}
                <span>{isUnstaking ? 'Removing...' : `REMOVE ${networkSymbol}`}</span>
              </button>
            </div>
          </div>
        )}

        {/* Current Staking Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Staked {networkSymbol}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.stakedAmount.toFixed(2)}</p>
            <p className="text-xs text-gray-500">Current Position</p>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Pending Rewards</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.claimableRewards.toFixed(4)}</p>
            <p className="text-xs text-gray-500">FCNCR Tokens</p>
          </div>
        </div>

        {/* Claim Rewards */}
        <button
          onClick={handleClaim}
          disabled={!wallet.isConnected || stats.claimableRewards === 0 || isClaiming}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
        >
          {isClaiming ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          ) : (
            <Award className="h-5 w-5" />
          )}
          <span>
            {isClaiming ? 'Claiming...' : `Claim ${stats.claimableRewards.toFixed(4)} FCNCR`}
          </span>
        </button>

        {/* APY Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Current APY</span>
          </div>
          <p className="text-lg font-bold text-yellow-900">
            {((stats.currentReward / 50) * 100).toFixed(1)}% 
            <span className="text-sm font-normal ml-1">
              (Decreases with halvings)
            </span>
          </p>
        </div>

        {/* Network Info */}
        {!wallet.isConnected && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 mb-2">
              <strong>Connect your wallet to start staking!</strong>
            </p>
            <p className="text-xs text-blue-600">
              Supported networks: ETH, EGAZ, PLQ, OCTA, WDOGE, S, FTM, ALT, ETHO
            </p>
          </div>
        )}

        {/* Current Network Contract Info */}
        {wallet.isConnected && currentChain && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: currentChain.color }}
              />
              <span className="text-sm font-medium text-indigo-800">
                {currentChain.name} Network Active
              </span>
            </div>
            <div className="text-xs text-indigo-600 space-y-1">
              <div>Staking Token: <span className="font-mono">{networkSymbol}</span></div>
              <div>Reward Token: <span className="font-mono">FCNCR</span></div>
              {currentChain.factory && (
                <div>Swapin Factory: <span className="font-mono">{currentChain.factory.slice(0, 10)}...</span></div>
              )}
            </div>
          </div>
        )}

        {/* Cross-Chain Upgrade Notice */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Cross-Chain Staking Available</span>
          </div>
          <p className="text-xs text-purple-700 mb-2">
            Upgrade to cross-chain staking for global reward distribution across all networks.
          </p>
          <button
            onClick={() => setUseCrossChain(true)}
            className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition-colors"
          >
            Switch to Cross-Chain
          </button>
        </div>
      </div>
    </div>
  );
};

export default StakingPanel;