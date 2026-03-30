/**
 * Deep Haiku Run — aggressive gap filling
 * Runs 30 agents sequentially (no rate limit issues) with deep prompts
 * Each agent: 25-30 dp focused on simulation node data
 *
 * Run: npx tsx scripts/haiku-deep-run.ts
 */

import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const DATA_DIR = path.join(process.cwd(), 'data');
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rkkfwsmoqylctprzqhfj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';

interface DataPoint {
  metric: string;
  value: string | number;
  unit?: string;
  source: string;
  year: number;
  description?: string;
}

// Deep research prompts — each covers a FULL journey with 25-30 data points
const DEEP_PROMPTS = [
  // AGENCY (critical gap)
  { theme: 'agency', prompt: 'Starting a digital marketing agency from scratch: startup costs, client acquisition timeline, first year revenue, profit margins, team hiring costs, common failure points, scaling challenges. Include data for USA, UK, and Southeast Asia.' },
  { theme: 'agency', prompt: 'Consulting business economics: hourly rates by specialty (management, IT, strategy, design), utilization rates, client retention, proposal win rates, revenue per consultant, partnership track statistics.' },
  { theme: 'agency', prompt: 'Agency business models comparison: retainer vs project vs performance-based. Average contract values, client lifetime value, churn rates, upsell rates, referral rates. By agency type (SEO, PPC, social, full-service).' },
  // CONTENT CREATOR (critical gap)
  { theme: 'content_creator', prompt: 'YouTube channel growth milestones: time to 100, 1K, 10K, 100K, 1M subscribers. Revenue per 1000 views by niche (tech, finance, lifestyle, gaming). Full-time creator income distribution. Sponsorship rates by subscriber count.' },
  { theme: 'content_creator', prompt: 'TikTok and Instagram creator economy: follower growth rate, engagement rates by follower count, creator fund payouts, brand deal rates, affiliate conversion rates. Comparison across platforms 2024-2025.' },
  { theme: 'content_creator', prompt: 'Podcast business: listener numbers needed to monetize, CPM rates, sponsorship revenue by download count, production costs, time to build audience, podcast survival rate after 1 year, most profitable niches.' },
  { theme: 'content_creator', prompt: 'Newsletter business statistics 2025: Substack top earners, average paid subscriber conversion rate, revenue per subscriber, churn rate, growth rate, time to 1K/10K subscribers, newsletter business acquisition multiples.' },
  // E-COMMERCE (critical gap)
  { theme: 'ecommerce', prompt: 'Shopify store journey: startup costs, time to first sale, average monthly revenue by month 1/3/6/12, profit margins by product category, customer acquisition cost, cart abandonment rate, return rate, survival rate year 1.' },
  { theme: 'ecommerce', prompt: 'Dropshipping reality: initial investment needed, profit margins after ads, average order value, supplier reliability issues, shipping times impact on returns, Facebook/Google ads ROAS by niche, failure rate first 6 months.' },
  { theme: 'ecommerce', prompt: 'Amazon FBA seller statistics: startup costs, fees breakdown (referral, FBA, storage), average monthly revenue, profit margins, competition level by category, time to profitability, percentage who quit within year 1.' },
  // FITNESS/WEIGHT LOSS (critical gap)
  { theme: 'fitness', prompt: 'Weight loss journey statistics: average weight lost in first month/3 months/1 year by method (diet, exercise, surgery, medication), regain rates at 1/2/5 years, most effective approaches ranked by long-term success.' },
  { theme: 'fitness', prompt: 'Gym and fitness business: personal training client results timeline, gym membership retention by month, boutique fitness studio survival rate, online coaching revenue potential, fitness app engagement retention.' },
  { theme: 'fitness', prompt: 'Health transformation milestones: BMI improvement timeline, blood pressure/cholesterol improvement by exercise type, mental health benefits of exercise onset timeline, injury rates by sport/activity, marathon training completion rate.' },
  // RELATIONSHIP (critical gap)
  { theme: 'relationship', prompt: 'Modern dating statistics 2024-2025: app match-to-date conversion rate, dates to relationship conversion, average relationship duration by how they met, long-distance success rate, age gap impact, income impact on relationship stability.' },
  { theme: 'relationship', prompt: 'Marriage and divorce statistics worldwide: divorce rate by country, by years married, by age at marriage, by number of marriages, cost of divorce, custody outcomes, financial impact, remarriage rates and success.' },
  { theme: 'relationship', prompt: 'Intercultural/interfaith relationships: success rates, main challenges, family acceptance timeline, language barrier impact, marriage rates, location decisions (whose country), children bilingual statistics.' },
  // SKILL LEARNING (critical gap)
  { theme: 'skill_learning', prompt: 'Learning to code journey: time to job-ready by path (bootcamp, self-taught, CS degree), salary at entry level, bootcamp completion rates, self-taught success rate, most in-demand languages 2025, junior developer job search timeline.' },
  { theme: 'skill_learning', prompt: 'Professional skill acquisition timelines: time to proficiency in design/marketing/data science/project management. Certification pass rates (PMP, AWS, CFA, Google Analytics). Salary premium per certification.' },
  { theme: 'skill_learning', prompt: 'Language learning statistics: time to B1/B2/C1 by language difficulty (FSI data), method effectiveness (immersion vs app vs class), Duolingo completion rates, bilingual salary premium by language pair, most valuable languages for business 2025.' },
  // TRADING (partial gap)
  { theme: 'trading', prompt: 'Day trading reality: percentage profitable after 1 year, average loss first year, time spent per day, capital needed, most common mistakes, prop firm pass rates, success rate by market (stocks, forex, crypto, options).' },
  { theme: 'trading', prompt: 'Investment returns by strategy: index fund historical returns, active vs passive comparison, real estate vs stocks vs bonds vs crypto 10-year performance, dividend investing returns, FIRE portfolio success rates.' },
  // DEBT (partial gap)
  { theme: 'debt', prompt: 'Debt freedom journey: average time to pay off student loans/credit cards/mortgage by strategy, debt snowball vs avalanche effectiveness, debt consolidation success rate, bankruptcy recovery timeline, credit score rebuild time.' },
  { theme: 'debt', prompt: 'Financial crisis survival: emergency fund adequacy by income level, job loss financial impact timeline, foreclosure process duration by country, wage garnishment limits, debt-to-income ratio thresholds for loans.' },
  // IMMIGRATION (partial gap)
  { theme: 'immigration', prompt: 'Visa and immigration journey: H1B approval rate by country/employer, green card wait times by category, student visa to work permit conversion rate, digital nomad visa costs/requirements by country, citizenship timeline by country.' },
  { theme: 'immigration', prompt: 'Expat life reality: cost of relocation international, culture shock timeline, salary adjustment expectations, healthcare costs abroad, children education abroad, return rate (what percentage go back), best/worst cities for expats 2025.' },
  // SaaS (partial gap)
  { theme: 'saas', prompt: 'SaaS startup metrics by stage: pre-revenue to $1K MRR timeline, $1K to $10K MRR, $10K to $100K MRR. Churn rate benchmarks, CAC payback period, LTV:CAC ratio. By model (B2B, B2C, prosumer). Indie hacker vs VC-funded comparison.' },
  { theme: 'saas', prompt: 'Mobile app business: development costs by type, time to build, App Store approval rate, download to active user conversion, monetization (ads vs subscription vs freemium), average revenue per user, app survival rate after 1 year.' },
  // STARTUP (deepen)
  { theme: 'startup', prompt: 'Startup failure post-mortem data: top 20 reasons for failure with percentages, failure rate by funding stage, time from launch to death by cause, founder salary statistics, equity split problems, pivot success rate, acqui-hire statistics.' },
  { theme: 'startup', prompt: 'Bootstrapped business statistics 2025: revenue milestones timeline, profit margins vs funded startups, solo founder income by year, most successful bootstrapped industries, time to replace salary, exit multiples for bootstrapped vs funded.' },
  // CAFE/RESTAURANT (deepen)
  { theme: 'cafe', prompt: 'Cafe business deep dive Indonesia: startup cost Bandung vs Jakarta vs Bali, monthly operating costs breakdown, break-even timeline, customer spend per visit, peak hours revenue, delivery app commission impact, competition density by area.' },
];

async function runAgent(prompt: string, theme: string, index: number): Promise<DataPoint[]> {
  const fullPrompt = `You are a data research agent for a life simulator. Find 25-30 SPECIFIC, QUANTITATIVE facts about:

${prompt}

Each fact must be a SHORT sentence (max 80 chars) with a NUMBER and a REAL SOURCE (2023-2025 only).

Examples:
- "38% of startups fail from cash problems" (CB Insights 2024)
- "Avg Shopify store revenue month 1: $127" (LittleData 2024)
- "Day traders: 97% lose money over 300+ days" (U São Paulo 2024)

Return ONLY a JSON array:
[{"metric": "unique_metric_name", "value": 20, "unit": "%", "source": "Source Name", "year": 2024, "description": "Short fact with number"}]`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4000,
        messages: [{ role: 'user', content: fullPrompt }],
      }),
    });

    const data = await res.json();
    const text = data.content?.[0]?.text || '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((dp: DataPoint) => dp.metric && dp.value != null && dp.source && dp.year >= 2023);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`    Error: ${msg.substring(0, 100)}`);
    return [];
  }
}

async function embedAndUpload(chunks: { id: string; file: string; category: string; text: string }[]): Promise<number> {
  if (!SUPABASE_KEY || chunks.length === 0) return 0;
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  let uploaded = 0;

  for (let i = 0; i < chunks.length; i += 50) {
    const batch = chunks.slice(i, i + 50);
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: batch.map(c => c.text.substring(0, 500)),
        dimensions: 512,
      });
      const rows = batch.map((c, j) => ({
        id: c.id, file: c.file, category: c.category, text: c.text,
        embedding: `[${response.data[j].embedding.join(',')}]`,
      }));
      for (let s = 0; s < rows.length; s += 10) {
        const sub = rows.slice(s, s + 10);
        const res = await fetch(`${SUPABASE_URL}/rest/v1/simulator_embeddings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': 'resolution=merge-duplicates',
          },
          body: JSON.stringify(sub),
        });
        if (res.ok) uploaded += sub.length;
      }
    } catch {}
  }
  return uploaded;
}

async function main() {
  console.log('=== DEEP HAIKU RUN ===');
  console.log(`Agents: ${DEEP_PROMPTS.length}`);
  console.log(`Running SEQUENTIALLY (1 at a time, 6s delay) to avoid rate limits\n`);

  let totalDp = 0;
  const allChunks: { id: string; file: string; category: string; text: string }[] = [];

  for (let i = 0; i < DEEP_PROMPTS.length; i++) {
    const { theme, prompt } = DEEP_PROMPTS[i];
    process.stdout.write(`[${i + 1}/${DEEP_PROMPTS.length}] ${theme}... `);

    const dps = await runAgent(prompt, theme, i);
    console.log(`${dps.length} dp`);
    totalDp += dps.length;

    if (dps.length > 0) {
      // Save to file
      const fileName = `deep-${theme}.json`;
      const filePath = path.join(DATA_DIR, fileName);
      const existing: DataPoint[] = fs.existsSync(filePath)
        ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : [];
      const merged = [...existing, ...dps];
      const deduped = merged.filter((v, idx, a) =>
        a.findIndex(t => t.metric === v.metric && t.year === v.year) === idx
      );
      fs.writeFileSync(filePath, JSON.stringify(deduped, null, 2));

      for (const dp of dps) {
        allChunks.push({
          id: `deep:${theme}:${dp.metric}:${dp.year}`,
          file: `deep-${theme}`,
          category: theme,
          text: `${dp.description || dp.metric.replace(/_/g, ' ')}: ${dp.value}${dp.unit ? ' ' + dp.unit : ''} (${dp.source}, ${dp.year})`,
        });
      }
    }

    // 6 second delay between agents
    await new Promise(r => setTimeout(r, 6000));
  }

  console.log(`\nTotal data points: ${totalDp}`);
  console.log(`Embedding + uploading ${allChunks.length} chunks...`);
  const uploaded = await embedAndUpload(allChunks);
  console.log(`Uploaded: ${uploaded} chunks to Supabase RAG`);
  console.log('=== DEEP RUN COMPLETE ===');
}

main().catch(console.error);
