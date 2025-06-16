const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const networks = [
  'altcoinchain',
  'ethereum',
  'etica',
  'planq',
  'octaspace',
  'dogechain',
  'sonic',
  'fantom',
  'etho'
];

async function deployToNetwork(network) {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 Deploying wALT Bridge to ${network}...`);
    
    const deploy = spawn('npx', ['hardhat', 'run', 'scripts/deployWALTBridgeDeterministic.js', '--network', network], {
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

async function configureBridgeAddresses(deploymentAddresses) {
  console.log('\n🔗 Configuring cross-chain bridge addresses...');
  
  // This would require calling setChainBridge on each deployed contract
  // For now, we'll just log the configuration needed
  
  console.log('\nConfiguration commands needed:');
  for (const [network, addresses] of Object.entries(deploymentAddresses)) {
    console.log(`\n${network.toUpperCase()}:`);
    for (const [otherNetwork, otherAddresses] of Object.entries(deploymentAddresses)) {
      if (network !== otherNetwork) {
        console.log(`  setChainBridge(${getChainId(otherNetwork)}, "${otherAddresses.waltBridge}")`);
      }
    }
  }
}

function getChainId(network) {
  const chainIds = {
    altcoinchain: 2330,
    ethereum: 1,
    etica: 61803,
    planq: 7070,
    octaspace: 800001,
    dogechain: 2000,
    sonic: 146,
    fantom: 250,
    etho: 1313161554
  };
  return chainIds[network];
}

async function main() {
  console.log('🌐 Starting multi-chain deployment of wALT Bridge...\n');
  
  const deploymentResults = [];
  const deploymentAddresses = {};

  for (const network of networks) {
    try {
      const result = await deployToNetwork(network);
      deploymentResults.push(result);
      
      // Extract addresses from output
      const bridgeMatch = result.output.match(/wALT Bridge deployed to: (0x[a-fA-F0-9]{40})/);
      const create2Match = result.output.match(/CREATE2 Deployer deployed to: (0x[a-fA-F0-9]{40})/);
      
      if (bridgeMatch && create2Match) {
        deploymentAddresses[network] = {
          waltBridge: bridgeMatch[1],
          create2Deployer: create2Match[1],
          waltToken: "0x48721ADeFE5b97101722c0866c2AffCE797C32b6"
        };
      }
      
    } catch (error) {
      console.error(`Failed to deploy to ${network}:`, error);
      deploymentResults.push({ network, success: false, error: error.message });
    }
  }

  // Configure bridge addresses
  if (Object.keys(deploymentAddresses).length > 1) {
    await configureBridgeAddresses(deploymentAddresses);
  }

  // Save all deployment addresses
  const deploymentsPath = path.join(__dirname, '..', 'walt-bridge-deployments.json');
  fs.writeFileSync(deploymentsPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    deployments: deploymentAddresses,
    results: deploymentResults,
    chainIds: {
      altcoinchain: 2330,
      ethereum: 1,
      etica: 61803,
      planq: 7070,
      octaspace: 800001,
      dogechain: 2000,
      sonic: 146,
      fantom: 250,
      etho: 1313161554
    },
    waltTokenAddress: "0x48721ADeFE5b97101722c0866c2AffCE797C32b6",
    bridgeSalt: "0x57414c5442524944474500000000000000000000000000000000000000000000"
  }, null, 2));

  console.log('\n📋 wALT Bridge Deployment Summary:');
  console.log('='.repeat(60));
  
  deploymentResults.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.network}: ${result.success ? 'SUCCESS' : 'FAILED'}`);
  });

  console.log(`\n📁 Deployment addresses saved to: ${deploymentsPath}`);
  
  if (Object.keys(deploymentAddresses).length > 0) {
    console.log('\n🎉 Successfully deployed wALT Bridge contracts:');
    Object.entries(deploymentAddresses).forEach(([network, addresses]) => {
      console.log(`\n${network.toUpperCase()}:`);
      console.log(`  wALT Bridge: ${addresses.waltBridge}`);
      console.log(`  CREATE2 Deployer: ${addresses.create2Deployer}`);
      console.log(`  wALT Token: ${addresses.waltToken}`);
    });
    
    // Check if all bridges have the same address (deterministic deployment)
    const bridgeAddresses = Object.values(deploymentAddresses).map(addr => addr.waltBridge);
    const uniqueAddresses = [...new Set(bridgeAddresses)];
    
    if (uniqueAddresses.length === 1) {
      console.log(`\n🎯 SUCCESS: All bridges deployed to the same address: ${uniqueAddresses[0]}`);
    } else {
      console.log(`\n⚠️  WARNING: Bridges deployed to different addresses. Check deployment logs.`);
    }
  }
}

main()
  .then(() => {
    console.log('\n🏁 wALT Bridge multi-chain deployment completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('wALT Bridge deployment failed:', error);
    process.exit(1);
  });