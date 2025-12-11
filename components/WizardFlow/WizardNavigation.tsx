"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  showBack?: boolean;
  isAnimating?: boolean;
}

export function WizardNavigation({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  nextDisabled = false,
  nextLabel = "Next",
  showBack = true,
  isAnimating = false,
}: WizardNavigationProps) {
  return (
    <div className="flex justify-between items-center w-full">
      {/* Back Button - Left aligned */}
      <div className="w-24">
        {showBack && currentStep > 1 ? (
          <button
            onClick={onBack}
            disabled={isAnimating}
            className="flex items-center gap-2 px-4 py-2 bg-[#E8E3DB] text-[#2D2A26] font-bold uppercase tracking-wide rounded-lg border-2 border-[#2D2A26] shadow-[3px_3px_0_#2D2A26] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_#2D2A26] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[3px_3px_0_#2D2A26]"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        ) : null}
      </div>

      {/* Next Button - Right aligned */}
      <div>
        <button
          onClick={onNext}
          disabled={nextDisabled || isAnimating}
          className="flex items-center gap-2 px-6 py-2 bg-[#E85D3B] text-white font-bold uppercase tracking-wide rounded-lg border-2 border-[#2D2A26] shadow-[3px_3px_0_#2D2A26] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_#2D2A26] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[3px_3px_0_#2D2A26]"
        >
          {nextLabel}
          {nextLabel !== "Start Over" && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
