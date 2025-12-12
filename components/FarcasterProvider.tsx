"use client";

import { sdk } from "@farcaster/miniapp-sdk";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

// EIP-1193 Provider interface
interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, callback: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, callback: (...args: unknown[]) => void) => void;
}

interface FarcasterContextType {
  // State
  isInFarcaster: boolean;
  isReady: boolean;
  context: Awaited<typeof sdk.context> | null;
  user: {
    fid: number | null;
    username: string | null;
    displayName: string | null;
    pfpUrl: string | null;
  } | null;
  // Wallet
  ethProvider: EthereumProvider | null;
  // Actions
  getEthereumProvider: () => Promise<EthereumProvider | null>;
  openUrl: (url: string) => Promise<void>;
  close: () => Promise<void>;
}

const FarcasterContext = createContext<FarcasterContextType>({
  isInFarcaster: false,
  isReady: false,
  context: null,
  user: null,
  ethProvider: null,
  getEthereumProvider: async () => null,
  openUrl: async () => {},
  close: async () => {},
});

interface FarcasterProviderProps {
  children: ReactNode;
}

export function FarcasterProvider({ children }: FarcasterProviderProps) {
  const [isInFarcaster, setIsInFarcaster] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [context, setContext] = useState<Awaited<typeof sdk.context> | null>(
    null
  );
  const [user, setUser] = useState<FarcasterContextType["user"]>(null);
  const [ethProvider, setEthProvider] = useState<EthereumProvider | null>(null);

  // Get Ethereum Provider (EIP-1193)
  const getEthereumProvider = useCallback(async (): Promise<EthereumProvider | null> => {
    if (!isInFarcaster) return null;

    try {
      // sdk.wallet.ethProvider is a property, not a function
      const provider = sdk.wallet.ethProvider as unknown as EthereumProvider;
      setEthProvider(provider);
      return provider;
    } catch (error) {
      console.error("Failed to get Ethereum provider:", error);
      return null;
    }
  }, [isInFarcaster]);

  // Open URL in browser (outside Farcaster)
  const openUrl = useCallback(async (url: string): Promise<void> => {
    if (!isInFarcaster) {
      window.open(url, "_blank");
      return;
    }

    try {
      await sdk.actions.openUrl(url);
    } catch (error) {
      console.error("Failed to open URL:", error);
      window.open(url, "_blank");
    }
  }, [isInFarcaster]);

  // Close Mini App
  const close = useCallback(async (): Promise<void> => {
    if (!isInFarcaster) return;

    try {
      await sdk.actions.close();
    } catch (error) {
      console.error("Failed to close:", error);
    }
  }, [isInFarcaster]);

  useEffect(() => {
    const initFarcaster = async () => {
      try {
        // Get context - will be null if not in Farcaster client
        const ctx = await sdk.context;

        if (ctx) {
          setIsInFarcaster(true);
          setContext(ctx);

          // Extract user info if available
          if (ctx.user) {
            setUser({
              fid: ctx.user.fid ?? null,
              username: ctx.user.username ?? null,
              displayName: ctx.user.displayName ?? null,
              pfpUrl: ctx.user.pfpUrl ?? null,
            });
          }

          // Initialize Ethereum provider
          try {
            const provider = sdk.wallet.ethProvider as unknown as EthereumProvider;
            if (provider) {
              setEthProvider(provider);
            }
          } catch {
            console.debug("Ethereum provider not available");
          }

          // Signal that app is ready to display (hides splash screen)
          await sdk.actions.ready();
          setIsReady(true);
        } else {
          // Not in Farcaster client - mark as ready anyway
          setIsReady(true);
        }
      } catch (error) {
        // Not in Farcaster client or SDK error
        console.debug("Farcaster SDK init:", error);
        setIsReady(true);
      }
    };

    initFarcaster();
  }, []);

  return (
    <FarcasterContext.Provider
      value={{
        isInFarcaster,
        isReady,
        context,
        user,
        ethProvider,
        getEthereumProvider,
        openUrl,
        close,
      }}
    >
      {children}
    </FarcasterContext.Provider>
  );
}

export function useFarcaster() {
  const context = useContext(FarcasterContext);
  if (!context) {
    throw new Error("useFarcaster must be used within FarcasterProvider");
  }
  return context;
}
