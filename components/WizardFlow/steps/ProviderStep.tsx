"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { SocialScores } from "@/lib/types";

interface ProviderStepProps {
  scores: SocialScores | undefined;
  isLoading: boolean;
}

// Provider config for cleaner rendering
const PROVIDERS: Array<{
  id: string;
  name: string;
  logo: string;
  max: number;
  decimals: number;
  noCap?: boolean;
}> = [
  { id: "neynar", name: "Neynar", logo: "/provider_logos/Neynar_400x400.jpg", max: 1, decimals: 2 },
  { id: "ethos", name: "Ethos", logo: "/provider_logos/ethos_logo.png", max: 2800, decimals: 0 },
  { id: "talentBuilder", name: "Builder", logo: "/provider_logos/Talent_Protocol.jpg", max: 1000, decimals: 0, noCap: true },
  { id: "talentCreator", name: "Creator", logo: "/provider_logos/Talent_Protocol.jpg", max: 1000, decimals: 0, noCap: true },
  { id: "quotient", name: "Quotient", logo: "/provider_logos/Quotient.png", max: 1, decimals: 2 },
  { id: "passport", name: "Passport", logo: "/provider_logos/human_paspport.jpg", max: 100, decimals: 2 },
];

export function ProviderStep({ scores, isLoading }: ProviderStepProps) {
  const [animatedWidths, setAnimatedWidths] = useState<Record<string, number>>({});

  // Animate progress bars from 0 to actual values
  useEffect(() => {
    if (scores && !isLoading) {
      const timer = setTimeout(() => {
        const widths: Record<string, number> = {};
        for (const provider of PROVIDERS) {
          const score = scores[provider.id as keyof typeof scores];
          if (score && typeof score === 'object' && 'score' in score) {
            const rawScore = score.score;
            const progressWidth = provider.noCap
              ? Math.min((rawScore / provider.max) * 100, 100)
              : (rawScore / provider.max) * 100;
            widths[provider.id] = progressWidth;
          } else {
            widths[provider.id] = 0;
          }
        }
        setAnimatedWidths(widths);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [scores, isLoading]);

  const getScore = (id: string) => {
    const scoreMap: Record<string, { score: number } | undefined> = {
      neynar: scores?.neynar ?? undefined,
      ethos: scores?.ethos ?? undefined,
      talentBuilder: scores?.talentBuilder ?? undefined,
      talentCreator: scores?.talentCreator ?? undefined,
      quotient: scores?.quotient ?? undefined,
      passport: scores?.passport ?? undefined,
    };
    return scoreMap[id]?.score ?? null;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-4">
        <h3 className="uppercase text-base text-center font-bold text-[#2D2A26] tracking-wide mb-4">
          Provider Scores
        </h3>
        <div className="flex flex-col gap-2 w-full max-w-md">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-[#F5F0E8] border border-[#2D2A26]/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 bg-[#E8E3DB] rounded-full animate-pulse" />
                <div className="w-16 h-4 bg-[#E8E3DB] rounded animate-pulse" />
              </div>
              <div className="retro-progress h-2">
                <div className="retro-progress-fill-loading" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 py-4">
      <h3 className="uppercase text-6xl text-center font-bold text-[#2D2A26] retro-text-3d tracking-wide mb-8 font-[family-name:var(--font-luckiest-guy)]">
        Provider Scores
      </h3>
      <div className="flex flex-col gap-2 w-full max-w-md">
        {PROVIDERS.map((provider) => {
          const score = getScore(provider.id);
          const hasScore = score !== null;
          const displayScore = hasScore
            ? provider.decimals > 0
              ? score.toFixed(provider.decimals)
              : score.toString()
            : "-";
          const progressWidth = hasScore
            ? provider.noCap
              ? Math.min((score / provider.max) * 100, 100)
              : (score / provider.max) * 100
            : 0;

          return (
            <div
              key={provider.id}
              className="bg-[#F5F0E8] border border-[#2D2A26]/20 rounded-lg p-3"
            >
              {/* Row 1: Logo + Name */}
              <div className="flex items-center gap-2 mb-2">
                <Image
                  src={provider.logo}
                  alt={provider.name}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
                <span className="text-xs font-bold text-[#2D2A26]">{provider.name}</span>
              </div>
              {/* Row 2: Score + Progress Bar + Max */}
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono w-12 ${hasScore ? 'text-[#2D2A26]' : 'text-[#8B8680]'}`}>
                  {displayScore}
                </span>
                <div className="retro-progress h-2 flex-1">
                  <div
                    className="retro-progress-fill"
                    style={{ width: `${animatedWidths[provider.id] ?? 0}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-[#8B8680] w-12 text-right">
                  /{provider.max}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
