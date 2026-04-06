import { NextRequest, NextResponse } from 'next/server';
import { detectCountries, fetchRAGContext, fetchAllLiveData, matchSacredRoots } from '@/lib/generate/data-fetcher';
import { buildDynamicPrompt, enrichScenarioWithTags } from '@/lib/generate/prompt-builder';
import { callAICascade } from '@/lib/generate/ai-cascade';

// ============ RATE LIMITER (in-memory, resets at midnight UTC) ============
const requestCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // per IP per day

function getResetTimestamp(): number {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return tomorrow.getTime();
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = requestCounts.get(ip);

  if (!entry || now >= entry.resetAt) {
    const resetAt = getResetTimestamp();
    requestCounts.set(ip, { count: 1, resetAt });
    return { allowed: true, remaining: RATE_LIMIT - 1, resetAt };
  }

  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, remaining: RATE_LIMIT - entry.count, resetAt: entry.resetAt };
}

// ============ CORS HEADERS ============
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ============ PREDICTION SYSTEM PROMPT ============
const PREDICT_SYSTEM_PROMPT = `You are a deterministic scenario probability engine. Given a scenario description and supporting data, return a JSON prediction summary.

CRITICAL RULES:
1. DATA INTEGRITY: Every probability MUST come from real data. Use the RAG data provided, your training knowledge, or well-known reports (BLS, World Bank, McKinsey, CB Insights, PitchBook, etc.).
2. DETERMINISTIC: Same input = same output. No randomness. Temperature 0.
3. CONSERVATIVE: When uncertain, lean toward lower probabilities. Never overestimate.
4. SOURCE EVERYTHING: Every bottleneck must cite a real source.

Return ONLY valid JSON with this exact structure:
{
  "probability": <number 0-100>,
  "confidence": <number 0.0-1.0>,
  "probRange": { "optimistic": <number 0-100>, "adverse": <number 0-100> },
  "keyBottlenecks": [
    { "label": "<short name>", "prob": <number 0-100>, "description": "<1 sentence with data source>" }
  ],
  "sources": ["<source1>", "<source2>"],
  "sacredRootIds": ["SR-xxx", "SR-yyy"]
}

Rules for fields:
- probability: overall success probability (weighted product of bottleneck pass rates)
- confidence: 0.0-1.0 based on data availability (1.0 = all data from tier-3 sources, 0.5 = mostly estimates, 0.2 = very sparse data)
- probRange: optimistic = best case, adverse = worst case
- keyBottlenecks: top 3-5 critical gates with individual pass probabilities and data-backed descriptions
- sources: list of data sources used (format: "SourceName Year")
- sacredRootIds: 2-4 most relevant sacred root IDs from the 36 roots that determine this outcome`;

