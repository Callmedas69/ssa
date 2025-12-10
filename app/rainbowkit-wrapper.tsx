"use client";

import { ReactNode } from "react";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";

export function RainbowKitProviderWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return <RainbowKitProvider>{children}</RainbowKitProvider>;
}
