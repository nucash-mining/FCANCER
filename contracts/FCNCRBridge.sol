// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract FCNCRBridge is Ownable, ReentrancyGuard, Pausable {
    IERC20 public immutable FCNCR_TOKEN;
    
    uint256 public constant BRIDGE_FEE_RATE = 100; // 0.1% (100/100000)
    uint256 public constant FEE_DENOMINATOR = 100000;
    
    uint256 public bridgeNonce;
    
    struct BridgeRequest {
        address user;
        uint256 amount;
        uint256 targetChainId;
        uint256 nonce;
        bool processed;
    }
    
    mapping(uint256 => BridgeRequest) public bridgeRequests;
    mapping(bytes32 => bool) public processedTransactions;
    mapping(uint256 => bool) public supportedChains;
    
    event BridgeInitiated(
        address indexed user,
        uint256 amount,
        uint256 targetChainId,
        uint256 nonce
    );
    
    event BridgeCompleted(
        address indexed user,
        uint256 amount,
        uint256 sourceChainId,
        bytes32 txHash
    );
    
    event ChainSupported(uint256 chainId, bool supported);
    
    constructor(address _fcncrToken) {
        FCNCR_TOKEN = IERC20(_fcncrToken);
        
        // Add supported chains
        supportedChains[1] = true;     // EGAZ Mainnet
        supportedChains[250] = true;   // Fantom
        supportedChains[800] = true;   // OctaSpace
        supportedChains[2018] = true;  // DOGEchain
        supportedChains[2330] = true;  // Altcoinchain
        supportedChains[7668] = true;  // PlanQ Mainnet
    }
    
    function initiateBridge(uint256 amount, uint256 targetChainId) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        require(amount > 0, "Amount must be greater than 0");
        require(supportedChains[targetChainId], "Target chain not supported");
        require(targetChainId != block.chainid, "Cannot bridge to same chain");
        
        uint256 fee = (amount * BRIDGE_FEE_RATE) / FEE_DENOMINATOR;
        uint256 bridgeAmount = amount - fee;
        
        require(
            FCNCR_TOKEN.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        
        bridgeNonce++;
        bridgeRequests[bridgeNonce] = BridgeRequest({
            user: msg.sender,
            amount: bridgeAmount,
            targetChainId: targetChainId,
            nonce: bridgeNonce,
            processed: false
        });
        
        emit BridgeInitiated(msg.sender, bridgeAmount, targetChainId, bridgeNonce);
    }
    
    function completeBridge(
        address user,
        uint256 amount,
        uint256 sourceChainId,
        bytes32 txHash
    ) external onlyOwner nonReentrant {
        require(!processedTransactions[txHash], "Transaction already processed");
        require(supportedChains[sourceChainId], "Source chain not supported");
        
        processedTransactions[txHash] = true;
        
        // Mint tokens to user (assuming FCNCR has mint function for bridge)
        // For now, we'll transfer from bridge reserves
        require(
            FCNCR_TOKEN.transfer(user, amount),
            "Transfer failed"
        );
        
        emit BridgeCompleted(user, amount, sourceChainId, txHash);
    }
    
    function setSupportedChain(uint256 chainId, bool supported) external onlyOwner {
        supportedChains[chainId] = supported;
        emit ChainSupported(chainId, supported);
    }
    
    function withdrawFees() external onlyOwner {
        uint256 balance = FCNCR_TOKEN.balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");
        
        require(FCNCR_TOKEN.transfer(owner(), balance), "Transfer failed");
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function getBridgeFee(uint256 amount) external pure returns (uint256) {
        return (amount * BRIDGE_FEE_RATE) / FEE_DENOMINATOR;
    }
}