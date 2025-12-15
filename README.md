# TrustCheck

An aggregated onchain reputation score that combines multiple well-known reputation providers into a single metric. Attest your scores to the blockchain and mint a Soulbound Token (SBT) on Base.

## Score Providers

| Provider | Description |
|----------|-------------|
| Neynar | Farcaster Influence |
| Ethos | Credibility |
| Quotient | Engagement Quality |
| Talent Builder | Onchain Builder |
| Talent Creator | Content Creator |

**Note:** Human Passport (Gitcoin) measures sybil resistance and is displayed separately from the behavior score.

## Score Calculation

Your TrustCheck score is a weighted average of normalized scores from each behavior provider (0-100 scale).

```
TrustCheck = Σ(score × weight)
```

### Tiers

| Tier | Range |
|------|-------|
| Legendary | 90+ |
| Trusted | 70-89 |
| Rising Star | 40-69 |
| Newcomer | 0-39 |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Tech Stack

- Next.js 16
- TypeScript
- Tailwind CSS
- wagmi / RainbowKit
- Base Network
