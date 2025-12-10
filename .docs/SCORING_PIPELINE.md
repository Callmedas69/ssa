# 📄 **SCORING_PIPELINE.md**

```md
# Scoring Pipeline Architecture

This document describes the complete flow for generating, signing, verifying,
and storing reputation scores for the Profile SBT system.

The pipeline has four main phases:

1. **Data Collection (Backend)**
2. **Score Normalization + MetaScore Computation**
3. **EIP-712 Signing**
4. **On-Chain Submission + Storage**

---

# 1. Data Collection Phase

Backend route example:
```

GET /api/social-scores?address=0x...&fid=...

````

The backend fetches raw data from all scoring providers.

### Providers & API Sources
- **Neynar** → Farcaster social score
- **Ethos** → On-chain reputation score
- **Talent Protocol** → Builder + Creator scores
- **Gitcoin Passport** → Identity & sybil resistance
- **Quotient** → Engagement quality (optional)

Each provider has an adapter returning:

```ts
interface ProviderResult {
  providerId: string;
  rawScore: number;
  updatedAt: number;
}
````

---

# 2. Normalization + MetaScore Engine

All provider values are normalized into a 0–100 band.

The normalized values then feed into the MetaScore formula (see metascore_weights.md):

```
MetaScore =
  normEthos        * 0.25 +
  normNeynar       * 0.20 +
  normBuilder      * 0.15 +
  normCreator      * 0.15 +
  normPassport     * 0.15 +
  normQuotient     * 0.10
```

Result:

* `MetaScore` (0–100 integer)
* `ProviderScores` (0–100 per provider)

These values are bundled into the signed payload:

```ts
const scorePayload = {
  user: "0xUser",
  metaScore: 47,
  providers: [
    { id: "ETHOS", score: 44 },
    { id: "NEYNAR", score: 98 },
    { id: "TALENT_BUILDER", score: 50 },
    { id: "TALENT_CREATOR", score: 31 },
    { id: "PASSPORT", score: 27 },
    { id: "QUOTIENT", score: 0 }
  ],
  timestamp: Date.now()
}
```

---

# 3. EIP-712 Signing

The backend signs the payload using domain data:

```ts
{
  name: "SocialScoreHub",
  version: "1",
  chainId: <CHAIN_ID>,
  verifyingContract: <ATTESTATOR_ADDRESS>
}
```

The signature ensures:

* Only the backend can issue legitimate scores.
* Users cannot forge or modify scores.
* Contract can recover signer and validate authenticity.

Output to frontend:

```ts
{
  payload: scorePayload,
  signature: "0x..."
}
```

---

# 4. On-Chain Verification + Storage

Frontend calls:

```ts
socialScoreAttestator.submitScores(payload, signature)
```

The contract:

1. Rebuilds EIP-712 digest
2. Recovers signer
3. Ensures signer == backendAuthority
4. Writes to storage:

```solidity
mapping(address => uint256) metaScore;
mapping(address => mapping(bytes32 providerId)) providerScores;
```

5. Emits:

```
ScoreUpdated(user, providerId, score)
MetaScoreUpdated(user, metaScore)
```

These values become the **single source of truth** on-chain.

---

# 5. SBT Minting (x402 + Voucher Flow)

User pays via x402 → backend verifies payment → backend signs an EIP-712
`MintVoucher`.

Frontend calls:

```ts
profileSBT.mintProfile(voucher, signature);
```

Contract mints a **non-transferable Profile NFT**.

During `tokenURI()`, the contract reads on-chain reputation data and renders:

### Front Side:

* Domain / username
* Avatar
* Chain context

### Back Side:

* MetaScore
* Provider breakdown
* Tier (Bronze / Silver / Gold / Platinum)

---

# 6. Score Refresh Strategy

Because reputation evolves:

* A scheduled backend job (daily/weekly) re-fetches provider scores.
* Frontend offers a **“Refresh Reputation”** button.
* User submits new signed payload to update on-chain state.

This ensures scores always remain fresh without requiring on-chain polling.

---

# 7. Security Principles

* Only backend-signed scores can enter the contract
* User cannot submit self-defined scores
* Scores are immutable until overridden by new signed payload
* Contract stores only final values → efficient gas usage

---

# 8. Modular Extensibility

Adding new providers requires:

1. Implementing a backend adapter
2. Adding normalization rules
3. Assigning a MetaScore weight
4. Updating contract provider ID list

No breaking changes are needed.

---

This document defines the **official scoring flow** for the Profile SBT and SocialScoreAttestator system.

```

---

All done, C.  
If you'd like, I can also generate:

✅ `EIP712_SCORE_PAYLOAD_SCHEMA.md`  
✅ `SOCIAL_SCORE_ATTESTATOR.sol` (full implementation)  
✅ TypeScript backend scoring engine  

Just say **“C, generate EIP-712 docs”** or **“generate contract”**.
```
