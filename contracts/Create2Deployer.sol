// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Create2Deployer {
    event ContractDeployed(address indexed contractAddress, bytes32 salt);
    
    function deploy(
        bytes memory bytecode,
        bytes32 salt
    ) external returns (address) {
        address contractAddress;
        
        assembly {
            contractAddress := create2(
                0,
                add(bytecode, 0x20),
                mload(bytecode),
                salt
            )
        }
        
        require(contractAddress != address(0), "Deployment failed");
        
        emit ContractDeployed(contractAddress, salt);
        return contractAddress;
    }
    
    function computeAddress(
        bytes memory bytecode,
        bytes32 salt
    ) external view returns (address) {
        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                salt,
                keccak256(bytecode)
            )
        );
        
        return address(uint160(uint256(hash)));
    }
    
    function computeAddressWithDeployer(
        address deployer,
        bytes memory bytecode,
        bytes32 salt
    ) external pure returns (address) {
        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                deployer,
                salt,
                keccak256(bytecode)
            )
        );
        
        return address(uint160(uint256(hash)));
    }
}