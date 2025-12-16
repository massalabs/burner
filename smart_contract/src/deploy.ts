import * as dotenv from 'dotenv';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  Account,
  Mas,
  Web3Provider,
  Args,
} from '@massalabs/massa-web3';

// Load .env file content into process.env
dotenv.config();

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(path.dirname(__filename));

// Get configuration from environment variables
const secretKey = process.env.WALLET_SECRET_KEY;
if (!secretKey) {
  throw new Error('Missing WALLET_SECRET_KEY in .env file');
}

async function deploy() {
  console.log('🔥 Burner Smart Contract Deployment');
  console.log('====================================\n');

  // Create account from secret key
  const account = await Account.fromPrivateKey(secretKey!);
  console.log(`📍 Deployer address: ${account.address}`);

  // Create provider connected to mainnet
  const provider = Web3Provider.mainnet(account);
  console.log('🌐 Connected to Massa Mainnet\n');

  // Read the compiled WASM file
  const wasmPath = path.join(__dirname, 'build', 'main.wasm');
  console.log(`📦 Loading WASM from: ${wasmPath}`);
  
  let byteCode: Uint8Array;
  try {
    byteCode = new Uint8Array(readFileSync(wasmPath));
    console.log(`   Bytecode size: ${byteCode.length} bytes\n`);
  } catch (error) {
    console.error('❌ Failed to read WASM file. Make sure to run "npm run build" first.');
    process.exit(1);
  }

  // Deploy the smart contract
  console.log('🚀 Deploying smart contract...');
  
  try {
    // Use deploySC on provider - returns SmartContract with address
    const contract = await provider.deploySC({
      byteCode: byteCode,
      parameter: new Args(), // Empty args for constructor
      coins: Mas.fromString('0.5'), // Initial coins for storage
      maxGas: 3_980_000_000n, // Max gas for deployment
      waitFinalExecution: false, // Don't wait for final, speculative is faster
    });

    console.log(`\n🎉 CONTRACT DEPLOYED SUCCESSFULLY!`);
    console.log('====================================');
    console.log(`📝 Contract Address: ${contract.address}`);
    console.log('====================================\n');
    
    // Save the contract address to a file for reference
    const outputPath = path.join(__dirname, 'deployed_address.txt');
    writeFileSync(outputPath, contract.address.toString());
    console.log(`💾 Contract address saved to: ${outputPath}`);
    
    return contract.address;
  } catch (error) {
    console.error('\n❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Run deployment
deploy()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Deployment error:', error);
    process.exit(1);
  });
