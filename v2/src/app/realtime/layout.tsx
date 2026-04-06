import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Real-Time Reality Engine — Simulator',
  description: 'Your simulations update automatically when the world changes. Live data feeds recalibrate every probability.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
