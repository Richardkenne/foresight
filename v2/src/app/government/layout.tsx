import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Policy Simulation for Government — Foresight',
  description: 'Run policy scenarios before they become reality. Data-driven governance with deterministic simulation.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
