import { NextRequest, NextResponse } from 'next/server';
import { detectCountries, fetchRAGContext, fetchAllLiveData } from '@/lib/generate/data-fetcher';
import { STATIC_PROMPT, buildDynamicPrompt, buildUserMessage, enrichScenarioWithTags } from '@/lib/generate/prompt-builder';
import { applyNodeDependencies } from '@/lib/generate/response-parser';
import { callAICascade } from '@/lib/generate/ai-cascade';
import type { GenerateRequest } from '@/lib/generate/types';

export async function POST(request: NextRequest) {
  try {
    const { scenario, tags, profile, sacredMode, parentContext } = await request.json() as GenerateRequest;
    if (!scenario) return NextResponse.json({ error: 'Missing scenario' }, { status: 400 });

    // Recursive drill-down: max depth 3
    if (parentContext && parentContext.depth > 3) {
      return NextResponse.json({ error: 'Maximum drill-down depth (3) reached' }, { status: 400 });
    }

    // Enrich scenario with tag keywords for better routing
    const enrichedScenario = enrichScenarioWithTags(scenario, tags);
    const detectedCountries = detectCountries(enrichedScenario);

    // Fetch RAG/KB context + all live data in parallel
    const [{ kbContext, dataSource }, liveData] = await Promise.all([
      fetchRAGContext(enrichedScenario),
      fetchAllLiveData(scenario, detectedCountries),
    ]);

    // Build dynamic prompt (live data + sacred + industry + profile + tags)
    const dynamicPrompt = await buildDynamicPrompt({
      scenario,
      enrichedScenario,
      tags,
      profile,
      sacredMode,
      detectedCountries,
      liveData,
    });

    // Build user message (main scenario or drill-down)
    const userMsg = buildUserMessage(scenario, sacredMode, parentContext, kbContext);

    // 3-tier AI cascade: Claude -> OpenAI -> Groq
    const { flow, provider } = await callAICascade(STATIC_PROMPT, dynamicPrompt, userMsg);

    // Metadata
    flow._provider = provider;
    flow._live_data = !!(liveData.live?.gdp || liveData.countryData || liveData.exchangeRates || liveData.laborData || liveData.cryptoData || liveData.cityData);
    flow._data_source = dataSource;

    // POST-PROCESSING: Apply node dependency modifiers
    applyNodeDependencies(flow);

    return NextResponse.json(flow);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
