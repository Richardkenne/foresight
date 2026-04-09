import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '50 Industry Engines — Foresight',
  description: 'Every industry has its own failure modes. Each engine is trained on industry-specific data for accurate life and business simulations.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
