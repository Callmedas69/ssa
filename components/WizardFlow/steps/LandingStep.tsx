"use client";

import Image from "next/image";
import { CustomConnectButton } from "@/components/CustomConnectButton";
import { useAccount } from "wagmi";

export function LandingStep() {
  const { isConnected } = useAccount();

  return (
    <div className="text-center space-y-8 flex flex-col items-center my-auto">
      {/* Logo */}
      <Image
        src="/ssa_logo_v2.svg"
        alt="SSA Index"
        width={120}
        height={120}
        className="w-24 h-24 sm:w-32 sm:h-32"
      />

      {/* Title */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-[family-name:var(--font-luckiest-guy)] text-[#2D2A26] retro-text-3d uppercase tracking-wide">
        Social Check
      </h1>

      {/* Tagline */}
      <p className="text-[#8B8680] text-sm italic sm:text-xl max-w-md mx-auto">
        Your onchain reputation. Verified.
      </p>

      {/* Connect Button - always visible */}
      <div className="space-y-3 pt-4">
        <CustomConnectButton />
      </div>
    </div>
  );
}
