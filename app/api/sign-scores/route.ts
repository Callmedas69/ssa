import { NextRequest, NextResponse } from 'next/server';
import { isAddress, getAddress, createWalletClient, http, type Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { fetchAllProviderScores, providerRegistry } from '@/lib/providers';
import { calculateSSAIndex } from '@/lib/ssaIndex';
import { SSA_EIP712_DOMAIN } from '@/lib/contracts/config';
import { SCORE_PAYLOAD_TYPES, type SignedScorePayload } from '@/lib/contracts/eip712';

// Rate limiting (shared with /api/scores)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
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

interface SignScoreApiResponse {
  success: boolean;
  data: SignedScorePayload | null;
  error?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<SignScoreApiResponse>> {
  try {
    // Check environment variables
    const signerPrivateKey = process.env.BACKEND_SIGNER_PRIVATE_KEY;
    const attestatorAddress = process.env.SSA_ATTESTATOR_ADDRESS;

    if (!signerPrivateKey) {
      console.error('BACKEND_SIGNER_PRIVATE_KEY not configured');
      return NextResponse.json(
        { success: false, data: null, error: 'Backend signing not configured' },
        { status: 500 }
      );
    }

    if (!attestatorAddress) {
      console.error('SSA_ATTESTATOR_ADDRESS not configured');
      return NextResponse.json(
        { success: false, data: null, error: 'Contract address not configured' },
        { status: 500 }
      );
    }

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

    // Validate address format
    if (!isAddress(address)) {
      return NextResponse.json(
        { success: false, data: null, error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const checksumAddress = getAddress(address);

    // Fetch all providers using the registry
    const results = await fetchAllProviderScores(checksumAddress);

    // Calculate SSA Index
    const ssaIndexResult = calculateSSAIndex(results);

    // Build normalized scores (0-100) for each enabled provider
    const enabledProviders = providerRegistry.getEnabled();
    const providers: Hex[] = [];
    const scores: number[] = [];

    for (const provider of enabledProviders) {
      const breakdown = ssaIndexResult.breakdown.find(b => b.provider === provider.id);
      if (breakdown) {
        providers.push(provider.onChainId);
        scores.push(Math.round(breakdown.normalizedScore));
      }
    }

    // Build payload
    const timestamp = Math.floor(Date.now() / 1000);
    const payload = {
      user: checksumAddress as Hex,
      ssaIndex: ssaIndexResult.score,
      providers,
      scores,
      timestamp,
    };

    // Create signer from private key
    const account = privateKeyToAccount(signerPrivateKey as Hex);

    // Sign EIP-712 typed data
    const walletClient = createWalletClient({
      account,
      chain: base,
      transport: http(),
    });

    const signature = await walletClient.signTypedData({
      domain: {
        name: SSA_EIP712_DOMAIN.name,
        version: SSA_EIP712_DOMAIN.version,
        chainId: base.id,
        verifyingContract: attestatorAddress as Hex,
      },
      types: SCORE_PAYLOAD_TYPES,
      primaryType: 'ScorePayload',
      message: {
        user: payload.user,
        ssaIndex: BigInt(payload.ssaIndex),
        providers: payload.providers,
        scores: payload.scores.map(s => BigInt(s)),
        timestamp: BigInt(payload.timestamp),
      },
    });

    const response = NextResponse.json({
      success: true,
      data: { payload, signature },
    });

    // No caching for signatures (timestamp-sensitive)
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    console.error('Sign scores API error:', error);
    return NextResponse.json(
      { success: false, data: null, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
