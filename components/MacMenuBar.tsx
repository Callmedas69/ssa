"use client";

import { CustomConnectButton } from "./CustomConnectButton";
import Image from "next/image";

export function MacMenuBar() {
  return (
    <div className="w-full bg-white border-b-2 border-black px-4 py-3 flex items-center justify-between font-['Chicago'] text-xs">
      <div className="flex items-center gap-2 sm:gap-3">
        <Image
          src="/ssa_logo_v2.svg"
          alt="SSA Logo"
          width={80}
          height={80}
          className="w-9 h-9 sm:w-20 sm:h-20"
        />
        <span className="flex flex-col">
          <p className="font-bold uppercase text-lg sm:text-2xl lg:text-3xl">
            <span className="sm:hidden">SSA INDEX</span>
            <span className="hidden sm:inline">Social Score Attestator</span>
          </p>
          <p className="hidden sm:block text-xs sm:text-sm">
            one score. one identity
          </p>
        </span>
      </div>
      <div className="flex items-center gap-3">
        <CustomConnectButton />
      </div>
    </div>
  );
}