// ============ POST HANDLER ============
export async function POST(request: NextRequest) {
  // Get client IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';

  // Rate limit check
  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded. Maximum 5 requests per day.',
        resetAt: new Date(rateCheck.resetAt).toISOString(),
      },
      {
        status: 429,
        headers: {
          ...CORS_HEADERS,
          'X-RateLimit-Limit': String(RATE_LIMIT),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(rateCheck.resetAt / 1000)),
          'Retry-After': String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const { scenario, country, budget, timeline } = body as {
      scenario?: string;
      country?: string;
      budget?: number;
      timeline?: string;
    };

    // Validate input
    if (!scenario || typeof scenario !== 'string' || scenario.trim().length === 0) {
      return NextResponse.json(
        { error: 'Missing or empty "scenario" field. Provide a description of what you want to predict.' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (scenario.length > 2000) {
      return NextResponse.json(
        { error: 'Scenario too long. Maximum 2000 characters.' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Build enriched scenario with optional context
    let enrichedScenario = scenario.trim();
    if (country) enrichedScenario += ` (country: ${country})`;
    if (budget) enrichedScenario += ` (budget: $${budget})`;
    if (timeline) enrichedScenario += ` (timeline: ${timeline})`;

    const detectedCountries = detectCountries(enrichedScenario);

    // Fetch data in parallel (RAG + live data)
    const [{ kbContext, dataSource }, liveData] = await Promise.all([
      fetchRAGContext(enrichedScenario),
      fetchAllLiveData(scenario, detectedCountries),
    ]);

    // Build dynamic prompt with live data
    const dynamicPrompt = await buildDynamicPrompt({
      scenario,
      enrichedScenario: enrichScenarioWithTags(scenario, undefined),
      detectedCountries,
      liveData,
    });

    // Build user message for prediction
    const userMsg = buildPredictUserMessage(enrichedScenario, kbContext);

    // AI cascade: Claude -> OpenAI -> Groq (max_tokens reduced for speed)
    const { flow, provider } = await callAICascade(PREDICT_SYSTEM_PROMPT, dynamicPrompt, userMsg);

    // Extract and validate response
    const prediction = flow as Record<string, unknown>;
    const probability = typeof prediction.probability === 'number' ? prediction.probability : 0;
    const confidence = typeof prediction.confidence === 'number' ? prediction.confidence : 0;
    const probRange = (prediction.probRange as { optimistic?: number; adverse?: number }) || {};
    const keyBottlenecks = Array.isArray(prediction.keyBottlenecks) ? prediction.keyBottlenecks : [];
    const sources = Array.isArray(prediction.sources) ? prediction.sources : [];
    const sacredRootIds = Array.isArray(prediction.sacredRootIds) ? prediction.sacredRootIds : [];

    // Get sacred root labels
    const sacredRoots = getSacredRootLabels(sacredRootIds, scenario);

    const response = {
      scenario: scenario.trim(),
      probability: Math.round(probability * 10) / 10,
      confidence: Math.round(confidence * 100) / 100,
      probRange: {
        optimistic: Math.round((probRange.optimistic ?? probability) * 10) / 10,
        adverse: Math.round((probRange.adverse ?? probability) * 10) / 10,
      },
      keyBottlenecks: keyBottlenecks.slice(0, 5).map((b: Record<string, unknown>) => ({
        label: String(b.label || ''),
        prob: typeof b.prob === 'number' ? Math.round(b.prob * 10) / 10 : 0,
        description: String(b.description || ''),
      })),
      sources: sources.map(String),
      sacredRoots,
      generatedAt: new Date().toISOString(),
      _meta: {
        provider,
        dataSource,
        responseTime: undefined as string | undefined,
      },
    };

    return NextResponse.json(response, {
      headers: {
        ...CORS_HEADERS,
        'X-RateLimit-Limit': String(RATE_LIMIT),
        'X-RateLimit-Remaining': String(rateCheck.remaining),
        'X-RateLimit-Reset': String(Math.ceil(rateCheck.resetAt / 1000)),
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    console.error('[Predict API] Error:', (e as Error).message);
    return NextResponse.json(
      { error: 'Prediction failed. Please try again.' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

// ============ HELPERS ============
function buildPredictUserMessage(scenario: string, kbContext: string | null): string {
  let msg = `Predict the probability of success for this scenario:\n"${scenario}"`;
  if (kbContext) {
    msg += `\n\nRELEVANT DATA FROM KNOWLEDGE BASE:\n${kbContext}`;
  }
  msg += '\n\nReturn ONLY the JSON prediction object. No commentary.';
  return msg;
}

function getSacredRootLabels(rootIds: string[], scenario: string): string[] {
  // Use matchSacredRoots to get relevant root descriptions
  const rootsText = matchSacredRoots(scenario, 5);
  if (!rootsText) return rootIds;

  // Extract root labels from the formatted text
  const labels: string[] = [];
  const lines = rootsText.split('\n').filter(l => l.startsWith('- ['));
  for (const line of lines) {
    const match = line.match(/\[([^\]]+)\]\s+(.+?)\s+\|/);
    if (match) {
      const id = match[1];
      const label = match[2];
      if (rootIds.includes(id)) {
        labels.push(`${id}: ${label}`);
      }
    }
  }

  // If no matches from the AI response IDs, return the first few matched roots
  if (labels.length === 0) {
    for (const line of lines.slice(0, 3)) {
      const match = line.match(/\[([^\]]+)\]\s+(.+?)\s+\|/);
      if (match) labels.push(`${match[1]}: ${match[2]}`);
    }
  }

  return labels.length > 0 ? labels : rootIds;
}
