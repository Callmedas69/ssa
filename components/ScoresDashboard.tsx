"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { OnchainProfileCard } from "./OnchainProfileCard";
import { ScoreCard } from "./ScoreCard";
import { AllProviderGuidance } from "./ProviderGuidance";
import { useHasMintedSBT } from "@/hooks/useHasMintedSBT";
import type { SocialScores, ScoreApiResponse } from "@/lib/types";

async function fetchScores(address: string): Promise<SocialScores> {
  try {
    const response = await fetch(`/api/scores?address=${address}`);

    if (!response.ok) {
      throw new Error(
        `API returned ${response.status}: ${response.statusText}`
      );
    }

    const result: ScoreApiResponse = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || "Failed to fetch scores");
    }

    return result.data;
  } catch (error) {
    if (error instanceof Error) {
      // Re-throw with better context
      throw new Error(`Failed to fetch scores: ${error.message}`);
    }
    throw error;
  }
}

export function ScoresDashboard() {
  const { address, isConnected } = useAccount();
  const [showGuidance, setShowGuidance] = useState(false);
  const { hasMinted } = useHasMintedSBT(address);

  const {
    data: scores,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["scores", address],
    queryFn: () => fetchScores(address!),
    enabled: !!address && isConnected,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache 30 minutes
    retry: 2,
  });

  // Debug logging
  if (scores) {
    console.log("[ScoresDashboard] Scores data:", scores);
    console.log("[ScoresDashboard] Identity:", scores.identity);
  }

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Connect your wallet to view your social scores
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-destructive font-semibold">Error Loading Scores</p>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Failed to fetch scores"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 flex flex-col items-center p-4">
      {/* Onchain Profile Card */}
      {address && (
        <OnchainProfileCard
          address={address}
          identity={scores?.identity ?? null}
          ssaIndex={scores?.ssaIndex?.score ?? null}
          ssaTier={scores?.ssaIndex?.tier ?? null}
          hasMintedSBT={hasMinted}
        />
      )}

      {/* Provider Score Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-6xl w-full">
        {/* SSA Index Card */}
        <div className="mac1-window bg-white p-1">
          <div className="mac1-title-bar mb-2">
            <h3 className="uppercase text-[11px]">SSA Index</h3>
          </div>
          <div className="mac1-inset bg-white p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold">Max: 100</span>
            </div>
            <p className="text-[11px] mb-4 italic text-black">
              Social Score Attestation Index
            </p>

            {isLoading ? (
              <>
                <div className="h-8 w-16 bg-[#E8E8E8] mb-3 animate-pulse" />
                <div className="h-4 w-full bg-[#E8E8E8] animate-pulse" />
              </>
            ) : scores?.ssaIndex ? (
              <>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-3xl font-bold text-black">
                    {scores.ssaIndex.score}
                  </span>
                  {scores.ssaIndex.tier && (
                    <span className="text-[11px] text-black capitalize">
                      {scores.ssaIndex.tier}
                    </span>
                  )}
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={scores.ssaIndex.score}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`SSA Index: ${scores.ssaIndex.score}`}
                  className="h-4 w-full mac1-inset bg-white"
                >
                  <div
                    className="h-full bg-[#000000] transition-all duration-500"
                    style={{ width: `${scores.ssaIndex.score}%` }}
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <span className="text-black text-[11px]">No scores yet</span>
              </div>
            )}
          </div>
        </div>

        <ScoreCard
          provider="neynar"
          data={scores?.neynar ?? null}
          isLoading={isLoading}
        />
        <ScoreCard
          provider="ethos"
          data={scores?.ethos ?? null}
          isLoading={isLoading}
        />
        <ScoreCard
          provider="talentBuilder"
          data={scores?.talentBuilder ?? null}
          isLoading={isLoading}
        />
        <ScoreCard
          provider="talentCreator"
          data={scores?.talentCreator ?? null}
          isLoading={isLoading}
        />
        <ScoreCard
          provider="quotient"
          data={scores?.quotient ?? null}
          isLoading={isLoading}
        />
        <ScoreCard
          provider="passport"
          data={scores?.passport ?? null}
          isLoading={isLoading}
        />
      </div>

      {/* Improve Your Scores Section */}
      {scores && !isLoading && (
        <div className="space-y-4">
          <button
            onClick={() => setShowGuidance(!showGuidance)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
          >
            <span>{showGuidance ? "Hide" : "Show"} improvement tips</span>
            <svg
              className={`w-4 h-4 transition-transform ${
                showGuidance ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showGuidance && (
            <AllProviderGuidance
              scores={{
                neynar: scores.neynar,
                ethos: scores.ethos,
                talentBuilder: scores.talentBuilder,
                talentCreator: scores.talentCreator,
                quotient: scores.quotient,
                passport: scores.passport,
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
