import { fetchWithTimeout } from '@/lib/fetchWithTimeout';
import { resolveFid } from '../fid-resolver';
import type { ProviderConfig, ProviderFetcher, ProviderResult } from '../registry';

/**
 * Neynar provider configuration
 */
export const neynarConfig: ProviderConfig = {
  id: 'neynar',
  name: 'Neynar',
  weight: 0.24,
  cap: 1,
  normalization: 'multiply',
  inputType: 'address',
  enabled: true,
};

/**
 * Fetch Neynar score for an address
 * Uses shared FID resolver for address→FID mapping
 */
export const fetchNeynar: ProviderFetcher = async (input): Promise<ProviderResult | null> => {
  const address = String(input);
  const apiKey = process.env.NEYNAR_API_KEY;

  if (!apiKey) {
    console.error('NEYNAR_API_KEY not configured');
    return null;
  }

  // First resolve address to FID (cached)
  const fidInfo = await resolveFid(address);
  if (!fidInfo) return null;

  // Now fetch the user score with the FID
  const url = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fidInfo.fid}`;

  try {
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        api_key: apiKey,
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      console.error('[neynar] API error:', { address, status: response.status });
      return null;
    }

    const data = await response.json();
    const users = data.users;

    if (!users || users.length === 0) return null;

    const user = users[0];
    return {
      score: user.experimental?.neynar_user_score ?? 0,
      metadata: {
        fid: fidInfo.fid,
        username: fidInfo.username,
        displayName: fidInfo.displayName,
        pfpUrl: fidInfo.pfpUrl,
      },
    };
  } catch (error) {
    console.error('[neynar] Fetch failed:', { address, error: error instanceof Error ? error.message : error });
    return null;
  }
};
