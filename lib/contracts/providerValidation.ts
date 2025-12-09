import { type Hex } from "viem";
import { getPublicClient } from "wagmi/actions";
import { wagmiConfig } from "@/lib/wagmi/config";
import { CONTRACTS } from "@/abi/addresses";
import { SocialScoreAttestatorABI } from "@/abi/SocialScoreAttestator";

/**
 * Retry helper with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 500
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = baseDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries reached');
}

/**
 * Validate that all providerIds exist on-chain
 * Includes retry logic for transient RPC failures and rate limiting
 */
export async function validateProvidersOnChain(providers: Hex[]) {
  const client = getPublicClient(wagmiConfig);

  const details: { providerId: Hex; allowed: boolean }[] = [];
  const invalid: Hex[] = [];

  for (let i = 0; i < providers.length; i++) {
    const pid = providers[i];
    let allowed = false;

    try {
      allowed = await retryWithBackoff(
        () => client.readContract({
          address: CONTRACTS.SocialScoreAttestator as `0x${string}`,
          abi: SocialScoreAttestatorABI,
          functionName: "isProviderAllowed",
          args: [pid],
        }),
        3, // 3 retries
        500 // 500ms base delay (500ms, 1s, 2s)
      );
    } catch (error) {
      console.error(`Provider validation failed after retries for ${pid}:`, error);
      allowed = false;
    }

    details.push({ providerId: pid, allowed });
    if (!allowed) invalid.push(pid);

    // Add small delay between checks to avoid rate limiting
    // Skip delay after last provider
    if (i < providers.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return {
    valid: invalid.length === 0,
    invalidProviders: invalid,
    details,
  };
}

/**
 * Check contract paused state
 */
export async function isContractPaused(): Promise<boolean> {
  const client = getPublicClient(wagmiConfig);

  try {
    return await client.readContract({
      address: CONTRACTS.SocialScoreAttestator as `0x${string}`,
      abi: SocialScoreAttestatorABI,
      functionName: "paused",
    });
  } catch {
    return false;
  }
}

/**
 * Get backend signer address used by your backend for EIP-712 signing
 */
export async function getBackendSigner(): Promise<Hex | null> {
  const client = getPublicClient(wagmiConfig);

  try {
    return (await client.readContract({
      address: CONTRACTS.SocialScoreAttestator as `0x${string}`,
      abi: SocialScoreAttestatorABI,
      functionName: "backendSigner",
    })) as Hex;
  } catch {
    return null;
  }
}

/**
 * Human-readable providerId
 */
export function formatProviderId(providerId: Hex): string {
  const known: Record<string, string> = {
    "0xce5f729620e102f0dbd6ae8f0512a9975ead77639fa81bd6ad3e3a0f0fdbefff": "ETHOS",
    "0xe2d80ec67da1ba0903493542957d0b324290cfc686e0e7ec6797916960833925": "NEYNAR",
    "0xaeefb81ec4b9639c4a6864ef1fb687a12a8d9aeeb43619c1ae348f8bf0be53b7": "TALENT_BUILDER",
    "0x62003533de463e0c39a993139f4ac7963fccc6a5229152572523b4625f0eaf44": "TALENT_CREATOR",
    "0x182df985acd3aa110a13a97aa8ed9b1d53c26db260279a9a5312ba12d8145bf1": "PASSPORT",
    "0xf0394fe85e01da6124457b01aba2af68d2ca992423ab678d107bd155bd575f5a": "QUOTIENT",
  };

  const id = providerId.toLowerCase();
  return known[id] ?? `${providerId.slice(0, 10)}...${providerId.slice(-8)}`;
}
