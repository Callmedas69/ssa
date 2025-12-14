"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import type { SocialScores } from "@/lib/types";
import { getPassportTierLabel, getPassportTierColor } from "@/lib/passportTier";

interface ProviderStepProps {
  scores: SocialScores | undefined;
  isLoading: boolean;
}

// Provider config for behavior/reputation providers (included in SSA score)
const BEHAVIOR_PROVIDERS: Array<{
  id: string;
  name: string;
  subtitle: string;
  logo: string;
  max: number;
  decimals: number;
  noCap?: boolean;
}> = [
  { id: "neynar", name: "Neynar", subtitle: "Farcaster Influence", logo: "/provider_logos/Neynar_400x400.jpg", max: 1, decimals: 2 },
  { id: "ethos", name: "Ethos", subtitle: "Credibility", logo: "/provider_logos/ethos_logo.png", max: 2800, decimals: 0 },
  { id: "talentBuilder", name: "Talent Protocol", subtitle: "Onchain Builder", logo: "/provider_logos/Talent_Protocol.jpg", max: 1000, decimals: 0, noCap: true },
  { id: "talentCreator", name: "Talent Protocol", subtitle: "Content Creator", logo: "/provider_logos/Talent_Protocol.jpg", max: 1000, decimals: 0, noCap: true },
  { id: "quotient", name: "Quotient", subtitle: "Engagement Quality", logo: "/provider_logos/Quotient.png", max: 1, decimals: 2 },
];

// Passport config (displayed separately - measures identity, not behavior)
const PASSPORT_CONFIG = {
  id: "passport",
  name: "Passport",
  subtitle: "Sybil Resistance",
  logo: "/provider_logos/human_paspport.jpg",
  max: 100,
  decimals: 0,
};

// Combined for animation purposes
const ALL_PROVIDERS = [...BEHAVIOR_PROVIDERS, PASSPORT_CONFIG];

export function ProviderStep({ scores, isLoading }: ProviderStepProps) {
  const [animatedWidths, setAnimatedWidths] = useState<Record<string, number>>({});

  // Animate progress bars from 0 to actual values
  useEffect(() => {
    if (scores && !isLoading) {
      const timer = setTimeout(() => {
        const widths: Record<string, number> = {};
        for (const provider of ALL_PROVIDERS) {
          const score = scores[provider.id as keyof typeof scores];
          if (score && typeof score === 'object' && 'score' in score) {
            const rawScore = score.score;
            const noCap = 'noCap' in provider ? provider.noCap : false;
            const progressWidth = noCap
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

  const scoreMap = useMemo(() => ({
    neynar: scores?.neynar ?? undefined,
    ethos: scores?.ethos ?? undefined,
    talentBuilder: scores?.talentBuilder ?? undefined,
    talentCreator: scores?.talentCreator ?? undefined,
    quotient: scores?.quotient ?? undefined,
    passport: scores?.passport ?? undefined,
  }), [scores]);

  const getScore = (id: string) => {
    return (scoreMap[id as keyof typeof scoreMap] as { score: number } | undefined)?.score ?? null;
  };

  // Get passport score and tier
  const passportScore = scores?.passport?.score ?? null;
  const passportTierLabel = getPassportTierLabel(passportScore);
  const passportTierColor = getPassportTierColor(passportScore);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-4">
        <h3 className="uppercase text-base text-center font-bold text-[#2D2A26] tracking-wide mb-4">
          Breakdown
        </h3>
        <div className="flex flex-col gap-2 w-full max-w-md">
          {[1, 2, 3, 4, 5].map((i) => (
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
          {/* Passport skeleton */}
          <div className="mt-4 pt-4 border-t-2 border-[#2D2A26]/10">
            <div className="bg-[#F5F0E8] border border-[#2D2A26]/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 bg-[#E8E3DB] rounded-full animate-pulse" />
                <div className="w-24 h-4 bg-[#E8E3DB] rounded animate-pulse" />
              </div>
              <div className="retro-progress h-2">
                <div className="retro-progress-fill-loading" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 py-4">
      <h3 className="uppercase text-6xl text-center font-bold text-[#2D2A26] retro-text-3d tracking-wide mb-8 font-[family-name:var(--font-luckiest-guy)]">
        Breakdown
      </h3>
      <div className="flex flex-col gap-2 w-full max-w-md">
        {/* Behavior/Reputation Providers - included in SSA score */}
        {BEHAVIOR_PROVIDERS.map((provider) => {
          const score = getScore(provider.id);
          const hasScore = score !== null;
          const displayScore = hasScore
            ? provider.decimals > 0
              ? score.toFixed(provider.decimals)
              : score.toString()
            : "-";

          return (
            <div
              key={provider.id}
              className="bg-[#F5F0E8] border border-[#2D2A26]/20 rounded-lg p-3"
            >
              {/* Row 1: Logo + Name + Subtitle */}
              <div className="flex items-center gap-2 mb-2">
                <Image
                  src={provider.logo}
                  alt={provider.name}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
                <span className="text-xs font-bold text-[#2D2A26]">{provider.name}</span>
                <span className="text-xs text-[#8B8680]">·</span>
                <span className="text-xs text-[#8B8680]">{provider.subtitle}</span>
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

        {/* Divider - Passport is separate */}
        <div className="mt-4 pt-4 border-t-2 border-[#2D2A26]/10">
          <p className="text-[10px] text-[#8B8680] uppercase tracking-wider mb-2 text-center">
            Sybil Resistance
          </p>

          {/* Passport - displayed separately with tier badge */}
          <div className="bg-[#F5F0E8] border border-[#2D2A26]/20 rounded-lg p-3">
            {/* Row 1: Logo + Name + Tier Badge */}
            <div className="flex items-center gap-2 mb-2">
              <Image
                src={PASSPORT_CONFIG.logo}
                alt={PASSPORT_CONFIG.name}
                width={20}
                height={20}
                className="rounded-full"
              />
              <span className="text-xs font-bold text-[#2D2A26]">{PASSPORT_CONFIG.name}</span>
              <span className="text-xs text-[#8B8680]">·</span>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded"
                style={{ backgroundColor: passportTierColor, color: '#fff' }}
              >
                {passportTierLabel}
              </span>
            </div>
            {/* Row 2: Score + Progress Bar + Max */}
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono w-12 ${passportScore !== null ? 'text-[#2D2A26]' : 'text-[#8B8680]'}`}>
                {passportScore !== null ? Math.round(passportScore).toString() : "-"}
              </span>
              <div className="retro-progress h-2 flex-1">
                <div
                  className="retro-progress-fill"
                  style={{
                    width: `${animatedWidths[PASSPORT_CONFIG.id] ?? 0}%`,
                    backgroundColor: passportTierColor,
                  }}
                />
              </div>
              <span className="text-xs font-mono text-[#8B8680] w-12 text-right">
                /{PASSPORT_CONFIG.max}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
