"use client";

import { useState } from "react";
import Image from "next/image";
import { useFarcaster } from "@/components/FarcasterProvider";
import type { SocialScores } from "@/lib/types";
import { CONTRACTS } from "@/abi/addresses";
import { TIER_LABELS, TIER_MESSAGES } from "@/lib/ssaIndex";

interface ShareStepProps {
  scores: SocialScores | undefined;
}

export function ShareStep({ scores }: ShareStepProps) {
  const [copied, setCopied] = useState(false);
  const { isInFarcaster, composeCast } = useFarcaster();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trustcheck.geoart.studio";

  const currentTier = scores?.ssaIndex?.tier || "bronze";
  const shareUrl = appUrl;
  // Strip protocol for Farcaster embed (works better without https://)
  const farcasterEmbedUrl = appUrl.replace(/^https?:\/\//, "");

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 sm:space-y-6 text-center my-auto max-w-sm mx-auto">
      {/* Personalized Title */}
      <div>
        <h3 className="text-3xl sm:text-4xl font-[family-name:var(--font-luckiest-guy)] text-[#2D2A26] mb-1 retro-text-3d">
          {TIER_MESSAGES[currentTier]}
        </h3>
        <p className="text-[#8B8680] text-sm">
          You&apos;re all set. Share your score!
        </p>
      </div>

      {/* Score Display */}
      {scores?.ssaIndex && (
        <div>
          <span className="text-7xl sm:text-9xl font-bold text-[#2D2A26] retro-text-3d block font-[family-name:var(--font-luckiest-guy)]">
            {scores.ssaIndex.score}
          </span>
          <span className="text-xs font-bold text-[#E85D3B] uppercase tracking-wide">
            {TIER_LABELS[currentTier]}
          </span>
        </div>
      )}

      {/* Share Buttons */}
      {scores?.ssaIndex && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
            <button
              onClick={() => {
                const text = `My TRUSTCHECK is ${scores.ssaIndex?.score} i am a ${TIER_LABELS[currentTier]}!\n\nCheck your onchain reputation score and mint your SBT\n\n`;
                window.open(
                  `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
                  "_blank",
                  "noopener,noreferrer"
                );
              }}
              className="px-4 py-2 bg-[#000] text-white font-bold uppercase tracking-wide text-xs rounded-lg border-2 border-[#2D2A26] shadow-[3px_3px_0_#2D2A26] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_#2D2A26] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Share on X
            </button>

            <button
              onClick={async () => {
                const text = `My TRUSTCHECK is ${scores.ssaIndex?.score} i am a ${TIER_LABELS[currentTier]}!\n\ncheck your onchain reputation score and mint your SBT\n\n`;

                if (isInFarcaster) {
                  // Use SDK composeCast - stays in Farcaster
                  await composeCast({
                    text,
                    embeds: [farcasterEmbedUrl] as [string],
                    channelKey: "geoart"
                  });
                } else {
                  // Desktop/browser fallback
                  window.open(
                    `https://warpcast.com/~/compose?text=${encodeURIComponent(text + " " + farcasterEmbedUrl)}&channelKey=geoart`,
                    "_blank",
                    "noopener,noreferrer"
                  );
                }
              }}
              className="px-4 py-2 bg-[#6A3CFF] text-white font-bold uppercase tracking-wide text-xs rounded-lg border-2 border-[#2D2A26] shadow-[3px_3px_0_#2D2A26] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_#2D2A26] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Image src="/farcaster_logo.svg" alt="Farcaster" width={16} height={16} />
              Share on Farcaster
            </button>
          </div>

          {/* Copy Link */}
          <button
            onClick={copyToClipboard}
            className="text-xs text-[#8B8680] hover:text-[#2D2A26] underline transition-colors cursor-pointer"
          >
            {copied ? "Copied!" : "Or copy link"}
          </button>

          {/* Collection Links - Secondary actions */}
          <div className="flex items-center justify-center gap-4 pt-2 text-xs text-[#8B8680]">
            <a
              href={`https://opensea.io/assets/base/${CONTRACTS.ProfileSBT}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#2D2A26] underline transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Image src="/opensea_logo.svg" alt="OpenSea" width={14} height={14} className="opacity-60" />
              OpenSea
            </a>
            <span className="text-[#D9D4CC]">|</span>
            <a
              href={`https://onchainchecker.xyz/collection/base/${CONTRACTS.ProfileSBT}/1`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#2D2A26] underline transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Image src="/onchainchecker_logo.svg" alt="Onchain Checker" width={14} height={14} className="opacity-60" />
              Onchain Checker
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
