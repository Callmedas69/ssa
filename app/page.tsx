"use client";

import { ScoresDashboard } from "@/components/ScoresDashboard";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <ScoresDashboard />
        </div>
      </main>
    </div>
  );
}
