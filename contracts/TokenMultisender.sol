// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract TokenMultisender is Ownable, ReentrancyGuard {
    uint256 public fee = 0.001 ether; // Fee per transaction
    
    event MultiSend(address indexed token, uint256 total, uint256 recipients);
    event FeeUpdated(uint256 newFee);
    
    struct Recipient {
        address to;
        uint256 amount;
    }
    
    function multiSendToken(
        address token,
        Recipient[] calldata recipients
    ) external payable nonReentrant {
        require(recipients.length > 0, "No recipients");
        require(msg.value >= fee * recipients.length, "Insufficient fee");
        
        IERC20 tokenContract = IERC20(token);
        uint256 total = 0;
        
        // Calculate total amount needed
        for (uint256 i = 0; i < recipients.length; i++) {
            total += recipients[i].amount;
        }
        
        // Transfer total amount from sender to this contract
        require(
            tokenContract.transferFrom(msg.sender, address(this), total),
            "Transfer to contract failed"
        );
        
        // Distribute to recipients
        for (uint256 i = 0; i < recipients.length; i++) {
            require(
                tokenContract.transfer(recipients[i].to, recipients[i].amount),
                "Transfer to recipient failed"
            );
        }
        
        emit MultiSend(token, total, recipients.length);
    }
    
    function multiSendEther(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external payable nonReentrant {
        require(recipients.length == amounts.length, "Array length mismatch");
        require(recipients.length > 0, "No recipients");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        uint256 requiredFee = fee * recipients.length;
        require(msg.value >= totalAmount + requiredFee, "Insufficient value");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            payable(recipients[i]).transfer(amounts[i]);
        }
        
        emit MultiSend(address(0), totalAmount, recipients.length);
    }
    
    function setFee(uint256 _fee) external onlyOwner {
        fee = _fee;
        emit FeeUpdated(_fee);
    }
    
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(owner()).transfer(balance);
    }
    
    function emergencyWithdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }
}