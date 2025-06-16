import React, { useState } from 'react';
import { ArrowRightLeft, ChevronDown, ExternalLink } from 'lucide-react';
import { SUPPORTED_CHAINS } from '../constants/chains';
import { useWallet } from '../hooks/useWallet';

const CrossChainBridge: React.FC = () => {
  const { wallet } = useWallet();
  const [fromChain, setFromChain] = useState(SUPPORTED_CHAINS[0]);
  const [toChain, setToChain] = useState(SUPPORTED_CHAINS[1]);
  const [amount, setAmount] = useState('');
  const [isBridging, setIsBridging] = useState(false);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const handleBridge = async () => {
    if (!wallet.isConnected || !amount) return;
    
    setIsBridging(true);
    // Simulate bridge transaction
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsBridging(false);
    setAmount('');
  };

  const swapChains = () => {
    const temp = fromChain;
    setFromChain(toChain);
    setToChain(temp);
  };

  const bridgeFee = parseFloat(amount) * 0.001; // 0.1% bridge fee

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
          <ArrowRightLeft className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Cross-Chain Bridge</h2>
      </div>

      <div className="space-y-4">
        {/* From Chain */}
        <div className="bg-gray-50 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
          <div className="relative">
            <button
              onClick={() => setShowFromDropdown(!showFromDropdown)}
              className="w-full flex items-center justify-between p-3 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: fromChain.color }}
                />
                <span className="font-medium">{fromChain.name}</span>
                <span className="text-gray-500">({fromChain.symbol})</span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
            
            {showFromDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {SUPPORTED_CHAINS.map((chain) => (
                  <button
                    key={chain.id}
                    onClick={() => {
                      setFromChain(chain);
                      setShowFromDropdown(false);
                    }}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: chain.color }}
                    />
                    <span className="font-medium">{chain.name}</span>
                    <span className="text-gray-500">({chain.symbol})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={swapChains}
            className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
          >
            <ArrowRightLeft className="h-4 w-4 text-gray-600 transform rotate-90" />
          </button>
        </div>

        {/* To Chain */}
        <div className="bg-gray-50 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
          <div className="relative">
            <button
              onClick={() => setShowToDropdown(!showToDropdown)}
              className="w-full flex items-center justify-between p-3 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: toChain.color }}
                />
                <span className="font-medium">{toChain.name}</span>
                <span className="text-gray-500">({toChain.symbol})</span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
            
            {showToDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {SUPPORTED_CHAINS.filter(chain => chain.id !== fromChain.id).map((chain) => (
                  <button
                    key={chain.id}
                    onClick={() => {
                      setToChain(chain);
                      setShowToDropdown(false);
                    }}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: chain.color }}
                    />
                    <span className="font-medium">{chain.name}</span>
                    <span className="text-gray-500">({chain.symbol})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Amount Input */}
        <div className="bg-gray-50 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount (FCNCR)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Bridge Info */}
        {amount && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Bridge Fee (0.1%)</span>
              <span className="font-medium">{bridgeFee.toFixed(6)} FCNCR</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">You will receive</span>
              <span className="font-medium">{(parseFloat(amount) - bridgeFee).toFixed(6)} FCNCR</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Estimated time</span>
              <span className="font-medium">2-5 minutes</span>
            </div>
          </div>
        )}

        {/* Bridge Button */}
        <button
          onClick={handleBridge}
          disabled={!wallet.isConnected || !amount || isBridging || fromChain.id === toChain.id}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
        >
          {isBridging ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          ) : (
            <ArrowRightLeft className="h-5 w-5" />
          )}
          <span>
            {isBridging ? 'Bridging...' : 'Bridge Tokens'}
          </span>
        </button>

        {/* Supported Chains */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Supported Networks</h3>
          <div className="grid grid-cols-2 gap-2">
            {SUPPORTED_CHAINS.map((chain) => (
              <div key={chain.id} className="flex items-center space-x-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: chain.color }}
                />
                <span className="text-gray-600">{chain.name}</span>
                <ExternalLink className="h-3 w-3 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrossChainBridge;