// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract FCNCR is ERC20, Ownable, ReentrancyGuard {
    uint256 public constant TOTAL_SUPPLY = 21_000_000 * 10**18;
    uint256 public constant INITIAL_REWARD = 50 * 10**18;
    uint256 public constant HALVING_INTERVAL = 210_000;
    
    uint256 public currentBlock;
    uint256 public deploymentBlock;
    uint256 public totalMined;
    
    mapping(address => uint256) public stakedALT;
    mapping(address => uint256) public lastClaimBlock;
    mapping(address => uint256) public pendingRewards;
    
    uint256 public totalStakedALT;
    
    IERC20 public immutable ALT_TOKEN;
    
    event ALTStaked(address indexed user, uint256 amount);
    event ALTUnstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event BlockMined(uint256 blockNumber, uint256 reward);
    
    constructor(address _altToken) ERC20("Fuck Cancer", "FCNCR") {
        ALT_TOKEN = IERC20(_altToken);
        deploymentBlock = block.number;
        currentBlock = 0;
    }
    
    function getCurrentReward() public view returns (uint256) {
        uint256 halvings = currentBlock / HALVING_INTERVAL;
        if (halvings >= 64) return 0; // After 64 halvings, reward becomes 0
        return INITIAL_REWARD >> halvings; // Equivalent to dividing by 2^halvings
    }
    
    function stakeALT(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(ALT_TOKEN.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        // Update pending rewards before changing stake
        updatePendingRewards(msg.sender);
        
        stakedALT[msg.sender] += amount;
        totalStakedALT += amount;
        lastClaimBlock[msg.sender] = currentBlock;
        
        emit ALTStaked(msg.sender, amount);
    }
    
    function unstakeALT(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(stakedALT[msg.sender] >= amount, "Insufficient staked amount");
        
        // Update pending rewards before changing stake
        updatePendingRewards(msg.sender);
        
        stakedALT[msg.sender] -= amount;
        totalStakedALT -= amount;
        lastClaimBlock[msg.sender] = currentBlock;
        
        require(ALT_TOKEN.transfer(msg.sender, amount), "Transfer failed");
        
        emit ALTUnstaked(msg.sender, amount);
    }
    
    function updatePendingRewards(address user) internal {
        if (stakedALT[user] > 0 && totalStakedALT > 0) {
            uint256 blocksSinceLastClaim = currentBlock - lastClaimBlock[user];
            if (blocksSinceLastClaim > 0) {
                uint256 userShare = (stakedALT[user] * 1e18) / totalStakedALT;
                uint256 rewardsPerBlock = getCurrentReward();
                uint256 totalRewards = blocksSinceLastClaim * rewardsPerBlock;
                uint256 userRewards = (totalRewards * userShare) / 1e18;
                
                pendingRewards[user] += userRewards;
            }
        }
    }
    
    function claimRewards() external nonReentrant {
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
    
    function mineBlock() external {
        require(block.number > deploymentBlock + currentBlock, "Block already mined");
        
        currentBlock++;
        uint256 reward = getCurrentReward();
        
        if (reward > 0 && totalMined + reward <= TOTAL_SUPPLY) {
            // Distribute rewards to all stakers proportionally
            // This is handled in updatePendingRewards when users interact
        }
        
        emit BlockMined(currentBlock, reward);
    }
    
    function getPendingRewards(address user) external view returns (uint256) {
        if (stakedALT[user] == 0 || totalStakedALT == 0) {
            return pendingRewards[user];
        }
        
        uint256 blocksSinceLastClaim = currentBlock - lastClaimBlock[user];
        if (blocksSinceLastClaim == 0) {
            return pendingRewards[user];
        }
        
        uint256 userShare = (stakedALT[user] * 1e18) / totalStakedALT;
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
    
    // Emergency functions
    function emergencyWithdrawALT() external nonReentrant {
        uint256 amount = stakedALT[msg.sender];
        require(amount > 0, "No ALT staked");
        
        stakedALT[msg.sender] = 0;
        totalStakedALT -= amount;
        
        require(ALT_TOKEN.transfer(msg.sender, amount), "Transfer failed");
        
        emit ALTUnstaked(msg.sender, amount);
    }
}