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

      {/* External Collection Links - only for minted users */}
      {hasMinted && (
        <div className="flex gap-3 justify-center max-w-2xl w-full">
          <a
            href="https://opensea.io/collection/ssa-index"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2 bg-[#2081E2] text-white font-bold uppercase tracking-wide rounded-lg border-2 border-[#2D2A26] shadow-[3px_3px_0_#2D2A26] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_#2D2A26] transition-all duration-150 flex items-center justify-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 90 90" fill="currentColor">
              <path d="M45 0C20.151 0 0 20.151 0 45C0 69.849 20.151 90 45 90C69.849 90 90 69.849 90 45C90 20.151 69.858 0 45 0ZM22.203 46.512L22.392 46.206L34.101 27.891C34.272 27.63 34.677 27.657 34.803 27.945C36.756 32.328 38.448 37.782 37.656 41.175C37.323 42.57 36.396 44.46 35.352 46.206C35.217 46.458 35.073 46.71 34.911 46.953C34.839 47.061 34.713 47.124 34.578 47.124H22.545C22.221 47.124 22.032 46.773 22.203 46.512ZM74.376 52.812C74.376 52.983 74.277 53.127 74.133 53.19C73.224 53.577 70.119 55.008 68.832 56.799C65.538 61.38 63.027 67.932 57.402 67.932H33.948C25.632 67.932 18.9 61.173 18.9 52.83V52.56C18.9 52.344 19.08 52.164 19.305 52.164H32.373C32.634 52.164 32.823 52.398 32.805 52.659C32.706 53.505 32.868 54.378 33.273 55.17C34.047 56.745 35.658 57.726 37.395 57.726H43.866V52.677H37.467C37.143 52.677 36.945 52.299 37.134 52.038C37.206 51.93 37.278 51.822 37.368 51.696C37.971 50.823 38.835 49.491 39.699 47.97C40.284 46.944 40.851 45.846 41.31 44.748C41.4 44.55 41.472 44.343 41.553 44.145C41.679 43.794 41.805 43.47 41.895 43.146C41.985 42.858 42.066 42.561 42.138 42.282C42.354 41.295 42.444 40.245 42.444 39.159C42.444 38.718 42.426 38.259 42.39 37.818C42.372 37.341 42.318 36.864 42.264 36.387C42.228 35.964 42.156 35.55 42.084 35.127C41.985 34.488 41.859 33.858 41.715 33.228L41.661 33.003C41.553 32.58 41.463 32.175 41.337 31.752C40.986 30.429 40.581 29.151 40.131 27.936C39.978 27.486 39.798 27.054 39.618 26.622C39.348 25.929 39.069 25.29 38.808 24.687C38.682 24.426 38.574 24.192 38.466 23.949C38.349 23.679 38.223 23.409 38.097 23.157C38.007 22.959 37.899 22.779 37.827 22.599L37.035 21.204C36.927 21.015 37.098 20.781 37.305 20.844L42.219 22.311H42.237C42.246 22.311 42.246 22.311 42.255 22.311L42.885 22.5L43.578 22.716L43.866 22.806V19.665C43.866 18.189 45.063 17 46.53 17C47.263 17 47.925 17.298 48.402 17.784C48.879 18.27 49.194 18.936 49.194 19.665V24.291L49.707 24.435C49.752 24.453 49.797 24.471 49.833 24.498C49.959 24.594 50.148 24.726 50.382 24.894C50.571 25.035 50.769 25.212 51.021 25.389C51.516 25.758 52.11 26.235 52.767 26.784C52.956 26.937 53.136 27.099 53.298 27.261C54.168 28.044 55.143 28.971 56.073 30.015C56.334 30.312 56.586 30.618 56.847 30.942C57.108 31.266 57.387 31.581 57.63 31.905C57.96 32.346 58.317 32.805 58.629 33.282C58.767 33.498 58.932 33.723 59.067 33.948C59.454 34.551 59.787 35.172 60.111 35.793C60.246 36.072 60.381 36.378 60.498 36.675C60.822 37.449 61.074 38.241 61.236 39.033C61.29 39.204 61.326 39.393 61.344 39.564V39.609C61.398 39.852 61.416 40.113 61.434 40.383C61.506 41.214 61.47 42.054 61.326 42.894C61.254 43.335 61.155 43.758 61.029 44.199C60.903 44.622 60.768 45.063 60.597 45.486C60.264 46.35 59.868 47.196 59.391 47.988C59.238 48.276 59.058 48.573 58.878 48.861C58.68 49.167 58.482 49.455 58.302 49.743C58.05 50.094 57.78 50.463 57.51 50.796C57.276 51.111 57.033 51.435 56.772 51.723C56.403 52.164 56.052 52.578 55.683 52.974C55.494 53.19 55.287 53.415 55.071 53.613C54.864 53.838 54.648 54.036 54.459 54.225C54.144 54.522 53.874 54.756 53.649 54.945L53.19 55.35C53.1 55.422 52.983 55.467 52.866 55.467H49.194V57.726H53.982C55.089 57.726 56.142 57.339 56.991 56.634C57.276 56.394 58.527 55.323 59.985 53.577C60.039 53.514 60.102 53.469 60.183 53.451L73.863 49.527C74.124 49.455 74.376 49.644 74.376 49.914V52.812Z"/>
            </svg>
            View Collection
          </a>

          <a
            href="https://onchainchecker.xyz/collection/base/0x4d4b5F15cdF4A0a6a45c8Eb4459992EAa2A8cA07/1"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2 bg-[#10B981] text-white font-bold uppercase tracking-wide rounded-lg border-2 border-[#2D2A26] shadow-[3px_3px_0_#2D2A26] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_#2D2A26] transition-all duration-150 flex items-center justify-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Onchain Checker
          </a>
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
              <span className={`text-sm font-mono w-14 text-right ${scores.neynar ? 'text-[#2D2A26]' : 'text-[#8B8680]'}`}>
                {scores.neynar ? scores.neynar.score.toFixed(2) : '—'}
              </span>
              <div className="flex-1 retro-progress h-4">
                <div
                  className="retro-progress-fill"
                  style={{ width: `${scores.neynar ? (scores.neynar.score / 1) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs text-[#8B8680] w-10 text-right">/ 1</span>
            </div>
            {/* Ethos */}
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
              <span className={`text-sm font-mono w-14 text-right ${scores.ethos ? 'text-[#2D2A26]' : 'text-[#8B8680]'}`}>
                {scores.ethos ? scores.ethos.score : '—'}
              </span>
              <div className="flex-1 retro-progress h-4">
                <div
                  className="retro-progress-fill"
                  style={{ width: `${scores.ethos ? (scores.ethos.score / 2800) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs text-[#8B8680] w-10 text-right">/ 2800</span>
            </div>
            {/* Talent Builder */}
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
              <span className={`text-sm font-mono w-14 text-right ${scores.talentBuilder ? 'text-[#2D2A26]' : 'text-[#8B8680]'}`}>
                {scores.talentBuilder ? scores.talentBuilder.score : '—'}
              </span>
              <div className="flex-1 retro-progress h-4">
                <div
                  className="retro-progress-fill"
                  style={{
                    width: `${scores.talentBuilder ? Math.min((scores.talentBuilder.score / 1000) * 100, 100) : 0}%`,
                  }}
                />
              </div>
              <span className="text-xs text-[#8B8680] w-10 text-right">/ ∞</span>
            </div>
            {/* Talent Creator */}
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
              <span className={`text-sm font-mono w-14 text-right ${scores.talentCreator ? 'text-[#2D2A26]' : 'text-[#8B8680]'}`}>
                {scores.talentCreator ? scores.talentCreator.score : '—'}
              </span>
              <div className="flex-1 retro-progress h-4">
                <div
                  className="retro-progress-fill"
                  style={{
                    width: `${scores.talentCreator ? Math.min((scores.talentCreator.score / 1000) * 100, 100) : 0}%`,
                  }}
                />
              </div>
              <span className="text-xs text-[#8B8680] w-10 text-right">/ ∞</span>
            </div>
            {/* Quotient */}
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
              <span className={`text-sm font-mono w-14 text-right ${scores.quotient ? 'text-[#2D2A26]' : 'text-[#8B8680]'}`}>
                {scores.quotient ? scores.quotient.score.toFixed(2) : '—'}
              </span>
              <div className="flex-1 retro-progress h-4">
                <div
                  className="retro-progress-fill"
                  style={{ width: `${scores.quotient ? scores.quotient.score * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs text-[#8B8680] w-10 text-right">/ 1</span>
            </div>
            {/* Passport */}
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
              <span className={`text-sm font-mono w-14 text-right ${scores.passport ? 'text-[#2D2A26]' : 'text-[#8B8680]'}`}>
                {scores.passport ? scores.passport.score.toFixed(2) : '—'}
              </span>
              <div className="flex-1 retro-progress h-4">
                <div
                  className="retro-progress-fill"
                  style={{ width: `${scores.passport ? scores.passport.score : 0}%` }}
                />
              </div>
              <span className="text-xs text-[#8B8680] w-10 text-right">/ 100</span>
            </div>
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
