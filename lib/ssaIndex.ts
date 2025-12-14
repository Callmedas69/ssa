import { providerRegistry, normalizeScore, type ProviderResult } from './providers';
import type { SSAIndex, SSAIndexTier, SSAIndexBreakdown } from './types';
import { config } from './config';

// Derive from single source of truth (config.ts)
const { tiers } = config.ssaIndex;

export const TIERS = {
  platinum: { min: tiers.platinum.min, max: tiers.platinum.max },
  gold: { min: tiers.gold.min, max: tiers.gold.max },
  silver: { min: tiers.silver.min, max: tiers.silver.max },
  bronze: { min: tiers.bronze.min, max: tiers.bronze.max },
} as const;

export const TIER_LABELS: Record<SSAIndexTier, string> = {
  bronze: tiers.bronze.label,
  silver: tiers.silver.label,
  gold: tiers.gold.label,
  platinum: tiers.platinum.label,
} as const;

export const TIER_MESSAGES: Record<SSAIndexTier, string> = {
  bronze: tiers.bronze.message,
  silver: tiers.silver.message,
  gold: tiers.gold.message,
  platinum: tiers.platinum.message,
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
 * Note: Only providers with includeInScore !== false are included (excludes Passport)
 */
export function calculateSSAIndex(results: Map<string, ProviderResult | null>): SSAIndex {
  const providers = providerRegistry.getForScoring();
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
