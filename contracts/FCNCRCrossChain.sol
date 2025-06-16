// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./FCNCR.sol";
import "./CrossChainMessenger.sol";

contract FCNCRCrossChain is FCNCR {
    CrossChainMessenger public immutable messenger;
    
    mapping(uint256 => address) public chainContracts;
    mapping(bytes32 => bool) public processedBridges;
    
    event CrossChainBridge(
        address indexed user,
        uint256 amount,
        uint256 targetChainId,
        bytes32 bridgeId
    );
    
    event CrossChainMint(
        address indexed user,
        uint256 amount,
        uint256 sourceChainId,
        bytes32 bridgeId
    );
    
    constructor(
        address _altToken,
        address _messenger
    ) FCNCR(_altToken) {
        messenger = CrossChainMessenger(_messenger);
    }
    
    function bridgeTokens(
        uint256 amount,
        uint256 targetChainId
    ) external payable nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        require(chainContracts[targetChainId] != address(0), "Target chain not configured");
        
        // Burn tokens on source chain
        _burn(msg.sender, amount);
        
        bytes32 bridgeId = keccak256(
            abi.encodePacked(
                msg.sender,
                amount,
                block.chainid,
                targetChainId,
                block.timestamp
            )
        );
        
        // Prepare cross-chain message
        bytes memory payload = abi.encode(
            chainContracts[targetChainId],
            abi.encodeWithSignature(
                "mintFromBridge(address,uint256,uint256,bytes32)",
                msg.sender,
                amount,
                block.chainid,
                bridgeId
            )
        );
        
        // Send cross-chain message
        messenger.sendMessage{value: msg.value}(targetChainId, payload);
        
        emit CrossChainBridge(msg.sender, amount, targetChainId, bridgeId);
    }
    
    function mintFromBridge(
        address user,
        uint256 amount,
        uint256 sourceChainId,
        bytes32 bridgeId
    ) external {
        require(msg.sender == address(messenger), "Only messenger can call");
        require(!processedBridges[bridgeId], "Bridge already processed");
        require(chainContracts[sourceChainId] != address(0), "Source chain not configured");
        
        processedBridges[bridgeId] = true;
        
        // Mint tokens on target chain
        _mint(user, amount);
        
        emit CrossChainMint(user, amount, sourceChainId, bridgeId);
    }
    
    function setChainContract(uint256 chainId, address contractAddress) external onlyOwner {
        chainContracts[chainId] = contractAddress;
    }
    
    function getBridgeFee() external view returns (uint256) {
        return messenger.getMessageFee();
    }
}