// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract CrossChainMessenger is Ownable, ReentrancyGuard, Pausable {
    uint256 public constant MESSAGE_FEE = 0.001 ether;
    uint256 public messageNonce;
    
    struct CrossChainMessage {
        uint256 id;
        address sender;
        uint256 targetChainId;
        bytes payload;
        uint256 timestamp;
        bool executed;
        bytes32 messageHash;
    }
    
    mapping(uint256 => CrossChainMessage) public messages;
    mapping(bytes32 => bool) public processedMessages;
    mapping(uint256 => bool) public supportedChains;
    mapping(address => bool) public authorizedRelayers;
    
    event MessageSent(
        uint256 indexed messageId,
        address indexed sender,
        uint256 targetChainId,
        bytes32 messageHash,
        bytes payload
    );
    
    event MessageReceived(
        uint256 indexed messageId,
        address indexed sender,
        uint256 sourceChainId,
        bytes32 messageHash,
        bytes payload
    );
    
    event MessageExecuted(
        bytes32 indexed messageHash,
        address indexed executor,
        bool success
    );
    
    event RelayerAuthorized(address indexed relayer, bool authorized);
    event ChainSupported(uint256 chainId, bool supported);
    
    constructor() {
        // Initialize supported chains
        supportedChains[2330] = true;  // Altcoinchain
        supportedChains[1] = true;     // Ethereum
        supportedChains[61803] = true; // Etica
        supportedChains[7070] = true;  // PlanQ
        supportedChains[800001] = true; // OctaSpace
        supportedChains[2000] = true;  // Dogechain
        supportedChains[146] = true;   // Sonic
        supportedChains[250] = true;   // Fantom
        
        // Authorize deployer as initial relayer
        authorizedRelayers[msg.sender] = true;
    }
    
    modifier onlyRelayer() {
        require(authorizedRelayers[msg.sender], "Not authorized relayer");
        _;
    }
    
    function sendMessage(
        uint256 targetChainId,
        bytes calldata payload
    ) external payable nonReentrant whenNotPaused {
        require(supportedChains[targetChainId], "Target chain not supported");
        require(targetChainId != block.chainid, "Cannot send to same chain");
        require(msg.value >= MESSAGE_FEE, "Insufficient fee");
        
        messageNonce++;
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                messageNonce,
                msg.sender,
                block.chainid,
                targetChainId,
                payload,
                block.timestamp
            )
        );
        
        messages[messageNonce] = CrossChainMessage({
            id: messageNonce,
            sender: msg.sender,
            targetChainId: targetChainId,
            payload: payload,
            timestamp: block.timestamp,
            executed: false,
            messageHash: messageHash
        });
        
        emit MessageSent(
            messageNonce,
            msg.sender,
            targetChainId,
            messageHash,
            payload
        );
    }
    
    function receiveMessage(
        uint256 messageId,
        address sender,
        uint256 sourceChainId,
        bytes32 messageHash,
        bytes calldata payload,
        uint256 timestamp
    ) external onlyRelayer nonReentrant {
        require(supportedChains[sourceChainId], "Source chain not supported");
        require(!processedMessages[messageHash], "Message already processed");
        
        // Verify message hash
        bytes32 computedHash = keccak256(
            abi.encodePacked(
                messageId,
                sender,
                sourceChainId,
                block.chainid,
                payload,
                timestamp
            )
        );
        require(computedHash == messageHash, "Invalid message hash");
        
        processedMessages[messageHash] = true;
        
        emit MessageReceived(
            messageId,
            sender,
            sourceChainId,
            messageHash,
            payload
        );
        
        // Execute message if it's a contract call
        if (payload.length > 0) {
            _executeMessage(sender, payload, messageHash);
        }
    }
    
    function _executeMessage(
        address sender,
        bytes memory payload,
        bytes32 messageHash
    ) internal {
        // Decode target contract and call data
        (address target, bytes memory callData) = abi.decode(payload, (address, bytes));
        
        bool success;
        if (target != address(0)) {
            // Execute the cross-chain call
            (success,) = target.call(callData);
        }
        
        emit MessageExecuted(messageHash, sender, success);
    }
    
    function authorizeRelayer(address relayer, bool authorized) external onlyOwner {
        authorizedRelayers[relayer] = authorized;
        emit RelayerAuthorized(relayer, authorized);
    }
    
    function setSupportedChain(uint256 chainId, bool supported) external onlyOwner {
        supportedChains[chainId] = supported;
        emit ChainSupported(chainId, supported);
    }
    
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        (bool success,) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function getMessageFee() external pure returns (uint256) {
        return MESSAGE_FEE;
    }
    
    function isMessageProcessed(bytes32 messageHash) external view returns (bool) {
        return processedMessages[messageHash];
    }
}