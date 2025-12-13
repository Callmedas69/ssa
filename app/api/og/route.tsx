import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

// Reusable Logo SVG component
const LogoSvg = ({ width = 160, height = 140 }: { width?: number; height?: number }) => (
  <svg width={width} height={height} viewBox="0 50 512 450" xmlns="http://www.w3.org/2000/svg">
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
);

export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url);

  // Load fonts from public folder
  const [luckiestGuyFont, ubuntuRegularFont, ubuntuBoldFont] = await Promise.all([
    fetch(`${origin}/fonts/LuckiestGuy-Regular.ttf`).then((res) => res.arrayBuffer()),
    fetch(`${origin}/fonts/Ubuntu-Regular.ttf`).then((res) => res.arrayBuffer()),
    fetch(`${origin}/fonts/Ubuntu-Bold.ttf`).then((res) => res.arrayBuffer()),
  ]);

  // Hero Layout - branding only
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
          padding: "60px",
        }}
      >
        {/* Logo + Title Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginBottom: "6px",
          }}
        >
          <LogoSvg width={140} height={120} />
          <div
            style={{
              fontSize: "96px",
              fontFamily: "LuckiestGuy",
              color: "#2D2A26",
              textTransform: "uppercase",
              textShadow: "5px 5px 0 #E85D3B",
            }}
          >
            TRUSTCHECK
          </div>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "18px",
            fontFamily: "Ubuntu",
            fontWeight: 400,
            color: "#6B6560",
            textAlign: "center",
            maxWidth: "900px",
            lineHeight: "1.4",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <span>Aggregating your social reputation score into a single </span>
          <span style={{ fontWeight: 700 }}>&nbsp;soulbound token,</span>
          <span>giving you a verifiable snapshot of your onchain credibility.</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      },
      fonts: [
        { name: "LuckiestGuy", data: luckiestGuyFont, weight: 400, style: "normal" },
        { name: "Ubuntu", data: ubuntuRegularFont, weight: 400, style: "normal" },
        { name: "Ubuntu", data: ubuntuBoldFont, weight: 700, style: "normal" },
      ],
    }
  );
}
