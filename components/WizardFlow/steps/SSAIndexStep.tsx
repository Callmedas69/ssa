"use client";

import { useState, useEffect } from "react";
import type { SocialScores } from "@/lib/types";
import { TIERS, TIER_LABELS, TIER_MESSAGES } from "@/lib/ssaIndex";
import { Badge } from "@/components/ui/badge";

interface SSAIndexStepProps {
  scores: SocialScores | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function SSAIndexStep({ scores, isLoading, error }: SSAIndexStepProps) {
  const [animatedWidth, setAnimatedWidth] = useState(0);

  // Animate progress bar fill from 0 to actual score
  useEffect(() => {
    if (scores?.ssaIndex?.score !== undefined) {
      // Small delay to ensure DOM is ready, then animate
      const timer = setTimeout(() => {
        setAnimatedWidth(scores.ssaIndex.score);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [scores?.ssaIndex?.score]);

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
    <div className="flex flex-col items-center justify-center flex-1 space-y-6 py-8">
      {isLoading ? (
        <div className="space-y-6 text-center">
          
          <div className="retro-progress max-w-md mx-auto">
            <div className="retro-progress-fill-loading" />
          </div>
          <p className="text-[#8B8680] text-sm">Loading your score...</p>
        </div>
      ) : scores?.ssaIndex ? (
        <div className="space-y-6 text-center w-full max-w-md">
          {/* Score Display */}
          <div className="space-y-2">
          <h3 className="text-5xl sm:text-6xl font-[family-name:var(--font-luckiest-guy)] text-[#2D2A26] mb-1 retro-text-3d">
            TRUSTCHECK
          </h3>
            <span className="text-9xl sm:text-8xl font-bold text-[#2D2A26] retro-text-3d block font-[family-name:var(--font-luckiest-guy)]">
              {scores.ssaIndex.score}
            </span>
            <h3 className="text-xl sm:text-2xl font-[family-name:var(--font-luckiest-guy)] text-[#2D2A26] mb-1 retro-text-3d">
            {TIER_MESSAGES[scores.ssaIndex.tier]}
          </h3>
          </div>

          {/* Progress Bar */}
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
              style={{ width: `${animatedWidth}%` }}
            />
          </div>

          {/* Tier Badge */}
          {scores.ssaIndex.tier && (
            <div className="pt-2">
              <span className="inline-block text-sm sm:text-base font-bold text-white uppercase tracking-wide px-4 py-2 rounded-lg border-2 border-[#2D2A26] shadow-[2px_2px_0_#2D2A26]"
                style={{
                  backgroundColor:
                    scores.ssaIndex.tier === "platinum" ? "#2A9D8F" :
                    scores.ssaIndex.tier === "gold" ? "#F4A261" :
                    scores.ssaIndex.tier === "silver" ? "#E85D3B" :
                    "#8B8680"
                }}
              >
                {TIER_LABELS[scores.ssaIndex.tier]}
              </span>
            </div>
          )}

          {/* Tier Legend */}
          <div className="flex justify-center gap-1.5 pt-4 flex-wrap">
            <Badge variant="retro" className="bg-[#8B8680] text-white border-[#2D2A26]">{TIERS.bronze.min}-{TIERS.bronze.max} {TIER_LABELS.bronze}</Badge>
            <Badge variant="retro" className="bg-[#E85D3B] text-white border-[#2D2A26]">{TIERS.silver.min}-{TIERS.silver.max} {TIER_LABELS.silver}</Badge>
            <Badge variant="retro" className="bg-[#F4A261] text-white border-[#2D2A26]">{TIERS.gold.min}-{TIERS.gold.max} {TIER_LABELS.gold}</Badge>
            <Badge variant="retro" className="bg-[#2A9D8F] text-white border-[#2D2A26]">{TIERS.platinum.min}+ {TIER_LABELS.platinum}</Badge>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <span className="text-[#8B8680]">No scores yet</span>
        </div>
      )}
    </div>
  );
}
