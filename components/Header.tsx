"use client";

import { CustomConnectButton } from "./CustomConnectButton";
import Image from "next/image";

export function Header() {
  return (
    <header className="w-full bg-[#F5F0E8] border-b-2 border-[#2D2A26] px-4 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3 sm:gap-4">
        <Image
          src="/ssa_logo_v2.svg"
          alt="SSA Logo"
          width={80}
          height={80}
          className="w-10 h-10 sm:w-16 sm:h-16"
        />
        <div className="flex flex-col">
          <h1 className="font-bold uppercase text-lg sm:text-2xl lg:text-3xl text-[#2D2A26] tracking-tight">
            <span className="sm:hidden">SSA INDEX</span>
            <span className="hidden sm:inline retro-text-3d-sm">SSA INDEX</span>
          </h1>
          <p className="hidden sm:block text-xs sm:text-sm text-[#8B8680] font-medium uppercase tracking-wide">
            Your onchain reputation. Verified.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <CustomConnectButton />
      </div>
    </header>
  );
}
