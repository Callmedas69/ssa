'use client';

import { useReadContract } from 'wagmi';
import { CONTRACTS } from '@/abi/addresses';
import { ProfileSBTABI } from '@/abi/ProfileSBT';

export function useHasMintedSBT(address?: string) {
  const { data, isLoading } = useReadContract({
    address: CONTRACTS.ProfileSBT as `0x${string}`,
    abi: ProfileSBTABI,
    functionName: 'hasMinted',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  });

  return {
    hasMinted: data as boolean | undefined,
    isLoading,
  };
}
