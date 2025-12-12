"use client";

import { useState, useCallback } from "react";
import { ProfileSBTDisplay } from "./ProfileSBTDisplay";
import { SubmitScoresButton } from "./SubmitScoresButton";
import { MintProfileButton } from "./MintProfileButton";
import { CountdownTimer } from "./CountdownTimer";
import { useSubmitScores } from "@/hooks/useSubmitScores";
import type { UserIdentity } from "@/lib/types";
import { useTheme } from "./ThemeProvider";

interface OnchainProfileCardProps {
  address: string;
  identity: UserIdentity | null;
  ssaIndex: number | null;
  ssaTier?: string | null;
  hasMintedSBT?: boolean;
}

export function OnchainProfileCard({
  address,
  identity,
  ssaIndex,
  ssaTier,
  hasMintedSBT,
}: OnchainProfileCardProps) {
  const { theme } = useTheme();
  const { nextAllowedTime, lastSubmissionTime } = useSubmitScores();

  // Track if user just completed attestation in this session
  const [justAttested, setJustAttested] = useState(false);

  // Callback when attestation succeeds
  const handleAttestSuccess = useCallback(() => {
    setJustAttested(true);
  }, []);

  // User has attested if: just completed attestation OR has a previous submission on-chain
  const hasAttested = justAttested || (lastSubmissionTime !== null && lastSubmissionTime > 0);
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  // Only show countdown if cooldown is still active
  const isInCooldown = nextAllowedTime && nextAllowedTime > Math.floor(Date.now() / 1000);

  // Retro theme styling
  if (theme === "retro") {
    return (
      <div className="max-w-2xl w-full">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6">
          {/* Profile SBT Display */}
          <div className="flex justify-center md:justify-start">
            <ProfileSBTDisplay hasMinted={hasMintedSBT} address={address as `0x${string}`} />
          </div>

          {/* Profile Details */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-sm font-bold text-[#2D2A26] uppercase">
                  ENS
                </span>
                <span className="text-sm text-[#2D2A26]">
                  {identity?.ens || "—"}
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-4">
                <span className="text-sm font-bold text-[#2D2A26] uppercase">
                  Basename
                </span>
                <span className="text-sm text-[#2D2A26]">
                  {identity?.basename || "—"}
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-4">
                <span className="text-sm font-bold text-[#2D2A26] uppercase">
                  Wallet
                </span>
                <span className="text-sm text-[#2D2A26] font-mono">
                  {shortAddress}
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-4">
                <span className="text-sm font-bold text-[#2D2A26] uppercase">
                  SSA Index
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-[#2D2A26]">
                    {ssaIndex !== null ? ssaIndex : "—"}
                  </span>
                  {ssaTier && (
                    <span className="text-xs font-bold text-[#E85D3B] uppercase">
                      {ssaTier === "bronze" && "NEWCOMER"}
                      {ssaTier === "silver" && "RISING"}
                      {ssaTier === "gold" && "TRUSTED"}
                      {ssaTier === "platinum" && "LEGEND"}
                    </span>
                  )}
                </div>
              </div>

              {isInCooldown && (
                <div className="flex items-baseline justify-between gap-4 pt-2 border-t border-[#E8E3DB]">
                  <span className="text-sm font-bold text-[#2D2A26] uppercase">
                    Next Update
                  </span>
                  <span className="text-sm text-[#E85D3B] font-mono font-bold">
                    <CountdownTimer targetTime={nextAllowedTime} />
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              <div className="sm:flex-1">
                <SubmitScoresButton
                  disabled={ssaIndex === null}
                  hasMinted={hasMintedSBT}
                  onAttestSuccess={handleAttestSuccess}
                />
              </div>
              <div className="sm:flex-1">
                <MintProfileButton hasAttested={hasAttested} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mac1 theme (legacy)
  return (
    <div className="mac1-window bg-white p-1 max-w-2xl w-full">
      <div className="mac1-title-bar mb-2">
        <h3 className="uppercase text-[11px]">Onchain Profile</h3>
      </div>
      <div className="mac1-inset bg-white p-4">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6">
          {/* Profile SBT Display */}
          <div className="flex justify-center md:justify-start">
            <ProfileSBTDisplay hasMinted={hasMintedSBT} address={address as `0x${string}`} />
          </div>

          {/* Profile Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-baseline justify-between gap-8">
                <span className="text-[11px] font-bold text-black uppercase">
                  ENS
                </span>
                <span className="text-[11px] font-semibold text-black">
                  {identity?.ens || ":"}
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-8">
                <span className="text-[11px] font-bold text-black uppercase">
                  Basenames
                </span>
                <span className="text-[11px] font-semibold text-black">
                  {identity?.basename || ":"}
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-8">
                <span className="text-[11px] font-bold text-black uppercase">
                  Wallet
                </span>
                <span className="text-[11px] font-semibold text-black font-mono">
                  {shortAddress}
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-8">
                <span className="text-[11px] font-bold text-black uppercase">
                  SSA Index
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-black">
                    {ssaIndex !== null ? ssaIndex : ":"}
                  </span>
                  {ssaTier && (
                    <span className="text-[11px] text-black capitalize">
                      {ssaTier}
                    </span>
                  )}
                </div>
              </div>

              {isInCooldown && (
                <div className="flex items-baseline justify-between gap-8 pt-2">
                  <span className="text-[11px] font-bold text-black uppercase">
                    Next Attestation
                  </span>
                  <span className="text-[11px] font-semibold text-black font-mono">
                    <CountdownTimer targetTime={nextAllowedTime} />
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3">
              <div className="sm:flex-1 sm:min-w-[140px]">
                <SubmitScoresButton
                  disabled={ssaIndex === null}
                  hasMinted={hasMintedSBT}
                  onAttestSuccess={handleAttestSuccess}
                />
              </div>
              <div className="sm:flex-1 sm:min-w-[140px]">
                <MintProfileButton hasAttested={hasAttested} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
