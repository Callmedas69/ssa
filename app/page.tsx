"use client";

import { ScoresDashboard } from "@/components/ScoresDashboard";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Your reputation, decoded.
            </h2>
            <p className="text-muted-foreground">
              We unify your six reputation networks into a single identity
              signal you can trust.
            </p>
          </div>
          <ScoresDashboard />
        </div>
      </main>
    </div>
  );
}
