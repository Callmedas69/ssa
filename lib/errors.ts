/**
 * Humanize error messages for better user experience
 * Converts technical/contract errors into user-friendly messages
 */
export function humanizeError(error: string): string {
  const errorLower = error.toLowerCase();

  // User rejected transaction
  if (errorLower.includes('user rejected') || errorLower.includes('user denied')) {
    return "Transaction cancelled.";
  }

  // Insufficient funds
  if (errorLower.includes('insufficient funds') || errorLower.includes('insufficient balance')) {
    return "Insufficient funds for gas. Please add ETH to your wallet.";
  }

  // Contract-specific errors
  if (error.includes('SubmissionTooFrequent')) {
    return "You can only verify once every 24 hours.";
  }
  if (error.includes('AlreadyMinted') || errorLower.includes('already minted')) {
    return "You've already minted your SBT.";
  }
  if (error.includes('InvalidSignature')) {
    return "Verification failed. Please try again.";
  }
  if (error.includes('VoucherExpired') || error.includes('Voucher expired')) {
    return "Session expired. Please try again.";
  }
  if (error.includes('InvalidVoucher')) {
    return "Invalid session. Please try again.";
  }
  if (error.includes('Paused') || errorLower.includes('contract is paused')) {
    return "Service temporarily paused. Please try again later.";
  }

  // Network/connection errors
  if (errorLower.includes('network') || errorLower.includes('connection') || errorLower.includes('timeout')) {
    return "Network error. Please check your connection and try again.";
  }
  if (errorLower.includes('rate limit')) {
    return "Too many requests. Please wait a moment and try again.";
  }

  // RPC errors
  if (errorLower.includes('rpc') || errorLower.includes('provider')) {
    return "Connection error. Please try again.";
  }

  // Generic execution errors
  if (errorLower.includes('execution reverted')) {
    return "Transaction failed. Please try again.";
  }

  // Default fallback - keep it simple and actionable
  return "Something went wrong. Please try again.";
}
