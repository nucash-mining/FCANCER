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
    console.log(`\n🚀 Deploying cross-chain staking to ${network}...`);
    
    const deploy = spawn('npx', ['hardhat', 'run', 'scripts/deployCrossChainStaking.js', '--network', network], {
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
  console.log('\n🔗 Configuring cross-chain staking contracts...');
  
  console.log('\nConfiguration commands needed:');
  for (const [network, addresses] of Object.entries(deploymentAddresses)) {
    console.log(`\n${network.toUpperCase()}:`);
    for (const [otherNetwork, otherAddresses] of Object.entries(deploymentAddresses)) {
      if (network !== otherNetwork) {
        console.log(`  setChainStakingContract(${getChainId(otherNetwork)}, "${otherAddresses.fcncrStaking}")`);
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
  console.log('🌐 Starting cross-chain staking deployment...\n');
  
  const deploymentResults = [];
  const deploymentAddresses = {};

  for (const network of networks) {
    try {
      const result = await deployToNetwork(network);
      deploymentResults.push(result);
      
      // Extract addresses from output
      const messengerMatch = result.output.match(/CrossChainMessenger deployed to: (0x[a-fA-F0-9]{40})/);
      const stakingMatch = result.output.match(/FCNCRCrossChainStaking deployed to: (0x[a-fA-F0-9]{40})/);
      const bridgeMatch = result.output.match(/wALT Bridge deployed to: (0x[a-fA-F0-9]{40})/);
      const poolMatch = result.output.match(/FCNCR Liquidity Pool deployed to: (0x[a-fA-F0-9]{40})/);
      const isAltcoinchainMatch = result.output.match(/Is Altcoinchain: (true|false)/);
      
      if (messengerMatch && stakingMatch && poolMatch) {
        deploymentAddresses[network] = {
          messenger: messengerMatch[1],
          fcncrStaking: stakingMatch[1],
          waltBridge: bridgeMatch ? bridgeMatch[1] : null,
          liquidityPool: poolMatch[1],
          stakingToken: "0x48721ADeFE5b97101722c0866c2AffCE797C32b6",
          isAltcoinchain: isAltcoinchainMatch ? isAltcoinchainMatch[1] === 'true' : false
        };
      }
      
    } catch (error) {
      console.error(`Failed to deploy to ${network}:`, error);
      deploymentResults.push({ network, success: false, error: error.message });
    }
  }

  // Configure cross-chain contracts
  if (Object.keys(deploymentAddresses).length > 1) {
    await configureCrossChainContracts(deploymentAddresses);
  }

  // Save all deployment addresses
  const deploymentsPath = path.join(__dirname, '..', 'crosschain-staking-deployments.json');
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
    stakingTokenAddress: "0x48721ADeFE5b97101722c0866c2AffCE797C32b6"
  }, null, 2));

  console.log('\n📋 Cross-Chain Staking Deployment Summary:');
  console.log('='.repeat(60));
  
  deploymentResults.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.network}: ${result.success ? 'SUCCESS' : 'FAILED'}`);
  });

  console.log(`\n📁 Deployment addresses saved to: ${deploymentsPath}`);
  
  if (Object.keys(deploymentAddresses).length > 0) {
    console.log('\n🎉 Successfully deployed cross-chain staking contracts:');
    Object.entries(deploymentAddresses).forEach(([network, addresses]) => {
      console.log(`\n${network.toUpperCase()}:`);
      console.log(`  Messenger: ${addresses.messenger}`);
      console.log(`  FCNCR Staking: ${addresses.fcncrStaking}`);
      console.log(`  wALT Bridge: ${addresses.waltBridge || 'N/A (Altcoinchain)'}`);
      console.log(`  Liquidity Pool: ${addresses.liquidityPool}`);
      console.log(`  Staking Token: ${addresses.stakingToken} (${addresses.isAltcoinchain ? 'ALT' : 'wALT'})`);
    });
  }
}

main()
  .then(() => {
    console.log('\n🏁 Cross-chain staking deployment completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Cross-chain staking deployment failed:', error);
    process.exit(1);
  });