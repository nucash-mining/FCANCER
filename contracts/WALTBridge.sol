// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract WALTBridge is Ownable, ReentrancyGuard, Pausable {
    IERC20 public immutable WALT_TOKEN;
    
    uint256 public constant BRIDGE_FEE_RATE = 50; // 0.05% (50/100000)
    uint256 public constant FEE_DENOMINATOR = 100000;
    uint256 public constant MIN_BRIDGE_AMOUNT = 1e15; // 0.001 tokens minimum
    uint256 public constant MAX_BRIDGE_AMOUNT = 1e24; // 1M tokens maximum
    
    uint256 public bridgeNonce;
    uint256 public totalBridged;
    uint256 public totalFeesCollected;
    
    struct BridgeRequest {
        address user;
        uint256 amount;
        uint256 targetChainId;
        uint256 nonce;
        uint256 timestamp;
        bool processed;
        bytes32 bridgeId;
    }
    
    mapping(uint256 => BridgeRequest) public bridgeRequests;
    mapping(bytes32 => bool) public processedBridges;
    mapping(uint256 => bool) public supportedChains;
    mapping(uint256 => address) public chainBridges;
    mapping(address => bool) public authorizedRelayers;
    mapping(address => uint256) public userBridgeCount;
    
    // Rate limiting
    mapping(address => uint256) public lastBridgeTime;
    mapping(address => uint256) public dailyBridgeAmount;
    mapping(address => uint256) public lastResetDay;
    uint256 public constant DAILY_LIMIT = 100000e18; // 100K tokens per day per user
    uint256 public constant BRIDGE_COOLDOWN = 300; // 5 minutes between bridges
    
    event BridgeInitiated(
        address indexed user,
        uint256 amount,
        uint256 targetChainId,
        uint256 nonce,
        bytes32 bridgeId,
        uint256 fee
    );
    
    event BridgeCompleted(
        address indexed user,
        uint256 amount,
        uint256 sourceChainId,
        bytes32 bridgeId,
        address indexed relayer
    );
    
    event ChainSupported(uint256 chainId, bool supported);
    event ChainBridgeSet(uint256 chainId, address bridgeAddress);
    event RelayerAuthorized(address indexed relayer, bool authorized);
    event EmergencyWithdraw(address indexed token, uint256 amount);
    
    modifier onlyRelayer() {
        require(authorizedRelayers[msg.sender], "Not authorized relayer");
        _;
    }
    
    modifier validChain(uint256 chainId) {
        require(supportedChains[chainId], "Chain not supported");
        require(chainId != block.chainid, "Cannot bridge to same chain");
        _;
    }
    
    modifier rateLimited(address user, uint256 amount) {
        require(
            block.timestamp >= lastBridgeTime[user] + BRIDGE_COOLDOWN,
            "Bridge cooldown active"
        );
        
        uint256 currentDay = block.timestamp / 86400;
        if (lastResetDay[user] < currentDay) {
            dailyBridgeAmount[user] = 0;
            lastResetDay[user] = currentDay;
        }
        
        require(
            dailyBridgeAmount[user] + amount <= DAILY_LIMIT,
            "Daily bridge limit exceeded"
        );
        _;
    }
    
    constructor(address _waltToken) {
        WALT_TOKEN = IERC20(_waltToken);
        
        // Add supported chains
        supportedChains[2330] = true;   // Altcoinchain
        supportedChains[1] = true;      // Ethereum
        supportedChains[61803] = true;  // Etica
        supportedChains[7070] = true;   // PlanQ
        supportedChains[800001] = true; // OctaSpace
        supportedChains[2000] = true;   // Dogechain
        supportedChains[146] = true;    // Sonic
        supportedChains[250] = true;    // Fantom
        supportedChains[1313161554] = true; // ETHO Protocol
        
        // Authorize deployer as initial relayer
        authorizedRelayers[msg.sender] = true;
    }
    
    function initiateBridge(
        uint256 amount,
        uint256 targetChainId
    ) 
        external 
        nonReentrant 
        whenNotPaused 
        validChain(targetChainId)
        rateLimited(msg.sender, amount)
    {
        require(amount >= MIN_BRIDGE_AMOUNT, "Amount too small");
        require(amount <= MAX_BRIDGE_AMOUNT, "Amount too large");
        require(chainBridges[targetChainId] != address(0), "Target bridge not configured");
        
        uint256 fee = (amount * BRIDGE_FEE_RATE) / FEE_DENOMINATOR;
        uint256 bridgeAmount = amount - fee;
        
        require(
            WALT_TOKEN.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        
        bridgeNonce++;
        bytes32 bridgeId = keccak256(
            abi.encodePacked(
                msg.sender,
                bridgeAmount,
                block.chainid,
                targetChainId,
                bridgeNonce,
                block.timestamp
            )
        );
        
        bridgeRequests[bridgeNonce] = BridgeRequest({
            user: msg.sender,
            amount: bridgeAmount,
            targetChainId: targetChainId,
            nonce: bridgeNonce,
            timestamp: block.timestamp,
            processed: false,
            bridgeId: bridgeId
        });
        
        // Update rate limiting
        lastBridgeTime[msg.sender] = block.timestamp;
        dailyBridgeAmount[msg.sender] += amount;
        userBridgeCount[msg.sender]++;
        
        // Update totals
        totalBridged += bridgeAmount;
        totalFeesCollected += fee;
        
        emit BridgeInitiated(
            msg.sender,
            bridgeAmount,
            targetChainId,
            bridgeNonce,
            bridgeId,
            fee
        );
    }
    
    function completeBridge(
        address user,
        uint256 amount,
        uint256 sourceChainId,
        bytes32 bridgeId,
        uint256 timestamp,
        bytes calldata signature
    ) external onlyRelayer nonReentrant {
        require(!processedBridges[bridgeId], "Bridge already processed");
        require(supportedChains[sourceChainId], "Source chain not supported");
        require(block.timestamp <= timestamp + 86400, "Bridge request expired"); // 24 hour expiry
        
        // Verify signature (simplified - in production use proper cryptographic verification)
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                user,
                amount,
                sourceChainId,
                block.chainid,
                bridgeId,
                timestamp
            )
        );
        
        // Mark as processed
        processedBridges[bridgeId] = true;
        
        // Transfer tokens to user
        require(
            WALT_TOKEN.transfer(user, amount),
            "Transfer failed"
        );
        
        emit BridgeCompleted(user, amount, sourceChainId, bridgeId, msg.sender);
    }
    
    function batchCompleteBridge(
        address[] calldata users,
        uint256[] calldata amounts,
        uint256[] calldata sourceChainIds,
        bytes32[] calldata bridgeIds,
        uint256[] calldata timestamps,
        bytes[] calldata signatures
    ) external onlyRelayer nonReentrant {
        require(
            users.length == amounts.length &&
            amounts.length == sourceChainIds.length &&
            sourceChainIds.length == bridgeIds.length &&
            bridgeIds.length == timestamps.length &&
            timestamps.length == signatures.length,
            "Array length mismatch"
        );
        
        for (uint256 i = 0; i < users.length; i++) {
            if (!processedBridges[bridgeIds[i]] && 
                supportedChains[sourceChainIds[i]] &&
                block.timestamp <= timestamps[i] + 86400) {
                
                processedBridges[bridgeIds[i]] = true;
                
                require(
                    WALT_TOKEN.transfer(users[i], amounts[i]),
                    "Batch transfer failed"
                );
                
                emit BridgeCompleted(
                    users[i],
                    amounts[i],
                    sourceChainIds[i],
                    bridgeIds[i],
                    msg.sender
                );
            }
        }
    }
    
    function setSupportedChain(uint256 chainId, bool supported) external onlyOwner {
        supportedChains[chainId] = supported;
        emit ChainSupported(chainId, supported);
    }
    
    function setChainBridge(uint256 chainId, address bridgeAddress) external onlyOwner {
        require(bridgeAddress != address(0), "Invalid bridge address");
        chainBridges[chainId] = bridgeAddress;
        emit ChainBridgeSet(chainId, bridgeAddress);
    }
    
    function authorizeRelayer(address relayer, bool authorized) external onlyOwner {
        authorizedRelayers[relayer] = authorized;
        emit RelayerAuthorized(relayer, authorized);
    }
    
    function withdrawFees() external onlyOwner {
        uint256 balance = WALT_TOKEN.balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");
        
        require(WALT_TOKEN.transfer(owner(), balance), "Transfer failed");
    }
    
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).transfer(owner(), amount);
        }
        emit EmergencyWithdraw(token, amount);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // View functions
    function getBridgeFee(uint256 amount) external pure returns (uint256) {
        return (amount * BRIDGE_FEE_RATE) / FEE_DENOMINATOR;
    }
    
    function getBridgeRequest(uint256 nonce) external view returns (BridgeRequest memory) {
        return bridgeRequests[nonce];
    }
    
    function isBridgeProcessed(bytes32 bridgeId) external view returns (bool) {
        return processedBridges[bridgeId];
    }
    
    function getUserBridgeInfo(address user) external view returns (
        uint256 bridgeCount,
        uint256 lastBridge,
        uint256 dailyAmount,
        uint256 remainingDaily,
        uint256 nextBridgeTime
    ) {
        uint256 currentDay = block.timestamp / 86400;
        uint256 currentDailyAmount = lastResetDay[user] < currentDay ? 0 : dailyBridgeAmount[user];
        
        return (
            userBridgeCount[user],
            lastBridgeTime[user],
            currentDailyAmount,
            DAILY_LIMIT > currentDailyAmount ? DAILY_LIMIT - currentDailyAmount : 0,
            lastBridgeTime[user] + BRIDGE_COOLDOWN
        );
    }
    
    function getChainInfo() external view returns (
        uint256[] memory supportedChainIds,
        address[] memory bridgeAddresses
    ) {
        uint256[] memory chainIds = new uint256[](9);
        address[] memory bridges = new address[](9);
        
        chainIds[0] = 2330; bridges[0] = chainBridges[2330];
        chainIds[1] = 1; bridges[1] = chainBridges[1];
        chainIds[2] = 61803; bridges[2] = chainBridges[61803];
        chainIds[3] = 7070; bridges[3] = chainBridges[7070];
        chainIds[4] = 800001; bridges[4] = chainBridges[800001];
        chainIds[5] = 2000; bridges[5] = chainBridges[2000];
        chainIds[6] = 146; bridges[6] = chainBridges[146];
        chainIds[7] = 250; bridges[7] = chainBridges[250];
        chainIds[8] = 1313161554; bridges[8] = chainBridges[1313161554];
        
        return (chainIds, bridges);
    }
    
    function getBridgeStats() external view returns (
        uint256 totalBridgedAmount,
        uint256 totalFees,
        uint256 currentNonce,
        uint256 contractBalance
    ) {
        return (
            totalBridged,
            totalFeesCollected,
            bridgeNonce,
            WALT_TOKEN.balanceOf(address(this))
        );
    }
}