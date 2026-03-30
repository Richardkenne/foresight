/**
 * Overnight Data Pipeline v2 — GAP-DRIVEN
 *
 * Strategy: reads 40K scenarios from simulator-batch, compares against existing data,
 * focuses Haiku agents on the WEAKEST areas. Every night = stronger.
 *
 * Pipeline A: Analyze gaps (scenarios vs existing data coverage)
 * Pipeline B: 40 Haiku agents generate simulation-ready data points for gaps
 * Pipeline C: Embed + upload to Supabase RAG
 *
 * Target: 1M+ data points. Cost: ~$0.20/night (~$6/month)
 * Run: npx tsx scripts/overnight-pipeline.ts
 */

import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const DATA_DIR = path.join(process.cwd(), 'data');
const SCENARIOS_DIR = path.join(process.env.HOME || '', 'Desktop', 'simulator-batch');
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rkkfwsmoqylctprzqhfj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';
const EMBEDDING_MODEL = 'text-embedding-3-small';

// ============ SCENARIO THEMES (extracted from 40K JSONL) ============
// These are the CORE themes people simulate. Each needs deep data coverage.
// Priority 1 = most requested, weakest data. Priority 3 = well covered.

interface ThemeConfig {
  theme: string;
  keywords: string[];
  existingFiles: string[];  // JSON files that partially cover this
  priority: number;         // 1 = critical gap, 2 = partial, 3 = good coverage
  subTopics: string[];      // specific angles to research
}

