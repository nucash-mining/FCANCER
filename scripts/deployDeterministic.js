const { ethers } = require("hardhat");

// Deterministic salt for consistent addresses across chains
const DEPLOYMENT_SALT = "0x46434e4352000000000000000000000000000000000000000000000000000000"; // "FCNCR" in hex

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying deterministic contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "Chain ID:", network.chainId);
  console.log("Using salt:", DEPLOYMENT_SALT);

  // First deploy CREATE2 deployer if not exists
  const Create2Deployer = await ethers.getContractFactory("Create2Deployer");
  const create2Deployer = await Create2Deployer.deploy();
  await create2Deployer.waitForDeployment();
  
  const deployerAddress = await create2Deployer.getAddress();
  console.log("CREATE2 Deployer deployed to:", deployerAddress);

  // Get ALT token address for current network
  const altTokenAddresses = {
    2330: "0x48721ADeFE5b97101722c0866c2AffCE797C32b6",  // Altcoinchain
    1: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",     // Ethereum (WETH)
    61803: "0x444a294EA9858A1c61624300978D9b5C49Ba8873", // Etica
    7070: "0x5ebcdf1de1781e8b5d41c016b0574ad53e2f6e1a",  // PlanQ
    800001: "0x444a294EA9858A1c61624300978D9b5C49Ba8873", // OctaSpace
    2000: "0xB7ddC6414bf4F5515b52D8BdD69973Ae205ff101",  // Dogechain
    146: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",   // Sonic
    250: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83"    // Fantom
  };

  const altTokenAddress = altTokenAddresses[network.chainId];
  if (!altTokenAddress) {
    throw new Error(`ALT token address not found for chain ID ${network.chainId}`);
  }

  // Deploy CrossChainMessenger deterministically
  const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
  const messengerBytecode = CrossChainMessenger.bytecode;
  const messengerSalt = ethers.keccak256(ethers.toUtf8Bytes("FCNCR_MESSENGER"));
  
  const predictedMessengerAddress = await create2Deployer.computeAddress(messengerBytecode, messengerSalt);
  console.log("Predicted Messenger address:", predictedMessengerAddress);
  
  const messengerTx = await create2Deployer.deploy(messengerBytecode, messengerSalt);
  await messengerTx.wait();
  console.log("CrossChainMessenger deployed to:", predictedMessengerAddress);

  // Deploy FCNCRCrossChain deterministically
  const FCNCRCrossChain = await ethers.getContractFactory("FCNCRCrossChain");
  const fcncrConstructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
    ["address", "address"],
    [altTokenAddress, predictedMessengerAddress]
  );
  const fcncrBytecode = FCNCRCrossChain.bytecode + fcncrConstructorArgs.slice(2);
  const fcncrSalt = ethers.keccak256(ethers.toUtf8Bytes("FCNCR_TOKEN"));
  
  const predictedFcncrAddress = await create2Deployer.computeAddress(fcncrBytecode, fcncrSalt);
  console.log("Predicted FCNCR address:", predictedFcncrAddress);
  
  const fcncrTx = await create2Deployer.deploy(fcncrBytecode, fcncrSalt);
  await fcncrTx.wait();
  console.log("FCNCRCrossChain deployed to:", predictedFcncrAddress);

  // Deploy Bridge deterministically
  const FCNCRBridge = await ethers.getContractFactory("FCNCRBridge");
  const bridgeConstructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
    ["address"],
    [predictedFcncrAddress]
  );
  const bridgeBytecode = FCNCRBridge.bytecode + bridgeConstructorArgs.slice(2);
  const bridgeSalt = ethers.keccak256(ethers.toUtf8Bytes("FCNCR_BRIDGE"));
  
  const predictedBridgeAddress = await create2Deployer.computeAddress(bridgeBytecode, bridgeSalt);
  console.log("Predicted Bridge address:", predictedBridgeAddress);
  
  const bridgeTx = await create2Deployer.deploy(bridgeBytecode, bridgeSalt);
  await bridgeTx.wait();
  console.log("FCNCRBridge deployed to:", predictedBridgeAddress);

  // Deploy Liquidity Pool deterministically
  const FCNCRLiquidityPool = await ethers.getContractFactory("FCNCRLiquidityPool");
  const poolConstructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
    ["address", "address"],
    [predictedFcncrAddress, altTokenAddress]
  );
  const poolBytecode = FCNCRLiquidityPool.bytecode + poolConstructorArgs.slice(2);
  const poolSalt = ethers.keccak256(ethers.toUtf8Bytes("FCNCR_POOL"));
  
  const predictedPoolAddress = await create2Deployer.computeAddress(poolBytecode, poolSalt);
  console.log("Predicted Pool address:", predictedPoolAddress);
  
  const poolTx = await create2Deployer.deploy(poolBytecode, poolSalt);
  await poolTx.wait();
  console.log("FCNCRLiquidityPool deployed to:", predictedPoolAddress);

  // Save deployment addresses
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId,
    create2Deployer: deployerAddress,
    messenger: predictedMessengerAddress,
    fcncrCrossChain: predictedFcncrAddress,
    bridge: predictedBridgeAddress,
    liquidityPool: predictedPoolAddress,
    altToken: altTokenAddress,
    deployer: deployer.address,
    salt: DEPLOYMENT_SALT,
    timestamp: new Date().toISOString()
  };

  console.log("\n=== Deterministic Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });