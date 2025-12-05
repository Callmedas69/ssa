/**
 * Application configuration
 * Provider-specific config (weights, caps) is now in lib/providers/fetchers/*.ts
 */
export const config = {
  chains: {
    base: {
      id: 8453,
      name: 'Base',
    },
  },
  ssaIndex: {
    tiers: {
      bronze: { min: 0, max: 39, label: 'Bronze', color: '#CD7F32' },
      silver: { min: 40, max: 69, label: 'Silver', color: '#C0C0C0' },
      gold: { min: 70, max: 89, label: 'Gold', color: '#FFD700' },
      platinum: { min: 90, max: 100, label: 'Platinum', color: '#E5E4E2' },
    },
  },
} as const;
