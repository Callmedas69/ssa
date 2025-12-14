import { NextResponse } from "next/server";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trustcheck.geoart.studio";

export async function GET() {
  const manifest = {
    accountAssociation: {
      header: "eyJmaWQiOjIyNDIwLCJ0eXBlIjoiY3VzdG9keSIsImtleSI6IjB4NmU1RDE3NGQ3MjYxOUFFNDUxMzE2OThhZjMwREYxZDc3M0UwZENCMyJ9",
      payload: "eyJkb21haW4iOiJ0cnVzdGNoZWNrLmdlb2FydC5zdHVkaW8ifQ",
      signature: "dIeg6kLEXQ7jcVz+GPf3oEHSFRVC54NWdffNEZCk/WAczWz1czUIJPsOEwGFca1xtN9KKbUJv08ew4EJXoug9xw=",
    },
    miniapp: {
      version: "1",
      name: "TRUSTCHECK",
      subtitle: "Onchain Reputation Score",
      description:
        "Your aggregated reputation score. Attest onchain and mint SBT on Base.",
      iconUrl: `${appUrl}/iconLogo.svg`,
      homeUrl: appUrl,
      imageUrl: `${appUrl}/api/og`,
      buttonTitle: "Check Score",
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#FFFFFF",
      // Discovery metadata
      primaryCategory: "social",
      tags: ["reputation", "identity", "base", "attestation", "sbt"],
      heroImageUrl: `${appUrl}/api/og`,
      tagline: "Onchain verifiable reputation",
      // OpenGraph
      ogTitle: "TRUSTCHECK",
      ogDescription:
        "Your aggregated reputation score. Attest onchain and mint SBT on Base.",
      ogImageUrl: `${appUrl}/api/og`,
      // Required chains and capabilities
      requiredChains: ["eip155:8453"], // Base mainnet
      requiredCapabilities: [
        "wallet.getEthereumProvider",
      ],
      noindex: false,
    },
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
