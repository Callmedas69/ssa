import { memo } from 'react';
import type { ScoreProvider } from '@/lib/types';

interface ProviderGuidanceData {
  name: string;
  tips: string[];
  link: string;
  linkText: string;
}

const guidanceData: Record<ScoreProvider, ProviderGuidanceData> = {
  neynar: {
    name: 'Neynar',
    tips: [
      'Post quality content on Farcaster regularly',
      'Engage meaningfully with other users (replies, recasts)',
      'Grow your follower base organically',
      'Avoid spam or low-quality interactions',
    ],
    link: 'https://warpcast.com',
    linkText: 'Open Warpcast',
  },
  ethos: {
    name: 'Ethos',
    tips: [
      'Get vouches from trusted users on Ethos Network',
      'Vouch for others to build mutual credibility',
      'Maintain positive on-chain interactions',
      'Avoid negative reviews or disputes',
    ],
    link: 'https://ethos.network',
    linkText: 'Visit Ethos Network',
  },
  talentBuilder: {
    name: 'Talent Builder',
    tips: [
      'Connect your GitHub account',
      'Verify your technical skills and credentials',
      'Complete your builder profile',
      'Contribute to open source projects',
    ],
    link: 'https://app.talentprotocol.com',
    linkText: 'Complete Your Profile',
  },
  talentCreator: {
    name: 'Talent Creator',
    tips: [
      'Connect your social media accounts',
      'Build your content portfolio',
      'Grow your audience across platforms',
      'Demonstrate consistent content creation',
    ],
    link: 'https://app.talentprotocol.com',
    linkText: 'Complete Your Profile',
  },
  quotient: {
    name: 'Quotient',
    tips: [
      'Focus on quality engagement over quantity',
      'Build meaningful conversations on Farcaster',
      'Avoid mass-following or spam tactics',
      'Engage with high-quality content creators',
    ],
    link: 'https://quotient.social',
    linkText: 'View Quotient Profile',
  },
  passport: {
    name: 'Gitcoin Passport',
    tips: [
      'Add more stamps (GitHub, Discord, ENS, Google, etc.)',
      'Verify your unique humanity across platforms',
      'Keep stamps up to date (they can expire)',
      'Connect more accounts for higher score',
    ],
    link: 'https://passport.gitcoin.co',
    linkText: 'Add More Stamps',
  },
};

interface ProviderGuidanceProps {
  provider: ScoreProvider;
  hasProfile: boolean;
}

export const ProviderGuidance = memo(function ProviderGuidance({
  provider,
  hasProfile
}: ProviderGuidanceProps) {
  const guidance = guidanceData[provider];

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-card-foreground">{guidance.name}</h4>
        <a
          href={guidance.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline flex items-center gap-1"
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

      {!hasProfile && (
        <p className="text-sm text-amber-600 dark:text-amber-400 mb-3">
          No profile found. Create one to start building your reputation.
        </p>
      )}

      <p className="text-xs text-muted-foreground mb-2">How to improve:</p>
      <ul className="space-y-1">
        {guidance.tips.map((tip, index) => (
          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
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

export const AllProviderGuidance = memo(function AllProviderGuidance({ scores }: AllGuidanceProps) {
  const providers: ScoreProvider[] = [
    'neynar',
    'ethos',
    'talentBuilder',
    'talentCreator',
    'quotient',
    'passport',
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">How to Improve Your Scores</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {providers.map((provider) => (
          <ProviderGuidance
            key={provider}
            provider={provider}
            hasProfile={scores[provider] !== null}
          />
        ))}
      </div>
    </div>
  );
});
