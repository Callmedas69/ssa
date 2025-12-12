import type { Metadata } from "next";
import { Luckiest_Guy, Ubuntu } from "next/font/google";
import "./globals.css";

const luckiestGuy = Luckiest_Guy({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-luckiest-guy",
});

const ubuntu = Ubuntu({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-ubuntu",
});
import { WagmiQueryProviders } from "./providers";
import { ThemeProvider } from "@/components/ThemeProvider";
import { RainbowKitProviderWrapper } from "./rainbowkit-wrapper";
import { FarcasterProvider } from "@/components/FarcasterProvider";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trustcheck.geoart.studio";

// Farcaster Mini App embed configuration
const farcasterFrame = {
  version: "1",
  imageUrl: `${appUrl}/api/og`,
  button: {
    title: "Check Score",
    action: {
      type: "launch_frame",
      name: "SSA Index",
      url: appUrl,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#F5F0E8",
    },
  },
};

export const metadata: Metadata = {
  title: "SSA Index - Onchain Reputation Score",
  description:
    "Your unified SSA Index from 6 reputation providers - Neynar, Ethos, Talent, Quotient, and Passport. Verified on Base.",
  openGraph: {
    title: "SSA Index - Onchain Reputation Score",
    description:
      "Your unified SSA Index from 6 reputation providers. Verified on Base.",
    url: appUrl,
    siteName: "SSA Index",
    images: [
      {
        url: `${appUrl}/api/og`,
        width: 1200,
        height: 630,
        alt: "SSA Index - Onchain Reputation Score",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SSA Index - Onchain Reputation Score",
    description:
      "Your unified SSA Index from 6 reputation providers. Verified on Base.",
    images: [`${appUrl}/api/og`],
  },
  other: {
    "fc:miniapp": JSON.stringify(farcasterFrame),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased ${luckiestGuy.variable} ${ubuntu.className}`}>
        <WagmiQueryProviders>
          <FarcasterProvider>
            <ThemeProvider>
              <RainbowKitProviderWrapper>
                {children}
              </RainbowKitProviderWrapper>
            </ThemeProvider>
          </FarcasterProvider>
        </WagmiQueryProviders>
      </body>
    </html>
  );
}
