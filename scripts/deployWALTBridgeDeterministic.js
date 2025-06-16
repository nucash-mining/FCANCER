const { ethers } = require("hardhat");

// Deterministic salt for consistent addresses across chains
const WALT_BRIDGE_SALT = "0x57414c5442524944474500000000000000000000000000000000000000000000"; // "WALTBRIDGE" in hex

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying deterministic wALT Bridge with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "Chain ID:", network.chainId);
  console.log("Using salt:", WALT_BRIDGE_SALT);

  // First deploy CREATE2 deployer if not exists
  const Create2Deployer = await ethers.getContractFactory("Create2Deployer");
  const create2Deployer = await Create2Deployer.deploy();
  await create2Deployer.waitForDeployment();
  
  const deployerAddress = await create2Deployer.getAddress();
  console.log("CREATE2 Deployer deployed to:", deployerAddress);

  // wALT token address (same across all chains)
  const WALT_TOKEN_ADDRESS = "0x48721ADeFE5b97101722c0866c2AffCE797C32b6";

  // Deploy WALTBridge deterministically
  const WALTBridge = await ethers.getContractFactory("WALTBridge");
  const constructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
    ["address"],
    [WALT_TOKEN_ADDRESS]
  );
  const bridgeBytecode = WALTBridge.bytecode + constructorArgs.slice(2);
  
  const predictedBridgeAddress = await create2Deployer.computeAddress(bridgeBytecode, WALT_BRIDGE_SALT);
  console.log("Predicted wALT Bridge address:", predictedBridgeAddress);
  
  const bridgeTx = await create2Deployer.deploy(bridgeBytecode, WALT_BRIDGE_SALT);
  await bridgeTx.wait();
  console.log("wALT Bridge deployed to:", predictedBridgeAddress);

  // Verify the deployment
  const waltBridge = WALTBridge.attach(predictedBridgeAddress);
  const tokenAddress = await waltBridge.WALT_TOKEN();
  console.log("Verified wALT token address:", tokenAddress);

  // Save deployment addresses
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId,
    create2Deployer: deployerAddress,
    waltBridge: predictedBridgeAddress,
    waltToken: WALT_TOKEN_ADDRESS,
    salt: WALT_BRIDGE_SALT,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  console.log("\n=== Deterministic wALT Bridge Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });