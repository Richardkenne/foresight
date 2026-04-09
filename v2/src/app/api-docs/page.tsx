'use client';

import { useState } from 'react';

const EXAMPLE_REQUEST = {
  scenario: "Open a coffee shop in Bandung, Indonesia",
  country: "Indonesia",
  budget: 50000,
  timeline: "12 months",
};

const EXAMPLE_RESPONSE = {
  scenario: "Open a coffee shop in Bandung, Indonesia",
  probability: 23.4,
  confidence: 0.78,
  probRange: { optimistic: 38.2, adverse: 8.1 },
  keyBottlenecks: [
    { label: "Survive Year 1", prob: 40, description: "60% of restaurants fail in year 1 (National Restaurant Association 2024)" },
    { label: "Location Secured", prob: 65, description: "35% of applicants rejected for prime retail in Bandung (JLL Indonesia 2024)" },
    { label: "Break Even", prob: 55, description: "Median time to break even: 18 months for F&B in SEA (McKinsey 2024)" },
    { label: "Regulatory Permits", prob: 80, description: "Indonesia F&B permit approval rate (BKPM 2024)" },
  ],
  sources: ["National Restaurant Association 2024", "JLL Indonesia 2024", "McKinsey SEA 2024", "BKPM 2024"],
  sacredRoots: ["SR-010: Patience <-> Haste", "SR-012: Diligence <-> Sloth", "SR-031: Stewardship <-> Waste"],
  generatedAt: "2026-04-06T12:00:00.000Z",
  _meta: { provider: "claude", dataSource: "rag" },
};

