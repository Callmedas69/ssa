"use client";

import { CustomConnectButton } from "./CustomConnectButton";
import Image from "next/image";

export function MacMenuBar() {
  return (
    <div className="w-full bg-white border-b-2 border-black px-4 py-3 flex items-center justify-between font-['Chicago'] text-xs">
      <div className="flex items-center gap-3">
        <Image
          src="/ssa_logo.svg"
          alt="SSA Logo"
          width={36}
          height={36}
          className="rounded-full"
        />
        <span className="flex flex-col">
          <p className="font-bold uppercase text-3xl">
            Social Score Attestator
          </p>
          <p>A single identity signal from six reputation networks.</p>
        </span>
      </div>
      <div className="flex items-center gap-3">
        <CustomConnectButton />
      </div>
    </div>
  );
}
