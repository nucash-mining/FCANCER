const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying Swapin.co contracts to Sonic with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "Chain ID:", network.chainId);

  // Deploy Wrapped Sonic (wS) Token
  const WrappedToken = await ethers.getContractFactory("WETH9"); // Using WETH9 as template
  const wS = await WrappedToken.deploy();
  await wS.waitForDeployment();
  
  console.log("Wrapped Sonic (wS) deployed to:", await wS.getAddress());

  // Deploy SwapinV2Factory
  const SwapinV2Factory = await ethers.getContractFactory("SwapinV2Factory");
  const factory = await SwapinV2Factory.deploy();
  await factory.waitForDeployment();
  
  console.log("SwapinV2Factory deployed to:", await factory.getAddress());

  // Deploy SwapinV2Router
  const SwapinV2Router = await ethers.getContractFactory("SwapinV2Router");
  const router = await SwapinV2Router.deploy(
    await factory.getAddress(),
    await wS.getAddress()
  );
  await router.waitForDeployment();
  
  console.log("SwapinV2Router deployed to:", await router.getAddress());

  // Deploy Multicall
  const Multicall = await ethers.getContractFactory("Multicall");
  const multicall = await Multicall.deploy();
  await multicall.waitForDeployment();
  
  console.log("Multicall deployed to:", await multicall.getAddress());

  // Deploy TokenMultisender
  const TokenMultisender = await ethers.getContractFactory("TokenMultisender");
  const tokenMultisender = await TokenMultisender.deploy();
  await tokenMultisender.waitForDeployment();
  
  console.log("TokenMultisender deployed to:", await tokenMultisender.getAddress());

  // Set fee to setter (Swapin.co deployer address)
  const feeToSetterAddress = "0xE01A6a52Ef245FDeA587735aFe60a1C96152A48D";
  await factory.setFeeToSetter(feeToSetterAddress);
  console.log("Fee to setter set to:", feeToSetterAddress);

  // Save deployment addresses
  const deploymentInfo = {
    network: "Sonic Mainnet",
    chainId: 146,
    wS: await wS.getAddress(),
    factory: await factory.getAddress(),
    router: await router.getAddress(),
    multicall: await multicall.getAddress(),
    tokenMultisender: await tokenMultisender.getAddress(),
    feeToSetter: feeToSetterAddress,
    initHashCode: "0x0c817536501f0541680bc3d164be66d6559cdd44e8acf7afeee6aa44283d54ca",
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  console.log("\n=== Sonic Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });