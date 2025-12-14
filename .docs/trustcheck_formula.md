Here’s the **tight recap**, focused only on what matters 👇

---

## What You’re Doing Now

* You **weight all providers equally as peers**
* Gitcoin Passport = **18% raw score**
* Everything is normalized + capped
* Math is consistent ✅

---

## The Core Problem

**Gitcoin Passport answers a different question.**

* Others → *what the identity does* (behavior, activity, reputation)
* Passport → *is this likely a real human* (sybil resistance)

Treating Passport as a peer causes:

1. **Sybil-friendly scores** (Passport = 0 but still high SSA)
2. **Checkbox inflation** (Passport alone adds 18 points)

---

## What Should Change (Minimal Fix)

### ✅ Keep your weighted base model

But **remove Passport from the raw sum**.

```
BaseScore = Neynar + Ethos + Quotient + Builder + Creator
```

---

### ✅ Use Gitcoin Passport as confidence control

Not as points.

**Option A (best): Multiplier**

```
Final SSA = BaseScore × SybilMultiplier
```

Example:

* Passport low → ×0.65–0.8
* Passport medium → ×1.0
* Passport high → ×1.15

**Option B: Cap**

* Passport low → score capped (50 / 70)
* Passport high → cap removed

---

## What Stays the Same

* Same providers
* Same normalization
* Same data ingestion
* Same fairness philosophy

Only **aggregation logic changes**.

---

## Final One-Line Takeaway

> **Behavior builds the score.
> Gitcoin Passport decides how much that score can be trusted.**

That’s the whole correction.