const SCENARIO_THEMES: ThemeConfig[] = [
  // === PRIORITY 1: CRITICAL GAPS (weak or no data) ===
  {
    theme: 'build_agency',
    keywords: ['agency', 'consulting firm', 'service business', 'agenzia'],
    existingFiles: ['industry-specific-data.json'],
    priority: 1,
    subTopics: [
      'digital marketing agency startup costs revenue first year 2024 2025',
      'consulting agency profit margins client acquisition cost 2025',
      'agency founder burnout rate team scaling challenges statistics',
      'agency pricing models retainer vs project hourly rates benchmarks 2025',
      'agency client churn rate average contract length satisfaction scores',
      'solo consultant to agency transition statistics success rate timeline',
    ],
  },
  {
    theme: 'content_creator',
    keywords: ['creator', 'youtube', 'tiktok', 'podcast', 'influencer', 'content'],
    existingFiles: ['fame-entertainment-probabilities.json'],
    priority: 1,
    subTopics: [
      'youtube channel growth statistics 2025 subscribers milestone timeline',
      'tiktok creator earnings monetization rate 2025 by follower count',
      'podcast listener statistics 2025 download numbers revenue per episode',
      'content creator burnout quit rate 2025 by platform',
      'creator economy total market size revenue distribution 2025',
      'newsletter creator statistics 2025 subscriber growth paid conversion rate',
    ],
  },
  {
    theme: 'ecommerce_journey',
    keywords: ['ecommerce', 'shopify', 'dropshipping', 'online store', 'e-commerce'],
    existingFiles: ['marketing-growth-data.json', 'platform-economics.json'],
    priority: 1,
    subTopics: [
      'shopify store success rate revenue first year 2024 2025 statistics',
      'dropshipping profit margins failure rate 2025 by niche',
      'e-commerce customer acquisition cost by channel 2025 CAC',
      'online store average order value conversion rate 2025 by industry',
      'e-commerce return rate shipping cost impact on margins 2025',
      'amazon FBA seller statistics 2025 revenue success rate fees',
    ],
  },
  {
    theme: 'fitness_weight_loss',
    keywords: ['weight loss', 'fitness', 'gym', 'diet', 'health', 'perdi peso'],
    existingFiles: ['health-fitness.json', 'sports-fitness-goals.json'],
    priority: 1,
    subTopics: [
      'weight loss success rate maintain after 1 year 2 years 5 years 2024',
      'gym membership retention rate quit timeline 2025 statistics',
      'personal trainer client results success rate average transformation',
      'diet program effectiveness comparison keto intermittent fasting 2025',
      'fitness app user retention engagement statistics 2025',
      'obesity treatment statistics surgery vs diet vs exercise success rates 2025',
    ],
  },
  {
    theme: 'relationship_building',
    keywords: ['relationship', 'dating', 'marriage', 'breakup', 'relazione'],
    existingFiles: ['relationships.json', 'family-dynamics.json'],
    priority: 1,
    subTopics: [
      'dating app success rate marriage statistics 2025 by platform',
      'relationship duration statistics breakup probability by year 2025',
      'long distance relationship success failure rate 2025',
      'interfaith intercultural marriage success rate statistics 2025',
      'divorce rate by age income education country 2024 2025',
      'couples therapy success rate statistics cost duration 2025',
    ],
  },
  {
    theme: 'skill_learning',
    keywords: ['learn', 'skill', 'course', 'certification', 'impara'],
    existingFiles: ['education-probabilities-deep.json', 'language-learning.json'],
    priority: 1,
    subTopics: [
      'online course completion rate by platform Udemy Coursera 2025',
      'skill acquisition timeline by complexity coding design language 2025',
      'career change through reskilling success rate salary impact 2025',
      'self-taught developer success rate employment statistics 2025',
      'professional certification pass rate ROI by type AWS PMP CFA 2025',
      'language learning timeline fluency rate by method app immersion 2025',
    ],
  },
  // === PRIORITY 2: PARTIAL COVERAGE (have data but not deep enough) ===
  {
    theme: 'startup_launch',
    keywords: ['startup', 'launch', 'founder', 'lancia'],
    existingFiles: ['business-survival-probabilities.json', 'business-archetypes-1.json', 'funding-finance-business.json'],
    priority: 2,
    subTopics: [
      'startup failure reasons detailed breakdown by stage 2024 2025',
      'bootstrapped vs funded startup success rate comparison 2025',
      'solo founder vs co-founder success rate statistics 2025',
      'startup pivot statistics success rate timing reasons 2025',
      'startup time to profitability by industry model 2025',
      'startup employee count growth rate by stage funding 2025',
    ],
  },
  {
    theme: 'cafe_restaurant',
    keywords: ['cafe', 'restaurant', 'food', 'bar', 'ristorante'],
    existingFiles: ['cafe-restaurant-business.json', 'indonesia-business-deep.json'],
    priority: 2,
    subTopics: [
      'cafe startup cost breakdown by country city 2025 Indonesia USA Europe',
      'restaurant profit margin by type fast food fine dining cafe 2025',
      'food business health inspection failure rate closure reasons 2025',
      'cafe customer retention loyalty program effectiveness 2025',
      'food delivery platform commission impact on restaurant margins 2025',
      'cafe location analysis foot traffic rent correlation success rate 2025',
    ],
  },
  {
    theme: 'freelancing',
    keywords: ['freelance', 'freelancing', 'gig', 'solo', 'freelancer'],
    existingFiles: ['side-hustle-entrepreneurship.json', 'remote-work-digital-nomad.json'],
    priority: 2,
    subTopics: [
      'freelancer income by skill category 2025 median percentile',
      'freelancer client acquisition methods success rate 2025',
      'freelance to agency transition timeline statistics success rate',
      'freelancer tax burden by country comparison 2025',
      'upwork fiverr freelancer earnings success statistics 2025',
      'freelancer burnout rate work-life balance statistics 2025',
    ],
  },
  {
    theme: 'trading_investing',
    keywords: ['trading', 'invest', 'stock', 'crypto', 'forex', 'trading'],
    existingFiles: ['crypto-trading-investing.json', 'prediction-markets-trading.json', 'time-series-historical.json'],
    priority: 2,
    subTopics: [
      'day trading success rate profit loss statistics 2024 2025',
      'retail investor returns vs index fund comparison 2025',
      'forex trading profitability statistics by experience level 2025',
      'stock market beginner mistakes loss statistics first year 2025',
      'algorithmic trading retail success rate implementation cost 2025',
      'crypto trading psychology statistics FOMO panic sell data 2025',
    ],
  },
  {
    theme: 'debt_financial_crisis',
    keywords: ['debt', 'bankruptcy', 'loan', 'debiti', 'prestito'],
    existingFiles: ['debt-bankruptcy-financial-crisis.json', 'personal-finance.json'],
    priority: 2,
    subTopics: [
      'debt repayment timeline by amount method snowball avalanche 2025',
      'student loan default rate repayment statistics by country 2025',
      'credit card debt average interest rate payment behavior 2025',
      'personal bankruptcy recovery timeline credit score rebuild 2025',
      'debt consolidation success rate statistics comparison 2025',
      'debt stress impact on health relationships work performance 2025',
    ],
  },
  {
    theme: 'immigration_relocation',
    keywords: ['move', 'country', 'visa', 'immigration', 'trasferisciti', 'abroad'],
    existingFiles: ['immigration-relocation.json', 'immigration-relocation-research.json', 'country-specific-business.json'],
    priority: 2,
    subTopics: [
      'visa approval rate by country type work student family 2025',
      'cost of relocation international by destination 2025',
      'expat satisfaction regret rate by country 2025 statistics',
      'digital nomad visa countries requirements cost statistics 2025',
      'cultural adjustment timeline reverse culture shock statistics 2025',
      'expat salary cost of living comparison by city 2025',
    ],
  },
  {
    theme: 'saas_build',
    keywords: ['saas', 'software', 'app', 'product', 'costruisci'],
    existingFiles: ['industry-specific-data.json', 'tech-ai-probabilities-deep.json'],
    priority: 2,
    subTopics: [
      'SaaS startup metrics benchmark by stage ARR MRR churn 2025',
      'indie hacker SaaS revenue distribution success rate 2025',
      'SaaS pricing strategy impact on growth conversion 2025',
      'mobile app success rate downloads revenue statistics 2025',
      'SaaS customer acquisition cost by channel B2B B2C 2025',
      'time from MVP to first paying customer statistics by type 2025',
    ],
  },
  // === PRIORITY 3: GOOD COVERAGE (maintain freshness) ===
  {
    theme: 'career_employment',
    keywords: ['career', 'job', 'salary', 'promotion', 'lavoro'],
    existingFiles: ['career-employment.json', 'career-probabilities-deep.json'],
    priority: 3,
    subTopics: [
      'salary negotiation success rate increase percentage 2025',
      'career change success rate by age industry 2025',
      'remote work salary premium or penalty by role 2025',
    ],
  },
  {
    theme: 'real_estate',
    keywords: ['real estate', 'property', 'house', 'rent', 'immobiliare'],
    existingFiles: ['real-estate-housing.json'],
    priority: 3,
    subTopics: [
      'first time home buyer statistics success rate by market 2025',
      'rental property ROI by city country 2025',
      'real estate investment failure rate common mistakes 2025',
    ],
  },
  {
    theme: 'mental_health_burnout',
    keywords: ['burnout', 'mental health', 'stress', 'anxiety', 'depression'],
    existingFiles: ['burnout-mental-health-entrepreneurs.json', 'mental-health-psychology.json'],
    priority: 3,
    subTopics: [
      'entrepreneur burnout rate recovery timeline statistics 2025',
      'therapy effectiveness statistics by type CBT medication 2025',
      'work-life balance impact on business success statistics 2025',
    ],
  },
];

