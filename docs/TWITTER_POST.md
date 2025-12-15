# TrustCheck Twitter Posts

## Marketing Style Posts

### Thread Opener (Hook)
```
Your onchain reputation is scattered across 5+ platforms.

Nobody can see the full picture.

TrustCheck changes that.

One score. One attestation. One verifiable you.

Check your SSA Index now
[link]
```

### FOMO/Social Proof
```
Are you a Legendary, Trusted, or Rising Star?

TrustCheck aggregates your:
→ Farcaster influence
→ Onchain credibility
→ Builder reputation
→ Creator score
→ Identity verification

Into ONE verifiable number.

Mint your Soulbound reputation. Own your score.
```

### Feature Highlight
```
Your reputation shouldn't live in 5 different dashboards.

TrustCheck combines:
• Neynar (Farcaster)
• Ethos (Onchain)
• Talent Protocol (Builder + Creator)
• Quotient (Engagement)
• Gitcoin Passport (Identity)

= Your SSA Index (0-100)

Attest it onchain. Mint your SBT. Share your tier.
```

### Short Punchy
```
Stop collecting scores. Start proving reputation.

TrustCheck → 5 providers → 1 SSA Index → Onchain forever

What's your tier?
```

### Farcaster Mini App Launch
```
TrustCheck is now a Farcaster Mini App

Check your unified reputation score directly in Warpcast.

No new tabs. No wallet switching. Just tap and see.

Available now in @warpcast
```

---

## Technical Style Posts

### Architecture Overview
```
How TrustCheck works (technical deep dive):

1. Query 5 score APIs in parallel
2. Normalize each to 0-100 scale
3. Weighted average → SSA Index
4. Backend signs EIP-712 payload
5. User submits to Base contract
6. 24hr cooldown prevents spam
7. Mint SBT via voucher signature

All verifiable. All onchain.
```

### Smart Contract Focus
```
TrustCheck contracts on @base:

ProfileSBT: 0x4d4b5F...8cA07
→ Soulbound. Non-transferable. Your reputation.

SocialScoreAttestator: 0xF024...1DaD
→ Score registry with 24hr cooldown
→ EIP-712 signature validation

UUPS upgradeable. Future-proof.
```

### Developer/Composability
```
Building reputation-gated features?

TrustCheck's SocialScoreAttestator is a composable primitive.

Just read from our contract:
→ lastUpdated(address)
→ Get verified scores

No API keys. No trust assumptions. Just onchain reads.

Build on Base. Read our registry.
```

### Provider Integration
```
TrustCheck normalization model:

Neynar: 0-1 → 0-100
Ethos: 0-2800 → 0-100
Talent Builder: uncapped → normalized at 1000
Talent Creator: uncapped → normalized at 1000
Quotient: 0-1 → 0-100
Passport: 0-100 (displayed separately)

Weighted average. Proportional rebalancing for missing data. Clamped 0-100.
```

### Security Focused
```
How TrustCheck prevents score manipulation:

✓ Backend-signed EIP-712 payloads
✓ Contract validates signer address
✓ 24-hour cooldown between submissions
✓ Rate limiting (10 req/min per IP)
✓ Soulbound = no reputation trading

Your score. Verifiable. Tamper-proof.
```

### Stack Flex
```
TrustCheck stack:

Frontend: Next.js 16 + Tailwind + shadcn/ui
Wallet: wagmi + RainbowKit
Chain: Base Mainnet
Contracts: UUPS upgradeable proxies
Auth: EIP-712 typed signatures
Cache: React Query (5min stale, 30min GC)
Platform: Farcaster Mini App native

Fast. Simple. Onchain.
```

---

## Usage Guide

| Style | Focus | Best For |
|-------|-------|----------|
| **Marketing** | Value prop, tiers, FOMO, social proof | User acquisition, viral potential |
| **Technical** | Architecture, contracts, composability | Developer mindshare, protocol partnerships |

**Recommendation:** Start with the Marketing Thread Opener to capture attention, then follow up with the Architecture Overview for technical credibility.
