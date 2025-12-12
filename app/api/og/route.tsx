import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

// Tier labels - matches lib/ssaIndex.ts
const TIER_LABELS: Record<string, string> = {
  bronze: "NEWCOMER",
  silver: "RISING STAR",
  gold: "TRUSTED",
  platinum: "LEGENDARY",
};

// Tier greeting messages - matches lib/ssaIndex.ts
const TIER_MESSAGES: Record<string, string> = {
  bronze: "Welcome Aboard!",
  silver: "Rising Star!",
  gold: "Trusted Member!",
  platinum: "Legendary!",
};

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const score = searchParams.get("score") || "0";
  const tier = searchParams.get("tier") || "bronze";

  const tierLabel = TIER_LABELS[tier] || "NEWCOMER";
  const tierMessage = TIER_MESSAGES[tier] || "Welcome Aboard!";

  // Load fonts from public folder
  const [luckiestGuyFont, ubuntuBoldFont] = await Promise.all([
    fetch(`${origin}/fonts/LuckiestGuy-Regular.ttf`).then((res) => res.arrayBuffer()),
    fetch(`${origin}/fonts/Ubuntu-Bold.ttf`).then((res) => res.arrayBuffer()),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F5F0E8",
          padding: "40px",
          position: "relative",
        }}
      >
        {/* Tier Message - Luckiest Guy */}
        <div
          style={{
            fontSize: "56px",
            fontFamily: "LuckiestGuy",
            color: "#2D2A26",
            textTransform: "uppercase",
            textShadow: "3px 3px 0 #E85D3B",
            marginBottom: "4px",
          }}
        >
          {tierMessage}
        </div>

        {/* Title - TRUSTCHECK - Ubuntu */}
        <div
          style={{
            fontSize: "24px",
            fontFamily: "Ubuntu",
            color: "#8B8680",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            marginBottom: "32px",
          }}
        >
          TRUSTCHECK
        </div>

        {/* Large Score - Luckiest Guy */}
        <div
          style={{
            fontSize: "240px",
            fontFamily: "LuckiestGuy",
            color: "#2D2A26",
            textShadow: "6px 6px 0 #E85D3B",
            lineHeight: "1",
            marginBottom: "10px",
          }}
        >
          {score}
        </div>

        {/* Tier Label - Ubuntu */}
        <div
          style={{
            fontSize: "18px",
            fontFamily: "Ubuntu",
            color: "#E85D3B",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          ONCHAIN VERIFIABLE REPUTATION SIGNAL
        </div>

        {/* Logo - Bottom Left */}
        <div
          style={{
            position: "absolute",
            bottom: "96px",
            left: "96px",
            display: "flex",
          }}
        >
          <svg width="160" height="140" viewBox="0 50 512 450" xmlns="http://www.w3.org/2000/svg">
            <circle cx="104" cy="154" r="40" fill="none" stroke="#000" strokeWidth="1" />
            <circle cx="104" cy="256" r="40" fill="none" stroke="#000" strokeWidth="1" />
            <circle cx="104" cy="357" r="40" fill="#000" stroke="#000" strokeWidth="4" />
            <circle cx="205" cy="154" r="40" fill="#000" stroke="#000" strokeWidth="4" />
            <circle cx="205" cy="256" r="40" fill="#000" stroke="#000" strokeWidth="4" />
            <circle cx="205" cy="357" r="40" fill="#000" stroke="#000" strokeWidth="4" />
            <circle cx="307" cy="154" r="40" fill="#f15bb5" stroke="#f15bb5" strokeWidth="8" />
            <circle cx="307" cy="256" r="40" fill="#00f5d4" stroke="#00f5d4" strokeWidth="8" />
            <circle cx="307" cy="357" r="40" fill="none" stroke="#000" strokeWidth="1" />
            <circle cx="408" cy="154" r="40" fill="none" stroke="#000" strokeWidth="1" />
            <circle cx="408" cy="256" r="40" fill="#fee440" stroke="#fee440" strokeWidth="8" />
            <circle cx="408" cy="357" r="40" fill="none" stroke="#000" strokeWidth="1" />
          </svg>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=86400",
      },
      fonts: [
        {
          name: "LuckiestGuy",
          data: luckiestGuyFont,
          weight: 400,
          style: "normal",
        },
        {
          name: "Ubuntu",
          data: ubuntuBoldFont,
          weight: 700,
          style: "normal",
        },
      ],
    }
  );
}
