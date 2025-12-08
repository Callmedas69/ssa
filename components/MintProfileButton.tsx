"use client";

import { useEffect } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { useMintProfile } from "@/hooks/useMintProfile";
import { Loader2, Check, AlertCircle, ExternalLink, Award } from "lucide-react";

interface MintProfileButtonProps {
  disabled?: boolean;
  onMintSuccess?: () => void;
}

export function MintProfileButton({
  disabled,
  onMintSuccess,
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
    if (state === "idle" || state === "error") {
      await fetchVoucher();
    } else if (state === "ready") {
      await mint();
    } else if (state === "success") {
      reset();
      checkMintStatus();
    }
  };

  // Button content based on state
  const getButtonContent = () => {
    if (hasMinted && state === "idle") {
      return (
        <>
          <Check className="mr-2 h-4 w-4" />
          Profile Minted
        </>
      );
    }

    switch (state) {
      case "idle":
        return (
          <>
            <Award className="mr-2 h-4 w-4" />
            Mint Profile NFT
          </>
        );
      case "checking":
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Checking...
          </>
        );
      case "fetching":
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Preparing Voucher...
          </>
        );
      case "ready":
        return "Confirm Mint";
      case "minting":
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Minting...
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
            Minted!
          </>
        );
      case "error":
        return (
          <>
            <AlertCircle className="mr-2 h-4 w-4" />
            Try Again
          </>
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
    !isConnected || isLoading || disabled || (hasMinted && state === "idle");

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
            : "default"
        }
        className="w-full"
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
    </div>
  );
}
