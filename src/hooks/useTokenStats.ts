import { useState, useEffect } from 'react';
import { TokenStats } from '../types';
import { HALVING_BLOCKS, INITIAL_REWARD, TOTAL_SUPPLY } from '../constants/chains';
import { useContracts } from './useContracts';
import { useWallet } from './useWallet';

export const useTokenStats = () => {
  const { wallet } = useWallet();
  const { getTokenStats } = useContracts();
  const [stats, setStats] = useState<TokenStats>({
    totalSupply: TOTAL_SUPPLY,
    currentBlock: 0,
    currentReward: INITIAL_REWARD,
    nextHalving: HALVING_BLOCKS[0],
    stakedAmount: 0,
    userBalance: 0,
    claimableRewards: 0
  });

  const updateStats = async () => {
    if (!wallet.isConnected) return;
    
    try {
      const contractStats = await getTokenStats();
      if (contractStats) {
        setStats(prev => ({
          ...prev,
          currentBlock: contractStats.currentBlock,
          currentReward: contractStats.currentReward,
          nextHalving: contractStats.nextHalving,
          stakedAmount: contractStats.stakedAmount,
          claimableRewards: contractStats.claimableRewards,
          userBalance: contractStats.fcncrBalance
        }));
      }
    } catch (error) {
      console.error('Failed to update stats:', error);
    }
  };

  useEffect(() => {
    if (wallet.isConnected) {
      updateStats();
      
      // Update stats every 10 seconds
      const interval = setInterval(updateStats, 10000);
      return () => clearInterval(interval);
    }
  }, [wallet.isConnected, wallet.chainId]);

  return { stats, setStats, updateStats };
};