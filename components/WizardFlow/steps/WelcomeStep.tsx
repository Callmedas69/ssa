"use client";

export function WelcomeStep() {
  return (
    <div className="text-center space-y-6 px-8 my-auto">
      {/* Hero Title */}
      <h2 className="text-4xl sm:text-5xl lg:text-5xl font-[family-name:var(--font-luckiest-guy)] text-[#2D2A26] retro-text-3d">
        STAND OUT FROM THE CROWD
      </h2>

      {/* Description */}
      <p className="text-[#8B8680] text-lg max-w-xl mx-auto">
      Aggregating six social scoring providers into a single soulbound reputation index that reflects your true onchain identity.
      </p>
    </div>
  );
}
