import { type Hex } from 'viem';

/**
 * EIP-712 Types for ScorePayload
 */
export const SCORE_PAYLOAD_TYPES = {
  ScorePayload: [
    { name: 'user', type: 'address' },
    { name: 'ssaIndex', type: 'uint256' },
    { name: 'providers', type: 'bytes32[]' },
    { name: 'scores', type: 'uint256[]' },
    { name: 'timestamp', type: 'uint256' },
  ],
} as const;

/**
 * EIP-712 Types for MintVoucher
 */
export const MINT_VOUCHER_TYPES = {
  MintVoucher: [
    { name: 'user', type: 'address' },
    { name: 'expiresAt', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
  ],
} as const;

/**
 * ScorePayload structure for EIP-712 signing
 */
export interface ScorePayload {
  user: Hex;
  ssaIndex: bigint;
  providers: Hex[];
  scores: bigint[];
  timestamp: bigint;
}

/**
 * MintVoucher structure for EIP-712 signing
 */
export interface MintVoucher {
  user: Hex;
  expiresAt: bigint;
  nonce: bigint;
}

/**
 * Signed ScorePayload response from API
 */
export interface SignedScorePayload {
  payload: {
    user: Hex;
    ssaIndex: number;
    providers: Hex[];
    scores: number[];
    timestamp: number;
  };
  signature: Hex;
}
