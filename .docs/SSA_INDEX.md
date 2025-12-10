# SSA Index Specification

**SSA Index** (Social Score Attestator Index) is a unified score (0–100) that aggregates multiple identity, social, and on-chain signals to verify that a wallet belongs to a real, legitimate user.

Like a financial index (S&P 500), the SSA Index combines weighted components from multiple providers into a single, meaningful number.

This document defines the **official SSA Index weights** and the **normalization strategy** for each provider.

---

## 📊 Providers Used in SSA Index

The system currently integrates six attestation sources:

| Provider | Category | What It Proves |
|----------|----------|----------------|
| **Ethos** | On-chain credibility | Real on-chain history |
| **Neynar** | Farcaster social quality | Real social connections |
| **Talent Builder** | Developer reputation | Real dev contributions |
| **Talent Creator** | Creator reputation | Real content creation |
| **Gitcoin Passport** | Sybil resistance | User is human |
| **Quotient** | Engagement quality | Real engagement patterns |

**Combined = This wallet belongs to a REAL person with REAL activity**

---

## 🎚 Weight Allocation

| Provider           | Weight   | Rationale |
|--------------------|----------|-----------|
| **Ethos**          | **20%**  | Broad on-chain behavior; universal signal |
| **Neynar**         | **20%**  | Strongest social graph indicator |
| **Talent Builder** | **15%**  | Developer identity is core for Web3 profiles |
| **Talent Creator** | **12%**  | Content creation is valuable but secondary to builder |
| **Gitcoin Passport** | **18%** | Sybil resistance is foundational for identity trust |
| **Quotient**       | **15%**  | Engagement quality; strong signal against bots |

Total: **100%**

### Rationale for Weight Distribution

- **Passport (18%)** elevated: Without identity verification, other scores are meaningless
- **Quotient (15%)** elevated: Quality engagement filters out bots and low-effort accounts
- **Ethos (20%)** reduced: Important but shouldn't dominate
- **Creator (12%)** reduced: Valuable but less critical than builder reputation

These weights balance:
- On-chain reputation (Ethos)
- Social reputation (Neynar)
- Identity trust (Passport)
- Builder/creator reputation (Talent)
- Engagement quality (Quotient)

---

## 🔢 Normalization Rules (Raw → 0–100)

Raw values from providers vary widely. Each is normalized into a standard
0–100 range before weighting.

### **Neynar (0 → 1)**
```
normNeynar = rawNeynar * 100
```

### **Ethos (0 → 2800)**
```
normEthos = (rawEthos / 2800) * 100
```

### **Talent Builder (uncapped → cap at 200)**
```
normBuilder = min(rawBuilder / 200 * 100, 100)
```
> Note: Cap at 200. Most legitimate users score 50-150.
> This creates better distribution without losing granularity.

### **Talent Creator (uncapped → cap at 200)**
```
normCreator = min(rawCreator / 200 * 100, 100)
```

### **Passport (0 → 100)**
```
normPassport = rawPassport
```
> Already 0-100 scale. Linear normalization is sufficient.

### **Quotient (0 → 1)**
```
normQuotient = rawQuotient * 100
```
> Missing profile → `0`

---

## 🧮 SSA Index Formula

After normalization:

```
SSAIndex =
  normEthos        * 0.20 +
  normNeynar       * 0.20 +
  normBuilder      * 0.15 +
  normCreator      * 0.12 +
  normPassport     * 0.18 +
  normQuotient     * 0.15
```

Clamp to 0–100:
```
SSAIndex = round( clamp(SSAIndex, 0, 100) )
```

---

## 🔄 Missing Provider Strategy

When a provider score is unavailable (API error, no profile, etc.), use
**proportional rebalancing**:

```typescript
// Calculate available weight from providers with data
const availableWeight = providers
  .filter(p => p.score !== null)
  .reduce((sum, p) => sum + p.weight, 0);

// Sum weighted normalized scores
const rawScore = providers
  .filter(p => p.score !== null)
  .reduce((sum, p) => sum + p.normalizedScore * p.weight, 0);

// Scale to full 0-100 range
const ssaIndex = Math.round((rawScore / availableWeight) * 100) / 100;
```

This approach:
- Keeps calculation simple (KISS)
- Fairly represents available data
- Doesn't penalize users for missing providers
- Doesn't artificially inflate scores

---

## 🏅 Tiering

| Tier       | Range   | Description |
|------------|---------|-------------|
| Bronze     | 0–39    | Entry level |
| Silver     | 40–69   | Established |
| Gold       | 70–89   | Highly trusted |
| Platinum   | 90–100  | Elite |

