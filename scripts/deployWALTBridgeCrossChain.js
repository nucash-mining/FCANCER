const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying wALT Cross-Chain Bridge with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "Chain ID:", network.chainId);

  // wALT token address (same across all chains)
  const WALT_TOKEN_ADDRESS = "0x48721ADeFE5b97101722c0866c2AffCE797C32b6";

  // Deploy CrossChainMessenger first
  const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
  const messenger = await CrossChainMessenger.deploy();
  await messenger.waitForDeployment();
  
  console.log("CrossChainMessenger deployed to:", await messenger.getAddress());

  // Deploy WALTBridgeCrossChain
  const WALTBridgeCrossChain = await ethers.getContractFactory("WALTBridgeCrossChain");
  const waltBridge = await WALTBridgeCrossChain.deploy(
    WALT_TOKEN_ADDRESS,
    await messenger.getAddress()
  );
  await waltBridge.waitForDeployment();
  
  console.log("wALT Cross-Chain Bridge deployed to:", await waltBridge.getAddress());

  // Verify the deployment
  const tokenAddress = await waltBridge.WALT_TOKEN();
  const messengerAddress = await waltBridge.messenger();
  console.log("Verified wALT token address:", tokenAddress);
  console.log("Verified messenger address:", messengerAddress);

  // Save deployment addresses
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId,
    messenger: await messenger.getAddress(),
    waltBridge: await waltBridge.getAddress(),
    waltToken: WALT_TOKEN_ADDRESS,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  console.log("\n=== wALT Cross-Chain Bridge Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });