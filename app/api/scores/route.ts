import { NextRequest, NextResponse } from 'next/server';
import { isAddress, getAddress } from 'viem';
import { fetchAllProviderScores } from '@/lib/providers';
import { calculateSSAIndex } from '@/lib/ssaIndex';
import { resolveIdentity } from '@/lib/identity';
import type { ScoreApiResponse, SocialScores } from '@/lib/types';

// Rate limiting with automatic cleanup (per deployment instance)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute
const MAX_ENTRIES = 1000; // Prevent memory leaks

function cleanupOldEntries() {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  
  // Periodic cleanup to prevent memory leaks
  if (rateLimitMap.size > MAX_ENTRIES) {
    cleanupOldEntries();
  }

  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Convert registry results to legacy SocialScores format for API compatibility
 */
function toLegacyFormat(
  results: Map<string, import('@/lib/providers').ProviderResult | null>
): Omit<SocialScores, 'ssaIndex' | 'identity'> {
  const neynarResult = results.get('neynar');
  const ethosResult = results.get('ethos');
  const talentBuilderResult = results.get('talentBuilder');
  const talentCreatorResult = results.get('talentCreator');
  const quotientResult = results.get('quotient');
  const passportResult = results.get('passport');

  return {
    neynar: neynarResult ? {
      score: neynarResult.score,
      fid: neynarResult.metadata?.fid as number | undefined,
      username: neynarResult.metadata?.username as string | undefined,
      displayName: neynarResult.metadata?.displayName as string | undefined,
      pfpUrl: neynarResult.metadata?.pfpUrl as string | undefined,
    } : null,
    ethos: ethosResult ? {
      score: ethosResult.score,
      level: ethosResult.metadata?.level as import('@/lib/types').EthosLevel,
    } : null,
    talentBuilder: talentBuilderResult ? {
      score: talentBuilderResult.score,
      level: talentBuilderResult.metadata?.level as number | undefined,
    } : null,
    talentCreator: talentCreatorResult ? {
      score: talentCreatorResult.score,
      level: talentCreatorResult.metadata?.level as number | undefined,
    } : null,
    quotient: quotientResult ? {
      score: quotientResult.score,
      scoreRaw: quotientResult.metadata?.scoreRaw as number | undefined,
      rank: quotientResult.metadata?.rank as number | undefined,
      tier: quotientResult.metadata?.tier as import('@/lib/types').QuotientTier,
    } : null,
    passport: passportResult ? {
      score: passportResult.score,
      passingScore: passportResult.metadata?.passingScore as boolean,
      threshold: passportResult.metadata?.threshold as number,
      stampCount: passportResult.metadata?.stampCount as number | undefined,
    } : null,
  };
}

export async function GET(request: NextRequest): Promise<NextResponse<ScoreApiResponse>> {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, data: null, error: 'Rate limit exceeded. Try again later.' },
        { status: 429 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { success: false, data: null, error: 'Address is required' },
        { status: 400 }
      );
    }

    // Validate address format with checksum validation
    if (!isAddress(address)) {
      return NextResponse.json(
        { success: false, data: null, error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    // Normalize to checksum address
    const checksumAddress = getAddress(address);

    // Fetch all providers and identity in parallel
    const [results, identity] = await Promise.all([
      fetchAllProviderScores(checksumAddress),
      resolveIdentity(checksumAddress),
    ]);

    // Calculate SSA Index from provider results
    const ssaIndex = calculateSSAIndex(results);

    // Convert to legacy format for API compatibility
    const providerScores = toLegacyFormat(results);

    const scores: SocialScores = {
      ...providerScores,
      ssaIndex,
      identity,
    };

    const response = NextResponse.json({ success: true, data: scores });
    // No cache - scores change after attestation, must always be fresh
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    const address = request.nextUrl.searchParams.get('address');
    console.error('[api/scores] Failed:', { address, error: error instanceof Error ? error.message : error });

    // Provide more detailed error message
    const errorMessage = error instanceof Error
      ? error.message
      : 'Internal server error';

    return NextResponse.json(
      { success: false, data: null, error: errorMessage },
      { status: 500 }
    );
  }
}