// ============ PIPELINE A: GAP ANALYSIS ============

interface GapReport {
  theme: string;
  priority: number;
  existingDataPoints: number;
  subTopicsToResearch: string[];
}

function analyzeGaps(): GapReport[] {
  const gaps: GapReport[] = [];

  for (const theme of SCENARIO_THEMES) {
    let dataPoints = 0;
    for (const file of theme.existingFiles) {
      const filePath = path.join(DATA_DIR, file);
      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        // Rough estimate: 1 data point per ~200 bytes
        dataPoints += Math.floor(stat.size / 200);
      }
    }

    // Also check nightly files
    const nightlyFiles = fs.readdirSync(DATA_DIR).filter(f =>
      f.startsWith('nightly-') && theme.keywords.some(k => f.includes(k.replace(/ /g, '-')))
    );
    for (const f of nightlyFiles) {
      try {
        const arr = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8'));
        if (Array.isArray(arr)) dataPoints += arr.length;
      } catch {}
    }

    // Priority 1 themes get ALL subtopics researched
    // Priority 2 get 3 subtopics (rotating)
    // Priority 3 get 1 subtopic (rotating)
    const nightIndex = Math.floor(Date.now() / 86400000);
    let subTopicsToResearch: string[];
    if (theme.priority === 1) {
      subTopicsToResearch = theme.subTopics;
    } else if (theme.priority === 2) {
      const start = (nightIndex * 3) % theme.subTopics.length;
      subTopicsToResearch = [];
      for (let i = 0; i < 3; i++) {
        subTopicsToResearch.push(theme.subTopics[(start + i) % theme.subTopics.length]);
      }
    } else {
      subTopicsToResearch = [theme.subTopics[nightIndex % theme.subTopics.length]];
    }

    gaps.push({
      theme: theme.theme,
      priority: theme.priority,
      existingDataPoints: dataPoints,
      subTopicsToResearch,
    });
  }

  // Sort by priority (1 first), then by least data
  gaps.sort((a, b) => a.priority - b.priority || a.existingDataPoints - b.existingDataPoints);
  return gaps;
}

