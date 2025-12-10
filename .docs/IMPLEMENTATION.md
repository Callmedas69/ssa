# Plan: Smart Contracts + EIP-712 Signing Backend

Build the on-chain attestation system with two smart contracts and EIP-712 signing backend.

---

## Overview

**Goal**: Allow users to submit their SSA Index + provider scores on-chain with EIP-712 signature verification.

**Components**:
1. `SocialScoreAttestator.sol` - Verifies & stores scores on-chain
2. `ProfileSBT.sol` - Optional soulbound profile NFT
3. EIP-712 signing API endpoint
4. Submission UI flow

---

## Phase 1: Foundry Project Setup

### Files to Create
```
contracts/
├── foundry.toml
├── .gitignore
├── src/
│   ├── SocialScoreAttestator.sol
│   └── ProfileSBT.sol
├── script/
│   └── Deploy.s.sol
└── test/
    └── SocialScoreAttestator.t.sol
```

### Dependencies
- OpenZeppelin Contracts Upgradeable v5.x
- Forge Std

---

## Phase 2: SocialScoreAttestator.sol

### Key Changes from Architecture Doc
- Rename `MetaScore` → `SSAIndex` (per user's choice)
- Keep `SocialScoreHub` domain name for EIP-712 compatibility

### Contract Features
- UUPS upgradeable proxy pattern
- EIP-712 signature verification
- `submitScores(ScorePayload, signature)` - stores scores on-chain
- `setBackendSigner(address)` - owner only
- `setAllowedProvider(bytes32, bool)` - owner only
- `maxTimestampSkew` - 1 day default for replay protection

### Storage
```solidity
mapping(address => uint256) public ssaIndexScores;
mapping(address => mapping(bytes32 => ProviderScore)) public providerScores;
mapping(bytes32 => bool) public allowedProviders;
```

### EIP-712 Types
```solidity
bytes32 constant SCORE_PAYLOAD_TYPEHASH = keccak256(
  "ScorePayload(address user,uint256 ssaIndex,bytes32[] providers,uint256[] scores,uint256 timestamp)"
);
```

---

## Phase 3: Provider ID Constants

### `lib/contracts/providerIds.ts`
```typescript
import { keccak256, toBytes } from 'viem';

export const PROVIDER_IDS = {
  ETHOS: keccak256(toBytes('ETHOS')),
  NEYNAR: keccak256(toBytes('NEYNAR')),
  TALENT_BUILDER: keccak256(toBytes('TALENT_BUILDER')),
  TALENT_CREATOR: keccak256(toBytes('TALENT_CREATOR')),
  PASSPORT: keccak256(toBytes('PASSPORT')),
  QUOTIENT: keccak256(toBytes('QUOTIENT')),
} as const;
```

---

## Phase 4: EIP-712 Signing API

### `app/api/sign-scores/route.ts`

**Flow**:
1. Receive user address
2. Fetch all provider scores (reuse existing logic)
3. Calculate SSA Index
4. Build ScorePayload with normalized scores (0-100)
5. Sign with backend private key using EIP-712
6. Return `{ payload, signature }`

### Environment Variables
```
BACKEND_SIGNER_PRIVATE_KEY=0x...  # New
SSA_ATTESTATOR_ADDRESS=0x...       # After deployment
```

### Security
- Reuse rate limiting from `/api/scores`
- Validate address with viem
- Use `signTypedData` from viem account

---

## Phase 5: Frontend Submission Flow

### New Files
- `lib/contracts/abi.ts` - Contract ABIs
- `lib/contracts/config.ts` - Contract addresses
- `components/SubmitScoresButton.tsx` - UI component
- `hooks/useSubmitScores.ts` - wagmi hook

### Flow
1. User clicks "Attest On-Chain"
2. Frontend calls `/api/sign-scores?address=...`
3. Receives `{ payload, signature }`
4. Calls `socialScoreAttestator.submitScores(payload, signature)` via wagmi

### UI States
- Loading (fetching signature)
- Ready (show gas estimate)
- Submitting (tx pending)
- Success (show tx hash)
- Error (show message)

---

## Phase 6: ProfileSBT.sol (Optional - Phase 2)

Soulbound NFT with voucher-based minting. Can be deferred if not immediately needed.

### Features
- Non-transferable (approvals disabled)
- EIP-712 `MintVoucher` for gated minting
- One profile per wallet
- Links to SocialScoreAttestator for score reading

---

## File Changes Summary

### New Files
| Path | Purpose |
|------|---------|
| `contracts/foundry.toml` | Foundry config |
| `contracts/src/SocialScoreAttestator.sol` | Main attestation contract |
| `contracts/src/ProfileSBT.sol` | Soulbound profile NFT |
| `contracts/script/Deploy.s.sol` | Deployment script |
| `lib/contracts/providerIds.ts` | bytes32 provider ID constants |
| `lib/contracts/abi.ts` | Contract ABIs |
| `lib/contracts/config.ts` | Contract addresses |
| `app/api/sign-scores/route.ts` | EIP-712 signing endpoint |
| `components/SubmitScoresButton.tsx` | Attestation button |
| `hooks/useSubmitScores.ts` | wagmi submission hook |

### Modified Files
| Path | Changes |
|------|---------|
| `.env.local` | Add `BACKEND_SIGNER_PRIVATE_KEY` |
| `package.json` | No changes needed (viem already installed) |
| `components/ScoresDashboard.tsx` | Add SubmitScoresButton |

---

## Execution Order

1. Create Foundry project structure
2. Implement SocialScoreAttestator.sol (SSA Index naming)
3. Create provider ID constants
4. Create EIP-712 signing API endpoint
5. Add ABIs and contract config
6. Create submission UI components
7. Integrate into ScoresDashboard
8. (Later) Implement ProfileSBT.sol

---

## Notes

- **Gas**: Base L2, gas is cheap - no optimization needed
- **KISS**: Start with SocialScoreAttestator only, ProfileSBT can come later
- **Security**: Backend signer key must be secure (use env vars, never commit)
- **Upgradeable**: UUPS pattern allows future updates without redeployment
