"use client";

import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { useSubmitScores } from "@/hooks/useSubmitScores";
import { Loader2, Check, AlertCircle, ExternalLink } from "lucide-react";

interface SubmitScoresButtonProps {
  disabled?: boolean;
  hasMinted?: boolean;
}

export function SubmitScoresButton({
  disabled,
  hasMinted,
}: SubmitScoresButtonProps) {
  const { isConnected } = useAccount();
  const { state, error, txHash, fetchSignature, submitToChain, reset } =
    useSubmitScores();

  const handleClick = async () => {
    if (state === "idle" || state === "error") {
      // Single-click flow: fetch signature (auto-submits via useEffect)
      await fetchSignature();
      // submitToChain is automatically called by useEffect when state becomes 'ready'
    } else if (state === "success" || state === "cooldown") {
      reset();
    }
  };

  // Button content based on state
  const getButtonContent = () => {
    switch (state) {
      case "idle":
        return hasMinted ? "Update" : "Attest";
      case "signing":
        return (
          <span className="flex flex-row items-center justify-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Preparing...
          </span>
        );
      case "ready":
      case "submitting":
        return (
          <span className="flex flex-row items-center justify-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </span>
        );
      case "confirming":
        return (
          <span className="flex flex-row items-center justify-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Confirming...
          </span>
        );
      case "success":
        return (
          <span className="flex flex-row items-center justify-center">
            <Check className="mr-2 h-4 w-4" />
            Attested!
          </span>
        );
      case "error":
        return (
          <span className="flex flex-row items-center justify-center">
            <AlertCircle className="mr-2 h-4 w-4" />
            Try Again
          </span>
        );
      case "cooldown":
        return (
          <span className="flex flex-row items-center justify-center">
            <AlertCircle className="mr-2 h-4 w-4" />
            Cooldown
          </span>
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
        className="w-full min-w-[140px] flex-1 flex items-center justify-center"
        aria-label={
          hasMinted
            ? "Update social scores on-chain"
            : "Attest social scores on-chain"
        }
        aria-busy={isLoading}
        aria-disabled={isDisabled}
      >
        {getButtonContent()}
      </Button>

      {/* Error message with better formatting */}
      {error && (
        <div
          className="space-y-2 mac1-inset bg-white p-2 border-2 border-black"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-sm text-black text-center font-bold">
            ⚠️{" "}
            {error.includes("No signed payload")
              ? "Failed to prepare attestation. Please try again."
              : error}
          </p>
          {error.toLowerCase().includes("provider") && (
            <p className="text-xs text-muted-foreground text-center">
              Please try again. If the issue persists, contact support.
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
          className="flex items-center justify-center gap-1 text-sm text-black hover:underline transition-none"
        >
          View on BaseScan
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}
