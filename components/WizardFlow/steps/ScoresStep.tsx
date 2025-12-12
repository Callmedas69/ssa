"use client";

import Image from "next/image";
import type { SocialScores } from "@/lib/types";

interface ScoresStepProps {
  scores: SocialScores | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function ScoresStep({ scores, isLoading, error }: ScoresStepProps) {
  if (error) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-destructive font-semibold">Error Loading Scores</p>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Failed to fetch scores"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#E85D3B] text-white font-bold uppercase rounded-lg border-2 border-[#2D2A26] shadow-[3px_3px_0_#2D2A26] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_#2D2A26] transition-all duration-150"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full space-y-4 sm:space-y-8 pt-4 sm:pt-0">
      {/* SSA Index Section */}
      <div>
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <h3 className="uppercase text-base sm:text-lg font-bold text-[#2D2A26] tracking-wide">
            SSA Index
          </h3>
          <span className="text-xs text-[#8B8680] font-medium">Max: 100</span>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-10 sm:h-12 w-20 sm:w-24 bg-[#E8E3DB] rounded animate-pulse" />
            <div className="retro-progress">
              <div className="retro-progress-fill w-0" />
            </div>
          </div>
        ) : scores?.ssaIndex ? (
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-baseline justify-between flex-wrap">
              <span className="text-4xl sm:text-5xl font-bold text-[#2D2A26] retro-text-3d-sm">
                {scores.ssaIndex.score}
              </span>
              {scores.ssaIndex.tier && (
                <span className="text-xs sm:text-sm font-bold text-[#E85D3B] uppercase tracking-wide px-2 py-1 border border-[#2D2A26] rounded">
                  {scores.ssaIndex.tier === "bronze" && "NEWCOMER"}
                  {scores.ssaIndex.tier === "silver" && "RISING"}
                  {scores.ssaIndex.tier === "gold" && "TRUSTED"}
                  {scores.ssaIndex.tier === "platinum" && "LEGEND"}
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
          <div className="text-center py-4 sm:py-6">
            <span className="text-[#8B8680]">No scores yet</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <hr className="border-t-2 border-[#2D2A26] opacity-20" />

      {/* Score Breakdown */}
      {!isLoading && (
        <div>
          <h3 className="uppercase text-base sm:text-lg font-bold text-[#2D2A26] tracking-wide mb-3 sm:mb-4">
            Provider Scores
          </h3>
          <div className="space-y-3 sm:space-y-4 divide-y divide-[#2D2A26]/40">
            {/* Neynar */}
            {scores?.neynar && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 pb-3">
                <div className="flex items-center gap-2 sm:w-28 sm:shrink-0">
                  <Image
                    src="/provider_logos/Neynar_400x400.jpg"
                    alt="Neynar"
                    width={24}
                    height={24}
                    className="rounded-full w-5 h-5 sm:w-6 sm:h-6"
                  />
                  <span className="text-sm font-bold text-[#2D2A26] italic">Neynar</span>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm text-[#2D2A26] font-mono w-16">
                    {scores.neynar.score.toFixed(2)}
                  </span>
                  <div className="flex-1 retro-progress h-3 sm:h-4">
                    <div
                      className="retro-progress-fill"
                      style={{ width: `${(scores.neynar.score / 1) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#8B8680] w-10 text-right">/ 1</span>
                </div>
              </div>
            )}
            {/* Ethos */}
            {scores?.ethos && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 pt-3 pb-3">
                <div className="flex items-center gap-2 sm:w-28 sm:shrink-0">
                  <Image
                    src="/provider_logos/ethos_logo.png"
                    alt="Ethos"
                    width={24}
                    height={24}
                    className="rounded-full w-5 h-5 sm:w-6 sm:h-6"
                  />
                  <span className="text-sm font-bold text-[#2D2A26] italic">Ethos</span>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm text-[#2D2A26] font-mono w-16">
                    {scores.ethos.score}
                  </span>
                  <div className="flex-1 retro-progress h-3 sm:h-4">
                    <div
                      className="retro-progress-fill"
                      style={{ width: `${(scores.ethos.score / 2800) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#8B8680] w-10 text-right">/ 2800</span>
                </div>
              </div>
            )}
            {/* Talent Builder */}
            {scores?.talentBuilder && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 pt-3 pb-3">
                <div className="flex items-center gap-2 sm:w-28 sm:shrink-0">
                  <Image
                    src="/provider_logos/Talent_Protocol.jpg"
                    alt="Builder"
                    width={24}
                    height={24}
                    className="rounded-full w-5 h-5 sm:w-6 sm:h-6"
                  />
                  <span className="text-sm font-bold text-[#2D2A26] italic">Builder</span>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm text-[#2D2A26] font-mono w-16">
                    {scores.talentBuilder.score}
                  </span>
                  <div className="flex-1 retro-progress h-3 sm:h-4">
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
                  <span className="text-xs text-[#8B8680] w-10 text-right">no cap</span>
                </div>
              </div>
            )}
            {/* Talent Creator */}
            {scores?.talentCreator && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 pt-3 pb-3">
                <div className="flex items-center gap-2 sm:w-28 sm:shrink-0">
                  <Image
                    src="/provider_logos/Talent_Protocol.jpg"
                    alt="Creator"
                    width={24}
                    height={24}
                    className="rounded-full w-5 h-5 sm:w-6 sm:h-6"
                  />
                  <span className="text-sm font-bold text-[#2D2A26] italic">Creator</span>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm text-[#2D2A26] font-mono w-16">
                    {scores.talentCreator.score}
                  </span>
                  <div className="flex-1 retro-progress h-3 sm:h-4">
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
                  <span className="text-xs text-[#8B8680] w-10 text-right">no cap</span>
                </div>
              </div>
            )}
            {/* Quotient */}
            {scores?.quotient && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 pt-3 pb-3">
                <div className="flex items-center gap-2 sm:w-28 sm:shrink-0">
                  <Image
                    src="/provider_logos/Quotient.png"
                    alt="Quotient"
                    width={24}
                    height={24}
                    className="rounded-full w-5 h-5 sm:w-6 sm:h-6"
                  />
                  <span className="text-sm font-bold text-[#2D2A26] italic">Quotient</span>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm text-[#2D2A26] font-mono w-16">
                    {scores.quotient.score.toFixed(2)}
                  </span>
                  <div className="flex-1 retro-progress h-3 sm:h-4">
                    <div
                      className="retro-progress-fill"
                      style={{ width: `${scores.quotient.score * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#8B8680] w-10 text-right">/ 1</span>
                </div>
              </div>
            )}
            {/* Passport */}
            {scores?.passport && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 pt-3">
                <div className="flex items-center gap-2 sm:w-28 sm:shrink-0">
                  <Image
                    src="/provider_logos/human_paspport.jpg"
                    alt="Passport"
                    width={24}
                    height={24}
                    className="rounded-full w-5 h-5 sm:w-6 sm:h-6"
                  />
                  <span className="text-sm font-bold text-[#2D2A26] italic">Passport</span>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm text-[#2D2A26] font-mono w-16">
                    {scores.passport.score.toFixed(2)}
                  </span>
                  <div className="flex-1 retro-progress h-3 sm:h-4">
                    <div
                      className="retro-progress-fill"
                      style={{ width: `${scores.passport.score}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#8B8680] w-10 text-right">/ 100</span>
                </div>
              </div>
            )}

            {/* Loading skeleton for scores */}
            {isLoading && (
              <>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 pt-3 pb-3 animate-pulse">
                    <div className="flex items-center gap-2 sm:w-28 sm:shrink-0">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#E8E3DB] rounded-full" />
                      <div className="w-16 h-4 bg-[#E8E3DB] rounded" />
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-16 h-4 bg-[#E8E3DB] rounded" />
                      <div className="flex-1 h-3 sm:h-4 bg-[#E8E3DB] rounded" />
                      <div className="w-10 h-4 bg-[#E8E3DB] rounded" />
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
