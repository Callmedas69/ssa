import { fetchWithTimeout } from '@/lib/fetchWithTimeout';
import type { ProviderConfig, ProviderFetcher, ProviderResult } from '../registry';

/**
 * Ethos provider configuration
 */
export const ethosConfig: ProviderConfig = {
  id: 'ethos',
  name: 'Ethos',
  weight: 0.20,
  cap: 2800,
  normalization: 'divide',
  inputType: 'address',
  enabled: true,
};

type EthosLevel =
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

interface EthosResponse {
  score?: number;
  level: EthosLevel;
}

/**
 * Fetch Ethos score for an address
 */
export const fetchEthos: ProviderFetcher = async (input): Promise<ProviderResult | null> => {
  const address = String(input);
  const url = `https://api.ethos.network/api/v2/score/address?address=${address}`;

  try {
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'X-Ethos-Client': 'social-score-attestator',
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      console.error(`Ethos API error: ${response.status}`);
      return null;
    }

    const data: EthosResponse = await response.json();

    return {
      score: data.score ?? 0,
      metadata: {
        level: data.level,
      },
    };
  } catch (error) {
    console.error('Ethos fetch error:', error);
    return null;
  }
};
