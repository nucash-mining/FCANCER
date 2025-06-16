import React, { useState } from 'react';
import { Globe, ChevronDown, ExternalLink } from 'lucide-react';
import { SUPPORTED_CHAINS } from '../constants/chains';
import { useWallet } from '../hooks/useWallet';

const ChainSelector: React.FC = () => {
  const { wallet, switchChain } = useWallet();
  const [showDropdown, setShowDropdown] = useState(false);

  const currentChain = SUPPORTED_CHAINS.find(chain => chain.id === wallet.chainId);

  const handleChainSwitch = async (chainId: number) => {
    await switchChain(chainId);
    setShowDropdown(false);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-800 transition-colors duration-200">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
          <Globe className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Supported Networks</h2>
      </div>

      {/* Current Network */}
      {currentChain && (
        <div className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg p-4">
          <p className="text-sm font-medium text-indigo-800 dark:text-indigo-200 mb-2">Current Network</p>
          <div className="flex items-center space-x-3">
            <img 
              src={currentChain.logo} 
              alt={currentChain.name}
              className="w-6 h-6 rounded-full object-cover"
              onError={(e) => {
                // Fallback to colored circle if logo fails to load
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling!.style.display = 'block';
              }}
            />
            <div 
              className="w-6 h-6 rounded-full hidden"
              style={{ backgroundColor: currentChain.color }}
            />
            <span className="font-bold text-gray-900 dark:text-white">{currentChain.name}</span>
            <span className="text-gray-600 dark:text-gray-400">({currentChain.symbol})</span>
            <a 
              href={currentChain.explorer}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}

      {/* Network Selector */}
      <div className="relative mb-6">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
        >
          <span className="font-medium text-gray-700 dark:text-gray-300">Switch Network</span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>
        
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
            {SUPPORTED_CHAINS.map((chain) => (
              <button
                key={chain.id}
                onClick={() => handleChainSwitch(chain.id)}
                className={`w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-left ${
                  chain.id === wallet.chainId ? 'bg-blue-50 dark:bg-blue-900/50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <img 
                    src={chain.logo} 
                    alt={chain.name}
                    className="w-5 h-5 rounded-full object-cover"
                    onError={(e) => {
                      // Fallback to colored circle if logo fails to load
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling!.style.display = 'block';
                    }}
                  />
                  <div 
                    className="w-5 h-5 rounded-full hidden"
                    style={{ backgroundColor: chain.color }}
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{chain.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{chain.symbol}</p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Network Statistics */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Deployment Status</h3>
        {SUPPORTED_CHAINS.map((chain) => (
          <div key={chain.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <img 
                src={chain.logo} 
                alt={chain.name}
                className="w-4 h-4 rounded-full object-cover"
                onError={(e) => {
                  // Fallback to colored circle if logo fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling!.style.display = 'block';
                }}
              />
              <div 
                className="w-4 h-4 rounded-full hidden"
                style={{ backgroundColor: chain.color }}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{chain.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">Deployed</span>
            </div>
          </div>
        ))}
      </div>

      {/* Deploy All Button */}
      <button
        disabled={!wallet.isConnected}
        className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
      >
        <Globe className="h-5 w-5" />
        <span>Deploy to All Networks</span>
      </button>
    </div>
  );
};

export default ChainSelector;