import { fetchWithTimeout } from '@/lib/fetchWithTimeout';
import type { ProviderConfig, ProviderFetcher, ProviderResult } from '../registry';

/**
 * Quotient provider configuration
 */
export const quotientConfig: ProviderConfig = {
  id: 'quotient',
  name: 'Quotient',
  weight: 0.15,
  cap: 1,
  normalization: 'multiply',
  inputType: 'fid',
  dependsOn: 'neynar', // Requires FID from Neynar
  enabled: true,
};

type QuotientTier = 'inactive' | 'casual' | 'active' | 'influential' | 'elite' | 'exceptional';

interface QuotientReputationData {
  fid: number;
  username: string;
  quotientScore?: number | null;
  quotientScoreRaw?: number | null;
  quotientRank?: number | null;
  quotientProfileUrl: string;
}

interface QuotientResponse {
  data: QuotientReputationData[];
  count: number;
}

function getTierFromScore(score: number): QuotientTier {
  if (score >= 0.9) return 'exceptional';
  if (score >= 0.8) return 'elite';
  if (score >= 0.75) return 'influential';
  if (score >= 0.6) return 'active';
  if (score >= 0.5) return 'casual';
  return 'inactive';
}

/**
 * Fetch Quotient score for a FID
 */
export const fetchQuotient: ProviderFetcher = async (input): Promise<ProviderResult | null> => {
  const fid = Number(input);
  const apiKey = process.env.QUOTIENT_API_KEY;

  if (!apiKey) {
    console.error('QUOTIENT_API_KEY not configured');
    return null;
  }

  const url = 'https://api.quotient.social/v1/user-reputation';

  try {
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fids: [fid],
        api_key: apiKey,
      }),
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      console.error(`Quotient API error: ${response.status}`);
      return null;
    }

    const data: QuotientResponse = await response.json();

    if (!data.data || data.data.length === 0) return null;

    const userData = data.data[0];

    if (userData.quotientScore == null) return null;

    return {
      score: userData.quotientScore,
      metadata: {
        scoreRaw: userData.quotientScoreRaw,
        rank: userData.quotientRank,
        tier: getTierFromScore(userData.quotientScore),
      },
    };
  } catch (error) {
    console.error('Quotient fetch error:', error);
    return null;
  }
};
