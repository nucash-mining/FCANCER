// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./CrossChainMessenger.sol";

contract FCNCRCrossChainStaking is ERC20, Ownable, ReentrancyGuard, Pausable {
    uint256 public constant TOTAL_SUPPLY = 21_000_000 * 10**18;
    uint256 public constant INITIAL_REWARD = 50 * 10**18;
    uint256 public constant HALVING_INTERVAL = 210_000;
    
    uint256 public currentBlock;
    uint256 public deploymentBlock;
    uint256 public totalMined;
    
    // Local staking data
    mapping(address => uint256) public stakedTokens; // ALT on Altcoinchain, wALT on others
    mapping(address => uint256) public lastClaimBlock;
    mapping(address => uint256) public pendingRewards;
    
    uint256 public totalStakedLocal;
    
    // Cross-chain staking data
    mapping(uint256 => uint256) public chainStakedAmounts; // chainId => total staked
    mapping(uint256 => uint256) public lastChainUpdate; // chainId => last update block
    uint256 public totalStakedGlobal;
    
    // Cross-chain configuration
    mapping(uint256 => address) public chainStakingContracts;
    mapping(uint256 => bool) public supportedChains;
    CrossChainMessenger public immutable messenger;
    
    IERC20 public immutable STAKING_TOKEN; // ALT on Altcoinchain, wALT on others
    bool public immutable IS_ALTCOINCHAIN;
    
    event TokensStaked(address indexed user, uint256 amount);
    event TokensUnstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event BlockMined(uint256 blockNumber, uint256 reward);
    event CrossChainStakeUpdate(uint256 indexed chainId, uint256 totalStaked);
    event ChainStakingContractSet(uint256 indexed chainId, address contractAddress);
    
    constructor(
        address _stakingToken,
        address _messenger,
        bool _isAltcoinchain
    ) ERC20("Fuck Cancer", "FCNCR") {
        STAKING_TOKEN = IERC20(_stakingToken);
        messenger = CrossChainMessenger(_messenger);
        IS_ALTCOINCHAIN = _isAltcoinchain;
        deploymentBlock = block.number;
        currentBlock = 0;
        
        // Initialize supported chains
        supportedChains[2330] = true;   // Altcoinchain
        supportedChains[1] = true;      // Ethereum
        supportedChains[61803] = true;  // Etica
        supportedChains[7070] = true;   // PlanQ
        supportedChains[800001] = true; // OctaSpace
        supportedChains[2000] = true;   // Dogechain
        supportedChains[146] = true;    // Sonic
        supportedChains[250] = true;    // Fantom
        supportedChains[1313161554] = true; // ETHO Protocol
        
        // Set initial local staking amount
        chainStakedAmounts[block.chainid] = 0;
        lastChainUpdate[block.chainid] = currentBlock;
    }
    
    function getCurrentReward() public view returns (uint256) {
        uint256 halvings = currentBlock / HALVING_INTERVAL;
        if (halvings >= 64) return 0;
        return INITIAL_REWARD >> halvings;
    }
    
    function stakeTokens(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(STAKING_TOKEN.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        // Update pending rewards before changing stake
        updatePendingRewards(msg.sender);
        
        stakedTokens[msg.sender] += amount;
        totalStakedLocal += amount;
        chainStakedAmounts[block.chainid] += amount;
        lastClaimBlock[msg.sender] = currentBlock;
        
        // Update global total
        totalStakedGlobal += amount;
        
        // Broadcast stake update to other chains
        broadcastStakeUpdate();
        
        emit TokensStaked(msg.sender, amount);
    }
    
    function unstakeTokens(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(stakedTokens[msg.sender] >= amount, "Insufficient staked amount");
        
        // Update pending rewards before changing stake
        updatePendingRewards(msg.sender);
        
        stakedTokens[msg.sender] -= amount;
        totalStakedLocal -= amount;
        chainStakedAmounts[block.chainid] -= amount;
        lastClaimBlock[msg.sender] = currentBlock;
        
        // Update global total
        totalStakedGlobal -= amount;
        
        require(STAKING_TOKEN.transfer(msg.sender, amount), "Transfer failed");
        
        // Broadcast stake update to other chains
        broadcastStakeUpdate();
        
        emit TokensUnstaked(msg.sender, amount);
    }
    
    function updatePendingRewards(address user) internal {
        if (stakedTokens[user] > 0 && totalStakedGlobal > 0) {
            uint256 blocksSinceLastClaim = currentBlock - lastClaimBlock[user];
            if (blocksSinceLastClaim > 0) {
                uint256 userShare = (stakedTokens[user] * 1e18) / totalStakedGlobal;
                uint256 rewardsPerBlock = getCurrentReward();
                uint256 totalRewards = blocksSinceLastClaim * rewardsPerBlock;
                uint256 userRewards = (totalRewards * userShare) / 1e18;
                
                pendingRewards[user] += userRewards;
            }
        }
    }
    
    function claimRewards() external nonReentrant whenNotPaused {
        updatePendingRewards(msg.sender);
        
        uint256 rewards = pendingRewards[msg.sender];
        require(rewards > 0, "No rewards to claim");
        require(totalMined + rewards <= TOTAL_SUPPLY, "Would exceed total supply");
        
        pendingRewards[msg.sender] = 0;
        lastClaimBlock[msg.sender] = currentBlock;
        totalMined += rewards;
        
        _mint(msg.sender, rewards);
        
        emit RewardsClaimed(msg.sender, rewards);
    }
    
    function mineBlock() external whenNotPaused {
        require(block.number > deploymentBlock + currentBlock, "Block already mined");
        
        currentBlock++;
        uint256 reward = getCurrentReward();
        
        emit BlockMined(currentBlock, reward);
    }
    
    function broadcastStakeUpdate() internal {
        if (address(messenger) == address(0)) return;
        
        uint256 messageFee = messenger.getMessageFee();
        
        // Broadcast to all supported chains except current chain
        for (uint256 i = 0; i < getSupportedChainIds().length; i++) {
            uint256 chainId = getSupportedChainIds()[i];
            if (chainId != block.chainid && chainStakingContracts[chainId] != address(0)) {
                try {
                    bytes memory payload = abi.encode(
                        chainStakingContracts[chainId],
                        abi.encodeWithSignature(
                            "receiveStakeUpdate(uint256,uint256)",
                            block.chainid,
                            chainStakedAmounts[block.chainid]
                        )
                    );
                    
                    messenger.sendMessage{value: messageFee}(chainId, payload);
                } catch {
                    // Continue if one chain fails
                }
            }
        }
    }
    
    function receiveStakeUpdate(uint256 sourceChainId, uint256 stakedAmount) external {
        require(msg.sender == address(messenger), "Only messenger can call");
        require(supportedChains[sourceChainId], "Chain not supported");
        
        uint256 oldAmount = chainStakedAmounts[sourceChainId];
        chainStakedAmounts[sourceChainId] = stakedAmount;
        lastChainUpdate[sourceChainId] = currentBlock;
        
        // Update global total
        if (stakedAmount > oldAmount) {
            totalStakedGlobal += (stakedAmount - oldAmount);
        } else {
            totalStakedGlobal -= (oldAmount - stakedAmount);
        }
        
        emit CrossChainStakeUpdate(sourceChainId, stakedAmount);
    }
    
    function requestStakeUpdates() external {
        require(address(messenger) != address(0), "Messenger not set");
        
        uint256 messageFee = messenger.getMessageFee();
        
        // Request updates from all chains
        for (uint256 i = 0; i < getSupportedChainIds().length; i++) {
            uint256 chainId = getSupportedChainIds()[i];
            if (chainId != block.chainid && chainStakingContracts[chainId] != address(0)) {
                try {
                    bytes memory payload = abi.encode(
                        chainStakingContracts[chainId],
                        abi.encodeWithSignature("sendStakeUpdate()")
                    );
                    
                    messenger.sendMessage{value: messageFee}(chainId, payload);
                } catch {
                    // Continue if one chain fails
                }
            }
        }
    }
    
    function sendStakeUpdate() external {
        require(msg.sender == address(messenger), "Only messenger can call");
        broadcastStakeUpdate();
    }
    
    function setChainStakingContract(uint256 chainId, address contractAddress) external onlyOwner {
        require(supportedChains[chainId], "Chain not supported");
        chainStakingContracts[chainId] = contractAddress;
        emit ChainStakingContractSet(chainId, contractAddress);
    }
    
    function setSupportedChain(uint256 chainId, bool supported) external onlyOwner {
        supportedChains[chainId] = supported;
    }
    
    function manualUpdateChainStake(uint256 chainId, uint256 stakedAmount) external onlyOwner {
        require(supportedChains[chainId], "Chain not supported");
        
        uint256 oldAmount = chainStakedAmounts[chainId];
        chainStakedAmounts[chainId] = stakedAmount;
        lastChainUpdate[chainId] = currentBlock;
        
        // Update global total
        if (stakedAmount > oldAmount) {
            totalStakedGlobal += (stakedAmount - oldAmount);
        } else {
            totalStakedGlobal -= (oldAmount - stakedAmount);
        }
        
        emit CrossChainStakeUpdate(chainId, stakedAmount);
    }
    
    function getPendingRewards(address user) external view returns (uint256) {
        if (stakedTokens[user] == 0 || totalStakedGlobal == 0) {
            return pendingRewards[user];
        }
        
        uint256 blocksSinceLastClaim = currentBlock - lastClaimBlock[user];
        if (blocksSinceLastClaim == 0) {
            return pendingRewards[user];
        }
        
        uint256 userShare = (stakedTokens[user] * 1e18) / totalStakedGlobal;
        uint256 rewardsPerBlock = getCurrentReward();
        uint256 totalRewards = blocksSinceLastClaim * rewardsPerBlock;
        uint256 userRewards = (totalRewards * userShare) / 1e18;
        
        return pendingRewards[user] + userRewards;
    }
    
    function getNextHalvingBlock() external view returns (uint256) {
        uint256 nextHalving = ((currentBlock / HALVING_INTERVAL) + 1) * HALVING_INTERVAL;
        return nextHalving;
    }
    
    function getBlocksToHalving() external view returns (uint256) {
        uint256 nextHalving = this.getNextHalvingBlock();
        return nextHalving - currentBlock;
    }
    
    function getChainStakingInfo() external view returns (
        uint256[] memory chainIds,
        uint256[] memory stakedAmounts,
        uint256[] memory lastUpdates,
        address[] memory contractAddresses
    ) {
        uint256[] memory supportedChainIds = getSupportedChainIds();
        chainIds = new uint256[](supportedChainIds.length);
        stakedAmounts = new uint256[](supportedChainIds.length);
        lastUpdates = new uint256[](supportedChainIds.length);
        contractAddresses = new address[](supportedChainIds.length);
        
        for (uint256 i = 0; i < supportedChainIds.length; i++) {
            uint256 chainId = supportedChainIds[i];
            chainIds[i] = chainId;
            stakedAmounts[i] = chainStakedAmounts[chainId];
            lastUpdates[i] = lastChainUpdate[chainId];
            contractAddresses[i] = chainStakingContracts[chainId];
        }
    }
    
    function getSupportedChainIds() public pure returns (uint256[] memory) {
        uint256[] memory chainIds = new uint256[](9);
        chainIds[0] = 2330;   // Altcoinchain
        chainIds[1] = 1;      // Ethereum
        chainIds[2] = 61803;  // Etica
        chainIds[3] = 7070;   // PlanQ
        chainIds[4] = 800001; // OctaSpace
        chainIds[5] = 2000;   // Dogechain
        chainIds[6] = 146;    // Sonic
        chainIds[7] = 250;    // Fantom
        chainIds[8] = 1313161554; // ETHO Protocol
        return chainIds;
    }
    
    function getStakingTokenInfo() external view returns (
        address tokenAddress,
        string memory tokenSymbol,
        bool isAltcoinchain,
        uint256 userBalance,
        uint256 userStaked
    ) {
        return (
            address(STAKING_TOKEN),
            IS_ALTCOINCHAIN ? "ALT" : "wALT",
            IS_ALTCOINCHAIN,
            STAKING_TOKEN.balanceOf(msg.sender),
            stakedTokens[msg.sender]
        );
    }
    
    // Emergency functions
    function emergencyWithdrawTokens() external nonReentrant {
        uint256 amount = stakedTokens[msg.sender];
        require(amount > 0, "No tokens staked");
        
        stakedTokens[msg.sender] = 0;
        totalStakedLocal -= amount;
        chainStakedAmounts[block.chainid] -= amount;
        totalStakedGlobal -= amount;
        
        require(STAKING_TOKEN.transfer(msg.sender, amount), "Transfer failed");
        
        emit TokensUnstaked(msg.sender, amount);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
}