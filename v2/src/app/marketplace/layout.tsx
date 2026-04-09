import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Prediction Marketplace — Foresight',
  description: 'Like Polymarket for real life. Bet on whether scenarios succeed or fail. Real money calibrates the model.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
