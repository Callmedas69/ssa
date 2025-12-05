'use client';

import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { useSubmitScores } from '@/hooks/useSubmitScores';
import { Loader2, Check, AlertCircle, ExternalLink } from 'lucide-react';

interface SubmitScoresButtonProps {
  disabled?: boolean;
}

export function SubmitScoresButton({ disabled }: SubmitScoresButtonProps) {
  const { isConnected } = useAccount();
  const {
    state,
    error,
    txHash,
    fetchSignature,
    submitToChain,
    reset,
  } = useSubmitScores();

  // Check if contract is configured
  const contractConfigured = !!process.env.NEXT_PUBLIC_SSA_ATTESTATOR_ADDRESS;

  const handleClick = async () => {
    if (state === 'idle' || state === 'error') {
      await fetchSignature();
    } else if (state === 'ready') {
      await submitToChain();
    } else if (state === 'success') {
      reset();
    }
  };

  // Button content based on state
  const getButtonContent = () => {
    switch (state) {
      case 'idle':
        return 'Attest On-Chain';
      case 'signing':
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Preparing...
          </>
        );
      case 'ready':
        return 'Confirm Transaction';
      case 'submitting':
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        );
      case 'confirming':
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Confirming...
          </>
        );
      case 'success':
        return (
          <>
            <Check className="mr-2 h-4 w-4" />
            Attested!
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle className="mr-2 h-4 w-4" />
            Try Again
          </>
        );
      default:
        return 'Attest On-Chain';
    }
  };

  const isLoading = state === 'signing' || state === 'submitting' || state === 'confirming';
  const isDisabled = !isConnected || !contractConfigured || isLoading || disabled;

  return (
    <div className="space-y-2">
      <Button
        onClick={handleClick}
        disabled={isDisabled}
        variant={state === 'success' ? 'secondary' : state === 'error' ? 'destructive' : 'default'}
        className="w-full"
      >
        {getButtonContent()}
      </Button>

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      {/* Transaction link */}
      {txHash && state === 'success' && (
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

      {/* Not configured warning */}
      {!contractConfigured && (
        <p className="text-xs text-muted-foreground text-center">
          Contract not deployed yet
        </p>
      )}
    </div>
  );
}
