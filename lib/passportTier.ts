/**
 * Passport Tier System
 * Based on official Gitcoin Passport thresholds:
 * - 20 = default threshold (effective sybil elimination)
 * - 30 = most effective threshold
 * - 50+ = model-based recommended threshold
 *
 * @see https://docs.passport.xyz/building-with-passport/stamps/major-concepts/scoring-thresholds
 */

export const PASSPORT_TIERS = {
  unverified: { min: 0, max: 19, label: "Unverified", color: "#DC2626" },
  verified: { min: 20, max: 29, label: "Verified", color: "#F59E0B" },
  trusted: { min: 30, max: 49, label: "Trusted", color: "#10B981" },
  highlyTrusted: { min: 50, max: 100, label: "Highly Trusted", color: "#8B5CF6" },
} as const;

export type PassportTier = keyof typeof PASSPORT_TIERS;

/**
 * Get passport tier based on score
 */
export function getPassportTier(score: number | null): PassportTier {
  if (score === null || score < PASSPORT_TIERS.verified.min) return 'unverified';
  if (score < PASSPORT_TIERS.trusted.min) return 'verified';
  if (score < PASSPORT_TIERS.highlyTrusted.min) return 'trusted';
  return 'highlyTrusted';
}

/**
 * Get passport tier label
 */
export function getPassportTierLabel(score: number | null): string {
  const tier = getPassportTier(score);
  return PASSPORT_TIERS[tier].label;
}

/**
 * Get passport tier color
 */
export function getPassportTierColor(score: number | null): string {
  const tier = getPassportTier(score);
  return PASSPORT_TIERS[tier].color;
}
