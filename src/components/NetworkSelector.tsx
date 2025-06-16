import React, { useState } from 'react';
import { Globe, ChevronDown, ExternalLink } from 'lucide-react';
import { SUPPORTED_CHAINS } from '../constants/chains';
import { useWallet } from '../hooks/useWallet';

interface NetworkSelectorProps {
  selectedChain: any;
  onChainSelect: (chain: any) => void;
  label: string;
  showConnectedBadge?: boolean;
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  selectedChain,
  onChainSelect,
  label,
  showConnectedBadge = false
}) => {
  const { wallet, switchChain } = useWallet();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleChainSelect = async (chain: any) => {
    onChainSelect(chain);
    setShowDropdown(false);
    
    // If user wants to switch to this network
    if (wallet.isConnected && chain.id !== wallet.chainId) {
      try {
        await switchChain(chain.id);
      } catch (error) {
        console.error('Failed to switch network:', error);
      }
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: selectedChain.color }}
            />
            <span className="font-medium text-gray-900 dark:text-white">{selectedChain.name}</span>
            <span className="text-gray-500 dark:text-gray-400">({selectedChain.symbol})</span>
            {showConnectedBadge && wallet.isConnected && selectedChain.id === wallet.chainId && (
              <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full">
                Connected
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {wallet.isConnected && selectedChain.id !== wallet.chainId && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  switchChain(selectedChain.id);
                }}
                className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                Switch
              </button>
            )}
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </button>
        
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
            {SUPPORTED_CHAINS.map((chain) => (
              <button
                key={chain.id}
                onClick={() => handleChainSelect(chain)}
                className={`w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-left ${
                  chain.id === selectedChain.id ? 'bg-blue-50 dark:bg-blue-900/50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: chain.color }}
                  />
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">{chain.name}</span>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Chain ID: {chain.id}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {wallet.isConnected && chain.id === wallet.chainId && (
                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full">
                      Connected
                    </span>
                  )}
                  <a 
                    href={chain.explorer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkSelector;