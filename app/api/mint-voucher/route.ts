// app/api/mint-voucher/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { isAddress, getAddress, createWalletClient, http, type Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { CONTRACTS } from '@/abi/addresses';

// Rate limiting
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

// Nonce tracking (in production, use a database)
const usedNonces = new Map<string, Set<number>>();

function getNextNonce(user: string): bigint {
  const userNonces = usedNonces.get(user) || new Set();
  let nonce = Date.now();
  
  while (userNonces.has(nonce)) {
    nonce++;
  }
  
  userNonces.add(nonce);
  usedNonces.set(user, userNonces);
  
  return BigInt(nonce);
}

interface MintVoucherResponse {
  success: boolean;
  voucher?: {
    user: Hex;
    expiresAt: string;
    nonce: string;
  };
  signature?: Hex;
  error?: string;
}

// EIP-712 types for MintVoucher
const MINT_VOUCHER_TYPES = {
  MintVoucher: [
    { name: 'user', type: 'address' },
    { name: 'expiresAt', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
  ],
} as const;

const MINT_VOUCHER_DOMAIN = {
  name: 'ProfileSBT',
  version: '1',
  chainId: base.id,
  verifyingContract: CONTRACTS.ProfileSBT as Hex,
};

export async function POST(request: NextRequest): Promise<NextResponse<MintVoucherResponse>> {
  try {
    // Check environment variables
    const signerPrivateKey = process.env.VOUCHER_SIGNER_PRIVATE_KEY;

    if (!signerPrivateKey) {
      console.error('VOUCHER_SIGNER_PRIVATE_KEY not configured');
      return NextResponse.json(
        { success: false, error: 'Voucher signing not configured' },
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

    // Parse request body
    const body = await request.json();
    const { user } = body;

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User address is required' },
        { status: 400 }
      );
    }

    // Validate address format
    if (!isAddress(user)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const checksumAddress = getAddress(user);

    // Build voucher
    const expiresAt = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour expiry
    const nonce = getNextNonce(checksumAddress);

    const voucher = {
      user: checksumAddress as Hex,
      expiresAt,
      nonce,
    };

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
      domain: MINT_VOUCHER_DOMAIN,
      types: MINT_VOUCHER_TYPES,
      primaryType: 'MintVoucher',
      message: voucher,
    });

    // Convert BigInt values to strings for JSON serialization
    const response = NextResponse.json({
      success: true,
      voucher: {
        user: voucher.user,
        expiresAt: voucher.expiresAt.toString(),
        nonce: voucher.nonce.toString(),
      },
      signature,
    });

    // No caching for vouchers (nonce and timestamp-sensitive)
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    console.error('Mint voucher API error:', error);

    // Provide more detailed error message
    const errorMessage = error instanceof Error
      ? error.message
      : 'Internal server error';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
