"use client";

import { useTheme } from "./ThemeProvider";
import { ReactNode } from "react";

interface MacWindowProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function MacWindow({ title, children, className = "" }: MacWindowProps) {
  const { theme } = useTheme();

  if (theme !== "mac1") {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`mac1-window bg-white p-0 ${className}`}>
      {/* Title Bar with horizontal line pattern */}
      <div className="flex items-center border-b-2 border-black px-2 py-1 relative overflow-hidden">
        {/* Horizontal line stripes background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 1px, #000000 1px, #000000 2px)",
            backgroundSize: "100% 3px",
          }}
        />

        {/* Content with white background */}
        <div className="relative flex items-center w-full">
          {/* Close box (top-left) */}
          <div className="w-3 h-3 border-2 border-black bg-white mr-2 shrink-0" />

          {/* Title (centered) with white background */}
          <div className="flex-1 text-center font-['Chicago'] text-xs font-bold bg-white px-2">
            {title}
          </div>

          {/* Balance space for centering */}
          <div className="w-3 mr-2 shrink-0" />
        </div>
      </div>

      {/* Content area */}
      <div className="p-3">{children}</div>

      {/* Resize handle (bottom-right corner) */}
      <div className="absolute bottom-0 right-0 w-4 h-4">
        <svg width="16" height="16" viewBox="0 0 16 16" className="fill-black">
          <rect x="12" y="12" width="2" height="2" />
          <rect x="8" y="12" width="2" height="2" />
          <rect x="12" y="8" width="2" height="2" />
          <rect x="4" y="12" width="2" height="2" />
          <rect x="8" y="8" width="2" height="2" />
          <rect x="12" y="4" width="2" height="2" />
        </svg>
      </div>
    </div>
  );
}
