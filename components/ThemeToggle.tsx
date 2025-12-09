"use client";

import { useTheme } from "./ThemeProvider";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";

export function ThemeToggle() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        aria-label="Toggle theme"
        disabled
      >
        <span className="text-xs">🖥️</span>
        <span className="text-xs hidden sm:inline">Loading...</span>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      aria-label="Mac System 1 Theme"
      disabled
    >
      <span className="text-xs">🖥️</span>
      <span className="text-xs hidden sm:inline">Mac Classic</span>
    </Button>
  );
}
