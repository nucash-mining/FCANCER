import React from 'react';
import { TrendingUp, Coins, Users, Zap } from 'lucide-react';
import { useTokenStats } from '../hooks/useTokenStats';

const Dashboard: React.FC = () => {
  const { stats } = useTokenStats();

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    }
    return num.toFixed(2);
  };

  const blocksToHalving = stats.nextHalving - stats.currentBlock;
  const halvingProgress = ((stats.currentBlock % 210000) / 210000) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Current Block</p>
            <p className="text-2xl font-bold text-gray-900">{stats.currentBlock.toLocaleString()}</p>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              Live updating
            </p>
          </div>
          <div className="bg-purple-100 p-3 rounded-lg">
            <Zap className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Block Reward</p>
            <p className="text-2xl font-bold text-gray-900">{stats.currentReward} FCNCR</p>
            <p className="text-xs text-blue-600">
              {blocksToHalving.toLocaleString()} blocks to halving
            </p>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <Coins className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div className="mt-4">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${halvingProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {halvingProgress.toFixed(1)}% to next halving
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Your Staked ALT</p>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.stakedAmount)}</p>
            <p className="text-xs text-green-600">
              Earning rewards
            </p>
          </div>
          <div className="bg-green-100 p-3 rounded-lg">
            <Users className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Claimable FCNCR</p>
            <p className="text-2xl font-bold text-gray-900">{stats.claimableRewards.toFixed(4)}</p>
            <p className="text-xs text-orange-600">
              Ready to claim
            </p>
          </div>
          <div className="bg-orange-100 p-3 rounded-lg">
            <TrendingUp className="h-6 w-6 text-orange-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;