import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, ExternalLink, Clock, Shield, TrendingUp, Globe, Zap } from 'lucide-react';
import { SUPPORTED_CHAINS } from '../constants/chains';
import { useWallet } from '../hooks/useWallet';
import { useWALTBridge } from '../hooks/useWALTBridge';
import NetworkSelector from './NetworkSelector';

const WALTBridge: React.FC = () => {
  const { wallet } = useWallet();
  const { bridgeWALT, getBridgeStats, getUserBridgeInfo, loading } = useWALTBridge();
  const [fromChain, setFromChain] = useState(SUPPORTED_CHAINS[0]);
  const [toChain, setToChain] = useState(SUPPORTED_CHAINS[1]);
  const [amount, setAmount] = useState('');
  const [isBridging, setIsBridging] = useState(false);
  const [bridgeStats, setBridgeStats] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  // Get current chain info
  const currentChain = SUPPORTED_CHAINS.find(chain => chain.id === wallet.chainId);

  useEffect(() => {
    if (wallet.isConnected) {
      loadBridgeData();
      
      // Set current chain as from chain when connected
      if (currentChain) {
        setFromChain(currentChain);
        // Set to chain as different from current
        const otherChain = SUPPORTED_CHAINS.find(chain => chain.id !== currentChain.id);
        if (otherChain) {
          setToChain(otherChain);
        }
      }
    }
  }, [wallet.isConnected, wallet.address, wallet.chainId]);

  const loadBridgeData = async () => {
    try {
      const [stats, info] = await Promise.all([
        getBridgeStats(),
        getUserBridgeInfo(wallet.address!)
      ]);
      setBridgeStats(stats);
      setUserInfo(info);
    } catch (error) {
      console.error('Failed to load bridge data:', error);
    }
  };

  const handleBridge = async () => {
    if (!wallet.isConnected || !amount) return;
    
    try {
      setIsBridging(true);
      await bridgeWALT(amount, toChain.id);
      setAmount('');
      await loadBridgeData();
    } catch (error) {
      console.error('Bridge failed:', error);
      alert('Bridge transaction failed. Please try again.');
    } finally {
      setIsBridging(false);
    }
  };

  const swapChains = () => {
    const temp = fromChain;
    setFromChain(toChain);
    setToChain(temp);
  };

  const bridgeFee = parseFloat(amount) * 0.0005; // 0.05% bridge fee
  const receiveAmount = parseFloat(amount) - bridgeFee;

  const formatTime = (timestamp: number) => {
    if (timestamp <= Date.now() / 1000) return 'Ready';
    const remaining = timestamp - Date.now() / 1000;
    const minutes = Math.ceil(remaining / 60);
    return `${minutes}m`;
  };

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Current Network Display */}
      {wallet.isConnected && currentChain && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Connected Network</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Bridge wALT from this network</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: currentChain.color }}
              />
              <div className="text-right">
                <div className="font-bold text-gray-900 dark:text-white">{currentChain.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Chain ID: {currentChain.id}</div>
              </div>
              <a 
                href={currentChain.explorer}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-800 transition-colors duration-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 p-2 rounded-lg">
            <ArrowRightLeft className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">wALT Cross-Chain Bridge</h2>
        </div>

        {/* Bridge Statistics */}
        {bridgeStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Bridged</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{formatAmount(bridgeStats.totalBridged)} wALT</p>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Bridge Fee</p>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">0.05%</p>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Fees</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{formatAmount(bridgeStats.totalFees)} wALT</p>
            </div>
            <div className="bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Transactions</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{bridgeStats.currentNonce}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* From Chain with Network Selector */}
          <NetworkSelector
            selectedChain={fromChain}
            onChainSelect={setFromChain}
            label="From Network"
            showConnectedBadge={true}
          />

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              onClick={swapChains}
              className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-full transition-colors"
            >
              <ArrowRightLeft className="h-4 w-4 text-gray-600 dark:text-gray-400 transform rotate-90" />
            </button>
          </div>

          {/* To Chain with Network Selector */}
          <NetworkSelector
            selectedChain={toChain}
            onChainSelect={(chain) => setToChain(chain)}
            label="To Network"
          />

          {/* Amount Input */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount (wALT)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              min="0.001"
              max="1000000"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Min: 0.001 wALT</span>
              <span>Max: 1M wALT</span>
            </div>
          </div>

          {/* Bridge Info */}
          {amount && parseFloat(amount) >= 0.001 && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Bridge Fee (0.05%)</span>
                <span className="font-medium text-gray-900 dark:text-white">{bridgeFee.toFixed(6)} wALT</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">You will receive</span>
                <span className="font-medium text-gray-900 dark:text-white">{receiveAmount.toFixed(6)} wALT</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Estimated time</span>
                <span className="font-medium text-gray-900 dark:text-white">2-10 minutes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Same address</span>
                <span className="font-medium text-green-600 dark:text-green-400">✓ Guaranteed</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Bridge contract</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">Same on all chains</span>
              </div>
            </div>
          )}

          {/* Network Mismatch Warning */}
          {wallet.isConnected && fromChain.id !== wallet.chainId && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium text-orange-800 dark:text-orange-200">Network Mismatch</span>
              </div>
              <p className="text-xs text-orange-700 dark:text-orange-300">
                You're connected to {currentChain?.name} but trying to bridge from {fromChain.name}. 
                Click "Switch" next to the network name to change networks.
              </p>
            </div>
          )}

          {/* User Rate Limiting Info */}
          {userInfo && wallet.isConnected && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Your Bridge Limits</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Daily Remaining:</span>
                  <div className="font-medium text-gray-900 dark:text-white">{formatAmount(userInfo.remainingDaily)} wALT</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Next Bridge:</span>
                  <div className="font-medium flex items-center space-x-1 text-gray-900 dark:text-white">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(userInfo.nextBridgeTime)}</span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Total Bridges:</span>
                  <div className="font-medium text-gray-900 dark:text-white">{userInfo.bridgeCount}</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Today's Usage:</span>
                  <div className="font-medium text-gray-900 dark:text-white">{formatAmount(userInfo.dailyAmount)} wALT</div>
                </div>
              </div>
            </div>
          )}

          {/* Bridge Button */}
          <button
            onClick={handleBridge}
            disabled={
              !wallet.isConnected || 
              !amount || 
              isBridging || 
              fromChain.id === toChain.id ||
              parseFloat(amount) < 0.001 ||
              parseFloat(amount) > 1000000 ||
              (userInfo && parseFloat(amount) > parseFloat(userInfo.remainingDaily)) ||
              (wallet.isConnected && fromChain.id !== wallet.chainId)
            }
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            {isBridging ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <Zap className="h-5 w-5" />
            )}
            <span>
              {isBridging ? 'Bridging...' : wallet.isConnected ? 'Bridge wALT' : 'Connect Wallet'}
            </span>
          </button>

          {/* Supported Chains */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Supported Networks ({SUPPORTED_CHAINS.length})</span>
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {SUPPORTED_CHAINS.map((chain) => (
                <div key={chain.id} className="flex items-center space-x-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: chain.color }}
                  />
                  <span className="text-gray-600 dark:text-gray-400 truncate">{chain.name}</span>
                  {wallet.isConnected && chain.id === wallet.chainId && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Security Features</span>
            </div>
            <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• Same contract address across all chains</li>
              <li>• 5-minute cooldown between bridges</li>
              <li>• 100K wALT daily limit per address</li>
              <li>• Authorized relayer network</li>
              <li>• Emergency pause functionality</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WALTBridge;