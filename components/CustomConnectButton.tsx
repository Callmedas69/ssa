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
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className={
                      theme === "mac1"
                        ? "mac1-button min-h-11"
                        : "rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 min-h-11"
                    }
                    aria-label="Connect cryptocurrency wallet"
                  >
                    Connect Wallet
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
                        : "rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 min-h-11"
                    }
                  >
                    Wrong network
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
                      : "rounded-xl bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 min-h-11"
                  }
                >
                  <span className="hidden sm:inline">
                    {account.displayName}
                    {account.displayBalance
                      ? ` (${account.displayBalance})`
                      : ""}
                  </span>
                  <span className="sm:hidden">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 64 64"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M52 2H10V4H8V54H10V62H52V54H54V4H52V2Z"
                        fill="white"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M52 0H10V2H8V4H6V54H8V64H54V54H56V4H54V2H52V0ZM52 2V4H54V54H8V4H10V2H52ZM52 62H10V56H52V62Z"
                        fill="black"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M48 6H14V8H12V34H14V36H48V34H50V8H48V6ZM48 8V34H14V8H48Z"
                        fill="black"
                      />
                      <path
                        d="M26 26H24V28H26V30H34V28H36V26H34V28H26V26Z"
                        fill="black"
                      />
                      <path d="M32 14H30V22H28V24H32V14Z" fill="black" />
                      <rect x="38" y="14" width="2" height="4" fill="black" />
                      <rect x="22" y="14" width="2" height="4" fill="black" />
                      <rect x="12" y="44" width="4" height="2" fill="black" />
                      <rect x="37" y="44" width="12" height="2" fill="black" />
                    </svg>
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