// ============ PIPELINE B: HAIKU RESEARCH AGENTS ============

interface DataPoint {
  metric: string;
  value: string | number;
  unit?: string;
  source: string;
  year: number;
  description?: string;
}

async function runHaikuAgent(topic: string, theme: string): Promise<DataPoint[]> {
  if (!ANTHROPIC_KEY) return [];

  const prompt = `You are a data research agent for a life/business SIMULATOR. The simulator shows step-by-step paths with probabilities at each decision node.

Theme: ${theme}
Research topic: ${topic}

Your job: find 25-30 SPECIFIC facts that could be shown on simulation nodes. Each fact = a SHORT sentence with a NUMBER and a SOURCE.

Examples of PERFECT data points:
- "38% of startups fail from cash problems" (CB Insights 2024)
- "Only 40% of funded startups find product-market fit" (Startup Genome 2023)
- "80% of YouTube creators quit within 90 days" (YouTube Creator Academy)
- "Avg cafe startup cost: $275K for leased space" (Toast 2024)
- "Median freelancer earns $28/hr on Upwork" (Upwork 2024)
- "65% of products never reach 10 paying customers" (Baremetrics 2024)
- "Day traders: 97% lose money over 300+ days" (University of São Paulo 2024)

Rules:
- ONLY 2023, 2024, or 2025 data. Real sources only.
- Each "description" = max 80 chars, must contain a specific number
- Cover DIFFERENT stages: desire → start → early struggles → growth → failure/success
- Include costs, timelines, percentages, survival rates, income stats
- Include country-specific breakdowns when possible (USA, Indonesia, EU, Asia)
- Think: "what would someone simulating this need to know at each step?"

Return ONLY a JSON array:
[{"metric": "metric_name", "value": 20, "unit": "%", "source": "Source Name", "year": 2024, "description": "Short fact with number for simulation node"}]`;

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
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await res.json();
    const text = data.content?.[0]?.text || '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((dp: DataPoint) => dp.metric && dp.value != null && dp.source && dp.year >= 2023);
  } catch (err) {
    console.error(`  [Haiku] Error for "${topic.substring(0, 50)}...":`, err);
    return [];
  }
}

