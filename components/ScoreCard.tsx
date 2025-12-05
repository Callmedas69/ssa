import { memo, useMemo } from 'react';
import type { ScoreProvider, NeynarScore, EthosScore, TalentBuilderScore, TalentCreatorScore, QuotientScore, PassportScore } from '@/lib/types';

type ScoreData = NeynarScore | EthosScore | TalentBuilderScore | TalentCreatorScore | QuotientScore | PassportScore | null;

interface ScoreCardProps {
  provider: ScoreProvider;
  data: ScoreData;
  isLoading?: boolean;
}

const providerInfo: Record<ScoreProvider, { name: string; description: string; maxScore: string }> = {
  neynar: {
    name: 'Neynar',
    description: 'Farcaster social quality',
    maxScore: '1.0',
  },
  ethos: {
    name: 'Ethos',
    description: 'On-chain credibility',
    maxScore: '2800',
  },
  talentBuilder: {
    name: 'Talent Builder',
    description: 'Developer reputation',
    maxScore: 'Uncapped',
  },
  talentCreator: {
    name: 'Talent Creator',
    description: 'Content creator reputation',
    maxScore: 'Uncapped',
  },
  quotient: {
    name: 'Quotient',
    description: 'Farcaster engagement quality',
    maxScore: '1.0',
  },
  passport: {
    name: 'Passport',
    description: 'Sybil resistance score',
    maxScore: '100',
  },
};

function getScoreDisplay(provider: ScoreProvider, data: ScoreData): string {
  if (!data) return '—';

  if (provider === 'neynar') {
    return (data as NeynarScore).score.toFixed(2);
  }
  if (provider === 'ethos') {
    return String((data as EthosScore).score);
  }
  if (provider === 'talentBuilder') {
    return String((data as TalentBuilderScore).score);
  }
  if (provider === 'talentCreator') {
    return String((data as TalentCreatorScore).score);
  }
  if (provider === 'quotient') {
    return (data as QuotientScore).score.toFixed(2);
  }
  if (provider === 'passport') {
    return (data as PassportScore).score.toFixed(1);
  }
  return '—';
}

function getScorePercentage(provider: ScoreProvider, data: ScoreData): number {
  if (!data) return 0;

  if (provider === 'neynar') {
    return (data as NeynarScore).score * 100;
  }
  if (provider === 'ethos') {
    return Math.min(((data as EthosScore).score / 2800) * 100, 100);
  }
  if (provider === 'talentBuilder' || provider === 'talentCreator') {
    // Talent scores capped at 200 for SSA Index calculation
    return Math.min(((data as TalentBuilderScore).score / 200) * 100, 100);
  }
  if (provider === 'quotient') {
    return (data as QuotientScore).score * 100;
  }
  if (provider === 'passport') {
    return Math.min((data as PassportScore).score, 100);
  }
  return 0;
}

function getExtraInfo(provider: ScoreProvider, data: ScoreData): string | null {
  if (!data) return null;

  if (provider === 'neynar') {
    const neynar = data as NeynarScore;
    return neynar.username ? `@${neynar.username}` : null;
  }
  if (provider === 'ethos') {
    const ethos = data as EthosScore;
    return ethos.level ? ethos.level.charAt(0).toUpperCase() + ethos.level.slice(1) : null;
  }
  if (provider === 'talentBuilder') {
    const talent = data as TalentBuilderScore;
    return talent.level ? `Level ${talent.level}` : null;
  }
  if (provider === 'talentCreator') {
    const talent = data as TalentCreatorScore;
    return talent.level ? `Level ${talent.level}` : null;
  }
  if (provider === 'quotient') {
    const quotient = data as QuotientScore;
    return quotient.tier.charAt(0).toUpperCase() + quotient.tier.slice(1);
  }
  if (provider === 'passport') {
    const passport = data as PassportScore;
    if (passport.passingScore) return 'Passing';
    return passport.stampCount ? `${passport.stampCount} stamps` : null;
  }
  return null;
}

export const ScoreCard = memo(function ScoreCard({ provider, data, isLoading }: ScoreCardProps) {
  const info = providerInfo[provider];
  const scoreDisplay = useMemo(() => getScoreDisplay(provider, data), [provider, data]);
  const percentage = useMemo(() => getScorePercentage(provider, data), [provider, data]);
  const extraInfo = useMemo(() => getExtraInfo(provider, data), [provider, data]);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 animate-pulse">
        <div className="h-4 w-24 bg-muted rounded mb-2" />
        <div className="h-8 w-16 bg-muted rounded mb-4" />
        <div className="h-2 w-full bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-card-foreground">{info.name}</h3>
        <span className="text-xs text-muted-foreground">Max: {info.maxScore}</span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">{info.description}</p>

      {data ? (
        <>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-bold text-card-foreground">{scoreDisplay}</span>
            {extraInfo && (
              <span className="text-sm text-muted-foreground">{extraInfo}</span>
            )}
          </div>
          <div
            role="progressbar"
            aria-valuenow={Math.round(percentage)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${info.name} score: ${scoreDisplay}`}
            className="h-2 w-full bg-muted rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </>
      ) : (
        <div className="text-center py-4">
          <span className="text-muted-foreground">No profile found</span>
        </div>
      )}
    </div>
  );
});
