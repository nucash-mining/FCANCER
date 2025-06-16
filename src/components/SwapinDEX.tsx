import React, { useState } from 'react';
import { ArrowUpDown, Droplets, TrendingUp, ExternalLink, RefreshCw, Zap, Globe } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { SUPPORTED_CHAINS } from '../constants/chains';

const SwapinDEX: React.FC = () => {
  const { wallet } = useWallet();
  const [fromToken, setFromToken] = useState('FCNCR');
  const [toToken, setToToken] = useState('ALT');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [slippage, setSlippage] = useState('0.5');

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

  const networkSymbol = getNetworkSymbol();

  const handleSwap = async () => {
    if (!wallet.isConnected || !fromAmount) return;
    
    setIsSwapping(true);
    // Simulate swap transaction
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsSwapping(false);
    setFromAmount('');
    setToAmount('');
  };

  const swapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const calculateToAmount = (amount: string) => {
    if (!amount) return '';
    const rate = fromToken === 'FCNCR' ? 0.5 : 2.0; // Mock exchange rate
    return (parseFloat(amount) * rate).toFixed(6);
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    setToAmount(calculateToAmount(value));
  };

  // Mock pool data with real Swapin.co addresses
  const topPools = [
    {
      pair: `FCNCR/${networkSymbol}`,
      apy: 45.2,
      tvl: 1200000,
      volume24h: 89000,
      factory: currentChain?.factory,
      router: currentChain?.router
    },
    {
      pair: 'FCNCR/USDC',
      apy: 32.8,
      tvl: 890000,
      volume24h: 67000,
      factory: currentChain?.factory,
      router: currentChain?.router
    },
    {
      pair: `${networkSymbol}/USDC`,
      apy: 28.5,
      tvl: 2100000,
      volume24h: 156000,
      factory: currentChain?.factory,
      router: currentChain?.router
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                <img src="/image.png" alt="Swapin.co" className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Swapin.co</h1>
                <p className="text-sm text-purple-200">Cross-Chain DEX for FCNCR</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {currentChain && (
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: currentChain.color }}
                  />
                  <span className="text-white font-medium">{currentChain.name}</span>
                  <a 
                    href={currentChain.explorer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 hover:text-white"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}
              
              {/* Swapin.co Contract Info */}
              {currentChain && (
                <div className="text-xs text-white/60 bg-white/5 px-3 py-2 rounded-lg">
                  <div>Factory: {currentChain.factory?.slice(0, 8)}...</div>
                  <div>Router: {currentChain.router?.slice(0, 8)}...</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Swap Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Swap Tokens</h2>
                <div className="flex items-center space-x-4">
                  <button className="text-white/60 hover:text-white transition-colors">
                    <RefreshCw className="h-5 w-5" />
                  </button>
                  <div className="text-sm text-white/60">
                    Slippage: {slippage}%
                  </div>
                  <select 
                    value={slippage}
                    onChange={(e) => setSlippage(e.target.value)}
                    className="bg-white/10 text-white text-sm rounded px-2 py-1 border border-white/20"
                  >
                    <option value="0.1">0.1%</option>
                    <option value="0.5">0.5%</option>
                    <option value="1.0">1.0%</option>
                    <option value="3.0">3.0%</option>
                  </select>
                </div>
              </div>

              {/* From Token */}
              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/60 text-sm">From</span>
                  <span className="text-white/60 text-sm">Balance: 0.00</span>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    value={fromAmount}
                    onChange={(e) => handleFromAmountChange(e.target.value)}
                    placeholder="0.0"
                    className="flex-1 bg-transparent text-white text-2xl font-bold placeholder-white/40 focus:outline-none"
                  />
                  <div className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-lg">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                    <span className="text-white font-medium">{fromToken}</span>
                  </div>
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center my-4">
                <button
                  onClick={swapTokens}
                  className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors"
                >
                  <ArrowUpDown className="h-5 w-5 text-white" />
                </button>
              </div>

              {/* To Token */}
              <div className="bg-white/5 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/60 text-sm">To</span>
                  <span className="text-white/60 text-sm">Balance: 0.00</span>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    value={toAmount}
                    readOnly
                    placeholder="0.0"
                    className="flex-1 bg-transparent text-white text-2xl font-bold placeholder-white/40 focus:outline-none"
                  />
                  <div className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-lg">
                    <div 
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: currentChain?.color || '#8B5CF6' }}
                    ></div>
                    <span className="text-white font-medium">{toToken === 'ALT' ? networkSymbol : toToken}</span>
                  </div>
                </div>
              </div>

              {/* Swap Details */}
              {fromAmount && (
                <div className="bg-white/5 rounded-xl p-4 mb-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Exchange Rate</span>
                    <span className="text-white">1 FCNCR = 0.5 {networkSymbol}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Price Impact</span>
                    <span className="text-green-400">0.01%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Liquidity Provider Fee</span>
                    <span className="text-white">0.3%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Minimum Received</span>
                    <span className="text-white">{(parseFloat(toAmount) * (1 - parseFloat(slippage)/100)).toFixed(6)} {networkSymbol}</span>
                  </div>
                  {currentChain && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Router Contract</span>
                      <span className="text-white font-mono text-xs">{currentChain.router?.slice(0, 10)}...</span>
                    </div>
                  )}
                </div>
              )}

              {/* Swap Button */}
              <button
                onClick={handleSwap}
                disabled={!wallet.isConnected || !fromAmount || isSwapping}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 font-bold text-lg"
              >
                {isSwapping ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                ) : (
                  <Zap className="h-6 w-6" />
                )}
                <span>
                  {isSwapping ? 'Swapping...' : wallet.isConnected ? 'Swap Tokens' : 'Connect Wallet'}
                </span>
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cross-Chain Bridge */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Cross-Chain Bridge</span>
              </h3>
              <p className="text-white/60 text-sm mb-4">
                Bridge FCNCR tokens across all supported networks with minimal fees.
              </p>
              <div className="space-y-3">
                {SUPPORTED_CHAINS.map((chain) => (
                  <div key={chain.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: chain.color }}
                      />
                      <div>
                        <span className="text-white text-sm">{chain.name}</span>
                        <div className="text-xs text-white/40 font-mono">
                          {chain.factory?.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-green-400 text-xs">Live</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105">
                Bridge Tokens
              </button>
            </div>

            {/* Liquidity Pools */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <Droplets className="h-5 w-5" />
                <span>Top Pools</span>
              </h3>
              <div className="space-y-3">
                {topPools.map((pool, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex -space-x-1">
                        <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full border-2 border-white"></div>
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-white"
                          style={{ backgroundColor: currentChain?.color || '#8B5CF6' }}
                        ></div>
                      </div>
                      <div>
                        <span className="text-white text-sm">{pool.pair}</span>
                        <div className="text-xs text-white/40 font-mono">
                          {pool.factory?.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 text-sm font-bold">{pool.apy}% APY</div>
                      <div className="text-white/60 text-xs">${(pool.tvl / 1000000).toFixed(1)}M TVL</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2">
                <Droplets className="h-5 w-5" />
                <span>Add Liquidity</span>
              </button>
            </div>

            {/* DEX Stats */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Swapin.co Stats</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white/60 text-sm">24h Volume</span>
                    <span className="text-white font-bold">$2.4M</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white/60 text-sm">Total Liquidity</span>
                    <span className="text-white font-bold">$12.8M</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white/60 text-sm">Total Fees</span>
                    <span className="text-green-400 font-bold">$7.2K</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white/60 text-sm">Active Pairs</span>
                    <span className="text-white font-bold">24</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">Networks</span>
                    <span className="text-white font-bold">{SUPPORTED_CHAINS.length}</span>
                  </div>
                </div>
              </div>
              
              {/* Current Network Info */}
              {currentChain && (
                <div className="mt-4 p-3 bg-white/5 rounded-lg">
                  <div className="text-xs text-white/60 mb-2">Current Network Contracts:</div>
                  <div className="space-y-1 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-white/60">Factory:</span>
                      <span className="text-white">{currentChain.factory?.slice(0, 10)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Router:</span>
                      <span className="text-white">{currentChain.router?.slice(0, 10)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Multicall:</span>
                      <span className="text-white">{currentChain.multicall?.slice(0, 10)}...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapinDEX;