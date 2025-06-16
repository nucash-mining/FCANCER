const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying CREATE2 deployer with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "Chain ID:", network.chainId);

  // Deploy CREATE2 deployer
  const Create2Deployer = await ethers.getContractFactory("Create2Deployer");
  const create2Deployer = await Create2Deployer.deploy();
  await create2Deployer.waitForDeployment();
  
  const deployerAddress = await create2Deployer.getAddress();
  console.log("CREATE2 Deployer deployed to:", deployerAddress);

  return {
    network: network.name,
    chainId: network.chainId,
    create2Deployer: deployerAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });