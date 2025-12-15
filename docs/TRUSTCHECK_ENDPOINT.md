# TrustCheck Trusted Network API

## Overview

The Trusted Network is a public directory of TrustCheck-verified addresses. It provides third-party utility for DAOs, projects, and platforms seeking verified, reputable users.

### Use Cases

- **DAOs** - Vet contributors before grants
- **Projects** - Find trusted beta testers
- **Airdrops** - Target real humans, exclude bots
- **Hiring** - Discover reputable collaborators

---

## Database Schema (Supabase PostgreSQL)

```sql
CREATE TABLE trusted_network (
  id SERIAL PRIMARY KEY,
  address VARCHAR(42) NOT NULL UNIQUE,

  -- Identity
  fid INTEGER,
  farcaster_username VARCHAR(255),
  display_name VARCHAR(255),
  pfp_url TEXT,
  ens VARCHAR(255),
  basename VARCHAR(255),

  -- Social Metrics
  follower_count INTEGER DEFAULT 0,

  -- TrustCheck Scores
  ssa_score INTEGER,
  ssa_tier VARCHAR(20),

  -- Provider Scores (raw)
  neynar_score DECIMAL,
  ethos_score DECIMAL,
  quotient_score DECIMAL,
  talent_builder DECIMAL,
  talent_creator DECIMAL,
  passport_score DECIMAL,

  -- SBT Data
  token_id INTEGER,
  attested_at TIMESTAMP,

  -- TrustCheck Tenure
  first_attested_at TIMESTAMP,
  attestation_count INTEGER DEFAULT 1,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX idx_address ON trusted_network(address);
CREATE INDEX idx_tier ON trusted_network(ssa_tier);
CREATE INDEX idx_score ON trusted_network(ssa_score DESC);
CREATE INDEX idx_fid ON trusted_network(fid);
CREATE INDEX idx_follower ON trusted_network(follower_count DESC);
```

---

## API Endpoints

### List All Verified Users

```
GET /api/trusted-network
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 50, max: 100) |
| `tier` | string | Filter by tier: `legendary`, `trusted`, `rising_star`, `newcomer` |
| `minScore` | number | Minimum TrustCheck score (0-100) |
| `minFollowers` | number | Minimum follower count |
| `verified` | boolean | Only passport-verified users |
| `orderBy` | string | Sort field: `score`, `attested_at`, `followers` (default: `score`) |

**Example:**
```
GET /api/trusted-network?tier=legendary&minScore=90&limit=20
```

---

### Single Address Lookup

```
GET /api/trusted-network/[address]
```

**Example:**
```
GET /api/trusted-network/0x1234567890abcdef1234567890abcdef12345678
```

---

## Response Schema

### List Response

```json
{
  "success": true,
  "data": [
    {
      "address": "0x1234...abcd",
      "fid": 12345,
      "farcaster_username": "harry",
      "display_name": "Harry",
      "pfp_url": "https://...",
      "ens": "harry.eth",
      "basename": "harry.base.eth",
      "follower_count": 1250,
      "ssa_score": 85,
      "ssa_tier": "trusted",
      "passport_score": 42,
      "passport_status": "verified",
      "token_id": 123,
      "attested_at": "2025-01-15T10:30:00Z",
      "first_attested_at": "2025-01-10T08:00:00Z",
      "attestation_count": 3
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1234,
    "totalPages": 25
  }
}
```

### Single Address Response

```json
{
  "success": true,
  "data": {
    "address": "0x1234...abcd",
    "fid": 12345,
    "farcaster_username": "harry",
    "display_name": "Harry",
    "pfp_url": "https://...",
    "ens": "harry.eth",
    "basename": "harry.base.eth",
    "follower_count": 1250,
    "ssa_score": 85,
    "ssa_tier": "trusted",
    "scores": {
      "neynar": 80,
      "ethos": 75,
      "quotient": 90,
      "talent_builder": 85,
      "talent_creator": 70
    },
    "passport_score": 42,
    "passport_status": "verified",
    "token_id": 123,
    "attested_at": "2025-01-15T10:30:00Z",
    "first_attested_at": "2025-01-10T08:00:00Z",
    "attestation_count": 3
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Address not found in Trusted Network"
}
```

---

## Tier Definitions

| Tier | Score Range |
|------|-------------|
| Legendary | 90+ |
| Trusted | 70-89 |
| Rising Star | 40-69 |
| Newcomer | 0-39 |

---

## Passport Status

| Status | Passport Score |
|--------|----------------|
| `verified` | 20+ |
| `unverified` | < 20 |

---

## Implementation Steps

1. **Setup Supabase**
   - Create project at supabase.com
   - Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` to `.env.local`

2. **Create Database Table**
   - Run the SQL schema above in Supabase SQL Editor

3. **Integrate with Mint Flow**
   - After successful SBT mint, insert/update record in `trusted_network` table

4. **Build API Endpoints**
   - `app/api/trusted-network/route.ts` - List endpoint
   - `app/api/trusted-network/[address]/route.ts` - Single lookup

5. **(Optional) Build Directory UI**
   - `/directory` page with search and filters

---

## Rate Limits

- 100 requests per minute per IP
- Contact for higher limits

---

## Environment Variables

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
```
