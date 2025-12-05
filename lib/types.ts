// Score provider types
export type ScoreProvider = 'neynar' | 'ethos' | 'talentBuilder' | 'talentCreator' | 'quotient' | 'passport';

// Neynar Score (Farcaster social graph)
export interface NeynarScore {
  score: number; // 0-1
  fid?: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

// Ethos Score (On-chain credibility)
export interface EthosScore {
  score: number; // 0-2800
  level: EthosLevel;
}

export type EthosLevel =
  | 'untrusted'
  | 'questionable'
  | 'neutral'
  | 'known'
  | 'established'
  | 'reputable'
  | 'exemplary'
  | 'distinguished'
  | 'revered'
  | 'renowned';

// Talent Protocol Builder Score (Developer reputation)
export interface TalentBuilderScore {
  score: number; // uncapped
  level?: number; // 1-6
}

// Talent Protocol Creator Score (Content creator reputation)
export interface TalentCreatorScore {
  score: number; // uncapped
  level?: number;
}

// Quotient Score (Farcaster engagement quality)
export type QuotientTier = 'inactive' | 'casual' | 'active' | 'influential' | 'elite' | 'exceptional';

export interface QuotientScore {
  score: number; // 0-1 normalized
  scoreRaw?: number; // raw score for rewards multipliers
  rank?: number; // global rank
  tier: QuotientTier;
}

// Gitcoin Passport Score (Sybil resistance)
export interface PassportScore {
  score: number; // 0-100
  passingScore: boolean; // true if score >= threshold
  threshold: number; // default 20
  stampCount?: number; // number of stamps
}

// User Identity (ENS, Basename)
export interface UserIdentity {
  ens: string | null;
  basename: string | null;
}

// SSA Index (Social Score Attestator Index)
export type SSAIndexTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface SSAIndexBreakdown {
  provider: ScoreProvider;
  rawScore: number | null;
  normalizedScore: number;
  weight: number;
  contribution: number;
}

export interface SSAIndex {
  score: number; // 0-100 final score
  tier: SSAIndexTier;
  breakdown: SSAIndexBreakdown[];
}

// Aggregated scores from all providers
export interface SocialScores {
  neynar: NeynarScore | null;
  ethos: EthosScore | null;
  talentBuilder: TalentBuilderScore | null;
  talentCreator: TalentCreatorScore | null;
  quotient: QuotientScore | null;
  passport: PassportScore | null;
  ssaIndex: SSAIndex;
  identity: UserIdentity;
}

// API response wrapper
export interface ScoreApiResponse {
  success: boolean;
  data: SocialScores | null;
  error?: string;
}
