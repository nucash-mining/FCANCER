const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying cross-chain contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "Chain ID:", network.chainId);

  // Get ALT token address for current network
  const altTokenAddresses = {
    2330: "0x48721ADeFE5b97101722c0866c2AffCE797C32b6",  // Altcoinchain
    61803: "0x444a294EA9858A1c61624300978D9b5C49Ba8873", // Etica (using EGAZ address)
    7070: "0x5ebcdf1de1781e8b5d41c016b0574ad53e2f6e1a",  // PlanQ
    800001: "0x444a294EA9858A1c61624300978D9b5C49Ba8873", // OctaSpace
    2000: "0xB7ddC6414bf4F5515b52D8BdD69973Ae205ff101",  // Dogechain
    146: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",   // Sonic (using FTM address)
    250: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83"    // Fantom
  };

  const altTokenAddress = altTokenAddresses[network.chainId];
  if (!altTokenAddress) {
    throw new Error(`ALT token address not found for chain ID ${network.chainId}`);
  }

  console.log("Using ALT token address:", altTokenAddress);

  // Deploy CrossChainMessenger
  const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
  const messenger = await CrossChainMessenger.deploy();
  await messenger.waitForDeployment();
  
  console.log("CrossChainMessenger deployed to:", await messenger.getAddress());

  // Deploy FCNCRCrossChain
  const FCNCRCrossChain = await ethers.getContractFactory("FCNCRCrossChain");
  const fcncrCrossChain = await FCNCRCrossChain.deploy(
    altTokenAddress,
    await messenger.getAddress()
  );
  await fcncrCrossChain.waitForDeployment();
  
  console.log("FCNCRCrossChain deployed to:", await fcncrCrossChain.getAddress());

  // Deploy Bridge
  const FCNCRBridge = await ethers.getContractFactory("FCNCRBridge");
  const bridge = await FCNCRBridge.deploy(await fcncrCrossChain.getAddress());
  await bridge.waitForDeployment();
  
  console.log("FCNCR Bridge deployed to:", await bridge.getAddress());

  // Deploy Liquidity Pool
  const FCNCRLiquidityPool = await ethers.getContractFactory("FCNCRLiquidityPool");
  const liquidityPool = await FCNCRLiquidityPool.deploy(
    await fcncrCrossChain.getAddress(),
    altTokenAddress
  );
  await liquidityPool.waitForDeployment();
  
  console.log("FCNCR Liquidity Pool deployed to:", await liquidityPool.getAddress());

  // Save deployment addresses
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId,
    messenger: await messenger.getAddress(),
    fcncrCrossChain: await fcncrCrossChain.getAddress(),
    bridge: await bridge.getAddress(),
    liquidityPool: await liquidityPool.getAddress(),
    altToken: altTokenAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  console.log("\n=== Cross-Chain Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });