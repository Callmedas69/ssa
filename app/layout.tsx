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

// Farcaster Mini App embed configuration for social sharing
const miniAppEmbed = {
  version: "1",
  imageUrl: `${appUrl}/api/og`,
  button: {
    title: "Check Score",
    action: {
      type: "launch_miniapp",
      name: "TRUSTCHECK",
      url: appUrl,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#F5F0E8",
    },
  },
};

export const metadata: Metadata = {
  title: "TRUSTCHECK - Onchain Reputation Score",
  description:
    "Your aggregated score from 6 reputation providers - Neynar, Ethos, Talent, Quotient, and Passport. Verified on Base.",
  openGraph: {
    title: "TRUSTCHECK - Onchain Reputation Score",
    description:
      "Your aggregated score from 6 reputation providers. Attest onchain and mint your SBT on Base.",
    url: appUrl,
    siteName: "TRUSTCHECK",
    images: [
      {
        url: `${appUrl}/api/og`,
        width: 1200,
        height: 630,
        alt: "TRUSTCHECK - Onchain Reputation Score",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TRUSTCHECK - Onchain Reputation Score",
    description:
      "Your aggregated score from 6 reputation providers. Attest onchain and mint your SBT on Base.",
    images: [`${appUrl}/api/og`],
  },
  other: {
    "fc:miniapp": JSON.stringify(miniAppEmbed),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <meta name="apple-mobile-web-app-title" content="TrustCheck" />
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
