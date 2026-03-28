'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const SimulatorCanvas = dynamic(() => import('@/components/SimulatorCanvas'), { ssr: false });

export default function SharedSimulation() {
  const params = useParams();
  const id = params?.id as string;
  const [simData, setSimData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/simulations/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        setSimData(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Simulation not found');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-[var(--muted)] text-sm">Loading simulation...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[var(--background)] gap-4">
        <div className="text-[var(--foreground)] text-lg font-bold">Simulation not found</div>
        <a href="/" className="text-[var(--accent)] text-sm hover:underline">Create your own simulation</a>
      </div>
    );
  }

  // Pass shared data to SimulatorCanvas via URL params — canvas will load it
  return <SimulatorCanvas sharedSimulation={simData} />;
}
