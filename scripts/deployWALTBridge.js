const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying wALT Bridge with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "Chain ID:", network.chainId);

  // wALT token address (same across all chains)
  const WALT_TOKEN_ADDRESS = "0x48721ADeFE5b97101722c0866c2AffCE797C32b6";

  // Deploy WALTBridge
  const WALTBridge = await ethers.getContractFactory("WALTBridge");
  const waltBridge = await WALTBridge.deploy(WALT_TOKEN_ADDRESS);
  await waltBridge.waitForDeployment();
  
  console.log("wALT Bridge deployed to:", await waltBridge.getAddress());

  // Save deployment addresses
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId,
    waltBridge: await waltBridge.getAddress(),
    waltToken: WALT_TOKEN_ADDRESS,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  console.log("\n=== wALT Bridge Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });