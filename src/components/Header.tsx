import React from 'react';
import { Coins, Wallet } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { SUPPORTED_CHAINS } from '../constants/chains';
import ThemeToggle from './ThemeToggle';

const Header: React.FC = () => {
  const { wallet, connectWallet, switchChain, disconnectWallet } = useWallet();

  const currentChain = SUPPORTED_CHAINS.find(chain => chain.id === wallet.chainId);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg">
              <Coins className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Fuck Cancer</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">FCNCR Cross-Chain Token</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {wallet.isConnected ? (
              <div className="flex items-center space-x-3">
                {currentChain && (
                  <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: currentChain.color }}
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {currentChain.name}
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-2 bg-purple-100 dark:bg-purple-900 px-3 py-2 rounded-lg">
                  <Wallet className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    {truncateAddress(wallet.address!)}
                  </span>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
              >
                <Wallet className="h-4 w-4" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;