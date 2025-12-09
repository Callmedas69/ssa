"use client";

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
  const { nextAllowedTime } = useSubmitScores();
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div
      className={
        theme === "mac1"
          ? "mac1-window bg-white p-1 max-w-2xl"
          : "rounded-lg border border-border bg-card p-4 max-w-2xl"
      }
    >
      {theme === "mac1" && (
        <div className="mac1-title-bar mb-2">
          <h3 className="uppercase text-[11px]">Onchain Profile</h3>
        </div>
      )}
      <div
        className={theme === "mac1" ? "mac1-inset bg-white p-4" : "space-y-4"}
      >
        <div className="grid grid-cols-[auto_1fr] gap-6">
          {/* Profile SBT Display */}
          <ProfileSBTDisplay hasMinted={hasMintedSBT} />

          {/* Profile Details */}
          <div className="space-y-4">
            <div className="space-y-3">
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

              {nextAllowedTime && (
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

            <div className="flex gap-3 pt-2">
              <div className="flex-1 min-w-[140px]">
                <SubmitScoresButton
                  disabled={ssaIndex === null}
                  hasMinted={hasMintedSBT}
                />
              </div>
              <div className="flex-1 min-w-[140px]">
                <MintProfileButton
                  hasAttested={ssaIndex !== null && ssaIndex > 0}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
