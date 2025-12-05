import { config } from '@/lib/config';
import type { SSAIndex, SSAIndexTier } from '@/lib/types';

interface SSAIndexCardProps {
  data: SSAIndex | null;
  isLoading?: boolean;
}

const tierColors: Record<SSAIndexTier, string> = {
  bronze: config.ssaIndex.tiers.bronze.color,
  silver: config.ssaIndex.tiers.silver.color,
  gold: config.ssaIndex.tiers.gold.color,
  platinum: config.ssaIndex.tiers.platinum.color,
};

const tierLabels: Record<SSAIndexTier, string> = {
  bronze: config.ssaIndex.tiers.bronze.label,
  silver: config.ssaIndex.tiers.silver.label,
  gold: config.ssaIndex.tiers.gold.label,
  platinum: config.ssaIndex.tiers.platinum.label,
};

export function SSAIndexCard({ data, isLoading }: SSAIndexCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 animate-pulse">
        <div className="text-center">
          <div className="h-4 w-24 bg-muted rounded mx-auto mb-4" />
          <div className="h-16 w-24 bg-muted rounded mx-auto mb-4" />
          <div className="h-3 w-full bg-muted rounded mb-4" />
          <div className="h-6 w-20 bg-muted rounded mx-auto" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="text-center">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
            SSA Index
          </h2>
          <span className="text-muted-foreground">Unable to calculate</span>
        </div>
      </div>
    );
  }

  const { score, tier } = data;
  const tierColor = tierColors[tier];
  const tierLabel = tierLabels[tier];

  return (
    <div className="rounded-lg border border-border bg-card p-8">
      <div className="text-center">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
          SSA Index
        </h2>

        <div
          className="text-6xl font-bold mb-4 transition-colors duration-300"
          style={{ color: tierColor }}
        >
          {score}
        </div>

        <div
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`SSA Index score: ${score} out of 100`}
          className="h-3 w-full bg-muted rounded-full overflow-hidden mb-4"
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${score}%`,
              backgroundColor: tierColor,
            }}
          />
        </div>

        <div
          className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wider"
          style={{
            backgroundColor: tierColor,
            color: ['silver', 'gold', 'platinum'].includes(tier) ? '#1a1a1a' : '#ffffff',
          }}
        >
          {tierLabel}
        </div>
      </div>
    </div>
  );
}
