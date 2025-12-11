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

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ssaindex.xyz";

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
          <ThemeProvider>
            <RainbowKitProviderWrapper>
              {children}
            </RainbowKitProviderWrapper>
          </ThemeProvider>
        </WagmiQueryProviders>
      </body>
    </html>
  );
}
