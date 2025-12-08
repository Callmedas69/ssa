import { createPublicClient, http } from 'viem';
import { mainnet, base } from 'viem/chains';
import { normalize } from 'viem/ens';

/**
 * User identity information (ENS, Basename)
 */
export interface UserIdentity {
  ens: string | null;
  basename: string | null;
}

// Server-side client for ENS resolution
const mainnetRpcUrl = process.env.NEXT_PUBLIC_MAINNET_RPC_URL || process.env.NEXT_PUBLIC_RPC_URL || 'https://eth.llamarpc.com';

const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(mainnetRpcUrl, {
    timeout: 10_000,
    retryCount: 2,
    retryDelay: 500,
  }),
});

/**
 * Helper to race a promise with a timeout
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeoutMs)
    ),
  ]);
}

/**
 * Resolve ENS name for an address (mainnet .eth names)
 * Silently returns null on any error to avoid blocking UI
 */
async function resolveEns(address: string): Promise<string | null> {
  try {
    console.log('[ENS] Resolving for:', address);
    const ensName = await withTimeout(
      mainnetClient.getEnsName({
        address: address as `0x${string}`,
      }),
      8_000
    );
    console.log('[ENS] Result:', ensName);
    // Only return if it's a mainnet .eth name (not .base.eth)
    if (ensName && ensName.endsWith('.eth') && !ensName.endsWith('.base.eth')) {
      return ensName;
    }
    return null;
  } catch (error) {
    console.error('[ENS] Resolution error:', error);
    return null;
  }
}

/**
 * Resolve Basename for an address (Base .base.eth names)
 * Uses a separate client on Base chain to query the L2 resolver directly
 * Silently returns null on any error to avoid blocking UI
 */
async function resolveBasename(address: string): Promise<string | null> {
  try {
    console.log('[Basename] Resolving for:', address);
    
    // Create a Base chain client for L2 resolution
    const baseClient = createPublicClient({
      chain: base,
      transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'),
    });
    
    // Query Basename on Base chain
    const basename = await withTimeout(
      baseClient.getEnsName({
        address: address as `0x${string}`,
      }),
      8_000
    );
    
    console.log('[Basename] Result:', basename);
    if (basename?.endsWith('.base.eth')) {
      return basename;
    }
    return null;
  } catch (error) {
    console.error('[Basename] Resolution error:', error);
    return null;
  }
}

/**
 * Resolve both ENS and Basename for an address
 */
export async function resolveIdentity(address: string): Promise<UserIdentity> {
  console.log('[Identity] Resolving for address:', address);
  
  const [ens, basename] = await Promise.all([
    resolveEns(address),
    resolveBasename(address),
  ]);

  console.log('[Identity] Resolution result:', { ens, basename });
  return { ens, basename };
}
