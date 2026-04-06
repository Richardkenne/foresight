import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Digital Twin — Simulator',
  description: 'A complete model of your life. Not just one simulation — a continuous model that evolves as your life changes.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
