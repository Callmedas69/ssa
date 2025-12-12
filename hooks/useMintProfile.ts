'use client';

import { useState, useCallback } from "react";
import { writeContract, simulateContract, waitForTransactionReceipt, readContract } from "wagmi/actions";
import { wagmiConfig } from "@/lib/wagmi/config";
import { useAccount } from "wagmi";
import { CONTRACTS } from "@/abi/addresses";
import { ProfileSBTABI } from "@/abi/ProfileSBT";
import { SocialScoreAttestatorABI } from "@/abi/SocialScoreAttestator";
import { humanizeError } from "@/lib/errors";
import type { Hex } from "viem";

type MintState = 'idle' | 'checking' | 'fetching' | 'ready' | 'minting' | 'confirming' | 'success' | 'error';

interface MintVoucher {
  user: Hex;
  expiresAt: bigint;
  nonce: bigint;
}

export function useMintProfile() {
  const { address } = useAccount();
  const [state, setState] = useState<MintState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<Hex | null>(null);
  const [hasMinted, setHasMinted] = useState<boolean>(false);
  const [voucher, setVoucher] = useState<{ voucher: MintVoucher; signature: Hex } | null>(null);

  const checkMintStatus = useCallback(async () => {
    if (!address) return;

    setState('checking');
    setError(null);

    try {
      const minted = await readContract(wagmiConfig, {
        address: CONTRACTS.ProfileSBT as `0x${string}`,
        abi: ProfileSBTABI,
        functionName: "hasMinted",
        args: [address],
      });

      setHasMinted(minted as boolean);
      
      if (minted) {
        setState('success');
      } else {
        setState('idle');
      }
    } catch (err) {
      console.error('Error checking mint status:', err);
      setState('idle');
    }
  }, [address]);

  const fetchVoucher = useCallback(async (): Promise<{ voucher: MintVoucher; signature: Hex } | null> => {
    if (!address) {
      setError("Wallet not connected");
      setState('error');
      return null;
    }

    setState('fetching');
    setError(null);

    try {
      // Verify user has attested on-chain (contract is source of truth)
      const lastUpdated = await readContract(wagmiConfig, {
        address: CONTRACTS.SocialScoreAttestator as `0x${string}`,
        abi: SocialScoreAttestatorABI,
        functionName: "lastUpdated",
        args: [address],
      });

      if (!lastUpdated || Number(lastUpdated) === 0) {
        throw new Error("Please verify your scores first before minting.");
      }

      // Request voucher from backend
      const response = await fetch("/api/mint-voucher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: address }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Unable to prepare your mint. Please try again.' }));
        throw new Error(data.error || "Unable to prepare your mint. Please try again.");
      }

      const data = await response.json();

      if (!data.success || !data.voucher || !data.signature) {
        throw new Error("Something went wrong. Please try again.");
      }

      // Convert string values back to BigInt
      const voucherData = {
        voucher: {
          user: data.voucher.user as Hex,
          expiresAt: BigInt(data.voucher.expiresAt),
          nonce: BigInt(data.voucher.nonce),
        },
        signature: data.signature as Hex,
      };

      setVoucher(voucherData);
      setState('ready');
      return voucherData;  // Return voucher data for direct use
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : "";
      // Preserve already-friendly messages, humanize others
      const message = rawMessage.includes("verify your scores") || rawMessage.includes("Please")
        ? rawMessage
        : humanizeError(rawMessage);
      setError(message);
      setState('error');
      return null;
    }
  }, [address]);

  const mint = useCallback(async (voucherParam?: { voucher: MintVoucher; signature: Hex } | null) => {
    // Use passed voucher (preferred) or fall back to state
    const voucherToUse = voucherParam || voucher;

    if (!voucherToUse) {
      setError("Please click the button again to mint.");
      setState('error');
      return;
    }

    setState('minting');
    setError(null);

    try {
      // Simulate the transaction first
      const { request } = await simulateContract(wagmiConfig, {
        address: CONTRACTS.ProfileSBT as `0x${string}`,
        abi: ProfileSBTABI,
        functionName: "mintProfile",
        args: [
          {
            user: voucherToUse.voucher.user,
            expiresAt: voucherToUse.voucher.expiresAt,
            nonce: voucherToUse.voucher.nonce,
          },
          voucherToUse.signature,
        ],
      });

      // Execute the transaction
      const hash = await writeContract(wagmiConfig, request);
      setTxHash(hash);

      // Wait for confirmation
      setState('confirming');
      await waitForTransactionReceipt(wagmiConfig, { hash });

      setHasMinted(true);
      setState('success');
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : "";
      const message = humanizeError(rawMessage);
      setError(message);
      setState('error');
    }
  }, [voucher]);

  const reset = useCallback(() => {
    setState(hasMinted ? 'success' : 'idle');
    setError(null);
    setTxHash(null);
    setVoucher(null);
  }, [hasMinted]);

  return { 
    state, 
    error, 
    txHash, 
    hasMinted,
    checkMintStatus,
    fetchVoucher, 
    mint, 
    reset 
  };
}