// ============ PIPELINE C: EMBED & UPLOAD ============

async function embedAndUpload(chunks: { id: string; file: string; category: string; text: string }[]): Promise<number> {
  if (!SUPABASE_KEY || chunks.length === 0) return 0;

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  let uploaded = 0;

  for (let i = 0; i < chunks.length; i += 50) {
    const batch = chunks.slice(i, i + 50);
    const texts = batch.map(c => c.text.substring(0, 500));

    try {
      const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: texts,
        dimensions: 512,
      });
      const embeddings = response.data.map(d => d.embedding);

      const rows = batch.map((c, j) => ({
        id: c.id,
        file: c.file,
        category: c.category,
        text: c.text,
        embedding: `[${embeddings[j].join(',')}]`,
      }));

      for (let s = 0; s < rows.length; s += 10) {
        const subBatch = rows.slice(s, s + 10);
        const res = await fetch(`${SUPABASE_URL}/rest/v1/simulator_embeddings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': 'resolution=merge-duplicates',
          },
          body: JSON.stringify(subBatch),
        });

        if (!res.ok) {
          const err = await res.text();
          console.error(`  [Upload] Error: ${err.substring(0, 200)}`);
        } else {
          uploaded += subBatch.length;
        }
      }
    } catch (err) {
      console.error(`  [Embed] Error on batch ${Math.floor(i / 50)}:`, err);
    }
  }

  return uploaded;
}

// ============ MAIN ============

async function main() {
  const startTime = Date.now();
  const report: string[] = [];
  const todayStr = new Date().toISOString().split('T')[0];
  report.push(`# Overnight Pipeline Report — ${todayStr}`);
  report.push('');

  console.log('=== OVERNIGHT PIPELINE v2 (GAP-DRIVEN) ===');
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('');

  // --- Pipeline A: Gap Analysis ---
  console.log('--- Pipeline A: Gap Analysis ---');
  const gaps = analyzeGaps();

  let totalAgents = 0;
  for (const g of gaps) {
    totalAgents += g.subTopicsToResearch.length;
    console.log(`  [P${g.priority}] ${g.theme}: ${g.existingDataPoints} dp, researching ${g.subTopicsToResearch.length} topics`);
  }

  report.push(`## Pipeline A: Gap Analysis`);
  report.push(`| Theme | Priority | Existing DP | Topics Tonight |`);
  report.push(`|-------|----------|-------------|----------------|`);
  for (const g of gaps) {
    report.push(`| ${g.theme} | P${g.priority} | ${g.existingDataPoints} | ${g.subTopicsToResearch.length} |`);
  }
  report.push('');

  // --- Pipeline B: Haiku Research Agents ---
  console.log('');
  console.log(`--- Pipeline B: ${totalAgents} Haiku Agents ---`);

  const BATCH_SIZE = 3;
  const allNewDataPoints: DataPoint[] = [];
  const newChunks: { id: string; file: string; category: string; text: string }[] = [];

  // Flatten all research tasks
  const tasks: { topic: string; theme: string }[] = [];
  for (const g of gaps) {
    for (const topic of g.subTopicsToResearch) {
      tasks.push({ topic, theme: g.theme });
    }
  }

  console.log(`  Total research tasks: ${tasks.length} (batches of ${BATCH_SIZE})`);

  for (let b = 0; b < tasks.length; b += BATCH_SIZE) {
    const batch = tasks.slice(b, b + BATCH_SIZE);
    const batchNum = Math.floor(b / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(tasks.length / BATCH_SIZE);
    console.log(`  Batch ${batchNum}/${totalBatches}...`);

    const batchResults = await Promise.all(
      batch.map(async (t) => {
        let dataPoints = await runHaikuAgent(t.topic, t.theme);
        // Retry once if rate limited (0 results)
        if (dataPoints.length === 0) {
          await new Promise(r => setTimeout(r, 3000));
          dataPoints = await runHaikuAgent(t.topic, t.theme);
        }
        console.log(`    [${t.theme}] ${dataPoints.length} dp`);
        return { ...t, dataPoints };
      })
    );

    for (const result of batchResults) {
      if (result.dataPoints.length === 0) continue;
      allNewDataPoints.push(...result.dataPoints);

      // Save to themed JSON file
      const fileName = `nightly-${result.theme}.json`;
      const filePath = path.join(DATA_DIR, fileName);
      const existing: DataPoint[] = fs.existsSync(filePath)
        ? JSON.parse(fs.readFileSync(filePath, 'utf8'))
        : [];

      const merged = [...existing, ...result.dataPoints];
      const deduped = merged.filter((v, i, a) =>
        a.findIndex(t => t.metric === v.metric && t.year === v.year) === i
      );
      fs.writeFileSync(filePath, JSON.stringify(deduped, null, 2));

      // Create RAG chunks
      for (const dp of result.dataPoints) {
        newChunks.push({
          id: `nightly:${result.theme}:${dp.metric}:${dp.year}`,
          file: `nightly-${result.theme}`,
          category: result.theme,
          text: `${dp.description || dp.metric.replace(/_/g, ' ')}: ${dp.value}${dp.unit ? ' ' + dp.unit : ''} (${dp.source}, ${dp.year})`,
        });
      }
    }

    // Delay between batches to avoid Anthropic rate limits
    if (b + BATCH_SIZE < tasks.length) {
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  report.push(`## Pipeline B: Haiku Research`);
  report.push(`- Agents run: ${tasks.length}`);
  report.push(`- Data points found: ${allNewDataPoints.length}`);
  report.push(`- Avg per agent: ${tasks.length ? (allNewDataPoints.length / tasks.length).toFixed(1) : 0}`);
  report.push('');

  // --- Pipeline C: Embed & Upload ---
  console.log('');
  console.log(`--- Pipeline C: Embed & Upload (${newChunks.length} chunks) ---`);

  const uploaded = await embedAndUpload(newChunks);
  console.log(`  Uploaded: ${uploaded} chunks to Supabase RAG`);

  report.push(`## Pipeline C: Embed & Upload`);
  report.push(`- Chunks embedded: ${newChunks.length}`);
  report.push(`- Uploaded to Supabase: ${uploaded}`);
  report.push('');

  // --- Summary ---
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);

  // Count total data points across all nightly files
  let totalNightlyDp = 0;
  const nightlyFiles = fs.readdirSync(DATA_DIR).filter(f => f.startsWith('nightly-'));
  for (const f of nightlyFiles) {
    try {
      const arr = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8'));
      if (Array.isArray(arr)) totalNightlyDp += arr.length;
    } catch {}
  }

  report.push(`## Summary`);
  report.push(`- Duration: ${elapsed}s`);
  report.push(`- New data points tonight: ${allNewDataPoints.length}`);
  report.push(`- Total nightly data points (cumulative): ${totalNightlyDp}`);
  report.push(`- Chunks uploaded to RAG: ${uploaded}`);
  report.push(`- Priority 1 gaps targeted: ${gaps.filter(g => g.priority === 1).length} themes`);
  report.push(`- Priority 2 gaps targeted: ${gaps.filter(g => g.priority === 2).length} themes`);

  // Save report
  const reportDir = path.join(process.cwd(), 'docs', 'nightly-reports');
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(path.join(reportDir, `${todayStr}.md`), report.join('\n'));

  console.log('');
  console.log('=== OVERNIGHT PIPELINE COMPLETE ===');
  console.log(`Duration: ${elapsed}s`);
  console.log(`New data: ${allNewDataPoints.length} points`);
  console.log(`Uploaded: ${uploaded} chunks`);
  console.log(`Total nightly cumulative: ${totalNightlyDp}`);
  console.log(`Report: docs/nightly-reports/${todayStr}.md`);
}

main().catch(console.error);
