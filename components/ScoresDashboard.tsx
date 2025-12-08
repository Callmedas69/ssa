"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { SSAIndexCard } from "./SSAIndexCard";
import { ScoreCard } from "./ScoreCard";
import { SubmitScoresButton } from "./SubmitScoresButton";
import { AllProviderGuidance } from "./ProviderGuidance";
import { UserIdentity } from "./UserIdentity";
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
    <div className="space-y-6">
      {/* User Identity */}
      {address && (
        <div className="text-center">
          <UserIdentity identity={scores?.identity ?? null} address={address} />
        </div>
      )}

      {/* SSA Index Hero Card */}
      <div className="max-w-lg mx-auto space-y-4">
        <SSAIndexCard data={scores?.ssaIndex ?? null} isLoading={isLoading} />
        {/* Attest On-Chain Button */}
        {scores && !isLoading && (
          <SubmitScoresButton disabled={!scores.ssaIndex} />
        )}
      </div>

      {/* Provider Score Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
