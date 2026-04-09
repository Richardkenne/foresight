'use client';

import { useEffect, useRef, useState } from 'react';
import { TEMPLATES } from '@/lib/templates';

function sanitize(s: string): string {
  return s
    .replace(/"/g, '')
    .replace(/'/g, '')
    .replace(/[[\]{}()#&<>]/g, '')
    .replace(/%/g, 'pct')
    .replace(/\$/g, 'USD')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function templateToMermaid(templateKey: string): string {
  const t = TEMPLATES[templateKey];
  if (!t) return 'graph TD\n  A[Template not found]';

  const lines: string[] = ['graph TD'];

  for (const node of t.nodes) {
    const label = sanitize(node.label);
    const id = `N${node.id}`;
    switch (node.type) {
      case 'bottleneck':
      case 'gate':
      case 'decision':
        lines.push(`  ${id}{{${label}}}`);
        break;
      case 'outcome-good':
        lines.push(`  ${id}([${label}])`);
        break;
      case 'outcome-bad':
        lines.push(`  ${id}[${label}]`);
        break;
      default:
        lines.push(`  ${id}[${label}]`);
    }
  }

  for (const edge of t.edges) {
    const from = `N${edge.from}`;
    const to = `N${edge.to}`;
    if (edge.label) {
      lines.push(`  ${from} -->|${sanitize(edge.label)}| ${to}`);
    } else {
      lines.push(`  ${from} --> ${to}`);
    }
  }

  // Colors
  const colors: Record<string, string> = {
    state: '#d8ead8', action: '#eff6ff', bottleneck: '#fffbeb', gate: '#fffbeb',
    decision: '#ecfeff', 'outcome-good': '#dcfce7', 'outcome-bad': '#fee2e2',
    trajectory: '#efe2fb', desire: '#f5f3ff',
  };
  for (const node of t.nodes) {
    const fill = colors[node.type] || '#f1f5f9';
    lines.push(`  style N${node.id} fill:${fill},stroke:#94a3b8,stroke-width:1.5px,color:#1e293b`);
  }

  return lines.join('\n');
}

export default function MermaidTest() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState('upworkMoneyTreeMin');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const renderCount = useRef(0);

  const templates = ['upworkMoneyTreeMin', 'upworkMoneyTreeMid', 'upworkMoneyTree', 'appMin', 'appMid', 'app', 'startup', 'cafe', 'youtube_guruMin', 'youtube_guruMid', 'youtube_guru', 'want_to_winMin', 'want_to_winMid', 'want_to_win'];

  useEffect(() => {
    const mermaidCode = templateToMermaid(selected);
    setCode(mermaidCode);
    setError('');
    renderCount.current++;
    const graphId = `mermaid-${renderCount.current}`;

    import('mermaid').then(async (mod) => {
      const mermaid = mod.default;
      mermaid.initialize({
        startOnLoad: false,
        theme: 'neutral',
        flowchart: { htmlLabels: true, curve: 'basis', nodeSpacing: 50, rankSpacing: 70 },
      });

      try {
        const { svg } = await mermaid.render(graphId, mermaidCode);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          // Force SVG to show full size (not clipped)
          const svgEl = containerRef.current.querySelector('svg');
          if (svgEl) {
            svgEl.style.maxWidth = '100%';
            svgEl.style.height = 'auto';
            svgEl.removeAttribute('height');
          }
        }
      } catch (e) {
        setError(String(e));
        if (containerRef.current) {
          containerRef.current.innerHTML = `<pre style="color:red;font-size:12px">${String(e)}</pre>`;
        }
      }
    });
  }, [selected]);

  return (
    <div style={{ padding: 24, fontFamily: 'Inter, system-ui, sans-serif', background: 'var(--background)', minHeight: '100vh', overflow: 'auto' }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Mermaid.js Vertical Test</h1>

      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {templates.map(k => (
          <button
            key={k}
            onClick={() => setSelected(k)}
            style={{
              padding: 'var(--space-2) var(--space-3)', borderRadius: 8, fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer',
              background: selected === k ? 'var(--accent)' : 'var(--border)',
              color: selected === k ? 'var(--accent-foreground)' : 'var(--muted-foreground)',
              border: 'none',
            }}
          >
            {TEMPLATES[k]?.title || k}
          </button>
        ))}
      </div>

      <div
        ref={containerRef}
        className="mermaid-container"
        style={{
          background: 'var(--surface)', borderRadius: 12, padding: 24,
          border: '1px solid var(--border)',
        }}
      />

      <details style={{ marginTop: 16 }}>
        <summary style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', cursor: 'pointer' }}>Mermaid code</summary>
        <pre style={{ fontSize: 11, background: 'var(--foreground)', color: 'var(--border)', padding: 16, borderRadius: 8, overflow: 'auto', marginTop: 8, whiteSpace: 'pre-wrap' }}>
          {code}
        </pre>
      </details>

      {error && (
        <pre style={{ marginTop: 8, color: 'red', fontSize: 11 }}>{error}</pre>
      )}
    </div>
  );
}
