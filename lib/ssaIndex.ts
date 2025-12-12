import { providerRegistry, normalizeScore, type ProviderResult } from './providers';
import type { SSAIndex, SSAIndexTier, SSAIndexBreakdown } from './types';

// Tier thresholds - single source of truth
export const TIERS = {
  platinum: { min: 90, max: 100 },
  gold: { min: 70, max: 89 },
  silver: { min: 40, max: 69 },
  bronze: { min: 0, max: 39 },
} as const;

// Tier display labels
export const TIER_LABELS: Record<SSAIndexTier, string> = {
  bronze: "NEWCOMER",
  silver: "RISING STAR",
  gold: "TRUSTED",
  platinum: "LEGENDARY",
} as const;

/**
 * Determine tier based on score
 */
function getTier(score: number): SSAIndexTier {
  if (score >= TIERS.platinum.min) return 'platinum';
  if (score >= TIERS.gold.min) return 'gold';
  if (score >= TIERS.silver.min) return 'silver';
  return 'bronze';
}

/**
 * Calculate SSA Index from provider results
 * Uses provider registry for weights and normalization
 */
export function calculateSSAIndex(results: Map<string, ProviderResult | null>): SSAIndex {
  const providers = providerRegistry.getEnabled();
  const breakdown: SSAIndexBreakdown[] = [];
  let totalWeight = 0;
  let weightedSum = 0;

  for (const provider of providers) {
    const result = results.get(provider.id);
    const rawScore = result?.score ?? null;
    const weight = provider.weight;

    let normalizedScore = 0;
    let contribution = 0;

    if (rawScore !== null) {
      normalizedScore = normalizeScore(rawScore, provider);
      contribution = normalizedScore * weight;
      totalWeight += weight;
      weightedSum += contribution;
    }

    breakdown.push({
      provider: provider.id as SSAIndexBreakdown['provider'],
      rawScore,
      normalizedScore,
      weight,
      contribution,
    });
  }

  // Calculate final score with proportional rebalancing
  const finalScore = totalWeight > 0
    ? Math.round((weightedSum / totalWeight) * 100) / 100
    : 0;

  // Clamp to 0-100
  const clampedScore = Math.max(0, Math.min(100, Math.round(finalScore)));

  return {
    score: clampedScore,
    tier: getTier(clampedScore),
    breakdown,
  };
}

/**
 * Legacy compatibility: Calculate SSA Index from old-style provider scores object
 * @deprecated Use calculateSSAIndex with Map instead
 */
export function calculateSSAIndexLegacy(scores: {
  neynar: { score: number } | null;
  ethos: { score: number } | null;
  talentBuilder: { score: number } | null;
  talentCreator: { score: number } | null;
  quotient: { score: number } | null;
  passport: { score: number } | null;
}): SSAIndex {
  const results = new Map<string, ProviderResult | null>();

  // Convert legacy format to Map
  for (const [key, value] of Object.entries(scores)) {
    if (value && 'score' in value) {
      results.set(key, { score: value.score, metadata: value as Record<string, unknown> });
    } else {
      results.set(key, null);
    }
  }

  return calculateSSAIndex(results);
}
