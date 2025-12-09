"use client";

import { ReactNode, useEffect } from "react";
import { RainbowKitProvider, Theme } from "@rainbow-me/rainbowkit";
import { useTheme } from "@/components/ThemeProvider";

const mac1Theme: Theme = {
  blurs: {
    modalOverlay: "none",
  },
  colors: {
    accentColor: "#000000",
    accentColorForeground: "#FFFFFF",
    actionButtonBorder: "#000000",
    actionButtonBorderMobile: "#000000",
    actionButtonSecondaryBackground: "#FFFFFF",
    closeButton: "#000000",
    closeButtonBackground: "#FFFFFF",
    connectButtonBackground: "#FFFFFF",
    connectButtonBackgroundError: "#FFFFFF",
    connectButtonInnerBackground: "#FFFFFF",
    connectButtonText: "#000000",
    connectButtonTextError: "#000000",
    connectionIndicator: "#000000",
    downloadBottomCardBackground: "#FFFFFF",
    downloadTopCardBackground: "#FFFFFF",
    error: "#000000",
    generalBorder: "#000000",
    generalBorderDim: "#000000",
    menuItemBackground: "#FFFFFF",
    modalBackdrop: "rgba(0, 0, 0, 0.5)",
    modalBackground: "#FFFFFF",
    modalBorder: "#000000",
    modalText: "#000000",
    modalTextDim: "#000000",
    modalTextSecondary: "#000000",
    profileAction: "#FFFFFF",
    profileActionHover: "#000000",
    profileForeground: "#FFFFFF",
    selectedOptionBorder: "#000000",
    standby: "#E8E8E8",
  },
  fonts: {
    body: '"Chicago", "VT323", "Courier New", monospace',
  },
  radii: {
    actionButton: "0px",
    connectButton: "0px",
    menuButton: "0px",
    modal: "0px",
    modalMobile: "0px",
  },
  shadows: {
    connectButton: "none",
    dialog: "none",
    profileDetailsAction: "none",
    selectedOption: "none",
    selectedWallet: "none",
    walletLogo: "none",
  },
};

export function RainbowKitProviderWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const { theme } = useTheme();

  // Force aggressive style injection for MacOS System 1 theme
  useEffect(() => {
    const styleId = "rainbowkit-mac1-override";
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    if (theme === "mac1") {
      styleEl.textContent = `
        /* Ultra high specificity overrides */
        [data-theme="mac1"] [data-rk],
        [data-theme="mac1"] [data-rk] *,
        [data-theme="mac1"] div[role="dialog"],
        [data-theme="mac1"] div[role="dialog"] * {
          border-radius: 0 !important;
        }
        
        [data-theme="mac1"] div[role="dialog"] {
          background: #FFFFFF !important;
          border: 2px solid #000000 !important;
          box-shadow: none !important;
        }

        [data-theme="mac1"] div[role="dialog"] > div:first-child {
          background: #FFFFFF !important;
          color: #000000 !important;
          padding: 4px 8px !important;
          font-weight: normal !important;
          font-size: 12px !important;
          text-align: center !important;
        }

        [data-theme="mac1"] div[role="dialog"] button {
          background: #FFFFFF !important;
          border: 2px solid #000000 !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          color: #000000 !important;
          font-family: "Chicago", "VT323", "Courier New", monospace !important;
          padding: 6px 12px !important;
          transition: none !important;
        }

        [data-theme="mac1"] div[role="dialog"] button:hover {
          background: #000000 !important;
          color: #FFFFFF !important;
        }

        [data-theme="mac1"] div[role="dialog"] button:active {
          background: #000000 !important;
          color: #FFFFFF !important;
        }
        
        [data-theme="mac1"] [data-rk] div,
        [data-theme="mac1"] [data-rk] button,
        [data-theme="mac1"] [data-rk] a {
          transition: none !important;
        }
      `;
    } else {
      styleEl.textContent = "";
    }
  }, [theme]);
  return (
    <RainbowKitProvider
      key={theme}
      theme={theme === "mac1" ? mac1Theme : undefined}
    >
      {children}
    </RainbowKitProvider>
  );
}
