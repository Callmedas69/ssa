"use client";

import { useState } from "react";
import type { SocialScores } from "@/lib/types";

interface ShareStepProps {
  scores: SocialScores | undefined;
}

export function ShareStep({ scores }: ShareStepProps) {
  const [copied, setCopied] = useState(false);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trustcheck.geoart.studio";

  const tierLabels: Record<string, string> = {
    bronze: "NEWCOMER",
    silver: "RISING STAR",
    gold: "TRUSTED",
    platinum: "LEGENDARY",
  };

  const tierMessages: Record<string, string> = {
    bronze: "Welcome Aboard!",
    silver: "Rising Star!",
    gold: "Trusted Member!",
    platinum: "Legendary!",
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentTier = scores?.ssaIndex?.tier || "bronze";

  return (
    <div className="space-y-4 sm:space-y-6 text-center my-auto max-w-sm mx-auto">
      {/* Personalized Title */}
      <div>
        <h3 className="text-3xl sm:text-4xl font-[family-name:var(--font-luckiest-guy)] text-[#2D2A26] mb-1 retro-text-3d">
          {tierMessages[currentTier]}
        </h3>
        <p className="text-[#8B8680] text-sm">
          You&apos;re all set. Share your score!
        </p>
      </div>

      {/* Score Display */}
      {scores?.ssaIndex && (
        <div>
          <span className="text-5xl sm:text-6xl font-bold text-[#2D2A26] retro-text-3d block">
            {scores.ssaIndex.score}
          </span>
          <span className="text-xs font-bold text-[#E85D3B] uppercase tracking-wide">
            {tierLabels[currentTier]}
          </span>
        </div>
      )}

      {/* Share Buttons */}
      {scores?.ssaIndex && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
            <button
              onClick={() => {
                const text = `My SSA Index is ${scores.ssaIndex?.score} - ${tierLabels[currentTier]}! Check your onchain reputation score at`;
                window.open(
                  `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(appUrl)}`,
                  "_blank",
                  "noopener,noreferrer"
                );
              }}
              className="px-4 py-2 bg-[#000] text-white font-bold uppercase tracking-wide text-xs rounded-lg border-2 border-[#2D2A26] shadow-[3px_3px_0_#2D2A26] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_#2D2A26] transition-all duration-150 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Share on X
            </button>

            <button
              onClick={() => {
                const text = `My SSA Index is ${scores.ssaIndex?.score} - ${tierLabels[currentTier]}! Check your onchain reputation score at ${appUrl}`;
                window.open(
                  `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`,
                  "_blank",
                  "noopener,noreferrer"
                );
              }}
              className="px-4 py-2 bg-[#8A63D2] text-white font-bold uppercase tracking-wide text-xs rounded-lg border-2 border-[#2D2A26] shadow-[3px_3px_0_#2D2A26] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_#2D2A26] transition-all duration-150 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.24 3H5.76A2.76 2.76 0 003 5.76v12.48A2.76 2.76 0 005.76 21h12.48A2.76 2.76 0 0021 18.24V5.76A2.76 2.76 0 0018.24 3zM12 17.4a5.4 5.4 0 110-10.8 5.4 5.4 0 010 10.8z" />
              </svg>
              Share on Farcaster
            </button>
          </div>

          {/* Copy Link */}
          <button
            onClick={copyToClipboard}
            className="text-xs text-[#8B8680] hover:text-[#2D2A26] underline transition-colors"
          >
            {copied ? "Copied!" : "Or copy link"}
          </button>
        </div>
      )}
    </div>
  );
}
