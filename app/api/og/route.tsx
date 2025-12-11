import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

// Fetch Inter font from Google Fonts
async function getInterFont() {
  const response = await fetch(
    "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff"
  );
  return await response.arrayBuffer();
}

async function getInterBoldFont() {
  const response = await fetch(
    "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff"
  );
  return await response.arrayBuffer();
}

const tierLabels: Record<string, string> = {
  bronze: "NEWCOMER",
  silver: "RISING STAR",
  gold: "TRUSTED",
  platinum: "LEGENDARY",
};

const tierColors: Record<string, { primary: string; secondary: string }> = {
  bronze: { primary: "#CD7F32", secondary: "#8B4513" },
  silver: { primary: "#C0C0C0", secondary: "#808080" },
  gold: { primary: "#FFD700", secondary: "#DAA520" },
  platinum: { primary: "#E5E4E2", secondary: "#A0A0A0" },
};

// SSA Logo as inline SVG component
const SSALogo = () => (
  <svg width="120" height="105" viewBox="0 50 512 450" fill="none">
    {/* LEFT SET */}
    <circle cx="104" cy="154" r="40" fill="none" stroke="#000" strokeWidth="1" />
    <circle cx="104" cy="256" r="40" fill="none" stroke="#000" strokeWidth="1" />
    <circle cx="104" cy="357" r="40" fill="#000" stroke="#000" strokeWidth="4" />
    <circle cx="205" cy="154" r="40" fill="#000" stroke="#000" strokeWidth="4" />
    <circle cx="205" cy="256" r="40" fill="#000" stroke="#000" strokeWidth="4" />
    <circle cx="205" cy="357" r="40" fill="#000" stroke="#000" strokeWidth="4" />
    {/* RIGHT SET */}
    <circle cx="307" cy="154" r="40" fill="#f15bb5" stroke="#f15bb5" strokeWidth="8" />
    <circle cx="307" cy="256" r="40" fill="#00f5d4" stroke="#00f5d4" strokeWidth="8" />
    <circle cx="307" cy="357" r="40" fill="none" stroke="#000" strokeWidth="1" />
    <circle cx="408" cy="154" r="40" fill="none" stroke="#000" strokeWidth="1" />
    <circle cx="408" cy="256" r="40" fill="#fee440" stroke="#fee440" strokeWidth="8" />
    <circle cx="408" cy="357" r="40" fill="none" stroke="#000" strokeWidth="1" />
  </svg>
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Load fonts
  const [interRegular, interBold] = await Promise.all([
    getInterFont(),
    getInterBoldFont(),
  ]);

  const score = searchParams.get("score") || "0";
  const tier = searchParams.get("tier") || "bronze";
  const name = searchParams.get("name") || "";
  const address = searchParams.get("address") || "";

  const displayName = name || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Anonymous");
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
  const tierLabel = tierLabels[tier] || "NEWCOMER";
  const colors = tierColors[tier] || tierColors.bronze;

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
          fontFamily: "Inter",
          position: "relative",
        }}
      >
        {/* Background Logo Watermark */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            opacity: 0.06,
            display: "flex",
          }}
        >
          <SSALogo />
        </div>

        {/* Card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "#FFFFFF",
            border: "4px solid #2D2A26",
            borderRadius: "16px",
            padding: "48px 64px",
            boxShadow: "8px 8px 0 #2D2A26",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: "32px",
            }}
          >
            <div
              style={{
                fontSize: "48px",
                fontWeight: "bold",
                color: "#2D2A26",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              SSA INDEX
            </div>
            <div
              style={{
                fontSize: "20px",
                color: "#8B8680",
              }}
            >
              Onchain Reputation Score
            </div>
          </div>

          {/* Score Badge */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "200px",
              height: "200px",
              borderRadius: "100px",
              border: `6px solid ${colors.primary}`,
              backgroundColor: "#F5F0E8",
              marginBottom: "32px",
            }}
          >
            <div
              style={{
                fontSize: "72px",
                fontWeight: "bold",
                color: "#2D2A26",
              }}
            >
              {score}
            </div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: colors.secondary,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {tierLabel}
            </div>
          </div>

          {/* User info */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: "24px",
              paddingBottom: "24px",
              borderBottom: "3px solid #E8E3DB",
              width: "100%",
            }}
          >
            <div
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#2D2A26",
              }}
            >
              {displayName}
            </div>
            {name && shortAddress && (
              <div
                style={{
                  fontSize: "16px",
                  color: "#8B8680",
                  fontFamily: "monospace",
                }}
              >
                {shortAddress}
              </div>
            )}
          </div>

          {/* Verified stamp */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px 24px",
              backgroundColor: "#0052FF",
              color: "#FFFFFF",
              fontSize: "16px",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              borderRadius: "100px",
              border: "3px solid #2D2A26",
            }}
          >
            Verified on Base
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Inter",
          data: interRegular,
          weight: 400,
          style: "normal",
        },
        {
          name: "Inter",
          data: interBold,
          weight: 700,
          style: "normal",
        },
      ],
      headers: {
        // Cache for 5 minutes on browser, 5 minutes on CDN, serve stale for 1 day while revalidating
        "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=86400",
      },
    }
  );
}
