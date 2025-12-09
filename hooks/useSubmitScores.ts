'use client';

import { useState, useCallback, useEffect } from "react";
import { writeContract, simulateContract, waitForTransactionReceipt } from "wagmi/actions";
import { wagmiConfig } from "@/lib/wagmi/config";
import { useAccount } from "wagmi";

import { CONTRACTS } from "@/abi/addresses";
import { SocialScoreAttestatorABI } from "@/abi/SocialScoreAttestator";

import { isContractPaused } from "@/lib/contracts/providerValidation";
import { PROVIDER_ID_MAP } from "@/lib/contracts/providerIds";
import { getPublicClient } from "wagmi/actions";

import type { Hex } from "viem";
import type { ScorePayload } from "@/lib/types";

type SubmitState = 'idle' | 'signing' | 'ready' | 'submitting' | 'confirming' | 'success' | 'error' | 'cooldown';

export function useSubmitScores() {
  const { address } = useAccount();
  const [state, setState] = useState<SubmitState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<Hex | null>(null);
  const [signedPayload, setSignedPayload] = useState<{ payload: ScorePayload; signature: Hex } | null>(null);
  const [lastSubmissionTime, setLastSubmissionTime] = useState<number | null>(null);
  const [nextAllowedTime, setNextAllowedTime] = useState<number | null>(null);

  const fetchSignature = useCallback(async () => {
    if (!address) {
      setError("Wallet not connected");
      setState('error');
      return;
    }

    setState('signing');
    setError(null);

    try {
      // 1. Contract paused?
      const paused = await isContractPaused();
      if (paused) {
        throw new Error("Score submission is currently paused.");
      }

      // 2. Check last submission time to prevent unnecessary API calls
      const publicClient = getPublicClient(wagmiConfig);
      const lastUpdated = await publicClient.readContract({
        address: CONTRACTS.SocialScoreAttestator as `0x${string}`,
        abi: SocialScoreAttestatorABI,
        functionName: "lastUpdated",
        args: [address],
      });

      if (lastUpdated) {
        const now = Math.floor(Date.now() / 1000);
        const MIN_INTERVAL = 86400; // 24 hours
        const nextAllowedTime = Number(lastUpdated) + MIN_INTERVAL;
        
        if (now < nextAllowedTime) {
          const hoursRemaining = Math.ceil((nextAllowedTime - now) / 3600);
          const timeRemaining = hoursRemaining > 1 ? `${hoursRemaining} hours` : `${Math.ceil((nextAllowedTime - now) / 60)} minutes`;
          const nextAllowedDate = new Date(nextAllowedTime * 1000).toLocaleString();
          throw new Error(`You can only submit scores once every 24 hours. Please wait ${timeRemaining}. Next submission available at: ${nextAllowedDate}`);
        }
      }

      // 3. Fetch scores from backend
      const scoresRes = await fetch(`/api/scores?address=${address}`);
      if (!scoresRes.ok) throw new Error("Failed to fetch scores");

      const scoresData = await scoresRes.json();
      if (!scoresData.success || !scoresData.data) {
        throw new Error("No scores available");
      }

      // 4. Build payload
      interface BreakdownItem {
        provider: string;
        normalizedScore: number;
      }
      const payload: ScorePayload = {
        user: address,
        ssaIndex: Math.round(scoresData.data.ssaIndex.score),
        providers: scoresData.data.ssaIndex.breakdown.map((b: BreakdownItem) => PROVIDER_ID_MAP[b.provider]),
        scores: scoresData.data.ssaIndex.breakdown.map((b: BreakdownItem) => Math.round(b.normalizedScore)),
        timestamp: Math.floor(Date.now() / 1000),
      };

      // Request backend for EIP-712 signature
      const sigRes = await fetch("/api/sign-scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!sigRes.ok) {
        const errorData = await sigRes.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || "Backend signature failed");
      }

      const sigData = await sigRes.json();
      if (!sigData.success || !sigData.signature) {
        throw new Error(sigData.error || "Invalid signature response");
      }

      const { signature } = sigData;

      setSignedPayload({ payload, signature });
      setState('ready');
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error preparing signature";
      setError(message);
      setState('error');
      return false;
    }
  }, [address]);

  const submitToChain = useCallback(async () => {
    if (!signedPayload) {
      setError("No signed payload available");
      setState('error');
      return;
    }

    setState('submitting');
    setError(null);

    try {
      const { payload, signature } = signedPayload;

      // Convert payload to contract format (bigint types)
      const contractPayload = {
        user: payload.user,
        ssaIndex: BigInt(payload.ssaIndex),
        providers: payload.providers,
        scores: payload.scores.map(s => BigInt(s)),
        timestamp: BigInt(payload.timestamp),
      };

      // Simulate contract request
      const { request } = await simulateContract(wagmiConfig, {
        address: CONTRACTS.SocialScoreAttestator as `0x${string}`,
        abi: SocialScoreAttestatorABI,
        functionName: "submitScores",
        args: [contractPayload, signature],
      });
      
      // Submit tx
      const hash = await writeContract(wagmiConfig, request);
      setTxHash(hash);

      // Wait for confirmation
      setState('confirming');
      await waitForTransactionReceipt(wagmiConfig, { hash });

      setState('success');
    } catch (err) {
      let message = err instanceof Error ? err.message : "Unknown error submitting scores";
      
      // Parse SubmissionTooFrequent error to show user-friendly message
      if (message.includes('SubmissionTooFrequent')) {
        const match = message.match(/SubmissionTooFrequent\(uint256 nextAllowedTime\) \((\d+)\)/);
        if (match && match[1]) {
          const nextAllowedTime = parseInt(match[1]);
          const now = Math.floor(Date.now() / 1000);
          const hoursRemaining = Math.ceil((nextAllowedTime - now) / 3600);
          const timeRemaining = hoursRemaining > 1 ? `${hoursRemaining} hours` : `${Math.ceil((nextAllowedTime - now) / 60)} minutes`;
          
          const nextAllowedDate = new Date(nextAllowedTime * 1000).toLocaleString();
          message = `You can only submit scores once every 24 hours. Please wait ${timeRemaining}. Next submission available at: ${nextAllowedDate}`;
        } else {
          message = "You can only submit scores once every 24 hours. Please try again later.";
        }
      }
      
      setError(message);
      setState('error');
    }
  }, [signedPayload]);

  const checkSubmissionStatus = useCallback(async () => {
    if (!address) return;

    try {
      const publicClient = getPublicClient(wagmiConfig);
      const lastUpdated = await publicClient.readContract({
        address: CONTRACTS.SocialScoreAttestator as `0x${string}`,
        abi: SocialScoreAttestatorABI,
        functionName: "lastUpdated",
        args: [address],
      });

      if (lastUpdated && Number(lastUpdated) > 0) {
        const lastTime = Number(lastUpdated);
        const now = Math.floor(Date.now() / 1000);
        const MIN_INTERVAL = 86400; // 24 hours
        const nextTime = lastTime + MIN_INTERVAL;
        
        setLastSubmissionTime(lastTime);
        setNextAllowedTime(nextTime);

        if (now < nextTime) {
          setState('cooldown');
        } else if (state === 'cooldown') {
          setState('idle');
        }
      }
    } catch (err) {
      console.error('Error checking submission status:', err);
    }
  }, [address, state]);

  // Check submission status on mount and when address changes
  useEffect(() => {
    checkSubmissionStatus();
  }, [checkSubmissionStatus]);

  // Auto-submit when signature is ready
  useEffect(() => {
    if (state === 'ready' && signedPayload) {
      submitToChain();
    }
  }, [state, signedPayload, submitToChain]);

  const reset = useCallback(() => {
    setState('idle');
    setError(null);
    setTxHash(null);
    setSignedPayload(null);
    checkSubmissionStatus();
  }, [checkSubmissionStatus]);

  return { 
    state, 
    error, 
    txHash, 
    lastSubmissionTime,
    nextAllowedTime,
    fetchSignature, 
    submitToChain, 
    reset,
    checkSubmissionStatus 
  };
}
