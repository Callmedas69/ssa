"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

interface WizardStepProps {
  stepNumber: number;
  currentStep: number;
  direction: "forward" | "backward";
  children: React.ReactNode;
  onAnimationComplete?: () => void;
}

export function WizardStep({
  stepNumber,
  currentStep,
  direction,
  children,
  onAnimationComplete,
}: WizardStepProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isActive = stepNumber === currentStep;

  useGSAP(
    () => {
      if (!containerRef.current || !isActive) return;

      // Smooth slide + fade animation
      const xOffset = direction === "forward" ? 60 : -60;

      gsap.fromTo(
        containerRef.current,
        {
          opacity: 0,
          x: xOffset,
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.3,
          ease: "power2.out",
          onComplete: onAnimationComplete,
        }
      );
    },
    { dependencies: [isActive, direction] }
  );

  if (!isActive) {
    return null;
  }

  return (
    <div ref={containerRef} className="w-full flex-1 flex flex-col">
      {children}
    </div>
  );
}
