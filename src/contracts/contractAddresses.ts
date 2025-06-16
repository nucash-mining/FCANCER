// Contract addresses will be updated after deployment
export const CONTRACT_ADDRESSES = {
  2330: { // Altcoinchain
    fcncr: '',
    fcncrCrossChain: '',
    messenger: '',
    bridge: '',
    liquidityPool: '',
    altToken: '0x48721ADeFE5b97101722c0866c2AffCE797C32b6'
  },
  61803: { // Etica Mainnet (formerly EGAZ)
    fcncr: '',
    fcncrCrossChain: '',
    messenger: '',
    bridge: '',
    liquidityPool: '',
    altToken: '0x444a294EA9858A1c61624300978D9b5C49Ba8873'
  },
  7070: { // PlanQ Mainnet
    fcncr: '',
    fcncrCrossChain: '',
    messenger: '',
    bridge: '',
    liquidityPool: '',
    altToken: '0x5ebcdf1de1781e8b5d41c016b0574ad53e2f6e1a'
  },
  800001: { // OctaSpace
    fcncr: '',
    fcncrCrossChain: '',
    messenger: '',
    bridge: '',
    liquidityPool: '',
    altToken: '0x444a294EA9858A1c61624300978D9b5C49Ba8873'
  },
  2000: { // DOGEchain
    fcncr: '',
    fcncrCrossChain: '',
    messenger: '',
    bridge: '',
    liquidityPool: '',
    altToken: '0xB7ddC6414bf4F5515b52D8BdD69973Ae205ff101'
  },
  146: { // Sonic Mainnet
    fcncr: '',
    fcncrCrossChain: '',
    messenger: '',
    bridge: '',
    liquidityPool: '',
    altToken: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83'
  },
  250: { // Fantom
    fcncr: '',
    fcncrCrossChain: '',
    messenger: '',
    bridge: '',
    liquidityPool: '',
    altToken: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83'
  }
} as const;

export type ChainId = keyof typeof CONTRACT_ADDRESSES;