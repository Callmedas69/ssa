'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ScoresDashboard } from '@/components/ScoresDashboard';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-foreground uppercase">Social Score Attestator</h1>
          <ConnectButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Your Social Scores</h2>
            <p className="text-muted-foreground">
              Your unified SSA Index from 6 reputation providers
            </p>
          </div>
          <ScoresDashboard />
        </div>
      </main>
    </div>
  );
}
