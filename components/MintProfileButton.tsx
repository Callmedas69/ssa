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
      // Pass voucher directly to mint to avoid React state closure timing issue
      const voucherData = await fetchVoucher();
      if (voucherData) {
        await mint(voucherData);
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
          MINTED
        </span>
      );
    }

    switch (state) {
      case "idle":
        return (
          <span className="flex items-center justify-center gap-2">
            <Award className="h-4 w-4" />
            MINT SBT
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
            MINTED!
          </span>
        );
      case "error":
        return (
          <span className="flex items-center justify-center gap-2">
            <AlertCircle className="h-4 w-4" />
            TRY AGAIN
          </span>
        );
      default:
        return "MINT SBT";
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
          hasMinted
            ? "retro-minted"
            : state === "success"
            ? "retro-success"
            : state === "error"
            ? "retro-outline"
            : "retro-outline"
        }
        className="w-full flex justify-center flex-row items-center"
        aria-label={
          hasMinted ? "SBT Profile already minted" : "Mint Profile SBT"
        }
        aria-busy={isLoading}
        aria-disabled={isDisabled}
      >
        {getButtonContent()}
      </Button>

      {/* Error message */}
      {error && (
        <div className="space-y-1 bg-white p-3 border-2 border-[#2D2A26] rounded-lg">
          <p className="text-sm text-[#C53030] text-center font-bold">
            {error}
          </p>
          {error.includes("already minted") && (
            <p className="text-xs text-[#8B8680] text-center">
              You already have a SBT Profile.
            </p>
          )}
          {error.includes("voucher") && (
            <p className="text-xs text-[#8B8680] text-center">
              Issue generating your SBT. Please try again.
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
          <ExternalLink className="h-3 w-3" />
        </a>
      )}

      {hasMinted && state === "idle" && (
        <p className="text-xs text-center text-[#8B8680]">
          Your SBT is already minted!
        </p>
      )}

      {!hasAttested && !hasMinted && (
        <p className="text-xs text-center text-[#8B8680]">
          Attest your scores first
        </p>
      )}
    </div>
  );
}
