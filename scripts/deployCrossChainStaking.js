const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying cross-chain staking contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "Chain ID:", network.chainId);

  // Determine if this is Altcoinchain and get appropriate token address
  const isAltcoinchain = network.chainId === 2330n;
  
  const stakingTokenAddresses = {
    2330: "0x48721ADeFE5b97101722c0866c2AffCE797C32b6",  // ALT on Altcoinchain
    1: "0x48721ADeFE5b97101722c0866c2AffCE797C32b6",     // wALT on Ethereum
    61803: "0x48721ADeFE5b97101722c0866c2AffCE797C32b6", // wALT on Etica
    7070: "0x48721ADeFE5b97101722c0866c2AffCE797C32b6",  // wALT on PlanQ
    800001: "0x48721ADeFE5b97101722c0866c2AffCE797C32b6", // wALT on OctaSpace
    2000: "0x48721ADeFE5b97101722c0866c2AffCE797C32b6",  // wALT on Dogechain
    146: "0x48721ADeFE5b97101722c0866c2AffCE797C32b6",   // wALT on Sonic
    250: "0x48721ADeFE5b97101722c0866c2AffCE797C32b6",   // wALT on Fantom
    1313161554: "0x48721ADeFE5b97101722c0866c2AffCE797C32b6" // wALT on ETHO
  };

  const stakingTokenAddress = stakingTokenAddresses[network.chainId];
  if (!stakingTokenAddress) {
    throw new Error(`Staking token address not found for chain ID ${network.chainId}`);
  }

  console.log("Using staking token address:", stakingTokenAddress);
  console.log("Is Altcoinchain:", isAltcoinchain);

  // Deploy CrossChainMessenger
  const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
  const messenger = await CrossChainMessenger.deploy();
  await messenger.waitForDeployment();
  
  console.log("CrossChainMessenger deployed to:", await messenger.getAddress());

  // Deploy FCNCRCrossChainStaking
  const FCNCRCrossChainStaking = await ethers.getContractFactory("FCNCRCrossChainStaking");
  const fcncrStaking = await FCNCRCrossChainStaking.deploy(
    stakingTokenAddress,
    await messenger.getAddress(),
    isAltcoinchain
  );
  await fcncrStaking.waitForDeployment();
  
  console.log("FCNCRCrossChainStaking deployed to:", await fcncrStaking.getAddress());

  // Deploy wALT Bridge (if not Altcoinchain)
  let waltBridge = null;
  if (!isAltcoinchain) {
    const WALTBridge = await ethers.getContractFactory("WALTBridge");
    waltBridge = await WALTBridge.deploy(stakingTokenAddress);
    await waltBridge.waitForDeployment();
    
    console.log("wALT Bridge deployed to:", await waltBridge.getAddress());
  }

  // Deploy Liquidity Pool
  const FCNCRLiquidityPool = await ethers.getContractFactory("FCNCRLiquidityPool");
  const liquidityPool = await FCNCRLiquidityPool.deploy(
    await fcncrStaking.getAddress(),
    stakingTokenAddress
  );
  await liquidityPool.waitForDeployment();
  
  console.log("FCNCR Liquidity Pool deployed to:", await liquidityPool.getAddress());

  // Save deployment addresses
  const deploymentInfo = {
    network: network.name,
    chainId: Number(network.chainId),
    isAltcoinchain: isAltcoinchain,
    messenger: await messenger.getAddress(),
    fcncrStaking: await fcncrStaking.getAddress(),
    waltBridge: waltBridge ? await waltBridge.getAddress() : null,
    liquidityPool: await liquidityPool.getAddress(),
    stakingToken: stakingTokenAddress,
    stakingTokenSymbol: isAltcoinchain ? "ALT" : "wALT",
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  console.log("\n=== Cross-Chain Staking Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });