import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';
import { CONTRACT_ADDRESSES, ChainId, CROSS_CHAIN_STAKING_CONFIG } from '../contracts/contractAddresses';
import { FCNCR_CROSSCHAIN_STAKING_ABI, ERC20_ABI } from '../contracts/abis';

export const useCrossChainStaking = () => {
  const { wallet } = useWallet();
  const [contracts, setContracts] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (wallet.isConnected && wallet.chainId && window.ethereum) {
      initializeContracts();
    }
  }, [wallet.isConnected, wallet.chainId]);

  const initializeContracts = async () => {
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const chainId = wallet.chainId as ChainId;
      const addresses = CONTRACT_ADDRESSES[chainId];
      
      if (!addresses || !addresses.fcncrStaking) {
        console.warn('Cross-chain staking contract not deployed on this network yet');
        return;
      }

      const stakingContract = new ethers.Contract(addresses.fcncrStaking, FCNCR_CROSSCHAIN_STAKING_ABI, signer);
      const stakingTokenContract = new ethers.Contract(addresses.stakingToken, ERC20_ABI, signer);

      setContracts({
        staking: stakingContract,
        stakingToken: stakingTokenContract,
        provider,
        signer
      });
    } catch (error) {
      console.error('Failed to initialize cross-chain staking contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const stakeTokens = async (amount: string) => {
    if (!contracts) throw new Error('Contracts not initialized');
    
    const amountWei = ethers.parseEther(amount);
    
    // First approve token spending
    const approveTx = await contracts.stakingToken.approve(contracts.staking.target, amountWei);
    await approveTx.wait();
    
    // Then stake
    const stakeTx = await contracts.staking.stakeTokens(amountWei);
    return await stakeTx.wait();
  };

  const unstakeTokens = async (amount: string) => {
    if (!contracts) throw new Error('Contracts not initialized');
    
    const amountWei = ethers.parseEther(amount);
    
    const unstakeTx = await contracts.staking.unstakeTokens(amountWei);
    return await unstakeTx.wait();
  };

  const claimRewards = async () => {
    if (!contracts) throw new Error('Contracts not initialized');
    
    const claimTx = await contracts.staking.claimRewards();
    return await claimTx.wait();
  };

  const mineBlock = async () => {
    if (!contracts) throw new Error('Contracts not initialized');
    
    const mineTx = await contracts.staking.mineBlock();
    return await mineTx.wait();
  };

  const requestStakeUpdates = async () => {
    if (!contracts) throw new Error('Contracts not initialized');
    
    const updateTx = await contracts.staking.requestStakeUpdates();
    return await updateTx.wait();
  };

  const getStakingStats = async () => {
    if (!contracts) return null;
    
    try {
      const [
        currentBlock,
        currentReward,
        nextHalving,
        blocksToHalving,
        stakedAmount,
        pendingRewards,
        fcncrBalance,
        stakingTokenBalance,
        totalStakedLocal,
        totalStakedGlobal,
        stakingTokenInfo,
        chainStakingInfo
      ] = await Promise.all([
        contracts.staking.currentBlock(),
        contracts.staking.getCurrentReward(),
        contracts.staking.getNextHalvingBlock(),
        contracts.staking.getBlocksToHalving(),
        contracts.staking.stakedTokens(wallet.address),
        contracts.staking.getPendingRewards(wallet.address),
        contracts.staking.balanceOf(wallet.address),
        contracts.stakingToken.balanceOf(wallet.address),
        contracts.staking.totalStakedLocal(),
        contracts.staking.totalStakedGlobal(),
        contracts.staking.getStakingTokenInfo(),
        contracts.staking.getChainStakingInfo()
      ]);

      return {
        currentBlock: Number(currentBlock),
        currentReward: Number(ethers.formatEther(currentReward)),
        nextHalving: Number(nextHalving),
        blocksToHalving: Number(blocksToHalving),
        stakedAmount: Number(ethers.formatEther(stakedAmount)),
        claimableRewards: Number(ethers.formatEther(pendingRewards)),
        fcncrBalance: Number(ethers.formatEther(fcncrBalance)),
        stakingTokenBalance: Number(ethers.formatEther(stakingTokenBalance)),
        totalStakedLocal: Number(ethers.formatEther(totalStakedLocal)),
        totalStakedGlobal: Number(ethers.formatEther(totalStakedGlobal)),
        stakingTokenInfo: {
          address: stakingTokenInfo.tokenAddress,
          symbol: stakingTokenInfo.tokenSymbol,
          isAltcoinchain: stakingTokenInfo.isAltcoinchain,
          userBalance: Number(ethers.formatEther(stakingTokenInfo.userBalance)),
          userStaked: Number(ethers.formatEther(stakingTokenInfo.userStaked))
        },
        chainStakingInfo: {
          chainIds: chainStakingInfo.chainIds.map((id: any) => Number(id)),
          stakedAmounts: chainStakingInfo.stakedAmounts.map((amount: any) => Number(ethers.formatEther(amount))),
          lastUpdates: chainStakingInfo.lastUpdates.map((update: any) => Number(update)),
          contractAddresses: chainStakingInfo.contractAddresses
        }
      };
    } catch (error) {
      console.error('Failed to get staking stats:', error);
      return null;
    }
  };

  const getChainStakeAmount = async (chainId: number) => {
    if (!contracts) return 0;
    
    try {
      const amount = await contracts.staking.chainStakedAmounts(chainId);
      return Number(ethers.formatEther(amount));
    } catch (error) {
      console.error('Failed to get chain stake amount:', error);
      return 0;
    }
  };

  const emergencyWithdraw = async () => {
    if (!contracts) throw new Error('Contracts not initialized');
    
    const withdrawTx = await contracts.staking.emergencyWithdrawTokens();
    return await withdrawTx.wait();
  };

  return {
    contracts,
    loading,
    stakeTokens,
    unstakeTokens,
    claimRewards,
    mineBlock,
    requestStakeUpdates,
    getStakingStats,
    getChainStakeAmount,
    emergencyWithdraw
  };
};