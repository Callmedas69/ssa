import { fetchWithTimeout } from '@/lib/fetchWithTimeout';
import type { ProviderConfig, ProviderFetcher, ProviderResult } from '../registry';

/**
 * Passport provider configuration
 */
export const passportConfig: ProviderConfig = {
  id: 'passport',
  name: 'Gitcoin Passport',
  weight: 0.18,
  cap: 100,
  normalization: 'none', // Already 0-100
  inputType: 'address',
  enabled: true,
};

interface PassportStamp {
  score: string;
  dedup: boolean;
  expiration_date: string;
}

interface PassportResponse {
  address: string;
  score: string;
  passing_score: boolean;
  last_score_timestamp: string;
  expiration_timestamp: string;
  threshold: string;
  error: string | null;
  stamps: Record<string, PassportStamp>;
}

/**
 * Fetch Passport score for an address
 */
export const fetchPassport: ProviderFetcher = async (input): Promise<ProviderResult | null> => {
  const address = String(input);
  const apiKey = process.env.GITCOIN_PASSPORT_API_KEY;
  const scorerId = process.env.GITCOIN_PASSPORT_SCORER_ID;

  if (!apiKey || !scorerId) {
    console.error('GITCOIN_PASSPORT_API_KEY or GITCOIN_PASSPORT_SCORER_ID not configured');
    return null;
  }

  const url = `https://api.passport.xyz/v2/stamps/${scorerId}/score/${address}`;

  try {
    // Passport API can be slow, use 15 second timeout
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'X-API-KEY': apiKey,
      },
    }, 15000);

    if (!response.ok) {
      if (response.status === 404) return null;
      console.error('[passport] API error:', { address, status: response.status });
      return null;
    }

    const data: PassportResponse = await response.json();

    if (data.error) {
      console.error('[passport] API returned error:', { address, error: data.error });
      return null;
    }

    const score = parseFloat(data.score);
    if (isNaN(score)) return null;

    const stampCount = data.stamps ? Object.keys(data.stamps).length : 0;

    return {
      score,
      metadata: {
        passingScore: data.passing_score,
        threshold: parseFloat(data.threshold) || 20,
        stampCount,
      },
    };
  } catch (error) {
    console.error('[passport] Fetch failed:', { address, error: error instanceof Error ? error.message : error });
    return null;
  }
};