Tiers are used in Profile SBT rendering and visual badges.

---

## 📌 Implementation Notes

1. **No freshness decay** — Keep it simple. Users can manually refresh scores.
2. **Future providers** can be added modularly without breaking the schema.
3. **Caps may evolve** — As datasets grow, caps (200 for Talent, 2800 for Ethos) may be adjusted.
4. **TypeScript constants** for implementation:

```typescript
export const SSA_INDEX_WEIGHTS = {
  ethos: 0.20,
  neynar: 0.20,
  talentBuilder: 0.15,
  talentCreator: 0.12,
  passport: 0.18,
  quotient: 0.15,
} as const;

export const SSA_INDEX_CAPS = {
  ethos: 2800,
  neynar: 1,        // multiply by 100
  talentBuilder: 200,
  talentCreator: 200,
  passport: 100,    // already normalized
  quotient: 1,      // multiply by 100
} as const;

export const SSA_INDEX_TIERS = {
  bronze: { min: 0, max: 39, label: 'Bronze' },
  silver: { min: 40, max: 69, label: 'Silver' },
  gold: { min: 70, max: 89, label: 'Gold' },
  platinum: { min: 90, max: 100, label: 'Platinum' },
} as const;

export type SSAIndexTier = keyof typeof SSA_INDEX_TIERS;
```

---

## 🏷 Naming Convention

| Term | Usage |
|------|-------|
| **SSA Index** | Full name in UI |
| **SSA Index Score** | Formal reference |
| **ssaIndex** | Variable name in code |
| **SSAIndex** | Type name |
| **SSAIndexTier** | Tier type |
| **Provider Scores** | Individual scores (Ethos, Neynar, etc.) |

---

## 🏗 Implementation Architecture

### File Structure

```
lib/
├── config.ts              # Centralized config (weights, caps, tiers)
├── types.ts               # Global types (SSAIndex, SSAIndexTier)
├── ssaIndex.ts            # Calculation logic module
└── providers/             # Individual provider fetchers
    ├── neynar.ts
    ├── ethos.ts
    ├── talent.ts
    ├── quotient.ts
    └── passport.ts

app/
└── api/
    └── scores/
        └── route.ts       # API endpoint (fetches + calculates)

components/
├── SSAIndexCard.tsx       # Hero display component
├── ScoreCard.tsx          # Individual provider card
└── ScoresDashboard.tsx    # Main dashboard layout
```

### Data Flow

```
1. User connects wallet
           ↓
2. Frontend calls GET /api/scores?address=0x...
           ↓
3. API route fetches all 6 providers in parallel
           ↓
4. calculateSSAIndex() normalizes & weights scores
           ↓
5. Response includes provider scores + ssaIndex
           ↓
6. Dashboard renders SSAIndexCard (hero) + 6 ScoreCards
```

### Type Definitions

```typescript
// SSA Index result (always calculated, never null)
interface SSAIndex {
  score: number;           // 0-100 final score
  tier: SSAIndexTier;      // bronze | silver | gold | platinum
  breakdown: {
    provider: ScoreProvider;
    rawScore: number | null;
    normalizedScore: number;
    weight: number;
    contribution: number;
  }[];
}

// Updated SocialScores includes ssaIndex
interface SocialScores {
  neynar: NeynarScore | null;
  ethos: EthosScore | null;
  talentBuilder: TalentBuilderScore | null;
  talentCreator: TalentCreatorScore | null;
  quotient: QuotientScore | null;
  passport: PassportScore | null;
  ssaIndex: SSAIndex;
}
```

### UI Layout

```
┌─────────────────────────────────────────────────────┐
│                  SSA INDEX                          │
│                     74                              │
│              ████████████░░░░                       │
│                    GOLD                             │
└─────────────────────────────────────────────────────┘

┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ Neynar  │ │  Ethos  │ │ Builder │ │ Creator │ │Quotient │ │Passport │
│  0.98   │ │  1240   │ │   85    │ │   42    │ │  0.75   │ │  26.7   │
└─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘
```

### Tier Colors

| Tier | Color | Hex |
|------|-------|-----|
| Bronze | 🥉 | #CD7F32 |
| Silver | 🥈 | #C0C0C0 |
| Gold | 🥇 | #FFD700 |
| Platinum | 💎 | #E5E4E2 |

---

This document defines the **canonical** weighting and normalization for the
SSA Index system.

Last updated: December 2024
