const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const networks = [
  'altcoinchain',
  'etica',
  'planq',
  'octaspace',
  'dogechain',
  'sonic',
  'fantom'
];

async function deployToNetwork(network) {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 Deploying cross-chain contracts to ${network}...`);
    
    const deploy = spawn('npx', ['hardhat', 'run', 'scripts/deployCrossChain.js', '--network', network], {
      stdio: 'pipe'
    });

    let output = '';
    let error = '';

    deploy.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.log(text);
    });

    deploy.stderr.on('data', (data) => {
      const text = data.toString();
      error += text;
      console.error(text);
    });

    deploy.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Successfully deployed to ${network}`);
        resolve({ network, output, success: true });
      } else {
        console.log(`❌ Failed to deploy to ${network}`);
        reject({ network, error, success: false });
      }
    });
  });
}

async function configureCrossChainContracts(deploymentAddresses) {
  console.log('\n🔗 Configuring cross-chain contract addresses...');
  
  for (const [network, addresses] of Object.entries(deploymentAddresses)) {
    try {
      console.log(`\nConfiguring ${network}...`);
      
      // Here you would call the setChainContract function for each network
      // This requires the contracts to be deployed and accessible
      
      for (const [otherNetwork, otherAddresses] of Object.entries(deploymentAddresses)) {
        if (network !== otherNetwork) {
          console.log(`  Setting ${otherNetwork} contract address: ${otherAddresses.fcncrCrossChain}`);
          // You would call fcncrCrossChain.setChainContract(chainId, contractAddress) here
        }
      }
    } catch (error) {
      console.error(`Failed to configure ${network}:`, error);
    }
  }
}

async function main() {
  console.log('🌐 Starting cross-chain deployment of FCNCR Token...\n');
  
  const deploymentResults = [];
  const deploymentAddresses = {};

  for (const network of networks) {
    try {
      const result = await deployToNetwork(network);
      deploymentResults.push(result);
      
      // Extract addresses from output
      const messengerMatch = result.output.match(/CrossChainMessenger deployed to: (0x[a-fA-F0-9]{40})/);
      const fcncrMatch = result.output.match(/FCNCRCrossChain deployed to: (0x[a-fA-F0-9]{40})/);
      const bridgeMatch = result.output.match(/FCNCR Bridge deployed to: (0x[a-fA-F0-9]{40})/);
      const poolMatch = result.output.match(/FCNCR Liquidity Pool deployed to: (0x[a-fA-F0-9]{40})/);
      
      if (messengerMatch && fcncrMatch && bridgeMatch && poolMatch) {
        deploymentAddresses[network] = {
          messenger: messengerMatch[1],
          fcncrCrossChain: fcncrMatch[1],
          bridge: bridgeMatch[1],
          liquidityPool: poolMatch[1]
        };
      }
      
    } catch (error) {
      console.error(`Failed to deploy to ${network}:`, error);
      deploymentResults.push({ network, success: false, error: error.message });
    }
  }

  // Configure cross-chain contract addresses
  if (Object.keys(deploymentAddresses).length > 1) {
    await configureCrossChainContracts(deploymentAddresses);
  }

  // Save all deployment addresses
  const deploymentsPath = path.join(__dirname, '..', 'crosschain-deployments.json');
  fs.writeFileSync(deploymentsPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    deployments: deploymentAddresses,
    results: deploymentResults,
    chainIds: {
      altcoinchain: 2330,
      etica: 61803,
      planq: 7070,
      octaspace: 800001,
      dogechain: 2000,
      sonic: 146,
      fantom: 250
    }
  }, null, 2));

  console.log('\n📋 Cross-Chain Deployment Summary:');
  console.log('='.repeat(60));
  
  deploymentResults.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.network}: ${result.success ? 'SUCCESS' : 'FAILED'}`);
  });

  console.log(`\n📁 Deployment addresses saved to: ${deploymentsPath}`);
  
  if (Object.keys(deploymentAddresses).length > 0) {
    console.log('\n🎉 Successfully deployed cross-chain contracts:');
    Object.entries(deploymentAddresses).forEach(([network, addresses]) => {
      console.log(`\n${network.toUpperCase()}:`);
      console.log(`  Messenger: ${addresses.messenger}`);
      console.log(`  FCNCR CrossChain: ${addresses.fcncrCrossChain}`);
      console.log(`  Bridge: ${addresses.bridge}`);
      console.log(`  Liquidity Pool: ${addresses.liquidityPool}`);
    });
  }
}

main()
  .then(() => {
    console.log('\n🏁 Cross-chain deployment completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Cross-chain deployment failed:', error);
    process.exit(1);
  });