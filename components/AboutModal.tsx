"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { config } from "@/lib/config";
import { TIER_LABELS } from "@/lib/ssaIndex";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROVIDERS = [
  { name: "Neynar", description: "Farcaster Influence" },
  { name: "Ethos", description: "Credibility" },
  { name: "Quotient", description: "Engagement Quality" },
  { name: "Talent Builder", description: "Onchain Builder" },
  { name: "Talent Creator", description: "Content Creator" },
];

const { tiers } = config.ssaIndex;
const TIERS = [
  { name: TIER_LABELS.platinum, range: `${tiers.platinum.min}+`, color: tiers.platinum.color },
  { name: TIER_LABELS.gold, range: `${tiers.gold.min}-${tiers.gold.max}`, color: tiers.gold.color },
  { name: TIER_LABELS.silver, range: `${tiers.silver.min}-${tiers.silver.max}`, color: tiers.silver.color },
  { name: TIER_LABELS.bronze, range: `${tiers.bronze.min}-${tiers.bronze.max}`, color: tiers.bronze.color },
];

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // GSAP animations
  useGSAP(() => {
    if (!containerRef.current || !overlayRef.current || !modalRef.current) return;

    if (isOpen) {
      gsap.set(containerRef.current, { display: "flex" });
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.2, ease: "power2.out" });
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.95, y: 10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.25, ease: "back.out(1.5)" }
      );
    } else {
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.15, ease: "power2.in" });
      gsap.to(modalRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.15,
        ease: "power2.in",
        onComplete: () => {
          if (containerRef.current) {
            gsap.set(containerRef.current, { display: "none" });
          }
        },
      });
    }
  }, { dependencies: [isOpen], scope: containerRef });

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] hidden items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Overlay */}
      <div ref={overlayRef} className="absolute inset-0 bg-black/50 opacity-0" />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-[#F5F0E8] w-full max-w-md max-h-[85vh] overflow-y-auto rounded-lg border-2 border-[#2D2A26] shadow-[4px_4px_0_#2D2A26]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#F5F0E8] px-6 py-4 border-b-2 border-[#2D2A26] flex items-center justify-between">
          <h2 className="text-xl font-[family-name:var(--font-luckiest-guy)] text-[#2D2A26] retro-text-3d">
            About TrustCheck
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#2D2A26] hover:bg-[#E8E3DB] rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {/* What is TrustCheck */}
          <section>
            <h3 className="text-sm font-bold text-[#2D2A26] uppercase mb-2">
              What is TrustCheck?
            </h3>
            <p className="text-sm text-[#5C5955] leading-relaxed">
              TrustCheck is an aggregated onchain reputation score that combines
              multiple well-known reputation providers into a single metric.
              Attest your scores to the blockchain and mint a Soulbound Token (SBT)
              on Base.
            </p>
          </section>

          {/* Score Providers */}
          <section>
            <h3 className="text-sm font-bold text-[#2D2A26] uppercase mb-3">
              Score Providers
            </h3>
            <div className="space-y-2">
              {PROVIDERS.map((provider) => (
                <div
                  key={provider.name}
                  className="py-1.5 border-b border-[#E8E3DB] last:border-0"
                >
                  <span className="text-sm font-semibold text-[#2D2A26]">
                    {provider.name}
                  </span>
                  <span className="text-xs text-[#8B8680] ml-2">
                    {provider.description}
                  </span>
                </div>
              ))}
            </div>
            {/* Human Passport note */}
            <p className="text-xs text-[#8B8680] mt-3 italic">
              Human Passport (Gitcoin) measures sybil resistance and is displayed
              separately from the behavior score.
            </p>
          </section>

          {/* How Score is Calculated */}
          <section>
            <h3 className="text-sm font-bold text-[#2D2A26] uppercase mb-2">
              Score Calculation
            </h3>
            <p className="text-sm text-[#5C5955] leading-relaxed mb-3">
              Your TrustCheck score is a weighted average of normalized scores
              from each behavior provider (0-100 scale).
            </p>
            {/* Formula */}
            <div className="bg-white rounded-lg border border-[#E8E3DB] p-3 mb-3 font-mono text-sm text-[#2D2A26] text-center">
              TrustCheck = Σ(score × weight)
            </div>
            {/* Tier legend */}
            <div className="flex flex-wrap gap-2">
              {TIERS.map((tier) => (
                <div
                  key={tier.name}
                  className="flex items-center gap-1.5 px-2 py-1 bg-white rounded border border-[#E8E3DB]"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: tier.color }}
                  />
                  <span className="text-xs font-semibold text-[#2D2A26]">
                    {tier.name}
                  </span>
                  <span className="text-xs text-[#8B8680]">
                    {tier.range}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E8E3DB]">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-[#2D2A26] text-white font-bold uppercase tracking-wide text-xs rounded-lg border-2 border-[#2D2A26] shadow-[2px_2px_0_#8B8680] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_#8B8680] transition-all duration-150"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
