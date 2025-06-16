const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const networks = [
  'altcoinchain',
  'egaz', 
  'planq',
  'octaspace',
  'dogechain',
  'fantom'
];

async function deployToNetwork(network) {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 Deploying to ${network}...`);
    
    const deploy = spawn('npx', ['hardhat', 'run', 'scripts/deploy.js', '--network', network], {
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

async function main() {
  console.log('🌐 Starting multi-chain deployment of FCNCR Token...\n');
  
  const deploymentResults = [];
  const deploymentAddresses = {};

  for (const network of networks) {
    try {
      const result = await deployToNetwork(network);
      deploymentResults.push(result);
      
      // Extract addresses from output
      const fcncrMatch = result.output.match(/FCNCR Token deployed to: (0x[a-fA-F0-9]{40})/);
      const bridgeMatch = result.output.match(/FCNCR Bridge deployed to: (0x[a-fA-F0-9]{40})/);
      const poolMatch = result.output.match(/FCNCR Liquidity Pool deployed to: (0x[a-fA-F0-9]{40})/);
      
      if (fcncrMatch && bridgeMatch && poolMatch) {
        deploymentAddresses[network] = {
          fcncr: fcncrMatch[1],
          bridge: bridgeMatch[1],
          liquidityPool: poolMatch[1]
        };
      }
      
    } catch (error) {
      console.error(`Failed to deploy to ${network}:`, error);
      deploymentResults.push({ network, success: false, error: error.message });
    }
  }

  // Save all deployment addresses
  const deploymentsPath = path.join(__dirname, '..', 'deployments.json');
  fs.writeFileSync(deploymentsPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    deployments: deploymentAddresses,
    results: deploymentResults
  }, null, 2));

  console.log('\n📋 Deployment Summary:');
  console.log('='.repeat(50));
  
  deploymentResults.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.network}: ${result.success ? 'SUCCESS' : 'FAILED'}`);
  });

  console.log(`\n📁 Deployment addresses saved to: ${deploymentsPath}`);
  
  if (Object.keys(deploymentAddresses).length > 0) {
    console.log('\n🎉 Successfully deployed contracts:');
    Object.entries(deploymentAddresses).forEach(([network, addresses]) => {
      console.log(`\n${network.toUpperCase()}:`);
      console.log(`  FCNCR Token: ${addresses.fcncr}`);
      console.log(`  Bridge: ${addresses.bridge}`);
      console.log(`  Liquidity Pool: ${addresses.liquidityPool}`);
    });
  }
}

main()
  .then(() => {
    console.log('\n🏁 Multi-chain deployment completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Deployment failed:', error);
    process.exit(1);
  });