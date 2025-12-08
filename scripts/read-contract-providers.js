const { createPublicClient, http } = require('viem');
const { base } = require('viem/chains');

const client = createPublicClient({
  chain: base,
  transport: http(),
});

const contractAddress = '0xf02419b54aedd2c215feeb3eeedbf5ac30741dad';

const abi = [
  {
    "type": "function",
    "name": "PROVIDER_ETHOS",
    "inputs": [],
    "outputs": [{ "name": "", "type": "bytes32", "internalType": "bytes32" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "PROVIDER_NEYNAR",
    "inputs": [],
    "outputs": [{ "name": "", "type": "bytes32", "internalType": "bytes32" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "PROVIDER_TALENT_BUILDER",
    "inputs": [],
    "outputs": [{ "name": "", "type": "bytes32", "internalType": "bytes32" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "PROVIDER_TALENT_CREATOR",
    "inputs": [],
    "outputs": [{ "name": "", "type": "bytes32", "internalType": "bytes32" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "PROVIDER_PASSPORT",
    "inputs": [],
    "outputs": [{ "name": "", "type": "bytes32", "internalType": "bytes32" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "PROVIDER_QUOTIENT",
    "inputs": [],
    "outputs": [{ "name": "", "type": "bytes32", "internalType": "bytes32" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isProviderAllowed",
    "inputs": [{ "name": "providerId", "type": "bytes32", "internalType": "bytes32" }],
    "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
    "stateMutability": "view"
  }
];

async function main() {
  console.log('Reading provider constants from deployed contract...\n');
  
  const ethos = await client.readContract({
    address: contractAddress,
    abi,
    functionName: 'PROVIDER_ETHOS',
  });
  
  const neynar = await client.readContract({
    address: contractAddress,
    abi,
    functionName: 'PROVIDER_NEYNAR',
  });
  
  const talentBuilder = await client.readContract({
    address: contractAddress,
    abi,
    functionName: 'PROVIDER_TALENT_BUILDER',
  });
  
  const talentCreator = await client.readContract({
    address: contractAddress,
    abi,
    functionName: 'PROVIDER_TALENT_CREATOR',
  });
  
  const passport = await client.readContract({
    address: contractAddress,
    abi,
    functionName: 'PROVIDER_PASSPORT',
  });
  
  const quotient = await client.readContract({
    address: contractAddress,
    abi,
    functionName: 'PROVIDER_QUOTIENT',
  });
  
  console.log('Contract Provider Constants:');
  console.log('============================');
  console.log('PROVIDER_ETHOS:          ', ethos);
  console.log('PROVIDER_NEYNAR:         ', neynar);
  console.log('PROVIDER_TALENT_BUILDER: ', talentBuilder);
  console.log('PROVIDER_TALENT_CREATOR: ', talentCreator);
  console.log('PROVIDER_PASSPORT:       ', passport);
  console.log('PROVIDER_QUOTIENT:       ', quotient);
  
  console.log('\nChecking if they are allowed:');
  console.log('============================');
  
  const providers = {
    'ETHOS': ethos,
    'NEYNAR': neynar,
    'TALENT_BUILDER': talentBuilder,
    'TALENT_CREATOR': talentCreator,
    'PASSPORT': passport,
    'QUOTIENT': quotient,
  };
  
  for (const [name, id] of Object.entries(providers)) {
    const allowed = await client.readContract({
      address: contractAddress,
      abi,
      functionName: 'isProviderAllowed',
      args: [id],
    });
    console.log(`${name}: ${allowed ? '✓ ALLOWED' : '✗ NOT ALLOWED'}`);
  }
  
  // Also check the calculated IDs
  const { keccak256, toBytes } = require('viem');
  const calculatedBuilder = keccak256(toBytes('TALENTBUILDER'));
  const calculatedCreator = keccak256(toBytes('TALENTCREATOR'));
  
  console.log('\nChecking calculated IDs (without underscores):');
  console.log('==============================================');
  const allowedBuilder = await client.readContract({
    address: contractAddress,
    abi,
    functionName: 'isProviderAllowed',
    args: [calculatedBuilder],
  });
  console.log(`TALENTBUILDER (${calculatedBuilder}): ${allowedBuilder ? '✓ ALLOWED' : '✗ NOT ALLOWED'}`);
  
  const allowedCreator = await client.readContract({
    address: contractAddress,
    abi,
    functionName: 'isProviderAllowed',
    args: [calculatedCreator],
  });
  console.log(`TALENTCREATOR (${calculatedCreator}): ${allowedCreator ? '✓ ALLOWED' : '✗ NOT ALLOWED'}`);
}

main().catch(console.error);
