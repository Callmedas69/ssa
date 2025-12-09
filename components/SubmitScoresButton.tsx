"use client";

import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { useSubmitScores } from "@/hooks/useSubmitScores";
import { CountdownTimer } from "@/components/CountdownTimer";
import { Loader2, Check, AlertCircle, ExternalLink } from "lucide-react";

interface SubmitScoresButtonProps {
  disabled?: boolean;
}

export function SubmitScoresButton({ disabled }: SubmitScoresButtonProps) {
  const { isConnected } = useAccount();
  const {
    state,
    error,
    txHash,
    nextAllowedTime,
    fetchSignature,
    submitToChain,
    reset,
    checkSubmissionStatus,
  } = useSubmitScores();

  // Contract is deployed - no configuration check needed

  const handleClick = async () => {
    if (state === "idle" || state === "error") {
      await fetchSignature();
    } else if (state === "ready") {
      await submitToChain();
    } else if (state === "success" || state === "cooldown") {
      reset();
    }
  };

  const handleCountdownComplete = () => {
    checkSubmissionStatus();
  };

  // Button content based on state
  const getButtonContent = () => {
    switch (state) {
      case "idle":
        return "Attest On-Chain";
      case "signing":
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Preparing...
          </>
        );
      case "ready":
        return "Confirm Transaction";
      case "submitting":
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        );
      case "confirming":
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Confirming...
          </>
        );
      case "success":
        return (
          <>
            <Check className="mr-2 h-4 w-4" />
            Attested!
          </>
        );
      case "error":
        return (
          <>
            <AlertCircle className="mr-2 h-4 w-4" />
            Try Again
          </>
        );
      case "cooldown":
        return nextAllowedTime ? (
          <CountdownTimer
            targetTime={nextAllowedTime}
            onComplete={handleCountdownComplete}
          />
        ) : (
          "Cooldown"
        );
      default:
        return "Attest On-Chain";
    }
  };

  const isLoading =
    state === "signing" || state === "submitting" || state === "confirming";
  const isDisabled =
    !isConnected || isLoading || disabled || state === "cooldown";

  return (
    <div className="space-y-2">
      <Button
        onClick={handleClick}
        disabled={isDisabled}
        variant={
          state === "success"
            ? "secondary"
            : state === "error"
            ? "destructive"
            : state === "cooldown"
            ? "secondary"
            : "default"
        }
        className="w-full"
      >
        {getButtonContent()}
      </Button>

      {/* Error message with better formatting */}
      {error && (
        <div className="space-y-1">
          <p className="text-sm text-destructive text-center font-medium">
            {error}
          </p>
          {error.includes("provider") && (
            <p className="text-xs text-muted-foreground text-center">
              This may indicate a configuration issue. Please contact support if
              the problem persists.
            </p>
          )}
          {error.includes("paused") && (
            <p className="text-xs text-muted-foreground text-center">
              The contract is temporarily paused. Please check back later.
            </p>
          )}
          {error.includes("24 hours") && (
            <p className="text-xs text-muted-foreground text-center">
              You can only submit scores once per day. Please wait before trying
              again.
            </p>
          )}
        </div>
      )}

      {/* Transaction link */}
      {txHash && state === "success" && (
        <a
          href={`https://basescan.org/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          View on BaseScan
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}
