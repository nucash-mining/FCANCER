const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "Chain ID:", network.chainId);

  // Get ALT token address for current network
  const altTokenAddresses = {
    2330: "0x48721ADeFE5b97101722c0866c2AffCE797C32b6", // Altcoinchain
    1: "0x444a294EA9858A1c61624300978D9b5C49Ba8873",    // EGAZ
    7668: "0x5ebcdf1de1781e8b5d41c016b0574ad53e2f6e1a", // PlanQ
    800: "0x444a294EA9858A1c61624300978D9b5C49Ba8873",  // OctaSpace
    2018: "0xB7ddC6414bf4F5515b52D8BdD69973Ae205ff101", // DOGEchain
    250: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83"   // Fantom
  };

  const altTokenAddress = altTokenAddresses[network.chainId];
  if (!altTokenAddress) {
    throw new Error(`ALT token address not found for chain ID ${network.chainId}`);
  }

  console.log("Using ALT token address:", altTokenAddress);

  // Deploy FCNCR Token
  const FCNCR = await ethers.getContractFactory("FCNCR");
  const fcncr = await FCNCR.deploy(altTokenAddress);
  await fcncr.waitForDeployment();
  
  console.log("FCNCR Token deployed to:", await fcncr.getAddress());

  // Deploy Bridge
  const FCNCRBridge = await ethers.getContractFactory("FCNCRBridge");
  const bridge = await FCNCRBridge.deploy(await fcncr.getAddress());
  await bridge.waitForDeployment();
  
  console.log("FCNCR Bridge deployed to:", await bridge.getAddress());

  // Deploy Liquidity Pool
  const FCNCRLiquidityPool = await ethers.getContractFactory("FCNCRLiquidityPool");
  const liquidityPool = await FCNCRLiquidityPool.deploy(
    await fcncr.getAddress(),
    altTokenAddress
  );
  await liquidityPool.waitForDeployment();
  
  console.log("FCNCR Liquidity Pool deployed to:", await liquidityPool.getAddress());

  // Save deployment addresses
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId,
    fcncr: await fcncr.getAddress(),
    bridge: await bridge.getAddress(),
    liquidityPool: await liquidityPool.getAddress(),
    altToken: altTokenAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  console.log("\n=== Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });