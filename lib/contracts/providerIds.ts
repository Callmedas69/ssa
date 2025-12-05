import { keccak256, toBytes } from 'viem';

/**
 * Provider ID constants for on-chain attestation.
 * These must match the bytes32 values registered in SocialScoreAttestator.
 */
export const PROVIDER_IDS = {
  ETHOS: keccak256(toBytes('ETHOS')),
  NEYNAR: keccak256(toBytes('NEYNAR')),
  TALENT_BUILDER: keccak256(toBytes('TALENT_BUILDER')),
  TALENT_CREATOR: keccak256(toBytes('TALENT_CREATOR')),
  PASSPORT: keccak256(toBytes('PASSPORT')),
  QUOTIENT: keccak256(toBytes('QUOTIENT')),
} as const;

export type ProviderId = (typeof PROVIDER_IDS)[keyof typeof PROVIDER_IDS];

/**
 * Map from ScoreProvider type to on-chain provider ID
 */
export const PROVIDER_ID_MAP: Record<string, `0x${string}`> = {
  ethos: PROVIDER_IDS.ETHOS,
  neynar: PROVIDER_IDS.NEYNAR,
  talentBuilder: PROVIDER_IDS.TALENT_BUILDER,
  talentCreator: PROVIDER_IDS.TALENT_CREATOR,
  passport: PROVIDER_IDS.PASSPORT,
  quotient: PROVIDER_IDS.QUOTIENT,
} as const;

/**
 * Ordered list of providers (matches contract initialization order)
 */
export const PROVIDER_ORDER = [
  'ethos',
  'neynar',
  'talentBuilder',
  'talentCreator',
  'passport',
  'quotient',
] as const;
