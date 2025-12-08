# ABIs for Frontend Integration

This directory contains TypeScript ABI files for your deployed contracts.

## Files

- `ProfileSBT.ts` - Main soulbound token contract ABI
- `addresses.ts` - Contract addresses on Base Mainnet

## Usage

### With wagmi/viem:

```typescript
import { ProfileSBTABI } from './abi/ProfileSBT';
import { CONTRACTS } from './abi/addresses';
import { useWriteContract, useReadContract } from 'wagmi';

// Read contract
const { data: hasMinted } = useReadContract({
  address: CONTRACTS.ProfileSBT,
  abi: ProfileSBTABI,
  functionName: 'hasMinted',
  args: [userAddress],
});

// Write contract
const { writeContract } = useWriteContract();

function mintProfile(voucher, signature) {
  writeContract({
    address: CONTRACTS.ProfileSBT,
    abi: ProfileSBTABI,
    functionName: 'mintProfile',
    args: [voucher, signature],
  });
}
```

### EIP-712 Voucher Signing (Backend):

```typescript
const domain = {
  name: 'ProfileSBT',
  version: '1',
  chainId: 8453,
  verifyingContract: CONTRACTS.ProfileSBT,
};

const types = {
  MintVoucher: [
    { name: 'user', type: 'address' },
    { name: 'expiresAt', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
  ],
};

const voucher = {
  user: '0x...',
  expiresAt: Math.floor(Date.now() / 1000) + 86400,
  nonce: 1,
};

const signature = await signer.signTypedData(domain, types, voucher);
```

## Contract Addresses (Base Mainnet)

- ProfileSBT: `0x4d4b5f15cdf4a0a6a45c8eb4459992eaa2a8ca07`
- SocialScoreAttestator: `0x26596556128c5f19fcab8f1d3752effe562192ae`
- ProfileSBTRenderer: `0xedd2c215feeb3eeedbf5ac30741dad9992eaa2a8ca07`
