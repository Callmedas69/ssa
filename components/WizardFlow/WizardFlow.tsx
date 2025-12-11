"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { WizardStep } from "./WizardStep";
import { LandingStep } from "./steps/LandingStep";
import { WelcomeStep } from "./steps/WelcomeStep";
import { ScoresStep } from "./steps/ScoresStep";
import { MintStep } from "./steps/MintStep";
import { TipsStep } from "./steps/TipsStep";
import { ShareStep } from "./steps/ShareStep";
import { useHasMintedSBT } from "@/hooks/useHasMintedSBT";
import { Badge } from "@/components/ui/badge";
import type { SocialScores, ScoreApiResponse } from "@/lib/types";

async function fetchScores(address: string): Promise<SocialScores> {
  try {
    const response = await fetch(`/api/scores?address=${address}`);

    if (!response.ok) {
      throw new Error(
        `API returned ${response.status}: ${response.statusText}`
      );
    }

    const result: ScoreApiResponse = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || "Failed to fetch scores");
    }

    return result.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch scores: ${error.message}`);
    }
    throw error;
  }
}

export function WizardFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [isAnimating, setIsAnimating] = useState(false);

  const { address, isConnected } = useAccount();
  const { hasMinted } = useHasMintedSBT(address);

  // Fetch scores when connected and on step 3+
  const {
    data: scores,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["scores", address],
    queryFn: () => fetchScores(address!),
    enabled: !!address && isConnected && currentStep >= 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache 30 minutes
    retry: 2,
  });

  // Reset to step 1 if wallet disconnects
  useEffect(() => {
    if (!isConnected && currentStep > 1) {
      setCurrentStep(1);
      setDirection("backward");
    }
  }, [isConnected, currentStep]);

  const handleAnimationComplete = useCallback(() => {
    setIsAnimating(false);
  }, []);

  const goToNext = useCallback(() => {
    if (currentStep < 6 && !isAnimating) {
      setIsAnimating(true);
      setDirection("forward");
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, isAnimating]);

  const goToPrevious = useCallback(() => {
    if (currentStep > 1 && !isAnimating) {
      setIsAnimating(true);
      setDirection("backward");
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep, isAnimating]);

  const handleStartOver = useCallback(() => {
    setIsAnimating(true);
    setDirection("backward");
    setCurrentStep(1);
  }, []);

  // Determine if Next button should be disabled
  const getNextDisabled = () => {
    switch (currentStep) {
      case 1:
        return !isConnected; // Must connect wallet on Landing
      case 2:
        return false; // Welcome step - always enabled
      case 3:
        return isLoading || !!error; // Scores step
      case 4:
        return false; // Mint step
      case 5:
        return false; // Tips step
      case 6:
        return false; // Share step - Start Over enabled
      default:
        return false;
    }
  };

  // Get label for Next button
  const getNextLabel = () => {
    switch (currentStep) {
      case 1:
        return isConnected ? "Get Started" : "Connect First";
      case 2:
        return "View Scores";
      case 3:
        return "Verify & Mint";
      case 4:
        return "Tips";
      case 5:
        return "Share";
      case 6:
        return "Done";
      default:
        return "Next";
    }
  };

  return (
    <div className="min-h-screen flex items-start sm:items-center justify-center py-0 px-0 sm:py-8 sm:px-4">
      {/* Container - responsive width */}
      <div className="relative w-full sm:w-[85%] lg:w-[75%] sm:max-w-4xl">
        {/* Card for steps 1-6 */}
        {currentStep <= 6 && (
          <div className="min-h-screen sm:min-h-0 sm:h-[80vh] bg-[#F5F0E8] py-6 px-8 sm:py-6 sm:px-10 lg:py-8 lg:px-12 pb-24 sm:pb-20 overflow-y-auto sm:overflow-hidden border-0 sm:border-2 border-[#2D2A26] rounded-none sm:rounded-lg shadow-none sm:shadow-[4px_4px_0_#2D2A26] flex flex-col justify-start sm:justify-center">
            {/* Step 1: Landing - Logo + Title + Tagline + Connect */}
            <WizardStep
              stepNumber={1}
              currentStep={currentStep}
              direction={direction}
              onAnimationComplete={handleAnimationComplete}
            >
              <LandingStep />
            </WizardStep>

            {/* Step 2: Welcome */}
            <WizardStep
              stepNumber={2}
              currentStep={currentStep}
              direction={direction}
              onAnimationComplete={handleAnimationComplete}
            >
              <WelcomeStep />
            </WizardStep>

            {/* Step 3: Scores */}
            <WizardStep
              stepNumber={3}
              currentStep={currentStep}
              direction={direction}
              onAnimationComplete={handleAnimationComplete}
            >
              <ScoresStep
                scores={scores}
                isLoading={isLoading}
                error={error as Error | null}
              />
            </WizardStep>

            {/* Step 4: Mint */}
            <WizardStep
              stepNumber={4}
              currentStep={currentStep}
              direction={direction}
              onAnimationComplete={handleAnimationComplete}
            >
              {address && (
                <MintStep
                  address={address}
                  identity={scores?.identity ?? null}
                  ssaIndex={scores?.ssaIndex?.score ?? null}
                  ssaTier={scores?.ssaIndex?.tier ?? null}
                  hasMintedSBT={hasMinted}
                />
              )}
            </WizardStep>

            {/* Step 5: Tips */}
            <WizardStep
              stepNumber={5}
              currentStep={currentStep}
              direction={direction}
              onAnimationComplete={handleAnimationComplete}
            >
              <TipsStep scores={scores} />
            </WizardStep>

            {/* Step 6: Share */}
            <WizardStep
              stepNumber={6}
              currentStep={currentStep}
              direction={direction}
              onAnimationComplete={handleAnimationComplete}
            >
              <ShareStep scores={scores} />
            </WizardStep>
          </div>
        )}

        {/* Navigation - [Back] on left, [Next] on right, overlapping card edge */}
        {/* Hide navigation on step 1 (Landing) until connected */}
        {(currentStep > 1 || isConnected) && (
          <div className="fixed sm:absolute left-0 right-0 z-50 sm:z-10 bg-[#F5F0E8] sm:bg-transparent bottom-0 sm:translate-y-1/2">
            {/* Index Tiers - only on step 3 */}
            {currentStep === 3 && scores?.ssaIndex && (
              <div className="flex justify-center gap-1.5 py-2 px-2 sm:hidden flex-wrap">
                <Badge variant="retro" className="bg-[#8B8680] text-white border-[#2D2A26]">0-24 Newcomer</Badge>
                <Badge variant="retro" className="bg-[#E85D3B] text-white border-[#2D2A26]">25-49 Rising</Badge>
                <Badge variant="retro" className="bg-[#F4A261] text-white border-[#2D2A26]">50-74 Trusted</Badge>
                <Badge variant="retro" className="bg-[#2A9D8F] text-white border-[#2D2A26]">75+ Legend</Badge>
              </div>
            )}
            {/* Nav buttons */}
            <div className="flex justify-between items-center w-full px-4 py-3 sm:py-0 border-t-2 sm:border-0 border-[#2D2A26]">
              {/* Back Button - Left */}
              <div className="w-20 sm:w-28">
                {currentStep > 1 ? (
                  <button
                    onClick={goToPrevious}
                    disabled={isAnimating}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-[#E8E3DB] text-[#2D2A26] font-bold uppercase tracking-wide text-xs sm:text-sm rounded-lg border-2 border-[#2D2A26] shadow-[2px_2px_0_#2D2A26] sm:shadow-[3px_3px_0_#2D2A26] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_#2D2A26] sm:hover:shadow-[5px_5px_0_#2D2A26] transition-all duration-150 disabled:cursor-not-allowed"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                ) : null}
              </div>

              {/* Step Indicator Dots - Center */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {[1, 2, 3, 4, 5, 6].map((step) => (
                  <div
                    key={step}
                    className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${
                      step === currentStep
                        ? "bg-[#E85D3B] scale-125"
                        : step < currentStep
                        ? "bg-[#2D2A26]"
                        : "bg-[#2D2A26]/30"
                    }`}
                  />
                ))}
              </div>

              {/* Next Button - Right */}
              <div>
                <button
                  onClick={currentStep === 6 ? handleStartOver : goToNext}
                  disabled={getNextDisabled() || isAnimating}
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 bg-[#E85D3B] text-white font-bold uppercase tracking-wide text-xs sm:text-sm rounded-lg border-2 border-[#2D2A26] shadow-[2px_2px_0_#2D2A26] sm:shadow-[3px_3px_0_#2D2A26] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_#2D2A26] sm:hover:shadow-[5px_5px_0_#2D2A26] transition-all duration-150 disabled:cursor-not-allowed"
                >
                  {currentStep === 6 ? "Start Over" : getNextLabel()}
                  {currentStep !== 6 && (
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
