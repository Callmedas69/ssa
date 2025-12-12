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

// Safe area insets for mobile UI
interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

// ComposeCast options type
interface ComposeCastOptions {
  text?: string;
  embeds?: [] | [string] | [string, string];
  parent?: { type: 'cast'; hash: string };
  close?: boolean;
  channelKey?: string;
}

// ComposeCast result type
interface ComposeCastResult {
  cast: { hash: string; channelKey?: string } | null;
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
  // Mobile safe areas
  safeAreaInsets: SafeAreaInsets | null;
  // Actions
  openUrl: (url: string) => Promise<void>;
  close: () => Promise<void>;
  composeCast: (options: ComposeCastOptions) => Promise<ComposeCastResult | undefined>;
  addMiniApp: () => Promise<void>;
}

const FarcasterContext = createContext<FarcasterContextType>({
  isInFarcaster: false,
  isReady: false,
  context: null,
  user: null,
  safeAreaInsets: null,
  openUrl: async () => {},
  close: async () => {},
  composeCast: async () => undefined,
  addMiniApp: async () => {},
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
  const [safeAreaInsets, setSafeAreaInsets] = useState<SafeAreaInsets | null>(null);

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

  // Compose a cast with optional text and embeds
  const composeCast = useCallback(async (options: ComposeCastOptions): Promise<ComposeCastResult | undefined> => {
    if (!isInFarcaster) return undefined;

    try {
      const result = await sdk.actions.composeCast(options);
      return result as ComposeCastResult;
    } catch (error) {
      console.error("Failed to compose cast:", error);
      return undefined;
    }
  }, [isInFarcaster]);

  // Prompt user to add the Mini App (enables notifications)
  const addMiniApp = useCallback(async (): Promise<void> => {
    if (!isInFarcaster) return;

    try {
      await sdk.actions.addMiniApp();
    } catch (error) {
      // RejectedByUser or InvalidDomainManifestJson
      console.error("Failed to add Mini App:", error);
      throw error;
    }
  }, [isInFarcaster]);

  useEffect(() => {
    const initFarcaster = async () => {
      try {
        // Use official detection method per Farcaster docs
        const isMiniApp = await sdk.isInMiniApp();

        if (isMiniApp) {
          setIsInFarcaster(true);
          const ctx = await sdk.context;
          setContext(ctx);

          // Extract user info if available
          if (ctx?.user) {
            setUser({
              fid: ctx.user.fid ?? null,
              username: ctx.user.username ?? null,
              displayName: ctx.user.displayName ?? null,
              pfpUrl: ctx.user.pfpUrl ?? null,
            });
          }

          // Store safe area insets for mobile UI
          if (ctx?.client?.safeAreaInsets) {
            setSafeAreaInsets(ctx.client.safeAreaInsets);
          }

          // Signal that app is ready to display (hides splash screen)
          await sdk.actions.ready();

          // Enable back navigation for native gestures (iOS swipe, Android back)
          try {
            await sdk.back.enableWebNavigation();
          } catch {
            console.debug("Back navigation not available");
          }
        }
        setIsReady(true);
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
        safeAreaInsets,
        openUrl,
        close,
        composeCast,
        addMiniApp,
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
