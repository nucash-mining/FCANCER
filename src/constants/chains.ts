import { Chain } from '../types';

export const SUPPORTED_CHAINS: Chain[] = [
  {
    id: 2330,
    name: 'Altcoinchain',
    symbol: 'ALT',
    rpc: 'http://99.248.100.186:8645',
    explorer: 'http://alt-exp.outsidethebox.top/',
    wrapperToken: '0x48721ADeFE5b97101722c0866c2AffCE797C32b6',
    factory: '0x347aAc6D939f98854110Ff48dC5B7beB52D86445',
    router: '0xae168Ce47cebca9abbC5107a58df0532f1afa4d6',
    multicall: '0x426b13031851947ce04C51670a6E9C622B18aa3C',
    tokenMultisender: '0xCF110A9F7c705604190f9Dd6FDf0FC79D00D569B',
    feeToSetter: '0xE01A6a52Ef245FDeA587735aFe60a1C96152A48D',
    initHashCode: '0x0c817536501f0541680bc3d164be66d6559cdd44e8acf7afeee6aa44283d54ca',
    color: '#8B5CF6'
  },
  {
    id: 1,
    name: 'Ethereum Mainnet',
    symbol: 'ETH',
    rpc: 'https://eth.llamarpc.com',
    explorer: 'https://etherscan.io',
    wrapperToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
    factory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', // Uniswap V2 Factory
    router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // Uniswap V2 Router
    multicall: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
    tokenMultisender: '0x0000000000000000000000000000000000000000', // To be deployed
    feeToSetter: '0x0000000000000000000000000000000000000000',
    initHashCode: '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f',
    color: '#627EEA'
  },
  {
    id: 61803,
    name: 'Etica Mainnet',
    symbol: 'EGAZ',
    rpc: 'https://eticamainnet.eticascan.org',
    explorer: 'https://eticascan.org',
    wrapperToken: '0x444a294EA9858A1c61624300978D9b5C49Ba8873',
    factory: '0x347aAc6D939f98854110Ff48dC5B7beB52D86445',
    router: '0xae168Ce47cebca9abbC5107a58df0532f1afa4d6',
    multicall: '0x426b13031851947ce04C51670a6E9C622B18aa3C',
    tokenMultisender: '0xCF110A9F7c705604190f9Dd6FDf0FC79D00D569B',
    feeToSetter: '0xE01A6a52Ef245FDeA587735aFe60a1C96152A48D',
    initHashCode: '0x0c817536501f0541680bc3d164be66d6559cdd44e8acf7afeee6aa44283d54ca',
    color: '#3B82F6'
  },
  {
    id: 7070,
    name: 'PlanQ Mainnet',
    symbol: 'PLQ',
    rpc: 'https://evm-rpc.planq.network',
    explorer: 'https://explorer.planq.network',
    wrapperToken: '0x5ebcdf1de1781e8b5d41c016b0574ad53e2f6e1a',
    factory: '0x347aAc6D939f98854110Ff48dC5B7beB52D86445',
    router: '0xae168Ce47cebca9abbC5107a58df0532f1afa4d6',
    multicall: '0x426b13031851947ce04C51670a6E9C622B18aa3C',
    tokenMultisender: '0x5a03b79b6F4cbb1eC8276a87b74a9304D05442C7',
    feeToSetter: '0xE01A6a52Ef245FDeA587735aFe60a1C96152A48D',
    initHashCode: '0x0c817536501f0541680bc3d164be66d6559cdd44e8acf7afeee6aa44283d54ca',
    swapd: '0x67e7ebdA5CBA73f5830538B03E678A1b45517dd7',
    color: '#10B981'
  },
  {
    id: 800001,
    name: 'OctaSpace',
    symbol: 'OCTA',
    rpc: 'https://rpc.octa.space',
    explorer: 'https://explorer.octa.space',
    wrapperToken: '0x444a294EA9858A1c61624300978D9b5C49Ba8873',
    factory: '0x347aAc6D939f98854110Ff48dC5B7beB52D86445',
    router: '0xae168Ce47cebca9abbC5107a58df0532f1afa4d6',
    multicall: '0x426b13031851947ce04C51670a6E9C622B18aa3C',
    tokenMultisender: '0xCF110A9F7c705604190f9Dd6FDf0FC79D00D569B',
    feeToSetter: '0xE01A6a52Ef245FDeA587735aFe60a1C96152A48D',
    initHashCode: '0x0c817536501f0541680bc3d164be66d6559cdd44e8acf7afeee6aa44283d54ca',
    color: '#F59E0B'
  },
  {
    id: 2000,
    name: 'DOGEchain',
    symbol: 'WDOGE',
    rpc: 'https://rpc.dogechain.dog',
    explorer: 'https://explorer.dogechain.dog',
    wrapperToken: '0xB7ddC6414bf4F5515b52D8BdD69973Ae205ff101',
    factory: '0x347aAc6D939f98854110Ff48dC5B7beB52D86445',
    router: '0xae168Ce47cebca9abbC5107a58df0532f1afa4d6',
    multicall: '0x426b13031851947ce04C51670a6E9C622B18aa3C',
    tokenMultisender: '0x5a03b79b6F4cbb1eC8276a87b74a9304D05442C7',
    feeToSetter: '0xE01A6a52Ef245FDeA587735aFe60a1C96152A48D',
    initHashCode: '0x0c817536501f0541680bc3d164be66d6559cdd44e8acf7afeee6aa44283d54ca',
    color: '#FBBF24'
  },
  {
    id: 146,
    name: 'Sonic Mainnet',
    symbol: 'S',
    rpc: 'https://rpc.soniclabs.com',
    explorer: 'https://sonicscan.org',
    wrapperToken: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83', // To be deployed
    factory: '0x347aAc6D939f98854110Ff48dC5B7beB52D86445', // To be deployed
    router: '0xae168Ce47cebca9abbC5107a58df0532f1afa4d6', // To be deployed
    multicall: '0x426b13031851947ce04C51670a6E9C622B18aa3C', // To be deployed
    tokenMultisender: '0x5a03b79b6F4cbb1eC8276a87b74a9304D05442C7', // To be deployed
    feeToSetter: '0xE01A6a52Ef245FDeA587735aFe60a1C96152A48D', // To be deployed
    initHashCode: '0x0c817536501f0541680bc3d164be66d6559cdd44e8acf7afeee6aa44283d54ca',
    color: '#00D4FF'
  },
  {
    id: 250,
    name: 'Fantom',
    symbol: 'FTM',
    rpc: 'https://rpc.ftm.tools',
    explorer: 'https://ftmscan.com',
    wrapperToken: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
    factory: '0x347aAc6D939f98854110Ff48dC5B7beB52D86445',
    router: '0xae168Ce47cebca9abbC5107a58df0532f1afa4d6',
    multicall: '0x426b13031851947ce04C51670a6E9C622B18aa3C',
    tokenMultisender: '0x5a03b79b6F4cbb1eC8276a87b74a9304D05442C7',
    feeToSetter: '0xE01A6a52Ef245FDeA587735aFe60a1C96152A48D',
    initHashCode: '0x0c817536501f0541680bc3d164be66d6559cdd44e8acf7afeee6aa44283d54ca',
    color: '#1969FF'
  },
  {
    id: 1313161554,
    name: 'ETHO Protocol',
    symbol: 'ETHO',
    rpc: 'https://rpc.ether1.org',
    explorer: 'https://explorer.ether1.org',
    wrapperToken: '0xF30eCf203fae5051ECA8640d2752265f4ED49ACB',
    factory: '0x347aAc6D939f98854110Ff48dC5B7beB52D86445',
    router: '0xae168Ce47cebca9abbC5107a58df0532f1afa4d6',
    multicall: '0x426b13031851947ce04C51670a6E9C622B18aa3C',
    tokenMultisender: '0x5a03b79b6F4cbb1eC8276a87b74a9304D05442C7',
    feeToSetter: '0xE01A6a52Ef245FDeA587735aFe60a1C96152A48D',
    initHashCode: '0x0c817536501f0541680bc3d164be66d6559cdd44e8acf7afeee6aa44283d54ca',
    color: '#00FF88'
  }
];

export const SWAPIN_DEPLOYER = '0xE01A6a52Ef245FDeA587735aFe60a1C96152A48D';
export const WRAPPER_DEPLOYER = '0x1F39ddcb71C90B6A690610a7B9B71ab9B97E4D41';

export const HALVING_BLOCKS = [210000, 420000, 630000, 840000, 1050000];
export const INITIAL_REWARD = 50;
export const TOTAL_SUPPLY = 21000000;