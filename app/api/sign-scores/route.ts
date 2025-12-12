// app/api/sign-scores/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { isAddress, getAddress, createWalletClient, http, type Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { fetchAllProviderScores, providerRegistry } from '@/lib/providers';
import { calculateSSAIndex } from '@/lib/ssaIndex';
import { SSA_EIP712_DOMAIN } from '@/lib/contracts/config';
import { SCORE_PAYLOAD_TYPES, type SignedScorePayload } from '@/lib/contracts/eip712';
import { CONTRACTS } from '@/abi/addresses';

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
  signature?: Hex;
  error?: string;
}

interface ScorePayloadRequest {
  user: Hex;
  ssaIndex: number;
  providers: Hex[];
  scores: number[];
  timestamp: number;
}

export async function POST(request: NextRequest): Promise<NextResponse<SignScoreApiResponse>> {
  try {
    // Check environment variables
    const signerPrivateKey = process.env.BACKEND_SIGNER_PRIVATE_KEY;

    if (!signerPrivateKey) {
      console.error('BACKEND_SIGNER_PRIVATE_KEY not configured');
      return NextResponse.json(
        { success: false, error: 'Service temporarily unavailable. Please try again later.' },
        { status: 500 }
      );
    }

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Try again later.' },
        { status: 429 }
      );
    }

    // Parse payload from request body
    const payload: ScorePayloadRequest = await request.json();

    if (!payload || !payload.user) {
      return NextResponse.json(
        { success: false, error: 'Invalid request. Please refresh and try again.' },
        { status: 400 }
      );
    }

    // Validate address format
    if (!isAddress(payload.user)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    // Validate payload structure
    if (!Array.isArray(payload.providers) || !Array.isArray(payload.scores)) {
      return NextResponse.json(
        { success: false, error: 'Invalid score data. Please refresh and try again.' },
        { status: 400 }
      );
    }

    if (payload.providers.length !== payload.scores.length) {
      return NextResponse.json(
        { success: false, error: 'Invalid score data. Please refresh and try again.' },
        { status: 400 }
      );
    }

    // Create signer from private key
    const account = privateKeyToAccount(signerPrivateKey as Hex);

    // Sign EIP-712 typed data
    const rpcUrl = process.env.BASE_RPC_URL || process.env.NEXT_PUBLIC_BASE_RPC_URL || process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org';
    
    const walletClient = createWalletClient({
      account,
      chain: base,
      transport: http(rpcUrl),
    });

    const signature = await walletClient.signTypedData({
      domain: {
        name: SSA_EIP712_DOMAIN.name,
        version: SSA_EIP712_DOMAIN.version,
        chainId: base.id,
        verifyingContract: CONTRACTS.SocialScoreAttestator as Hex,
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
      signature,
    });

    // No caching for signatures (timestamp-sensitive)
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    console.error('Sign scores API error:', error);

    // User-friendly error message (don't expose internal details)
    return NextResponse.json(
      { success: false, error: 'Unable to process your request. Please try again.' },
      { status: 500 }
    );
  }
}
