import { NextRequest, NextResponse } from 'next/server';
import { fetchWebSearch } from '@/lib/generate/data-fetcher';

export async function POST(request: NextRequest) {
  try {
    const { scenario } = await request.json() as { scenario: string };
    if (!scenario) return NextResponse.json({ facts: [] });

    // Fetch fresh web data
    const webData = await fetchWebSearch(scenario);

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ facts: [] });

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
          content: `You are generating "right now" facts for a live simulation about: "${scenario}"

FRESH WEB DATA (searched today):
${(webData || '').slice(0, 2000)}

Generate 10-15 facts about what is LITERALLY happening RIGHT NOW in the real world related to this scenario. Each fact must:
1. Be based on REAL statistics (population, rates, frequencies)
2. Calculate the per-second, per-minute, or per-hour rate
3. Be phrased as "Right now..." or "In this moment..." or "Every [timeframe]..."
4. Include the source/basis for the calculation
5. Feel alive — like you're watching a live feed of reality

Example format:
- "Right now, ~1 startup is failing somewhere in the world every second (305M entrepreneurs, 50% fail within 5 years — Startup Genome 2025)"
- "In the last minute, ~22 freelancers quit a platform permanently (18M registered, 65% churn year 1 — Upwork 2025)"
- "Every hour, ~150 people submit their first-ever freelance proposal (Upwork Community Data 2025)"

Rules:
- ONLY use verifiable statistics. Show the math briefly in parentheses.
- Mix scales: some per-second, some per-minute, some per-hour, some per-day
- Include both positive and negative facts
- NO generic motivational statements — only data-backed real-time facts

Return ONLY a JSON array of strings: ["fact1", "fact2", ...]`,
        }],
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) return NextResponse.json({ facts: [] });

    const data = await res.json();
    const text = data.content?.[0]?.text || '[]';

    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return NextResponse.json({ facts: [] });

    const facts: string[] = JSON.parse(match[0]);
    console.log(`[LIVE FACTS] Generated ${facts.length} real-time facts for "${scenario}"`);

    return NextResponse.json({ facts });
  } catch (e) {
    console.warn('[LIVE FACTS] Error:', (e as Error).message);
    return NextResponse.json({ facts: [] });
  }
}