export default function ApiDocsPage() {
  const [scenario, setScenario] = useState('');
  const [country, setCountry] = useState('');
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenario.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const body: Record<string, unknown> = { scenario: scenario.trim() };
      if (country.trim()) body.country = country.trim();
      if (budget.trim()) body.budget = Number(budget);
      if (timeline.trim()) body.timeline = timeline.trim();

      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || `HTTP ${res.status}`);
      } else {
        setResult(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] overflow-y-auto">
      <div className="max-w-[880px] mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-sm font-medium text-white/50 tracking-wide uppercase">Foresight API</span>
          </div>
          <h1 className="text-4xl font-semibold text-white tracking-tight mb-3">Prediction API</h1>
          <p className="text-lg text-white/60 leading-relaxed max-w-[640px]">
            Get probability predictions for any life or business scenario. Powered by real data from 350K+ data points, 7 live APIs, and sacred behavioral roots.
          </p>
        </div>

        {/* Endpoint */}
        <Section title="Endpoint">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-400 text-xs font-semibold rounded tracking-wide">POST</span>
            <code className="text-sm font-mono text-white/90">/api/predict</code>
          </div>
          <p className="text-sm text-white/50 mt-2">Content-Type: application/json</p>
        </Section>

        {/* Authentication */}
        <Section title="Authentication">
          <p className="text-sm text-white/60 leading-relaxed">
            No authentication required for the free tier (5 requests/day per IP).
            API key authentication for higher limits will be available in a future release.
          </p>
        </Section>

        {/* Rate Limits */}
        <Section title="Rate Limits">
          <div className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-2 text-sm">
            <span className="text-white/40">Free tier</span>
            <span className="text-white/80">5 requests per IP per day</span>
            <span className="text-white/40">Reset</span>
            <span className="text-white/80">Midnight UTC</span>
            <span className="text-white/40">Headers</span>
            <span className="font-mono text-xs text-white/60">X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset</span>
          </div>
        </Section>

        {/* Request */}
        <Section title="Request Body">
          <div className="space-y-3">
            <ParamRow name="scenario" type="string" required description="The scenario to predict. Max 2000 characters." />
            <ParamRow name="country" type="string" description="Target country for location-specific data (GDP, labor, exchange rates)." />
            <ParamRow name="budget" type="number" description="Available budget in USD. Affects financial bottleneck calculations." />
            <ParamRow name="timeline" type="string" description='Target timeline (e.g. "6 months", "2 years"). Affects time-dependent probabilities.' />
          </div>
          <CodeBlock title="Example Request" language="bash">
{`curl -X POST https://your-domain.com/api/predict \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(EXAMPLE_REQUEST, null, 2)}'`}
          </CodeBlock>
        </Section>

        {/* Response */}
        <Section title="Response">
          <div className="space-y-3 mb-6">
            <ParamRow name="scenario" type="string" description="The input scenario (echoed back)." />
            <ParamRow name="probability" type="number" description="Overall success probability (0-100%). Weighted product of all bottleneck pass rates." />
            <ParamRow name="confidence" type="number" description="Data confidence score (0.0-1.0). Higher = more tier-3 sources available." />
            <ParamRow name="probRange" type="object" description="Optimistic and adverse probability bounds." />
            <ParamRow name="keyBottlenecks" type="array" description="Top 3-5 critical gates with individual pass probabilities and data sources." />
            <ParamRow name="sources" type="string[]" description="All data sources referenced in the prediction." />
            <ParamRow name="sacredRoots" type="string[]" description="Relevant sacred behavioral roots (from 36 irreducible atoms) that determine the outcome." />
            <ParamRow name="generatedAt" type="string" description="ISO 8601 timestamp of when the prediction was generated." />
          </div>
          <CodeBlock title="Example Response">
            {JSON.stringify(EXAMPLE_RESPONSE, null, 2)}
          </CodeBlock>
        </Section>

        {/* Errors */}
        <Section title="Error Responses">
          <div className="space-y-2 text-sm">
            <ErrorRow code={400} message="Missing or empty scenario" description='The "scenario" field is required and must be a non-empty string.' />
            <ErrorRow code={400} message="Scenario too long" description="Maximum 2000 characters." />
            <ErrorRow code={429} message="Rate limit exceeded" description="You have exceeded 5 requests/day. Wait until midnight UTC or check X-RateLimit-Reset header." />
            <ErrorRow code={500} message="Prediction failed" description="Internal error in the AI pipeline. Try again in a few seconds." />
          </div>
        </Section>

        {/* Try It */}
        <Section title="Try It">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wide">Scenario *</label>
              <textarea
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                placeholder="Open a SaaS startup in Berlin with $20K..."
                rows={3}
                maxLength={2000}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-white/25 resize-none font-mono"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wide">Country</label>
                <input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Indonesia"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-white/25 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wide">Budget (USD)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="50000"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-white/25 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wide">Timeline</label>
                <input
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  placeholder="12 months"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-white/25 font-mono"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !scenario.trim()}
              className="px-5 py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
            >
              {loading ? 'Predicting...' : 'Send Request'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400 font-mono">{error}</p>
            </div>
          )}

          {result && (
            <CodeBlock title="Response" className="mt-4">
              {result}
            </CodeBlock>
          )}
        </Section>

        {/* SDKs */}
        <Section title="SDKs">
          <p className="text-sm text-white/60 leading-relaxed mb-6">
            Official client libraries for JavaScript/TypeScript and Python. Both handle authentication, rate limits, error handling, and type safety out of the box.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-lg border border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center gap-2 mb-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
                  <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" />
                  <path d="m9 17 3-3 3 3" />
                  <path d="M12 14v7" />
                </svg>
                <span className="text-sm font-semibold text-white/80">JavaScript / TypeScript</span>
              </div>
              <code className="block text-xs font-mono text-white/50 bg-white/[0.03] rounded px-3 py-2 mb-3">npm install @simulator/sdk</code>
              <pre className="text-xs font-mono text-white/60 leading-relaxed">{`import { SimulatorClient } from '@simulator/sdk';

const client = new SimulatorClient();
const result = await client.predict({
  scenario: 'Open a coffee shop in Bandung',
  country: 'Indonesia',
  budget: 50000,
  timeline: '12 months',
});

console.log(result.probability + '%');`}</pre>
            </div>

            <div className="p-4 rounded-lg border border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center gap-2 mb-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                  <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" />
                  <path d="m9 17 3-3 3 3" />
                  <path d="M12 14v7" />
                </svg>
                <span className="text-sm font-semibold text-white/80">Python</span>
              </div>
              <code className="block text-xs font-mono text-white/50 bg-white/[0.03] rounded px-3 py-2 mb-3">pip install simulator-sdk</code>
              <pre className="text-xs font-mono text-white/60 leading-relaxed">{`from simulator_sdk import SimulatorClient

client = SimulatorClient()
result = client.predict(
    scenario="Open a coffee shop in Bandung",
    country="Indonesia",
    budget=50000,
    timeline="12 months",
)

print(f"{result.probability}%")`}</pre>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-white/70">Error Handling</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CodeBlock title="TypeScript" language="ts">
{`import { RateLimitError, ValidationError }
  from '@simulator/sdk';

try {
  const r = await client.predict({ scenario });
} catch (err) {
  if (err instanceof RateLimitError) {
    // err.retryAfter (seconds)
    // err.resetAt (Date)
  } else if (err instanceof ValidationError) {
    // err.message
  }
}`}
              </CodeBlock>
              <CodeBlock title="Python" language="py">
{`from simulator_sdk import (
    RateLimitError, ValidationError
)

try:
    r = client.predict(scenario=scenario)
except RateLimitError as e:
    # e.retry_after (seconds)
    # e.reset_at (datetime)
except ValidationError as e:
    # str(e)`}
              </CodeBlock>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <h3 className="text-sm font-medium text-white/70">Batch Predictions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CodeBlock title="TypeScript" language="ts">
{`const results = await client.predictBatch([
  { scenario: 'Start a food truck' },
  { scenario: 'Launch a SaaS', budget: 100000 },
]);

for (const { result, error } of results) {
  if (result) console.log(result.probability);
  else console.error(error.message);
}`}
              </CodeBlock>
              <CodeBlock title="Python" language="py">
{`results = client.predict_batch([
    {"scenario": "Start a food truck"},
    {"scenario": "Launch a SaaS", "budget": 100000},
])

for item in results:
    if item["result"]:
        print(item["result"].probability)
    else:
        print(item["error"])`}
              </CodeBlock>
            </div>
          </div>
        </Section>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/5 text-xs text-white/30">
          <p>Foresight Prediction API v1.0 -- Deterministic scenario analysis powered by 350K+ data points.</p>
        </div>
      </div>
    </div>
  );
}

// ============ SUBCOMPONENTS ============

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="text-lg font-semibold text-white tracking-tight mb-4 pb-2 border-b border-white/5">{title}</h2>
      {children}
    </section>
  );
}

function ParamRow({
  name,
  type,
  required,
  description,
}: {
  name: string;
  type: string;
  required?: boolean;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 py-2 border-b border-white/[0.03] last:border-0">
      <div className="flex items-center gap-2 min-w-[140px] shrink-0">
        <code className="text-sm font-mono text-white/80">{name}</code>
        {required && <span className="text-[10px] text-amber-400/80 uppercase tracking-wider font-semibold">required</span>}
      </div>
      <span className="text-xs font-mono text-white/30 min-w-[60px] shrink-0 pt-0.5">{type}</span>
      <span className="text-sm text-white/50 leading-relaxed">{description}</span>
    </div>
  );
}

function ErrorRow({ code, message, description }: { code: number; message: string; description: string }) {
  return (
    <div className="flex items-start gap-4 py-2 border-b border-white/[0.03] last:border-0">
      <span className={`font-mono text-xs min-w-[32px] shrink-0 pt-0.5 ${code >= 500 ? 'text-red-400' : code >= 400 ? 'text-amber-400' : 'text-white/50'}`}>
        {code}
      </span>
      <span className="text-sm text-white/70 min-w-[180px] shrink-0">{message}</span>
      <span className="text-sm text-white/40">{description}</span>
    </div>
  );
}

function CodeBlock({
  title,
  language,
  children,
  className = '',
}: {
  title?: string;
  language?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mt-4 rounded-lg border border-white/[0.06] overflow-hidden ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-white/[0.02] border-b border-white/[0.06]">
          <span className="text-xs text-white/30">{title}</span>
          {language && <span className="text-[10px] text-white/20 uppercase tracking-wider">{language}</span>}
        </div>
      )}
      <pre className="px-4 py-3 overflow-x-auto text-xs font-mono leading-relaxed text-white/70">
        {children}
      </pre>
    </div>
  );
}
