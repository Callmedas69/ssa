'use client';

import { useState, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { base } from 'viem/chains';
import { type Hex } from 'viem';
import { SOCIAL_SCORE_ATTESTATOR_ABI } from '@/lib/contracts/abi';
import type { SignedScorePayload } from '@/lib/contracts/eip712';

type SubmitState = 'idle' | 'signing' | 'ready' | 'submitting' | 'confirming' | 'success' | 'error';

interface UseSubmitScoresResult {
  state: SubmitState;
  error: string | null;
  txHash: Hex | null;
  signedPayload: SignedScorePayload | null;
  fetchSignature: () => Promise<void>;
  submitToChain: () => Promise<void>;
  reset: () => void;
}

export function useSubmitScores(): UseSubmitScoresResult {
  const { address, isConnected } = useAccount();
  const [state, setState] = useState<SubmitState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [signedPayload, setSignedPayload] = useState<SignedScorePayload | null>(null);

  const { writeContract, data: txHash, isPending: isWritePending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Update state based on transaction status
  if (isWritePending && state !== 'submitting') {
    setState('submitting');
  }
  if (isConfirming && state !== 'confirming') {
    setState('confirming');
  }
  if (isConfirmed && state !== 'success') {
    setState('success');
  }

  const fetchSignature = useCallback(async () => {
    if (!isConnected || !address) {
      setError('Wallet not connected');
      setState('error');
      return;
    }

    setState('signing');
    setError(null);

    try {
      const response = await fetch(`/api/sign-scores?address=${address}`);
      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch signature');
      }

      setSignedPayload(result.data);
      setState('ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch signature');
      setState('error');
    }
  }, [address, isConnected]);

  const submitToChain = useCallback(async () => {
    if (!signedPayload) {
      setError('No signed payload available');
      setState('error');
      return;
    }

    const contractAddress = process.env.NEXT_PUBLIC_SSA_ATTESTATOR_ADDRESS;
    if (!contractAddress) {
      setError('Contract address not configured');
      setState('error');
      return;
    }

    try {
      writeContract({
        address: contractAddress as Hex,
        abi: SOCIAL_SCORE_ATTESTATOR_ABI,
        functionName: 'submitScores',
        args: [
          {
            user: signedPayload.payload.user,
            ssaIndex: BigInt(signedPayload.payload.ssaIndex),
            providers: signedPayload.payload.providers,
            scores: signedPayload.payload.scores.map(s => BigInt(s)),
            timestamp: BigInt(signedPayload.payload.timestamp),
          },
          signedPayload.signature,
        ],
        chainId: base.id,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed');
      setState('error');
    }
  }, [signedPayload, writeContract]);

  const reset = useCallback(() => {
    setState('idle');
    setError(null);
    setSignedPayload(null);
  }, []);

  return {
    state,
    error,
    txHash: txHash || null,
    signedPayload,
    fetchSignature,
    submitToChain,
    reset,
  };
}
