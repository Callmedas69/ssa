"use client";

import { useEffect } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { useSubmitScores } from "@/hooks/useSubmitScores";
import { Loader2, Check, AlertCircle, ExternalLink } from "lucide-react";

interface SubmitScoresButtonProps {
  disabled?: boolean;
  hasMinted?: boolean;
  onAttestSuccess?: () => void;
}

export function SubmitScoresButton({
  disabled,
  hasMinted,
  onAttestSuccess,
}: SubmitScoresButtonProps) {
  const { isConnected } = useAccount();
  const { state, error, txHash, fetchSignature, submitToChain, reset } =
    useSubmitScores();

  // Notify parent when attestation succeeds
  useEffect(() => {
    if (state === "success" && onAttestSuccess) {
      onAttestSuccess();
    }
  }, [state, onAttestSuccess]);

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
        return hasMinted ? "UPDATE" : "ATTEST";
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
            Sending...
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
            ATTESTED!
          </span>
        );
      case "error":
        return (
          <span className="flex flex-row items-center justify-center">
            <AlertCircle className="mr-2 h-4 w-4" />
            TRY AGAIN
          </span>
        );
      case "cooldown":
        return (
          <span className="flex flex-row items-center justify-center">
            <AlertCircle className="mr-2 h-4 w-4" />
            WAIT 24H
          </span>
        );
      default:
        return "ATTEST";
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
            ? "retro-success"
            : state === "error"
            ? "retro-outline"
            : state === "cooldown"
            ? "retro-outline"
            : "retro"
        }
        className="w-full min-w-[140px] flex-1 flex items-center justify-center"
        aria-label={
          hasMinted
            ? "Update social scores attestation"
            : "Attest social scores on-chain"
        }
        aria-busy={isLoading}
        aria-disabled={isDisabled}
      >
        {getButtonContent()}
      </Button>

      {/* Error message */}
      {error && (
        <div
          className="space-y-2 bg-white p-3 border-2 border-[#2D2A26] rounded-lg"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-sm text-[#2D2A26] text-center font-bold">
            {error.includes("No signed payload")
              ? "Failed to prepare. Please try again."
              : error}
          </p>
          {error.toLowerCase().includes("provider") && (
            <p className="text-xs text-[#8B8680] text-center">
              Please try again. If the issue persists, contact support.
            </p>
          )}
          {error.includes("paused") && (
            <p className="text-xs text-[#8B8680] text-center">
              The contract is temporarily paused. Check back later.
            </p>
          )}
          {error.includes("24 hours") && (
            <p className="text-xs text-[#8B8680] text-center">
              Check back tomorrow!
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
          className="flex items-center justify-center gap-1 text-sm text-[#E85D3B] font-bold hover:underline"
        >
          View on BaseScan
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}
