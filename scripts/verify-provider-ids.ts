/**
 * Verification script to check if provider IDs match contract constants
 * Run with: npx tsx scripts/verify-provider-ids.ts
 */

import { keccak256, toBytes } from 'viem';

// Provider config IDs (camelCase) - these get uppercased to match deployed contract
const PROVIDER_CONFIG_IDS = [
  'ethos',
  'neynar',
  'talentBuilder',
  'talentCreator',
  'passport',
  'quotient',
] as const;

// Provider IDs from console log (truncated)
const CONSOLE_LOG_IDS = [
  '0xe2d80ec67da1ba0903493542957d0b324290cfc686e0e7ec6797916960833925',
  '0xce5f729620e102f0dbd6ae8f0512a9975ead77639fa81bd6ad3e3a0f0fdbefff',
  '0x35fc1e193b942ccbc0e95061827e8cc66dc8240aa1146259a26635f7a549b9f5',
  '0x7704a459c36ff913cac6a9952477e908a0de9d4c45fc219a16f269e137cb1542',
  '0xf0394fe85e01da6124457b01aba2af68d2ca992423ab678d107bd155bd575f5a',
  '0x182df985acd3aa110a13a97aa8ed9b1d53c26db260279a9a5312ba12d8145bf1',
];

console.log('=== Provider ID Verification ===\n');

// Calculate expected provider IDs (matching registry.ts logic)
const calculated: Record<string, string> = {};
for (const providerId of PROVIDER_CONFIG_IDS) {
  // Match registry.ts: config.id.toUpperCase()
  const normalizedId = providerId.toUpperCase();
  const hash = keccak256(toBytes(normalizedId));
  calculated[providerId] = hash;
  console.log(`${providerId} (-> ${normalizedId}):`);
  console.log(`  Calculated: ${hash}`);
}

console.log('\n=== Comparing with Console Log IDs ===\n');

// Try to match console log IDs with calculated ones
for (let i = 0; i < CONSOLE_LOG_IDS.length; i++) {
  const consoleId = CONSOLE_LOG_IDS[i];
  console.log(`Console Log ID ${i + 1}: ${consoleId}`);
  
  let matched = false;
  for (const [provider, calculatedId] of Object.entries(calculated)) {
    if (calculatedId.toLowerCase() === consoleId.toLowerCase()) {
      console.log(`  ✓ Matches: ${provider}`);
      matched = true;
      break;
    }
  }
  
  if (!matched) {
    console.log(`  ✗ No match found!`);
    // Check if it's close to any calculated ID
    for (const [provider, calculatedId] of Object.entries(calculated)) {
      const prefixMatch = calculatedId.slice(0, 10) === consoleId.slice(0, 10);
      if (prefixMatch) {
        console.log(`  ⚠ Prefix matches ${provider} but full hash differs`);
        console.log(`    Expected: ${calculatedId}`);
        console.log(`    Got:      ${consoleId}`);
      }
    }
  }
  console.log();
}

