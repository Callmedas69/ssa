import { createPublicClient, http, getAddress } from 'viem';
import { mainnet, base } from 'viem/chains';

/**
 * User identity information (ENS, Basename)
 */
export interface UserIdentity {
  ens: string | null;
  basename: string | null;
}

// Mainnet client for ENS resolution
const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(
    process.env.NEXT_PUBLIC_MAINNET_RPC_URL || 
    process.env.NEXT_PUBLIC_RPC_URL || 
    'https://eth.llamarpc.com',
    {
      timeout: 10_000,
      retryCount: 2,
      retryDelay: 500,
    }
  ),
});

// Base client for Basename resolution
const baseClient = createPublicClient({
  chain: base,
  transport: http(
    process.env.NEXT_PUBLIC_BASE_RPC_URL || 
    'https://mainnet.base.org',
    {
      timeout: 15_000, // Increased timeout for Base RPC
      retryCount: 3,
      retryDelay: 1000,
    }
  ),
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
 * Resolve ENS name on Ethereum mainnet
 * Returns only .eth names (excludes .base.eth)
 */
async function resolveEnsOnMainnet(address: string): Promise<string | null> {
  try {
    console.log('[ENS] Resolving for:', address);
    const ensName = await withTimeout(
      mainnetClient.getEnsName({
        address: address as `0x${string}`,
      }),
      8_000
    );
    console.log('[ENS] Raw result:', ensName);
    
    // Only return traditional .eth names, not .base.eth
    if (ensName && ensName.endsWith('.eth') && !ensName.endsWith('.base.eth')) {
      console.log('[ENS] Returning:', ensName);
      return ensName;
    }
    console.log('[ENS] Filtered out (not a .eth or is .base.eth)');
    return null;
  } catch (error) {
    console.error('[ENS] Error:', error);
    return null;
  }
}

/**
 * Resolve Basename on Base L2
 * Returns only .base.eth names
 * Uses the ReverseRegistrar contract directly since Base doesn't have ensUniversalResolver
 */
async function resolveBasenameOnBase(address: string): Promise<string | null> {
  try {
    console.log('[Basename] Resolving for:', address);
    
    // Base ReverseRegistrar contract address
    const REVERSE_REGISTRAR = getAddress('0x79ea96012eea67a83431f1701b3dff7e37f9e282');
    
    // Call node() to get the reverse node for this address
    const reverseNode = await baseClient.readContract({
      address: REVERSE_REGISTRAR,
      abi: [{
        name: 'node',
        type: 'function',
        stateMutability: 'pure',
        inputs: [{ name: 'addr', type: 'address' }],
        outputs: [{ name: '', type: 'bytes32' }],
      }],
      functionName: 'node',
      args: [address as `0x${string}`],
    });
    
    // L2Resolver contract address
    const L2_RESOLVER = getAddress('0xC6d566A56A1aFf6508b41f6C90Ff131615583BCD');
    
    // Get the name from the resolver
    const basename = await withTimeout(
      baseClient.readContract({
        address: L2_RESOLVER,
        abi: [{
          name: 'name',
          type: 'function',
          stateMutability: 'view',
          inputs: [{ name: 'node', type: 'bytes32' }],
          outputs: [{ name: '', type: 'string' }],
        }],
        functionName: 'name',
        args: [reverseNode],
      }) as Promise<string>,
      8_000
    );
    
    console.log('[Basename] Raw result:', basename);
    
    // Only return .base.eth names
    if (basename && basename.endsWith('.base.eth')) {
      console.log('[Basename] Returning:', basename);
      return basename;
    }
    console.log('[Basename] Filtered out (not a .base.eth)');
    return null;
  } catch (error) {
    console.error('[Basename] Error:', error);
    return null;
  }
}

/**
 * Resolve both ENS (mainnet) and Basename (Base L2) for an address
 */
export async function resolveIdentity(address: string): Promise<UserIdentity> {
  console.log('[Identity] Resolving for address:', address);
  
  const [ens, basename] = await Promise.all([
    resolveEnsOnMainnet(address),
    resolveBasenameOnBase(address),
  ]);

  console.log('[Identity] Final result:', { ens, basename });
  return { ens, basename };
}
