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
      bronze: { min: 0, max: 39, label: 'NEWCOMER', color: '#8B8680', message: 'Welcome Aboard!' },
      silver: { min: 40, max: 69, label: 'RISING STAR', color: '#E85D3B', message: 'Rising Star!' },
      gold: { min: 70, max: 89, label: 'TRUSTED', color: '#F4A261', message: 'Trusted Member!' },
      platinum: { min: 90, max: 100, label: 'LEGENDARY', color: '#2A9D8F', message: 'Legendary!' },
    },
  },
} as const;
