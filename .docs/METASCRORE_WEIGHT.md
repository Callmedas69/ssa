# 📄 **METASCORE_WEIGHTS.md**

```md
# MetaScore Weights Specification

The MetaScore is a unified reputation score (0–100) derived from multiple
identity, social, and on-chain providers. Each provider contributes a
normalized score (0–100), weighted according to signal quality, ecosystem
impact, and reliability.

This document defines the **official MetaScore weights** and the **normalization
strategy** for each provider.

---

## 📊 Providers Used in MetaScore

The system currently integrates six reputation sources:

1. **Ethos** — On-chain credibility  
2. **Neynar** — Farcaster social quality  
3. **Talent Builder** — Developer reputation  
4. **Talent Creator** — Creator reputation  
5. **Gitcoin Passport** — Sybil resistance / identity  
6. **Quotient** — Farcaster engagement quality  

---

## 🎚 Weight Allocation

| Provider          | Weight | Rationale |
|------------------|--------|-----------|
| **Ethos**        | **25%** | Broad on-chain behavior; most universal signal |
| **Neynar**       | **20%** | Strongest social graph indicator |
| **Talent Builder** | **15%** | Developer identity is core for Web3 profiles |
| **Talent Creator** | **15%** | Content creation is an essential identity signal |
| **Gitcoin Passport** | **15%** | Sybil resistance and identity trustworthiness |
| **Quotient**     | **10%** | Engagement quality; optional but helpful |

Total: **100%**

These weights were selected to balance:
- On-chain reputation  
- Social reputation  
- Identity trust  
- Builder/creator reputation  
- Engagement quality  

---

## 🔢 Normalization Rules (Raw → 0–100)

Raw values from providers may vary widely. Each is normalized into a standard
0–100 range before weighting.

### **Neynar (0 → 1)**
```

normNeynar = rawNeynar * 100

```

### **Ethos (0 → 2800)**
```

normEthos = (rawEthos / 2800) * 100

```

### **Talent Builder (uncapped → cap at 300)**
```

normBuilder = min(rawBuilder / 300 * 100, 100)

```

### **Talent Creator (uncapped → cap at 300)**
```

normCreator = min(rawCreator / 300 * 100, 100)

```

### **Passport (0 → 100)**
```

normPassport = rawPassport

```

### **Quotient (0 → 1)**
- Missing profile → `0`
```

normQuotient = rawQuotient * 100

```

---

## 🧮 MetaScore Formula

After normalization:

```

MetaScore =
normEthos        * 0.25 +
normNeynar       * 0.20 +
normBuilder      * 0.15 +
normCreator      * 0.15 +
normPassport     * 0.15 +
normQuotient     * 0.10

```

Clamp to 0–100:
```

MetaScore = round( clamp(MetaScore, 0, 100) )

```

---

## 🏅 Tiering (Optional)

| Tier       | Range |
|------------|--------|
| Bronze     | 0–39 |
| Silver     | 40–69 |
| Gold       | 70–89 |
| Platinum   | 90–100 |

Tiers may be used in Profile SBT rendering.

---

## 📌 Notes

- If a provider is missing, weights are automatically **rebalanced proportionally**.
- Future providers can be added modularly without breaking the schema.
- Different ecosystems may adjust caps (300 for Talent, 2800 for Ethos) as datasets evolve.

---

This document defines the **canonical** weighting and normalization for the
MetaScore system.
```

---

