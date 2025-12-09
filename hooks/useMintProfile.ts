'use client';

import { useState, useCallback } from "react";
import { writeContract, simulateContract, waitForTransactionReceipt, readContract } from "wagmi/actions";
import { wagmiConfig } from "@/lib/wagmi/config";
import { useAccount } from "wagmi";
import { CONTRACTS } from "@/abi/addresses";
import { ProfileSBTABI } from "@/abi/ProfileSBT";
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

  const fetchVoucher = useCallback(async () => {
    if (!address) {
      setError("Wallet not connected");
      setState('error');
      return;
    }

    setState('fetching');
    setError(null);

    try {
      // Request voucher from backend
      const response = await fetch("/api/mint-voucher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: address }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch mint voucher");
      }

      const data = await response.json();
      
      if (!data.success || !data.voucher || !data.signature) {
        throw new Error("Invalid voucher response");
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
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error fetching voucher";
      setError(message);
      setState('error');
      return false;
    }
  }, [address]);

  const mint = useCallback(async () => {
    if (!voucher) {
      setError("No voucher available");
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
            user: voucher.voucher.user,
            expiresAt: voucher.voucher.expiresAt,
            nonce: voucher.voucher.nonce,
          },
          voucher.signature,
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
      const message = err instanceof Error ? err.message : "Unknown error minting profile";
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
