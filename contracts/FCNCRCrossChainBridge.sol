// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./CrossChainMessenger.sol";

contract FCNCRCrossChainBridge is Ownable, ReentrancyGuard, Pausable {
    IERC20 public immutable FCNCR_TOKEN;
    CrossChainMessenger public immutable messenger;
    
    uint256 public constant BRIDGE_FEE_RATE = 100; // 0.1% (100/100000)
    uint256 public constant FEE_DENOMINATOR = 100000;
    
    uint256 public bridgeNonce;
    
    struct BridgeRequest {
        address user;
        uint256 amount;
        uint256 targetChainId;
        uint256 nonce;
        bool processed;
        bytes32 bridgeId;
    }
    
    mapping(uint256 => BridgeRequest) public bridgeRequests;
    mapping(bytes32 => bool) public processedBridges;
    mapping(uint256 => bool) public supportedChains;
    mapping(uint256 => address) public chainBridges;
    
    event BridgeInitiated(
        address indexed user,
        uint256 amount,
        uint256 targetChainId,
        uint256 nonce,
        bytes32 bridgeId
    );
    
    event BridgeCompleted(
        address indexed user,
        uint256 amount,
        uint256 sourceChainId,
        bytes32 bridgeId
    );
    
    event ChainSupported(uint256 chainId, bool supported);
    event ChainBridgeSet(uint256 chainId, address bridgeAddress);
    
    constructor(address _fcncrToken, address _messenger) {
        FCNCR_TOKEN = IERC20(_fcncrToken);
        messenger = CrossChainMessenger(_messenger);
        
        // Add supported chains
        supportedChains[2330] = true;  // Altcoinchain
        supportedChains[1] = true;     // Ethereum
        supportedChains[61803] = true; // Etica
        supportedChains[7070] = true;  // PlanQ
        supportedChains[800001] = true; // OctaSpace
        supportedChains[2000] = true;  // Dogechain
        supportedChains[146] = true;   // Sonic
        supportedChains[250] = true;   // Fantom
    }
    
    function initiateBridge(
        uint256 amount,
        uint256 targetChainId
    ) external payable nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(supportedChains[targetChainId], "Target chain not supported");
        require(targetChainId != block.chainid, "Cannot bridge to same chain");
        require(chainBridges[targetChainId] != address(0), "Target bridge not configured");
        
        uint256 fee = (amount * BRIDGE_FEE_RATE) / FEE_DENOMINATOR;
        uint256 bridgeAmount = amount - fee;
        
        require(
            FCNCR_TOKEN.transferFrom(msg.sender, address(this), amount),
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
            processed: false,
            bridgeId: bridgeId
        });
        
        // Prepare cross-chain message
        bytes memory payload = abi.encode(
            chainBridges[targetChainId],
            abi.encodeWithSignature(
                "completeBridge(address,uint256,uint256,bytes32)",
                msg.sender,
                bridgeAmount,
                block.chainid,
                bridgeId
            )
        );
        
        // Send cross-chain message
        uint256 messageFee = messenger.getMessageFee();
        require(msg.value >= messageFee, "Insufficient message fee");
        
        messenger.sendMessage{value: messageFee}(targetChainId, payload);
        
        emit BridgeInitiated(msg.sender, bridgeAmount, targetChainId, bridgeNonce, bridgeId);
    }
    
    function completeBridge(
        address user,
        uint256 amount,
        uint256 sourceChainId,
        bytes32 bridgeId
    ) external {
        require(msg.sender == address(messenger), "Only messenger can call");
        require(!processedBridges[bridgeId], "Bridge already processed");
        require(supportedChains[sourceChainId], "Source chain not supported");
        
        processedBridges[bridgeId] = true;
        
        // Transfer tokens to user
        require(
            FCNCR_TOKEN.transfer(user, amount),
            "Transfer failed"
        );
        
        emit BridgeCompleted(user, amount, sourceChainId, bridgeId);
    }
    
    function setSupportedChain(uint256 chainId, bool supported) external onlyOwner {
        supportedChains[chainId] = supported;
        emit ChainSupported(chainId, supported);
    }
    
    function setChainBridge(uint256 chainId, address bridgeAddress) external onlyOwner {
        chainBridges[chainId] = bridgeAddress;
        emit ChainBridgeSet(chainId, bridgeAddress);
    }
    
    function withdrawFees() external onlyOwner {
        uint256 balance = FCNCR_TOKEN.balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");
        
        require(FCNCR_TOKEN.transfer(owner(), balance), "Transfer failed");
    }
    
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
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
    
    function getMessageFee() external view returns (uint256) {
        return messenger.getMessageFee();
    }
}