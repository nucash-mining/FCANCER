// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./SwapinV2Pair.sol";

contract SwapinV2Factory is Ownable {
    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;
    
    uint256 public constant FEE_RATE = 30; // 0.3%
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    address public feeTo;
    address public feeToSetter;
    
    event PairCreated(
        address indexed token0,
        address indexed token1,
        address pair,
        uint256 allPairsLength
    );
    
    constructor() {
        feeToSetter = msg.sender;
    }
    
    function allPairsLength() external view returns (uint256) {
        return allPairs.length;
    }
    
    function createPair(address tokenA, address tokenB) external returns (address pair) {
        require(tokenA != tokenB, "SwapinV2: IDENTICAL_ADDRESSES");
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), "SwapinV2: ZERO_ADDRESS");
        require(getPair[token0][token1] == address(0), "SwapinV2: PAIR_EXISTS");
        
        bytes memory bytecode = type(SwapinV2Pair).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        
        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        
        SwapinV2Pair(pair).initialize(token0, token1);
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair;
        allPairs.push(pair);
        
        emit PairCreated(token0, token1, pair, allPairs.length);
    }
    
    function setFeeTo(address _feeTo) external {
        require(msg.sender == feeToSetter, "SwapinV2: FORBIDDEN");
        feeTo = _feeTo;
    }
    
    function setFeeToSetter(address _feeToSetter) external {
        require(msg.sender == feeToSetter, "SwapinV2: FORBIDDEN");
        feeToSetter = _feeToSetter;
    }
}