// Contract addresses will be updated after deployment
export const CONTRACT_ADDRESSES = {
  2330: { // Altcoinchain
    fcncr: '',
    fcncrCrossChain: '',
    fcncrStaking: '', // New cross-chain staking contract
    messenger: '',
    bridge: '',
    liquidityPool: '',
    waltBridge: '', // wALT Bridge address (deterministic)
    altToken: '0x48721ADeFE5b97101722c0866c2AffCE797C32b6', // ALT token
    stakingToken: '0x48721ADeFE5b97101722c0866c2AffCE797C32b6' // ALT token for staking
  },
  1: { // Ethereum Mainnet
    fcncr: '',
    fcncrCrossChain: '',
    fcncrStaking: '', // New cross-chain staking contract
    messenger: '',
    bridge: '',
    liquidityPool: '',
    waltBridge: '', // wALT Bridge address (deterministic)
    altToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH as ALT token equivalent
    stakingToken: '0x48721ADeFE5b97101722c0866c2AffCE797C32b6' // wALT token for staking
  },
  61803: { // Etica Mainnet (formerly EGAZ)
    fcncr: '',
    fcncrCrossChain: '',
    fcncrStaking: '', // New cross-chain staking contract
    messenger: '',
    bridge: '',
    liquidityPool: '',
    waltBridge: '', // wALT Bridge address (deterministic)
    altToken: '0x444a294EA9858A1c61624300978D9b5C49Ba8873',
    stakingToken: '0x48721ADeFE5b97101722c0866c2AffCE797C32b6' // wALT token for staking
  },
  7070: { // PlanQ Mainnet
    fcncr: '',
    fcncrCrossChain: '',
    fcncrStaking: '', // New cross-chain staking contract
    messenger: '',
    bridge: '',
    liquidityPool: '',
    waltBridge: '', // wALT Bridge address (deterministic)
    altToken: '0x5ebcdf1de1781e8b5d41c016b0574ad53e2f6e1a',
    stakingToken: '0x48721ADeFE5b97101722c0866c2AffCE797C32b6' // wALT token for staking
  },
  800001: { // OctaSpace
    fcncr: '',
    fcncrCrossChain: '',
    fcncrStaking: '', // New cross-chain staking contract
    messenger: '',
    bridge: '',
    liquidityPool: '',
    waltBridge: '', // wALT Bridge address (deterministic)
    altToken: '0x444a294EA9858A1c61624300978D9b5C49Ba8873',
    stakingToken: '0x48721ADeFE5b97101722c0866c2AffCE797C32b6' // wALT token for staking
  },
  2000: { // DOGEchain
    fcncr: '',
    fcncrCrossChain: '',
    fcncrStaking: '', // New cross-chain staking contract
    messenger: '',
    bridge: '',
    liquidityPool: '',
    waltBridge: '', // wALT Bridge address (deterministic)
    altToken: '0xB7ddC6414bf4F5515b52D8BdD69973Ae205ff101',
    stakingToken: '0x48721ADeFE5b97101722c0866c2AffCE797C32b6' // wALT token for staking
  },
  146: { // Sonic Mainnet
    fcncr: '',
    fcncrCrossChain: '',
    fcncrStaking: '', // New cross-chain staking contract
    messenger: '',
    bridge: '',
    liquidityPool: '',
    waltBridge: '', // wALT Bridge address (deterministic)
    altToken: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
    stakingToken: '0x48721ADeFE5b97101722c0866c2AffCE797C32b6' // wALT token for staking
  },
  250: { // Fantom
    fcncr: '',
    fcncrCrossChain: '',
    fcncrStaking: '', // New cross-chain staking contract
    messenger: '',
    bridge: '',
    liquidityPool: '',
    waltBridge: '', // wALT Bridge address (deterministic)
    altToken: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
    stakingToken: '0x48721ADeFE5b97101722c0866c2AffCE797C32b6' // wALT token for staking
  },
  1313161554: { // ETHO Protocol
    fcncr: '',
    fcncrCrossChain: '',
    fcncrStaking: '', // New cross-chain staking contract
    messenger: '',
    bridge: '',
    liquidityPool: '',
    waltBridge: '', // wALT Bridge address (deterministic)
    altToken: '0xF30eCf203fae5051ECA8640d2752265f4ED49ACB',
    stakingToken: '0x48721ADeFE5b97101722c0866c2AffCE797C32b6' // wALT token for staking
  }
} as const;

export type ChainId = keyof typeof CONTRACT_ADDRESSES;

// wALT Bridge will have the same address across all chains
export const WALT_BRIDGE_ADDRESS = ""; // Will be filled after deterministic deployment
export const WALT_TOKEN_ADDRESS = "0x48721ADeFE5b97101722c0866c2AffCE797C32b6";

// Cross-chain staking configuration
export const CROSS_CHAIN_STAKING_CONFIG = {
  // ALT token on Altcoinchain, wALT on all other chains
  STAKING_TOKEN_ADDRESS: "0x48721ADeFE5b97101722c0866c2AffCE797C32b6",
  ALTCOINCHAIN_ID: 2330,
  SUPPORTED_CHAIN_IDS: [2330, 1, 61803, 7070, 800001, 2000, 146, 250, 1313161554]
};