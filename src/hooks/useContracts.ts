import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';
import { CONTRACT_ADDRESSES, ChainId } from '../contracts/contractAddresses';
import { FCNCR_CROSSCHAIN_ABI, CROSSCHAIN_MESSENGER_ABI, BRIDGE_ABI, LIQUIDITY_POOL_ABI, ERC20_ABI } from '../contracts/abis';

export const useContracts = () => {
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
      
      if (!addresses) {
        console.error('Unsupported chain ID:', chainId);
        return;
      }

      // Use cross-chain contracts if available, fallback to regular contracts
      const fcncrAddress = addresses.fcncrCrossChain || addresses.fcncr;
      const messengerAddress = addresses.messenger;
      
      if (!fcncrAddress) {
        console.warn('FCNCR contract not deployed on this network yet');
        return;
      }

      const fcncrContract = new ethers.Contract(fcncrAddress, FCNCR_CROSSCHAIN_ABI, signer);
      const altTokenContract = new ethers.Contract(addresses.altToken, ERC20_ABI, signer);
      
      let messengerContract = null;
      let bridgeContract = null;
      let liquidityPoolContract = null;

      if (messengerAddress) {
        messengerContract = new ethers.Contract(messengerAddress, CROSSCHAIN_MESSENGER_ABI, signer);
      }

      if (addresses.bridge) {
        bridgeContract = new ethers.Contract(addresses.bridge, BRIDGE_ABI, signer);
      }

      if (addresses.liquidityPool) {
        liquidityPoolContract = new ethers.Contract(addresses.liquidityPool, LIQUIDITY_POOL_ABI, signer);
      }

      setContracts({
        fcncr: fcncrContract,
        messenger: messengerContract,
        bridge: bridgeContract,
        liquidityPool: liquidityPoolContract,
        altToken: altTokenContract,
        provider,
        signer
      });
    } catch (error) {
      console.error('Failed to initialize contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const stakeALT = async (amount: string) => {
    if (!contracts) throw new Error('Contracts not initialized');
    
    const amountWei = ethers.parseEther(amount);
    
    // First approve ALT spending
    const approveTx = await contracts.altToken.approve(contracts.fcncr.target, amountWei);
    await approveTx.wait();
    
    // Then stake
    const stakeTx = await contracts.fcncr.stakeALT(amountWei);
    return await stakeTx.wait();
  };

  const unstakeALT = async (amount: string) => {
    if (!contracts) throw new Error('Contracts not initialized');
    
    const amountWei = ethers.parseEther(amount);
    
    const unstakeTx = await contracts.fcncr.unstakeALT(amountWei);
    return await unstakeTx.wait();
  };

  const claimRewards = async () => {
    if (!contracts) throw new Error('Contracts not initialized');
    
    const claimTx = await contracts.fcncr.claimRewards();
    return await claimTx.wait();
  };

  const mineBlock = async () => {
    if (!contracts) throw new Error('Contracts not initialized');
    
    const mineTx = await contracts.fcncr.mineBlock();
    return await mineTx.wait();
  };

  const bridgeTokens = async (amount: string, targetChainId: number) => {
    if (!contracts || !contracts.fcncr) throw new Error('Cross-chain contracts not initialized');
    
    const amountWei = ethers.parseEther(amount);
    const bridgeFee = await contracts.fcncr.getBridgeFee();
    
    // Bridge tokens using cross-chain functionality
    const bridgeTx = await contracts.fcncr.bridgeTokens(amountWei, targetChainId, {
      value: bridgeFee
    });
    return await bridgeTx.wait();
  };

  const addLiquidity = async (fcncrAmount: string, altAmount: string) => {
    if (!contracts || !contracts.liquidityPool) throw new Error('Liquidity pool contract not initialized');
    
    const fcncrWei = ethers.parseEther(fcncrAmount);
    const altWei = ethers.parseEther(altAmount);
    
    // Approve both tokens
    const fcncrApproveTx = await contracts.fcncr.approve(contracts.liquidityPool.target, fcncrWei);
    await fcncrApproveTx.wait();
    
    const altApproveTx = await contracts.altToken.approve(contracts.liquidityPool.target, altWei);
    await altApproveTx.wait();
    
    // Add liquidity
    const addTx = await contracts.liquidityPool.addLiquidity(fcncrWei, altWei);
    return await addTx.wait();
  };

  const getTokenStats = async () => {
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
        altBalance
      ] = await Promise.all([
        contracts.fcncr.currentBlock(),
        contracts.fcncr.getCurrentReward(),
        contracts.fcncr.getNextHalvingBlock(),
        contracts.fcncr.getBlocksToHalving(),
        contracts.fcncr.stakedALT(wallet.address),
        contracts.fcncr.getPendingRewards(wallet.address),
        contracts.fcncr.balanceOf(wallet.address),
        contracts.altToken.balanceOf(wallet.address)
      ]);

      return {
        currentBlock: Number(currentBlock),
        currentReward: Number(ethers.formatEther(currentReward)),
        nextHalving: Number(nextHalving),
        blocksToHalving: Number(blocksToHalving),
        stakedAmount: Number(ethers.formatEther(stakedAmount)),
        claimableRewards: Number(ethers.formatEther(pendingRewards)),
        fcncrBalance: Number(ethers.formatEther(fcncrBalance)),
        altBalance: Number(ethers.formatEther(altBalance))
      };
    } catch (error) {
      console.error('Failed to get token stats:', error);
      return null;
    }
  };

  return {
    contracts,
    loading,
    stakeALT,
    unstakeALT,
    claimRewards,
    mineBlock,
    bridgeTokens,
    addLiquidity,
    getTokenStats
  };
};