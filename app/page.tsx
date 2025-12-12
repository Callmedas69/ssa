import type { Metadata } from "next";
import { WizardFlow } from "@/components/WizardFlow/WizardFlow";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trustcheck.geoart.studio";

// Dynamic metadata based on query params for personalized OG images
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ score?: string; tier?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const hasPersonalizedScore = params.score !== undefined;

  const score = params.score || "0";
  const tier = params.tier || "bronze";

  // Use static ogHero.png for app URL, dynamic OG for personalized scores
  const ogImageUrl = hasPersonalizedScore
    ? `${appUrl}/api/og?score=${score}&tier=${tier}`
    : `${appUrl}/ogHero.png`;

  const title = hasPersonalizedScore
    ? `TRUSTCHECK: ${score} - Check Your Onchain Reputation`
    : "TRUSTCHECK - Onchain Reputation Score";

  const description = hasPersonalizedScore
    ? `Score: ${score}. Check your unified TRUSTCHECK from 6 reputation providers. Verified on Base.`
    : "Your unified TRUSTCHECK from 6 reputation providers. Verified on Base.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: appUrl,
      siteName: "TRUSTCHECK",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `TRUSTCHECK Score: ${score}`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <WizardFlow />
      </main>
    </div>
  );
}
