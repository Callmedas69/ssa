import { NextResponse } from "next/server";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ssaindex.xyz";

export async function GET() {
  const manifest = {
    accountAssociation: {
      header: "SIGN_AT_FARCASTER_MANIFEST_TOOL",
      payload: "SIGN_AT_FARCASTER_MANIFEST_TOOL",
      signature: "SIGN_AT_FARCASTER_MANIFEST_TOOL",
    },
    miniapp: {
      version: "1",
      name: "SSA Index",
      subtitle: "Onchain Reputation Score",
      description:
        "Your unified reputation score from 6 trusted providers - Neynar, Ethos, Talent, Quotient, and Passport. Attest onchain & mint your SBT on Base.",
      iconUrl: `${appUrl}/ssa_logo_v2.svg`,
      homeUrl: appUrl,
      imageUrl: `${appUrl}/api/og`,
      buttonTitle: "Check Score",
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#F5F0E8",
      // Discovery metadata
      primaryCategory: "social",
      tags: ["reputation", "identity", "base", "attestation", "sbt"],
      heroImageUrl: `${appUrl}/api/og`,
      tagline: "Your unified onchain reputation score",
      // OpenGraph
      ogTitle: "SSA Index - Onchain Reputation Score",
      ogDescription:
        "Your unified reputation score from 6 trusted providers. Verified on Base.",
      ogImageUrl: `${appUrl}/api/og`,
      // Required chains and capabilities
      requiredChains: ["eip155:8453"], // Base mainnet
      requiredCapabilities: [
        "wallet.getEthereumProvider",
      ],
    },
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
