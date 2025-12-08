import { base } from 'viem/chains';
import { CONTRACTS } from '@/abi/addresses';

/**
 * Contract deployment addresses on Base Mainnet (source of truth: abi/addresses.ts)
 */
export const CONTRACT_ADDRESSES = {
  [base.id]: {
    socialScoreAttestator: CONTRACTS.SocialScoreAttestator as `0x${string}`,
    profileSBT: CONTRACTS.ProfileSBT as `0x${string}`,
  },
} as const;

/**
 * EIP-712 Domain for SocialScoreAttestator
 * IMPORTANT: Must match the domain name in the deployed contract
 * Source: SocialScoreAttestator.sol line 139: __EIP712_init("SocialScoreHub", "1")
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
