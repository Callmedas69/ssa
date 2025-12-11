"use client";

interface SSABadgeProps {
  score: number;
  tier?: string;
  size?: "sm" | "md" | "lg";
}

const tierColors: Record<string, { primary: string; secondary: string }> = {
  bronze: { primary: "#CD7F32", secondary: "#8B4513" },
  silver: { primary: "#C0C0C0", secondary: "#808080" },
  gold: { primary: "#FFD700", secondary: "#DAA520" },
  platinum: { primary: "#E5E4E2", secondary: "#A0A0A0" },
};

const tierLabels: Record<string, string> = {
  bronze: "NEWCOMER",
  silver: "RISING STAR",
  gold: "TRUSTED",
  platinum: "LEGENDARY",
};

export function SSABadge({ score, tier = "bronze", size = "md" }: SSABadgeProps) {
  const colors = tierColors[tier] || tierColors.bronze;
  const tierLabel = tierLabels[tier] || "NEWCOMER";

  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-32 h-32",
    lg: "w-40 h-40",
  };

  const scoreSizes = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-4xl",
  };

  const labelSizes = {
    sm: "text-[8px]",
    md: "text-[10px]",
    lg: "text-xs",
  };

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      {/* Outer ring with rotating text */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
      >
        {/* Definitions */}
        <defs>
          {/* Circular path for text */}
          <path
            id="circlePath"
            d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
            fill="none"
          />
          {/* Gradient for outer ring */}
          <linearGradient id={`badgeGradient-${tier}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="100%" stopColor={colors.secondary} />
          </linearGradient>
        </defs>

        {/* Outer decorative ring */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke={colors.secondary}
          strokeWidth="2"
        />
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke={`url(#badgeGradient-${tier})`}
          strokeWidth="4"
        />

        {/* Inner circle background */}
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="#F5F0E8"
          stroke="#2D2A26"
          strokeWidth="2"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`font-bold text-[#2D2A26] ${scoreSizes[size]}`}
          style={{ textShadow: `1px 1px 0 ${colors.primary}` }}
        >
          {score}
        </span>
        <span
          className={`font-bold uppercase tracking-wide ${labelSizes[size]}`}
          style={{ color: colors.secondary }}
        >
          {tierLabel}
        </span>
      </div>
    </div>
  );
}
