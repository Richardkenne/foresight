'use client';

interface Bottleneck {
  label: string;
  reached: number;
  passed: number;
  actualRate: number;
  expectedRate: number;
}

export default function BottleneckCard({ bottlenecks }: { bottlenecks: Bottleneck[] }) {
  if (bottlenecks.length === 0) return null;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">

      {/* Titolo sezione */}
      <h3 className="text-[11px] uppercase tracking-[0.08em] font-semibold mb-3"
          style={{ color: 'var(--muted)' }}>
        Deadliest Bottlenecks
      </h3>

      {/* Lista bottleneck — SPERIMENTA QUI */}
      <div className="space-y-3">
        {bottlenecks.slice(0, 6).map((b, i) => {
          const isWorse = b.actualRate < b.expectedRate;
          const diff = b.actualRate - b.expectedRate;

          return (
            <div key={i} className="flex items-center justify-between">

              {/* Sinistra: numero + label */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-[11px] font-semibold tabular-nums w-4 shrink-0"
                      style={{ color: isWorse ? '#dc2626' : '#059669' }}>
                  {i + 1}
                </span>
                <span className="text-[12px] truncate" style={{ color: 'var(--foreground)' }}>
                  {b.label}
                </span>
              </div>

              {/* Destra: actual% / expected% + diff badge */}
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="text-[12px] font-semibold tabular-nums"
                      style={{ color: isWorse ? '#dc2626' : '#059669' }}>
                  {b.actualRate}%
                </span>
                <span className="text-[10px]" style={{ color: 'var(--muted)' }}>/</span>
                <span className="text-[11px] tabular-nums" style={{ color: 'var(--muted)' }}>
                  {b.expectedRate}%
                </span>
                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full tabular-nums"
                      style={{
                        background: isWorse ? 'rgba(220, 38, 38, 0.08)' : 'rgba(5, 150, 105, 0.08)',
                        color: isWorse ? '#dc2626' : '#059669',
                      }}>
                  {diff > 0 ? '+' : ''}{diff}%
                </span>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
