// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Multicall {
    struct Call {
        address target;
        bytes callData;
    }

    struct Result {
        bool success;
        bytes returnData;
    }

    function aggregate(Call[] memory calls) public returns (uint256 blockNumber, bytes[] memory returnData) {
        blockNumber = block.number;
        returnData = new bytes[](calls.length);
        for (uint256 i = 0; i < calls.length; i++) {
            (bool success, bytes memory ret) = calls[i].target.call(calls[i].callData);
            require(success, "Multicall aggregate: call failed");
            returnData[i] = ret;
        }
    }

    function tryAggregate(bool requireSuccess, Call[] memory calls) public returns (Result[] memory returnData) {
        returnData = new Result[](calls.length);
        for (uint256 i = 0; i < calls.length; i++) {
            (bool success, bytes memory ret) = calls[i].target.call(calls[i].callData);
            
            if (requireSuccess) {
                require(success, "Multicall tryAggregate: call failed");
            }
            
            returnData[i] = Result(success, ret);
        }
    }

    function blockAndAggregate(Call[] memory calls) public returns (uint256 blockNumber, bytes32 blockHash, Result[] memory returnData) {
        (blockNumber, blockHash) = getBlockHash(block.number);
        returnData = tryAggregate(false, calls);
    }

    function getBlockHash(uint256 blockNumber) public view returns (uint256, bytes32) {
        return (blockNumber, blockhash(blockNumber));
    }

    function getLastBlockHash() public view returns (bytes32) {
        return blockhash(block.number - 1);
    }

    function getCurrentBlockTimestamp() public view returns (uint256) {
        return block.timestamp;
    }

    function getCurrentBlockDifficulty() public view returns (uint256) {
        return block.difficulty;
    }

    function getCurrentBlockGasLimit() public view returns (uint256) {
        return block.gaslimit;
    }

    function getCurrentBlockCoinbase() public view returns (address) {
        return block.coinbase;
    }
}