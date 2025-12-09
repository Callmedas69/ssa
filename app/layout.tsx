import type { Metadata } from "next";
import "./globals.css";
import { WagmiQueryProviders } from "./providers";
import { ThemeProvider } from "@/components/ThemeProvider";
import { RainbowKitProviderWrapper } from "./rainbowkit-wrapper";
import { MacMenuBar } from "@/components/MacMenuBar";

export const metadata: Metadata = {
  title: "Social Score Attestator",
  description:
    "Your unified SSA Index from 6 reputation providers - Neynar, Ethos, Talent, Quotient, and Passport",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <WagmiQueryProviders>
          <ThemeProvider>
            <RainbowKitProviderWrapper>
              <MacMenuBar />
              {children}
            </RainbowKitProviderWrapper>
          </ThemeProvider>
        </WagmiQueryProviders>
      </body>
    </html>
  );
}
