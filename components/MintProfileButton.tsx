"use client";

import { useEffect } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { useMintProfile } from "@/hooks/useMintProfile";
import { Loader2, Check, AlertCircle, ExternalLink, Award } from "lucide-react";

interface MintProfileButtonProps {
  disabled?: boolean;
  onMintSuccess?: () => void;
  hasAttested?: boolean;
}

export function MintProfileButton({
  disabled,
  onMintSuccess,
  hasAttested = false,
}: MintProfileButtonProps) {
  const { isConnected, address } = useAccount();
  const {
    state,
    error,
    txHash,
    hasMinted,
    checkMintStatus,
    fetchVoucher,
    mint,
    reset,
  } = useMintProfile();

  // Check mint status when address changes
  useEffect(() => {
    if (address) {
      checkMintStatus();
    }
  }, [address, checkMintStatus]);

  // Call onMintSuccess when successfully minted
  useEffect(() => {
    if (state === "success" && hasMinted && onMintSuccess) {
      onMintSuccess();
    }
  }, [state, hasMinted, onMintSuccess]);

  const handleClick = async () => {
    // Don't allow any action if already minted
    if (hasMinted) {
      return;
    }

    if (state === "idle" || state === "error") {
      // Single-click flow: fetch voucher then mint immediately
      const success = await fetchVoucher();
      if (success) {
        await mint();
      }
    } else if (state === "success") {
      reset();
      checkMintStatus();
    }
  };

  // Button content based on state
  const getButtonContent = () => {
    if (hasMinted) {
      return (
        <span className="flex items-center justify-center gap-2">
          <Check className="h-4 w-4" />
          Minted
        </span>
      );
    }

    switch (state) {
      case "idle":
        return (
          <span className="flex items-center justify-center gap-2">
            <Award className="h-4 w-4" />
            Mint
          </span>
        );
      case "checking":
        return (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking...
          </span>
        );
      case "fetching":
        return (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Preparing...
          </span>
        );
      case "ready":
      case "minting":
        return (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Minting...
          </span>
        );
      case "confirming":
        return (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Confirming...
          </span>
        );
      case "success":
        return (
          <span className="flex items-center justify-center gap-2">
            <Check className="h-4 w-4" />
            Minted!
          </span>
        );
      case "error":
        return (
          <span className="flex items-center justify-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Try Again
          </span>
        );
      default:
        return "Mint Profile NFT";
    }
  };

  const isLoading =
    state === "checking" ||
    state === "fetching" ||
    state === "minting" ||
    state === "confirming";
  const isDisabled =
    !isConnected || isLoading || disabled || hasMinted || !hasAttested;

  return (
    <div className="space-y-2">
      <Button
        onClick={handleClick}
        disabled={isDisabled}
        variant={
          state === "success" || (hasMinted && state === "idle")
            ? "secondary"
            : state === "error"
            ? "destructive"
            : "default"
        }
        className="w-full flex justify-center flex-row items-center"
        aria-label={
          hasMinted ? "Profile NFT already minted" : "Mint Profile NFT"
        }
        aria-busy={isLoading}
        aria-disabled={isDisabled}
      >
        {getButtonContent()}
      </Button>

      {/* Error message */}
      {error && (
        <div className="space-y-1">
          <p className="text-sm text-destructive text-center font-medium">
            {error}
          </p>
          {error.includes("already minted") && (
            <p className="text-xs text-muted-foreground text-center">
              You already have a Profile NFT.
            </p>
          )}
          {error.includes("voucher") && (
            <p className="text-xs text-muted-foreground text-center">
              There was an issue generating your mint voucher. Please try again.
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

      {hasMinted && state === "idle" && (
        <p className="text-xs text-center text-muted-foreground">
          Your Profile NFT is already minted
        </p>
      )}

      {!hasAttested && !hasMinted && (
        <p className="text-xs text-center text-muted-foreground">
          Please attest your scores first
        </p>
      )}
    </div>
  );
}
