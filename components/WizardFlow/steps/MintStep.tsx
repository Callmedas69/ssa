"use client";

import { useReadContract } from "wagmi";
import { OnchainProfileCard } from "@/components/OnchainProfileCard";
import { ProfileSBTABI } from "@/abi/ProfileSBT";
import { CONTRACTS } from "@/abi/addresses";
import type { UserIdentity, SSAIndexTier } from "@/lib/types";

interface MintStepProps {
  address: `0x${string}`;
  identity: UserIdentity | null;
  ssaIndex: number | null;
  ssaTier?: SSAIndexTier | null;
  hasMintedSBT?: boolean;
  passportScore?: number | null;
}

export function MintStep({
  address,
  identity,
  ssaIndex,
  ssaTier,
  hasMintedSBT,
  passportScore,
}: MintStepProps) {
  const { data: totalSupply } = useReadContract({
    address: CONTRACTS.ProfileSBT as `0x${string}`,
    abi: ProfileSBTABI,
    functionName: "totalSupply",
    query: { staleTime: 1000 * 60 * 60 }, // 1 hour - totalSupply rarely changes
  });

  return (
    <div className="space-y-8">
      {/* Introduction Text */}
      <div className="text-center">
        <h3 className="text-5xl sm:text-6xl font-[family-name:var(--font-luckiest-guy)] text-[#2D2A26] mb-2 retro-text-3d">
          Attest & Mint
        </h3>
        <p className="text-[#8B8680] text-sm max-w-md mx-auto italic">
          Attest your scores to the blockchain
        <br />
        Mint your unique Soulbound Token (SBT).
        </p>
      </div>

      {/* Divider */}
      <hr className="border-t-2 border-[#2D2A26] opacity-20" />

      {/* Onchain Profile Card */}
      <div className="flex justify-center">
        <OnchainProfileCard
          address={address}
          identity={identity}
          ssaIndex={ssaIndex}
          ssaTier={ssaTier}
          hasMintedSBT={hasMintedSBT}
          passportScore={passportScore}
        />
      </div>

      {/* Helper Text */}
      <div className="text-center">
        <p className="text-[10px] text-[#8B8680] italic">
          {!hasMintedSBT
            ? "First, attest your scores onchain. Then mint your SBT Profile."
            : "You can update your scores again after 24 hours."}
        </p>
        {totalSupply !== undefined && (
          <p className="text-[10px] text-[#8B8680] mt-2 italic">
            {totalSupply.toString()} attested
          </p>
        )}
      </div>
    </div>
  );
}
