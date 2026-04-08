import { NextRequest, NextResponse } from 'next/server';
import { fetchWebSearch } from '@/lib/generate/data-fetcher';

interface NodeInput {
  id: number;
  type: string;
  label: string;
  prob?: number;
  desc?: string;
}

interface ProbUpdate {
  id: number;
  prob: number;
  probRange: { optimistic: number; adverse: number };
  source: string;
}

export async function POST(request: NextRequest) {
  try {
    const { scenario, nodes } = await request.json() as { scenario: string; nodes: NodeInput[] };
    if (!scenario || !nodes) return NextResponse.json({ updates: [] });

    // Only refresh bottleneck/decision/gate nodes (the ones with meaningful probabilities)
    const probNodes = nodes.filter(n =>
      (n.type === 'bottleneck' || n.type === 'decision' || n.type === 'gate') &&
      typeof n.prob === 'number' && n.prob < 100
    );

    if (probNodes.length === 0) return NextResponse.json({ updates: [] });

    // Fetch fresh web data for this scenario
    const webData = await fetchWebSearch(scenario);
    if (!webData) return NextResponse.json({ updates: [] });

    // Use Claude Haiku to extract updated probabilities from web data
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ updates: [] });

    const nodeList = probNodes.map(n => `- id:${n.id} "${n.label}" current_prob:${n.prob}%`).join('\n');

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        temperature: 0,
        messages: [{
          role: 'user',
          content: `Based on this FRESH WEB DATA searched today, update the probabilities for these simulation nodes.

FRESH WEB DATA:
${webData.slice(0, 2000)}

NODES TO UPDATE:
${nodeList}

Rules:
- Only update if web data provides a BETTER number than current_prob
- Round to nearest 5%
- Include probRange (optimistic/adverse)
- Include the source URL or name from the web data
- If no better data found for a node, skip it

Return ONLY valid JSON array: [{"id":1,"prob":25,"probRange":{"optimistic":35,"adverse":15},"source":"CB Insights 2025"}]
Return [] if no updates needed.`,
        }],
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return NextResponse.json({ updates: [] });

    const data = await res.json();
    const text = data.content?.[0]?.text || '[]';

    // Extract JSON array from response
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return NextResponse.json({ updates: [] });

    const updates: ProbUpdate[] = JSON.parse(match[0]);

    // Sanitize: round to 5%, clamp 5-95
    for (const u of updates) {
      u.prob = Math.max(5, Math.min(95, Math.round(u.prob / 5) * 5));
      if (u.probRange) {
        u.probRange.optimistic = Math.max(u.prob, Math.min(95, Math.round(u.probRange.optimistic / 5) * 5));
        u.probRange.adverse = Math.max(5, Math.min(u.prob, Math.round(u.probRange.adverse / 5) * 5));
      }
    }

    console.log(`[REFRESH] ${updates.length} prob updates for "${scenario}"`);
    return NextResponse.json({ updates });
  } catch (e) {
    console.warn('[REFRESH] Error:', (e as Error).message);
    return NextResponse.json({ updates: [] });
  }
}
