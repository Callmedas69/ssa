"use client";

import { useState, useEffect, memo } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  targetTime: number; // Unix timestamp
  onComplete?: () => void;
}

export const CountdownTimer = memo(function CountdownTimer({
  targetTime,
  onComplete,
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeRemaining("");
        if (onComplete) {
          onComplete();
        }
        return;
      }

      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetTime, onComplete]);

  if (!timeRemaining) return null;

  return (
    <span className="inline-flex items-center gap-2">
      <Clock className="h-4 w-4" />
      <span className="font-mono font-semibold">{timeRemaining}</span>
    </span>
  );
});
