"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useTheme } from "@/components/ThemeProvider";

export function CustomConnectButton() {
  const { theme } = useTheme();

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              // Retro theme classes
              const retroButton = "retro-button min-h-11 text-sm";
              const retroButtonOutline = "bg-[#F5F0E8] text-[#2D2A26] border-2 border-[#2D2A26] rounded-lg px-4 py-2 font-bold uppercase tracking-wide shadow-[3px_3px_0_#2D2A26] hover:bg-[#E85D3B] hover:text-white hover:translate-y-[-2px] hover:shadow-[5px_5px_0_#2D2A26] transition-all duration-150 min-h-11 text-sm";

              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className={
                      theme === "mac1"
                        ? "mac1-button min-h-11"
                        : theme === "retro"
                        ? retroButton
                        : "rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 min-h-11"
                    }
                    aria-label="Connect cryptocurrency wallet"
                  >
                    CONNECT
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className={
                      theme === "mac1"
                        ? "mac1-button min-h-11"
                        : theme === "retro"
                        ? "bg-[#C53030] text-white border-2 border-[#2D2A26] rounded-lg px-4 py-2 font-bold uppercase tracking-wide shadow-[3px_3px_0_#2D2A26] min-h-11 text-sm"
                        : "rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 min-h-11"
                    }
                  >
                    WRONG NETWORK
                  </button>
                );
              }

              return (
                <button
                  onClick={openAccountModal}
                  type="button"
                  className={
                    theme === "mac1"
                      ? "mac1-button-icon min-h-11 min-w-11 flex items-center justify-center sm:mac1-button sm:min-h-0 sm:min-w-0"
                      : theme === "retro"
                      ? `${retroButtonOutline} flex items-center justify-center`
                      : "rounded-xl bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 min-h-11"
                  }
                >
                  <span className="hidden sm:inline">
                    {account.displayName}
                  </span>
                  <span className="sm:hidden">
                    {account.displayName?.slice(0, 6)}...
                  </span>
                </button>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
