import { base } from 'viem/chains';

/**
 * Contract deployment addresses
 * Update these after deploying to mainnet/testnet
 */
export const CONTRACT_ADDRESSES = {
  [base.id]: {
    socialScoreAttestator: '' as `0x${string}`, // TODO: Update after deployment
    profileSBT: '' as `0x${string}`, // TODO: Update after deployment
  },
} as const;

/**
 * EIP-712 Domain for SocialScoreAttestator
 */
export const SSA_EIP712_DOMAIN = {
  name: 'SocialScoreHub',
  version: '1',
} as const;

/**
 * EIP-712 Domain for ProfileSBT
 */
export const PROFILE_SBT_EIP712_DOMAIN = {
  name: 'ProfileSBT',
  version: '1',
} as const;

/**
 * Get contract addresses for a given chain ID
 */
export function getContractAddresses(chainId: number) {
  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  if (!addresses) {
    throw new Error(`No contract addresses configured for chain ${chainId}`);
  }
  return addresses;
}
