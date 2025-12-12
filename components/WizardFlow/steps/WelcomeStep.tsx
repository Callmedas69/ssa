"use client";

export function WelcomeStep() {
  return (
    <div className="text-center space-y-6 px-8 my-auto">
      {/* Hero Title */}
      <h2 className="text-6xl sm:text-6xl lg:text-7xl font-[family-name:var(--font-luckiest-guy)] text-[#2D2A26] retro-text-3d">
        STAND OUT<br/>FROM THE CROWD
      </h2>

      {/* Description */}
      <p className="text-[#8B8680] text-sm italic max-w-xl mx-auto">
      We aggregate six independent social reputation signals into a single <span className="font-bold">soulbound</span> TrustCheck, giving you a verifiable snapshot of your onchain credibility.
      </p>
    </div>
  );
}
