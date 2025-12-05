import { createPublicClient, http, toCoinType } from 'viem';
import { mainnet, base } from 'viem/chains';

/**
 * User identity information (ENS, Basename)
 */
export interface UserIdentity {
  ens: string | null;
  basename: string | null;
}

// Resolution always starts from mainnet (even for Basenames)
// Per ENSIP-19, L2 names resolve via mainnet with coinType
const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

/**
 * Resolve ENS name for an address (mainnet .eth names)
 */
async function resolveEns(address: string): Promise<string | null> {
  try {
    const ensName = await mainnetClient.getEnsName({
      address: address as `0x${string}`,
    });
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
 * Uses mainnet client with coinType for L2 resolution per ENSIP-19
 */
async function resolveBasename(address: string): Promise<string | null> {
  try {
    const basename = await mainnetClient.getEnsName({
      address: address as `0x${string}`,
      coinType: toCoinType(base.id),
    });
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
  const [ens, basename] = await Promise.all([
    resolveEns(address),
    resolveBasename(address),
  ]);

  return { ens, basename };
}
