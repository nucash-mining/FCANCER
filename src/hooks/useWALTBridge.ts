import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';
import { CONTRACT_ADDRESSES, ChainId } from '../contracts/contractAddresses';
import { WALT_BRIDGE_ABI, ERC20_ABI } from '../contracts/abis';

export const useWALTBridge = () => {
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
      
      if (!addresses || !addresses.waltBridge) {
        console.warn('wALT Bridge not deployed on this network yet');
        return;
      }

      const waltBridgeContract = new ethers.Contract(addresses.waltBridge, WALT_BRIDGE_ABI, signer);
      const waltTokenContract = new ethers.Contract(addresses.altToken, ERC20_ABI, signer);

      setContracts({
        waltBridge: waltBridgeContract,
        waltToken: waltTokenContract,
        provider,
        signer
      });
    } catch (error) {
      console.error('Failed to initialize wALT Bridge contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const bridgeWALT = async (amount: string, targetChainId: number) => {
    if (!contracts) throw new Error('Contracts not initialized');
    
    const amountWei = ethers.parseEther(amount);
    
    // First approve wALT spending
    const approveTx = await contracts.waltToken.approve(contracts.waltBridge.target, amountWei);
    await approveTx.wait();
    
    // Then initiate bridge
    const bridgeTx = await contracts.waltBridge.initiateBridge(amountWei, targetChainId);
    return await bridgeTx.wait();
  };

  const getBridgeStats = async () => {
    if (!contracts) return null;
    
    try {
      const [totalBridged, totalFees, currentNonce, contractBalance] = await contracts.waltBridge.getBridgeStats();
      
      return {
        totalBridged: ethers.formatEther(totalBridged),
        totalFees: ethers.formatEther(totalFees),
        currentNonce: Number(currentNonce),
        contractBalance: ethers.formatEther(contractBalance)
      };
    } catch (error) {
      console.error('Failed to get bridge stats:', error);
      return null;
    }
  };

  const getUserBridgeInfo = async (userAddress: string) => {
    if (!contracts || !userAddress) return null;
    
    try {
      const [bridgeCount, lastBridge, dailyAmount, remainingDaily, nextBridgeTime] = 
        await contracts.waltBridge.getUserBridgeInfo(userAddress);
      
      return {
        bridgeCount: Number(bridgeCount),
        lastBridge: Number(lastBridge),
        dailyAmount: ethers.formatEther(dailyAmount),
        remainingDaily: ethers.formatEther(remainingDaily),
        nextBridgeTime: Number(nextBridgeTime)
      };
    } catch (error) {
      console.error('Failed to get user bridge info:', error);
      return null;
    }
  };

  const getBridgeRequest = async (nonce: number) => {
    if (!contracts) return null;
    
    try {
      const request = await contracts.waltBridge.getBridgeRequest(nonce);
      return {
        user: request.user,
        amount: ethers.formatEther(request.amount),
        targetChainId: Number(request.targetChainId),
        nonce: Number(request.nonce),
        timestamp: Number(request.timestamp),
        processed: request.processed,
        bridgeId: request.bridgeId
      };
    } catch (error) {
      console.error('Failed to get bridge request:', error);
      return null;
    }
  };

  const getChainInfo = async () => {
    if (!contracts) return null;
    
    try {
      const [supportedChainIds, bridgeAddresses] = await contracts.waltBridge.getChainInfo();
      
      return {
        supportedChainIds: supportedChainIds.map((id: any) => Number(id)),
        bridgeAddresses: bridgeAddresses
      };
    } catch (error) {
      console.error('Failed to get chain info:', error);
      return null;
    }
  };

  const getWALTBalance = async (userAddress: string) => {
    if (!contracts || !userAddress) return '0';
    
    try {
      const balance = await contracts.waltToken.balanceOf(userAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get wALT balance:', error);
      return '0';
    }
  };

  return {
    contracts,
    loading,
    bridgeWALT,
    getBridgeStats,
    getUserBridgeInfo,
    getBridgeRequest,
    getChainInfo,
    getWALTBalance
  };
};