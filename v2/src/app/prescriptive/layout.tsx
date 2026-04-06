import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Prescriptive Engine — Simulator',
  description: 'Don\'t simulate. Optimize. We don\'t tell you what happens — we tell you what to DO.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
