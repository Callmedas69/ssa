"use client";

import { AllProviderGuidance } from "@/components/ProviderGuidance";
import type { SocialScores } from "@/lib/types";

interface TipsStepProps {
  scores: SocialScores | undefined;
}

export function TipsStep({ scores }: TipsStepProps) {
  return (
    <div className="space-y-6 my-auto">
      {/* Title */}
      <div className="text-center">
        <h3 className="text-4xl sm:text-5xl font-[family-name:var(--font-luckiest-guy)] text-[#2D2A26] mb-2 retro-text-3d mb-6">
          Improve Your Score
        </h3>
        
      </div>

      {/* Provider Tips */}
      {scores && (
        <div className="text-left px-2 sm:px-0">
          <AllProviderGuidance
            scores={{
              neynar: scores.neynar,
              ethos: scores.ethos,
              talentBuilder: scores.talentBuilder,
              talentCreator: scores.talentCreator,
              quotient: scores.quotient,
              passport: scores.passport,
            }}
          />
        </div>
      )}
    </div>
  );
}
