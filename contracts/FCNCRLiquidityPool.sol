// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract FCNCRLiquidityPool is ERC20, Ownable, ReentrancyGuard {
    IERC20 public immutable FCNCR_TOKEN;
    IERC20 public immutable ALT_TOKEN;
    
    uint256 public constant MINIMUM_LIQUIDITY = 1000;
    
    uint256 public fcncrReserve;
    uint256 public altReserve;
    
    uint256 public totalFees;
    uint256 public constant FEE_RATE = 30; // 0.3% (30/10000)
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    event LiquidityAdded(
        address indexed provider,
        uint256 fcncrAmount,
        uint256 altAmount,
        uint256 liquidity
    );
    
    event LiquidityRemoved(
        address indexed provider,
        uint256 fcncrAmount,
        uint256 altAmount,
        uint256 liquidity
    );
    
    event Swap(
        address indexed user,
        uint256 fcncrIn,
        uint256 altIn,
        uint256 fcncrOut,
        uint256 altOut
    );
    
    constructor(address _fcncrToken, address _altToken) 
        ERC20("FCNCR-ALT LP", "FCNCR-ALT") 
    {
        FCNCR_TOKEN = IERC20(_fcncrToken);
        ALT_TOKEN = IERC20(_altToken);
    }
    
    function addLiquidity(uint256 fcncrAmount, uint256 altAmount) 
        external 
        nonReentrant 
        returns (uint256 liquidity) 
    {
        require(fcncrAmount > 0 && altAmount > 0, "Amounts must be greater than 0");
        
        require(
            FCNCR_TOKEN.transferFrom(msg.sender, address(this), fcncrAmount),
            "FCNCR transfer failed"
        );
        require(
            ALT_TOKEN.transferFrom(msg.sender, address(this), altAmount),
            "ALT transfer failed"
        );
        
        uint256 totalSupply = totalSupply();
        
        if (totalSupply == 0) {
            liquidity = sqrt(fcncrAmount * altAmount) - MINIMUM_LIQUIDITY;
            _mint(address(0), MINIMUM_LIQUIDITY); // Lock minimum liquidity
        } else {
            liquidity = min(
                (fcncrAmount * totalSupply) / fcncrReserve,
                (altAmount * totalSupply) / altReserve
            );
        }
        
        require(liquidity > 0, "Insufficient liquidity minted");
        
        _mint(msg.sender, liquidity);
        
        fcncrReserve += fcncrAmount;
        altReserve += altAmount;
        
        emit LiquidityAdded(msg.sender, fcncrAmount, altAmount, liquidity);
    }
    
    function removeLiquidity(uint256 liquidity) 
        external 
        nonReentrant 
        returns (uint256 fcncrAmount, uint256 altAmount) 
    {
        require(liquidity > 0, "Liquidity must be greater than 0");
        require(balanceOf(msg.sender) >= liquidity, "Insufficient liquidity balance");
        
        uint256 totalSupply = totalSupply();
        
        fcncrAmount = (liquidity * fcncrReserve) / totalSupply;
        altAmount = (liquidity * altReserve) / totalSupply;
        
        require(fcncrAmount > 0 && altAmount > 0, "Insufficient liquidity burned");
        
        _burn(msg.sender, liquidity);
        
        fcncrReserve -= fcncrAmount;
        altReserve -= altAmount;
        
        require(FCNCR_TOKEN.transfer(msg.sender, fcncrAmount), "FCNCR transfer failed");
        require(ALT_TOKEN.transfer(msg.sender, altAmount), "ALT transfer failed");
        
        emit LiquidityRemoved(msg.sender, fcncrAmount, altAmount, liquidity);
    }
    
    function swapFCNCRForALT(uint256 fcncrAmountIn, uint256 minAltOut) 
        external 
        nonReentrant 
        returns (uint256 altAmountOut) 
    {
        require(fcncrAmountIn > 0, "Amount must be greater than 0");
        
        require(
            FCNCR_TOKEN.transferFrom(msg.sender, address(this), fcncrAmountIn),
            "Transfer failed"
        );
        
        altAmountOut = getAmountOut(fcncrAmountIn, fcncrReserve, altReserve);
        require(altAmountOut >= minAltOut, "Insufficient output amount");
        require(altAmountOut < altReserve, "Insufficient liquidity");
        
        fcncrReserve += fcncrAmountIn;
        altReserve -= altAmountOut;
        
        require(ALT_TOKEN.transfer(msg.sender, altAmountOut), "Transfer failed");
        
        emit Swap(msg.sender, fcncrAmountIn, 0, 0, altAmountOut);
    }
    
    function swapALTForFCNCR(uint256 altAmountIn, uint256 minFcncrOut) 
        external 
        nonReentrant 
        returns (uint256 fcncrAmountOut) 
    {
        require(altAmountIn > 0, "Amount must be greater than 0");
        
        require(
            ALT_TOKEN.transferFrom(msg.sender, address(this), altAmountIn),
            "Transfer failed"
        );
        
        fcncrAmountOut = getAmountOut(altAmountIn, altReserve, fcncrReserve);
        require(fcncrAmountOut >= minFcncrOut, "Insufficient output amount");
        require(fcncrAmountOut < fcncrReserve, "Insufficient liquidity");
        
        altReserve += altAmountIn;
        fcncrReserve -= fcncrAmountOut;
        
        require(FCNCR_TOKEN.transfer(msg.sender, fcncrAmountOut), "Transfer failed");
        
        emit Swap(msg.sender, 0, altAmountIn, fcncrAmountOut, 0);
    }
    
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) 
        public 
        pure 
        returns (uint256 amountOut) 
    {
        require(amountIn > 0, "Amount must be greater than 0");
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");
        
        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - FEE_RATE);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * FEE_DENOMINATOR) + amountInWithFee;
        
        amountOut = numerator / denominator;
    }
    
    function getReserves() external view returns (uint256, uint256) {
        return (fcncrReserve, altReserve);
    }
    
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
    
    function min(uint256 x, uint256 y) internal pure returns (uint256) {
        return x < y ? x : y;
    }
}