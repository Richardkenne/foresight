'use client';

import dynamic from 'next/dynamic';

const SimulatorCanvas = dynamic(() => import('@/components/SimulatorCanvas'), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-screen flex items-center justify-center bg-[var(--background)]">
      <div className="text-sm text-[var(--muted)]">Loading simulator...</div>
    </div>
  ),
});

export default function SimulatorPage() {
  return <SimulatorCanvas />;
}
