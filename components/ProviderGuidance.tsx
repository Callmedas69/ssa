import { memo, useState } from "react";
import type { ScoreProvider } from "@/lib/types";

interface ProviderGuidanceData {
  name: string;
  tips: string[];
  link: string;
  linkText: string;
}

const guidanceData: Record<ScoreProvider, ProviderGuidanceData> = {
  neynar: {
    name: "Neynar",
    tips: [
      "Post quality content on Farcaster regularly",
      "Engage meaningfully with other users (replies, recasts)",
      "Grow your follower base organically",
      "Avoid spam or low-quality interactions",
    ],
    link: "https://warpcast.com",
    linkText: "Open Warpcast",
  },
  ethos: {
    name: "Ethos",
    tips: [
      "Get vouches from trusted users on Ethos Network",
      "Vouch for others to build mutual credibility",
      "Maintain positive on-chain interactions",
      "Avoid negative reviews or disputes",
    ],
    link: "https://ethos.network",
    linkText: "Visit Ethos Network",
  },
  talentBuilder: {
    name: "Talent Builder",
    tips: [
      "Connect your GitHub account",
      "Verify your technical skills and credentials",
      "Complete your builder profile",
      "Contribute to open source projects",
    ],
    link: "https://app.talentprotocol.com",
    linkText: "Complete Your Profile",
  },
  talentCreator: {
    name: "Talent Creator",
    tips: [
      "Connect your social media accounts",
      "Build your content portfolio",
      "Grow your audience across platforms",
      "Demonstrate consistent content creation",
    ],
    link: "https://app.talentprotocol.com",
    linkText: "Complete Your Profile",
  },
  quotient: {
    name: "Quotient",
    tips: [
      "Focus on quality engagement over quantity",
      "Build meaningful conversations on Farcaster",
      "Avoid mass-following or spam tactics",
      "Engage with high-quality content creators",
    ],
    link: "https://quotient.social",
    linkText: "View Quotient Profile",
  },
  passport: {
    name: "Gitcoin Passport",
    tips: [
      "Add more stamps (GitHub, Discord, ENS, Google, etc.)",
      "Verify your unique humanity across platforms",
      "Keep stamps up to date (they can expire)",
      "Connect more accounts for higher score",
    ],
    link: "https://passport.gitcoin.co",
    linkText: "Add More Stamps",
  },
};

interface ProviderGuidanceProps {
  provider: ScoreProvider;
  hasProfile: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

export const ProviderGuidance = memo(function ProviderGuidance({
  provider,
  hasProfile,
  isExpanded,
  onToggle,
}: ProviderGuidanceProps) {
  const guidance = guidanceData[provider];

  return (
    <div className="mac1-window bg-white p-1">
      <button
        onClick={onToggle}
        className="mac1-title-bar w-full cursor-pointer hover:bg-[#E8E8E8] transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px]">{isExpanded ? "▼" : "▶"}</span>
            <h4 className="uppercase text-[11px]">{guidance.name}</h4>
          </div>
          <a
            href={guidance.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[11px] text-black hover:underline flex items-center gap-1"
          >
            {guidance.linkText}
            <svg
              className="w-2 h-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="square"
                strokeLinejoin="miter"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </button>

      {isExpanded && (
        <div className="mac1-inset bg-white p-3 mt-2">
          {!hasProfile && (
            <p className="text-[11px] text-black mb-3 font-bold">
              ⚠️ No profile found. Create one to start building your reputation.
            </p>
          )}

          <ul className="space-y-1">
            {guidance.tips.map((tip, index) => (
              <li
                key={index}
                className="text-[11px] text-black flex items-start gap-2"
              >
                <span className="mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

interface AllGuidanceProps {
  scores: {
    neynar: unknown | null;
    ethos: unknown | null;
    talentBuilder: unknown | null;
    talentCreator: unknown | null;
    quotient: unknown | null;
    passport: unknown | null;
  };
}

export const AllProviderGuidance = memo(function AllProviderGuidance({
  scores,
}: AllGuidanceProps) {
  const [expandedProvider, setExpandedProvider] =
    useState<ScoreProvider | null>("neynar");

  const providers: ScoreProvider[] = [
    "neynar",
    "ethos",
    "talentBuilder",
    "talentCreator",
    "quotient",
    "passport",
  ];

  return (
    <div className="mac1-window bg-white p-1 max-w-2xl w-full">
      <div className="mac1-title-bar mb-2">
        <h3 className="uppercase text-[11px]">
          How to Improve Your Scores (Click to expand)
        </h3>
      </div>
      <div className="space-y-2">
        {providers.map((provider) => (
          <ProviderGuidance
            key={provider}
            provider={provider}
            hasProfile={scores[provider] !== null}
            isExpanded={expandedProvider === provider}
            onToggle={() =>
              setExpandedProvider(
                expandedProvider === provider ? null : provider
              )
            }
          />
        ))}
      </div>
    </div>
  );
});
