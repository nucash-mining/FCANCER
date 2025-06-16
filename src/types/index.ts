export interface Chain {
  id: number;
  name: string;
  symbol: string;
  rpc: string;
  explorer: string;
  wrapperToken: string;
  factory: string;
  router: string;
  multicall: string;
  tokenMultisender: string;
  color: string;
}

export interface TokenStats {
  totalSupply: number;
  currentBlock: number;
  currentReward: number;
  nextHalving: number;
  stakedAmount: number;
  userBalance: number;
  claimableRewards: number;
}

export interface StakingPosition {
  amount: number;
  rewards: number;
  lastClaim: number;
  chain: string;
}

export interface BridgeTransaction {
  id: string;
  fromChain: string;
  toChain: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
}