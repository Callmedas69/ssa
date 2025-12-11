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
    <div className="bg-[#F5F0E8] border border-[#2D2A26]/30 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-3 py-2 cursor-pointer hover:bg-[#E8E3DB] transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-bold text-[#2D2A26] transition-transform duration-300 ease-out ${
                isExpanded ? "rotate-90" : "rotate-0"
              }`}
            >
              ▶
            </span>
            <h4 className="uppercase text-sm font-bold text-[#2D2A26] tracking-wide">
              {guidance.name}
            </h4>
          </div>
          <a
            href={guidance.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[10px] italic text-[#E85D3B] font-bold hover:underline flex items-center gap-1"
          >
            {guidance.linkText}
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </button>

      <div
        className={`grid transition-all duration-300 ease-out ${
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-3 py-2 bg-white/50 border-t border-[#2D2A26]/20">
            {!hasProfile && (
              <p className="text-sm text-[#C53030] mb-3 font-bold">
                No profile found. Create one to start building your reputation.
              </p>
            )}

            <ul className="space-y-2">
              {guidance.tips.map((tip, index) => (
                <li
                  key={index}
                  className="text-sm text-[#2D2A26] flex items-start gap-2"
                >
                  <span className="text-[#E85D3B] mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
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
    useState<ScoreProvider | null>(null);

  const providers: ScoreProvider[] = [
    "neynar",
    "ethos",
    "talentBuilder",
    "talentCreator",
    "quotient",
    "passport",
  ];

  return (
    <div className="w-full">
      
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
