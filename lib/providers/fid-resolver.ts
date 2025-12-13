import { fetchWithTimeout } from '@/lib/fetchWithTimeout';

/**
 * FID (Farcaster ID) resolution result
 */
export interface FidResolution {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
}

/**
 * Simple in-memory cache for FID resolutions
 * Helps avoid redundant API calls within the same request
 */
const fidCache = new Map<string, { resolution: FidResolution | null; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Resolve an Ethereum address to a Farcaster FID
 * Uses Neynar API for resolution
 * Results are cached to avoid redundant lookups
 */
export async function resolveFid(address: string): Promise<FidResolution | null> {
  const normalizedAddress = address.toLowerCase();

  // Check cache
  const cached = fidCache.get(normalizedAddress);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.resolution;
  }

  const apiKey = process.env.NEYNAR_API_KEY;
  if (!apiKey) {
    console.error('NEYNAR_API_KEY not configured');
    return null;
  }

  const url = `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${address}`;

  try {
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        api_key: apiKey,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        fidCache.set(normalizedAddress, { resolution: null, timestamp: Date.now() });
        return null;
      }
      console.error('[fid-resolver] API error:', { address: normalizedAddress, status: response.status });
      return null;
    }

    const data = await response.json();
    // Neynar returns lowercase address keys
    const users = data[normalizedAddress] || Object.values(data)[0];

    if (!users || !Array.isArray(users) || users.length === 0) {
      fidCache.set(normalizedAddress, { resolution: null, timestamp: Date.now() });
      return null;
    }

    const user = users[0];
    const resolution: FidResolution = {
      fid: user.fid,
      username: user.username,
      displayName: user.display_name,
      pfpUrl: user.pfp_url,
    };

    fidCache.set(normalizedAddress, { resolution, timestamp: Date.now() });
    return resolution;
  } catch (error) {
    console.error('[fid-resolver] Fetch failed:', { address: normalizedAddress, error: error instanceof Error ? error.message : error });
    return null;
  }
}

/**
 * Clear FID cache (useful for testing)
 */
export function clearFidCache(): void {
  fidCache.clear();
}
