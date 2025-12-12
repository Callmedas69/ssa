"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import Image from "next/image";
import { OnchainProfileCard } from "./OnchainProfileCard";
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
      <div className="text-center py-16 px-4">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D2A26] mb-4 retro-text-3d">
          STAND OUT FROM THE CROWD
        </h2>
        <p className="text-[#8B8680] text-lg mb-8">
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
    <div className="space-y-6 flex flex-col items-center p-4 sm:p-8">
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

      {/* Share Buttons */}
      {scores?.ssaIndex && address && !isLoading && (
        <div className="flex gap-3 justify-center max-w-2xl w-full">
          <button
            onClick={() => {
              const tierLabels: Record<string, string> = {
                bronze: "NEWCOMER",
                silver: "RISING STAR",
                gold: "TRUSTED",
                platinum: "LEGENDARY",
              };
              const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trustcheck.geoart.studio";
              const text = `My SSA Index is ${scores.ssaIndex?.score} - ${tierLabels[scores.ssaIndex?.tier || "bronze"]}! Check your onchain reputation score at`;
              window.open(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(appUrl)}`,
                "_blank",
                "noopener,noreferrer"
              );
            }}
            className="flex-1 px-4 py-2 bg-[#000] text-white font-bold uppercase tracking-wide rounded-lg border-2 border-[#2D2A26] shadow-[3px_3px_0_#2D2A26] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_#2D2A26] transition-all duration-150 flex items-center justify-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Share on X
          </button>

          <button
            onClick={() => {
              const tierLabels: Record<string, string> = {
                bronze: "NEWCOMER",
                silver: "RISING STAR",
                gold: "TRUSTED",
                platinum: "LEGENDARY",
              };
              const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trustcheck.geoart.studio";
              const text = `My SSA Index is ${scores.ssaIndex?.score} - ${tierLabels[scores.ssaIndex?.tier || "bronze"]}! Check your onchain reputation score at ${appUrl}`;
              window.open(
                `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`,
                "_blank",
                "noopener,noreferrer"
              );
            }}
            className="flex-1 px-4 py-2 bg-[#8A63D2] text-white font-bold uppercase tracking-wide rounded-lg border-2 border-[#2D2A26] shadow-[3px_3px_0_#2D2A26] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_#2D2A26] transition-all duration-150 flex items-center justify-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.24 3H5.76A2.76 2.76 0 003 5.76v12.48A2.76 2.76 0 005.76 21h12.48A2.76 2.76 0 0021 18.24V5.76A2.76 2.76 0 0018.24 3zM12 17.4a5.4 5.4 0 110-10.8 5.4 5.4 0 010 10.8z" />
            </svg>
            Share on Farcaster
          </button>
        </div>
      )}

      {/* SSA Index Card */}
      <div className="retro-card p-6 max-w-2xl w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="uppercase text-sm font-bold text-[#2D2A26] tracking-wide">
            SSA Index
          </h3>
          <span className="text-xs text-[#8B8680] font-medium">Max: 100</span>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-12 w-24 bg-[#E8E3DB] rounded animate-pulse" />
            <div className="retro-progress">
              <div className="retro-progress-fill w-0" />
            </div>
          </div>
        ) : scores?.ssaIndex ? (
          <div className="space-y-4">
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-bold text-[#2D2A26] retro-text-3d-sm">
                {scores.ssaIndex.score}
              </span>
              {scores.ssaIndex.tier && (
                <span className="text-sm font-bold text-[#E85D3B] uppercase tracking-wide px-2 py-1 bg-[#F5F0E8] border border-[#2D2A26] rounded">
                  {scores.ssaIndex.tier === 'bronze' && 'NEWCOMER'}
                  {scores.ssaIndex.tier === 'silver' && 'RISING STAR'}
                  {scores.ssaIndex.tier === 'gold' && 'TRUSTED'}
                  {scores.ssaIndex.tier === 'platinum' && 'LEGENDARY'}
                </span>
              )}
            </div>
            <div
              role="progressbar"
              aria-valuenow={scores.ssaIndex.score}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`SSA Index: ${scores.ssaIndex.score}`}
              className="retro-progress"
            >
              <div
                className="retro-progress-fill"
                style={{ width: `${scores.ssaIndex.score}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <span className="text-[#8B8680]">No scores yet</span>
          </div>
        )}
      </div>

      {/* Score Breakdown */}
      {scores && !isLoading && (
        <div className="retro-card p-6 max-w-2xl w-full">
          <h3 className="uppercase text-sm font-bold text-[#2D2A26] tracking-wide mb-4">
            Provider Scores
          </h3>
          <div className="space-y-3">
            {/* Neynar */}
            {scores.neynar && (
              <div className="flex items-center gap-3">
                <Image
                  src="/provider_logos/Neynar_400x400.jpg"
                  alt="Neynar"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span className="text-sm font-bold text-[#2D2A26] w-28">
                  Neynar
                </span>
                <span className="text-sm text-[#2D2A26] font-mono w-14 text-right">
                  {scores.neynar.score.toFixed(2)}
                </span>
                <div className="flex-1 retro-progress h-4">
                  <div
                    className="retro-progress-fill"
                    style={{ width: `${(scores.neynar.score / 1) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-[#8B8680] w-10 text-right">/ 1</span>
              </div>
            )}
            {/* Ethos */}
            {scores.ethos && (
              <div className="flex items-center gap-3">
                <Image
                  src="/provider_logos/ethos_logo.png"
                  alt="Ethos"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span className="text-sm font-bold text-[#2D2A26] w-28">
                  Ethos
                </span>
                <span className="text-sm text-[#2D2A26] font-mono w-14 text-right">
                  {scores.ethos.score}
                </span>
                <div className="flex-1 retro-progress h-4">
                  <div
                    className="retro-progress-fill"
                    style={{ width: `${(scores.ethos.score / 2800) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-[#8B8680] w-10 text-right">/ 2800</span>
              </div>
            )}
            {/* Talent Builder */}
            {scores.talentBuilder && (
              <div className="flex items-center gap-3">
                <Image
                  src="/provider_logos/Talent_Protocol.jpg"
                  alt="Builder"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span className="text-sm font-bold text-[#2D2A26] w-28">
                  Builder
                </span>
                <span className="text-sm text-[#2D2A26] font-mono w-14 text-right">
                  {scores.talentBuilder.score}
                </span>
                <div className="flex-1 retro-progress h-4">
                  <div
                    className="retro-progress-fill"
                    style={{
                      width: `${Math.min(
                        (scores.talentBuilder.score / 1000) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-[#8B8680] w-10 text-right">/ ∞</span>
              </div>
            )}
            {/* Talent Creator */}
            {scores.talentCreator && (
              <div className="flex items-center gap-3">
                <Image
                  src="/provider_logos/Talent_Protocol.jpg"
                  alt="Creator"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span className="text-sm font-bold text-[#2D2A26] w-28">
                  Creator
                </span>
                <span className="text-sm text-[#2D2A26] font-mono w-14 text-right">
                  {scores.talentCreator.score}
                </span>
                <div className="flex-1 retro-progress h-4">
                  <div
                    className="retro-progress-fill"
                    style={{
                      width: `${Math.min(
                        (scores.talentCreator.score / 1000) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-[#8B8680] w-10 text-right">/ ∞</span>
              </div>
            )}
            {/* Quotient */}
            {scores.quotient && (
              <div className="flex items-center gap-3">
                <Image
                  src="/provider_logos/Quotient.png"
                  alt="Quotient"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span className="text-sm font-bold text-[#2D2A26] w-28">
                  Quotient
                </span>
                <span className="text-sm text-[#2D2A26] font-mono w-14 text-right">
                  {scores.quotient.score.toFixed(2)}
                </span>
                <div className="flex-1 retro-progress h-4">
                  <div
                    className="retro-progress-fill"
                    style={{ width: `${scores.quotient.score * 100}%` }}
                  />
                </div>
                <span className="text-xs text-[#8B8680] w-10 text-right">/ 1</span>
              </div>
            )}
            {/* Passport */}
            {scores.passport && (
              <div className="flex items-center gap-3">
                <Image
                  src="/provider_logos/human_paspport.png"
                  alt="Passport"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span className="text-sm font-bold text-[#2D2A26] w-28">
                  Passport
                </span>
                <span className="text-sm text-[#2D2A26] font-mono w-14 text-right">
                  {scores.passport.score.toFixed(2)}
                </span>
                <div className="flex-1 retro-progress h-4">
                  <div
                    className="retro-progress-fill"
                    style={{ width: `${scores.passport.score}%` }}
                  />
                </div>
                <span className="text-xs text-[#8B8680] w-10 text-right">/ 100</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Improvement Tips Section */}
      {scores && !isLoading && (
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
  );
}
