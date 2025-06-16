import React, { useState, useEffect } from 'react';
import { Shield, Plus, Minus, Award, TrendingUp, Globe, RefreshCw, AlertTriangle } from 'lucide-react';
import { useCrossChainStaking } from '../hooks/useCrossChainStaking';
import { useWallet } from '../hooks/useWallet';
import { SUPPORTED_CHAINS } from '../constants/chains';

const CrossChainStakingPanel: React.FC = () => {
  const { getStakingStats, stakeTokens, unstakeTokens, claimRewards, mineBlock, requestStakeUpdates, loading } = useCrossChainStaking();
  const { wallet } = useWallet();
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isMining, setIsMining] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [stakingStats, setStakingStats] = useState<any>(null);

  // Get current chain info and dynamic ticker
  const currentChain = SUPPORTED_CHAINS.find(chain => chain.id === wallet.chainId);
  const getNetworkSymbol = () => {
    if (!currentChain) return 'ALT';
    
    switch (currentChain.id) {
      case 2330: return 'ALT'; // Altcoinchain uses ALT
      default: return 'wALT'; // All other chains use wALT
    }
  };

  const networkSymbol = getNetworkSymbol();
  const isAltcoinchain = currentChain?.id === 2330;

  useEffect(() => {
    if (wallet.isConnected) {
      loadStakingStats();
      
      // Auto-refresh every 10 seconds
      const interval = setInterval(loadStakingStats, 10000);
      return () => clearInterval(interval);
    }
  }, [wallet.isConnected, wallet.address, wallet.chainId]);

  const loadStakingStats = async () => {
    try {
      const stats = await getStakingStats();
      setStakingStats(stats);
    } catch (error) {
      console.error('Failed to load staking stats:', error);
    }
  };

  const handleStake = async () => {
    if (!wallet.isConnected || !stakeAmount) return;
    
    try {
      setIsStaking(true);
      await stakeTokens(stakeAmount);
      setStakeAmount('');
      await loadStakingStats();
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
      await unstakeTokens(unstakeAmount);
      setUnstakeAmount('');
      await loadStakingStats();
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
      await loadStakingStats();
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
      await loadStakingStats();
    } catch (error) {
      console.error('Mining failed:', error);
      alert('Mining failed. Please try again.');
    } finally {
      setIsMining(false);
    }
  };

  const handleRequestUpdates = async () => {
    if (!wallet.isConnected) return;
    
    try {
      setIsUpdating(true);
      await requestStakeUpdates();
      await loadStakingStats();
    } catch (error) {
      console.error('Update request failed:', error);
      alert('Update request failed. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const maxStake = () => {
    if (stakingStats?.stakingTokenInfo?.userBalance) {
      setStakeAmount(stakingStats.stakingTokenInfo.userBalance.toString());
    }
  };

  const maxUnstake = () => {
    if (stakingStats?.stakedAmount) {
      setUnstakeAmount(stakingStats.stakedAmount.toString());
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toFixed(2);
  };

  const getChainName = (chainId: number) => {
    const chain = SUPPORTED_CHAINS.find(c => c.id === chainId);
    return chain ? chain.name : `Chain ${chainId}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Cross-Chain {networkSymbol} Staking</h2>
        </div>
        
        {/* Network Indicator */}
        {currentChain && (
          <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: currentChain.color }}
            />
            <span className="text-sm font-medium text-gray-700">{currentChain.name}</span>
            {isAltcoinchain && <span className="text-xs text-purple-600 font-bold">MASTER</span>}
          </div>
        )}
      </div>

      {/* Global Staking Statistics */}
      {stakingStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Local Staked</p>
            <p className="text-lg font-bold text-gray-900">{formatNumber(stakingStats.totalStakedLocal)} {networkSymbol}</p>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Global Staked</p>
            <p className="text-lg font-bold text-green-600">{formatNumber(stakingStats.totalStakedGlobal)} Total</p>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Your Share</p>
            <p className="text-lg font-bold text-gray-900">
              {stakingStats.totalStakedGlobal > 0 
                ? ((stakingStats.stakedAmount / stakingStats.totalStakedGlobal) * 100).toFixed(3)
                : '0.000'
              }%
            </p>
          </div>
          <div className="bg-gradient-to-r from-cyan-50 to-teal-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Networks</p>
            <p className="text-lg font-bold text-gray-900">
              {stakingStats.chainStakingInfo?.chainIds?.length || 0}/9
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Cross-Chain Update Button */}
        <div className="flex space-x-2">
          <button
            onClick={handleMineBlock}
            disabled={!wallet.isConnected || isMining}
            className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-3 rounded-lg hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            {isMining ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
            <span>{isMining ? 'Mining...' : 'Mine Block'}</span>
          </button>
          
          <button
            onClick={handleRequestUpdates}
            disabled={!wallet.isConnected || isUpdating}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
          >
            {isUpdating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">{isUpdating ? 'Updating...' : 'Sync Chains'}</span>
          </button>
        </div>

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
              <span>{isStaking ? 'Staking...' : `DEPLOY ${networkSymbol}`}</span>
            </button>
          </div>
          {stakingStats?.stakingTokenInfo && (
            <p className="text-xs text-gray-500 mt-1">
              Available: {formatNumber(stakingStats.stakingTokenInfo.userBalance)} {networkSymbol}
            </p>
          )}
        </div>

        {/* Unstaking Input */}
        {stakingStats?.stakedAmount > 0 && (
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <label className="block text-sm font-medium text-red-700 mb-2">
              Unstake {networkSymbol} Amount
            </label>
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <input
                  type="number"
                  value={unstakeAmount}
                  onChange={(e) => setUnstakeAmount(e.target.value)}
                  placeholder="0.0"
                  max={stakingStats.stakedAmount}
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
                disabled={!wallet.isConnected || !unstakeAmount || isUnstaking || parseFloat(unstakeAmount) > stakingStats.stakedAmount}
                className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-red-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
              >
                {isUnstaking ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <Minus className="h-4 w-4" />
                )}
                <span>{isUnstaking ? 'Unstaking...' : `REMOVE ${networkSymbol}`}</span>
              </button>
            </div>
          </div>
        )}

        {/* Current Staking Info */}
        {stakingStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Your Staked {networkSymbol}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stakingStats.stakedAmount.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Current Position</p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Award className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Pending Rewards</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stakingStats.claimableRewards.toFixed(4)}</p>
              <p className="text-xs text-gray-500">FCNCR Tokens</p>
            </div>
          </div>
        )}

        {/* Claim Rewards */}
        <button
          onClick={handleClaim}
          disabled={!wallet.isConnected || !stakingStats?.claimableRewards || stakingStats.claimableRewards === 0 || isClaiming}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
        >
          {isClaiming ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          ) : (
            <Award className="h-5 w-5" />
          )}
          <span>
            {isClaiming ? 'Claiming...' : `Claim ${stakingStats?.claimableRewards?.toFixed(4) || '0.0000'} FCNCR`}
          </span>
        </button>

        {/* Cross-Chain Staking Distribution */}
        {stakingStats?.chainStakingInfo && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Globe className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">Cross-Chain Distribution</span>
            </div>
            <div className="space-y-2">
              {stakingStats.chainStakingInfo.chainIds.map((chainId: number, index: number) => {
                const stakedAmount = stakingStats.chainStakingInfo.stakedAmounts[index];
                const percentage = stakingStats.totalStakedGlobal > 0 
                  ? (stakedAmount / stakingStats.totalStakedGlobal) * 100 
                  : 0;
                const isCurrentChain = chainId === wallet.chainId;
                
                return (
                  <div key={chainId} className={`flex items-center justify-between p-2 rounded ${isCurrentChain ? 'bg-blue-100 border border-blue-200' : 'bg-white'}`}>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: SUPPORTED_CHAINS.find(c => c.id === chainId)?.color || '#8B5CF6' }}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {getChainName(chainId)}
                        {isCurrentChain && <span className="text-blue-600 ml-1">(Current)</span>}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">
                        {formatNumber(stakedAmount)} {chainId === 2330 ? 'ALT' : 'wALT'}
                      </div>
                      <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* APY Info */}
        {stakingStats && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Current APY</span>
            </div>
            <p className="text-lg font-bold text-yellow-900">
              {((stakingStats.currentReward / 50) * 100).toFixed(1)}% 
              <span className="text-sm font-normal ml-1">
                (Decreases with halvings)
              </span>
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Rewards distributed proportionally across all {stakingStats.chainStakingInfo?.chainIds?.length || 0} networks
            </p>
          </div>
        )}

        {/* Network Info */}
        {!wallet.isConnected && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 mb-2">
              <strong>Connect your wallet to start cross-chain staking!</strong>
            </p>
            <p className="text-xs text-blue-600">
              • Altcoinchain: Stake ALT tokens (Master chain)
            </p>
            <p className="text-xs text-blue-600">
              • Other networks: Stake wALT tokens (bridged from Altcoinchain)
            </p>
          </div>
        )}

        {/* Warning for non-Altcoinchain networks */}
        {wallet.isConnected && !isAltcoinchain && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Bridge wALT Required</span>
            </div>
            <p className="text-xs text-orange-700">
              You need wALT tokens to stake on this network. Bridge ALT from Altcoinchain using the wALT Bridge.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrossChainStakingPanel;