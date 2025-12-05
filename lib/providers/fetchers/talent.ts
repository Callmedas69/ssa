import { fetchWithTimeout } from '@/lib/fetchWithTimeout';
import type { ProviderConfig, ProviderFetcher, ProviderResult } from '../registry';

/**
 * Talent Builder provider configuration
 */
export const talentBuilderConfig: ProviderConfig = {
  id: 'talentBuilder',
  name: 'Talent Builder',
  weight: 0.15,
  cap: 200,
  normalization: 'divide',
  inputType: 'address',
  enabled: true,
};

/**
 * Talent Creator provider configuration
 */
export const talentCreatorConfig: ProviderConfig = {
  id: 'talentCreator',
  name: 'Talent Creator',
  weight: 0.12,
  cap: 200,
  normalization: 'divide',
  inputType: 'address',
  enabled: true,
};

interface TalentResponse {
  score?: {
    points?: number;
    level?: number;
  };
}

type TalentScorerSlug = 'builder_score' | 'creator_score';

async function fetchTalentScore(
  address: string,
  scorerSlug: TalentScorerSlug
): Promise<ProviderResult | null> {
  const apiKey = process.env.TALENT_PROTOCOL_API_KEY;
  if (!apiKey) {
    console.error('TALENT_PROTOCOL_API_KEY not configured');
    return null;
  }

  const url = `https://api.talentprotocol.com/score?id=${address}&account_source=wallet&scorer_slug=${scorerSlug}`;

  try {
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'X-API-KEY': apiKey,
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      console.error(`Talent API error (${scorerSlug}): ${response.status}`);
      return null;
    }

    const data: TalentResponse = await response.json();

    if (!data.score) return null;

    return {
      score: data.score.points ?? 0,
      metadata: {
        level: data.score.level,
      },
    };
  } catch (error) {
    console.error(`Talent fetch error (${scorerSlug}):`, error);
    return null;
  }
}

/**
 * Fetch Talent Builder score for an address
 */
export const fetchTalentBuilder: ProviderFetcher = async (input): Promise<ProviderResult | null> => {
  return fetchTalentScore(String(input), 'builder_score');
};

/**
 * Fetch Talent Creator score for an address
 */
export const fetchTalentCreator: ProviderFetcher = async (input): Promise<ProviderResult | null> => {
  return fetchTalentScore(String(input), 'creator_score');
};
