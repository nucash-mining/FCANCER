export const FCNCR_ABI = [
  "function stakeALT(uint256 amount) external",
  "function unstakeALT(uint256 amount) external",
  "function claimRewards() external",
  "function mineBlock() external",
  "function getPendingRewards(address user) external view returns (uint256)",
  "function getCurrentReward() external view returns (uint256)",
  "function getNextHalvingBlock() external view returns (uint256)",
  "function getBlocksToHalving() external view returns (uint256)",
  "function stakedALT(address user) external view returns (uint256)",
  "function currentBlock() external view returns (uint256)",
  "function totalStakedALT() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)"
];

export const FCNCR_CROSSCHAIN_STAKING_ABI = [
  "function stakeTokens(uint256 amount) external",
  "function unstakeTokens(uint256 amount) external",
  "function claimRewards() external",
  "function mineBlock() external",
  "function getPendingRewards(address user) external view returns (uint256)",
  "function getCurrentReward() external view returns (uint256)",
  "function getNextHalvingBlock() external view returns (uint256)",
  "function getBlocksToHalving() external view returns (uint256)",
  "function stakedTokens(address user) external view returns (uint256)",
  "function currentBlock() external view returns (uint256)",
  "function totalStakedLocal() external view returns (uint256)",
  "function totalStakedGlobal() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function requestStakeUpdates() external",
  "function getChainStakingInfo() external view returns (uint256[] memory chainIds, uint256[] memory stakedAmounts, uint256[] memory lastUpdates, address[] memory contractAddresses)",
  "function getStakingTokenInfo() external view returns (address tokenAddress, string memory tokenSymbol, bool isAltcoinchain, uint256 userBalance, uint256 userStaked)",
  "function chainStakedAmounts(uint256 chainId) external view returns (uint256)",
  "function setChainStakingContract(uint256 chainId, address contractAddress) external",
  "function emergencyWithdrawTokens() external"
];

export const FCNCR_CROSSCHAIN_ABI = [
  ...FCNCR_ABI,
  "function bridgeTokens(uint256 amount, uint256 targetChainId) external payable",
  "function mintFromBridge(address user, uint256 amount, uint256 sourceChainId, bytes32 bridgeId) external",
  "function setChainContract(uint256 chainId, address contractAddress) external",
  "function getBridgeFee() external view returns (uint256)",
  "function chainContracts(uint256 chainId) external view returns (address)"
];

export const CROSSCHAIN_MESSENGER_ABI = [
  "function sendMessage(uint256 targetChainId, bytes calldata payload) external payable",
  "function receiveMessage(uint256 messageId, address sender, uint256 sourceChainId, bytes32 messageHash, bytes calldata payload, uint256 timestamp) external",
  "function authorizeRelayer(address relayer, bool authorized) external",
  "function setSupportedChain(uint256 chainId, bool supported) external",
  "function getMessageFee() external pure returns (uint256)",
  "function isMessageProcessed(bytes32 messageHash) external view returns (bool)",
  "function supportedChains(uint256 chainId) external view returns (bool)",
  "function authorizedRelayers(address relayer) external view returns (bool)"
];

export const BRIDGE_ABI = [
  "function initiateBridge(uint256 amount, uint256 targetChainId) external",
  "function getBridgeFee(uint256 amount) external pure returns (uint256)",
  "function supportedChains(uint256 chainId) external view returns (bool)"
];

export const WALT_BRIDGE_ABI = [
  "function initiateBridge(uint256 amount, uint256 targetChainId) external",
  "function completeBridge(address user, uint256 amount, uint256 sourceChainId, bytes32 bridgeId, uint256 timestamp, bytes calldata signature) external",
  "function batchCompleteBridge(address[] calldata users, uint256[] calldata amounts, uint256[] calldata sourceChainIds, bytes32[] calldata bridgeIds, uint256[] calldata timestamps, bytes[] calldata signatures) external",
  "function getBridgeFee(uint256 amount) external pure returns (uint256)",
  "function getBridgeRequest(uint256 nonce) external view returns (tuple(address user, uint256 amount, uint256 targetChainId, uint256 nonce, uint256 timestamp, bool processed, bytes32 bridgeId))",
  "function isBridgeProcessed(bytes32 bridgeId) external view returns (bool)",
  "function getUserBridgeInfo(address user) external view returns (uint256 bridgeCount, uint256 lastBridge, uint256 dailyAmount, uint256 remainingDaily, uint256 nextBridgeTime)",
  "function getChainInfo() external view returns (uint256[] memory supportedChainIds, address[] memory bridgeAddresses)",
  "function getBridgeStats() external view returns (uint256 totalBridgedAmount, uint256 totalFees, uint256 currentNonce, uint256 contractBalance)",
  "function supportedChains(uint256 chainId) external view returns (bool)",
  "function chainBridges(uint256 chainId) external view returns (address)",
  "function authorizedRelayers(address relayer) external view returns (bool)",
  "function WALT_TOKEN() external view returns (address)",
  "function BRIDGE_FEE_RATE() external view returns (uint256)",
  "function MIN_BRIDGE_AMOUNT() external view returns (uint256)",
  "function MAX_BRIDGE_AMOUNT() external view returns (uint256)",
  "function DAILY_LIMIT() external view returns (uint256)",
  "function BRIDGE_COOLDOWN() external view returns (uint256)"
];

export const LIQUIDITY_POOL_ABI = [
  "function addLiquidity(uint256 fcncrAmount, uint256 altAmount) external returns (uint256)",
  "function removeLiquidity(uint256 liquidity) external returns (uint256, uint256)",
  "function swapFCNCRForALT(uint256 fcncrAmountIn, uint256 minAltOut) external returns (uint256)",
  "function swapALTForFCNCR(uint256 altAmountIn, uint256 minFcncrOut) external returns (uint256)",
  "function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) external pure returns (uint256)",
  "function getReserves() external view returns (uint256, uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)"
];

export const ERC20_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function totalSupply() external view returns (uint256)"
];

export const CREATE2_DEPLOYER_ABI = [
  "function deploy(bytes memory bytecode, bytes32 salt) external returns (address)",
  "function computeAddress(bytes memory bytecode, bytes32 salt) external view returns (address)",
  "function computeAddressWithDeployer(address deployer, bytes memory bytecode, bytes32 salt) external pure returns (address)"
];