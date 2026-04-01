import { NextRequest, NextResponse } from 'next/server';
import https from 'https';
import http from 'http';

function fetchPage(url: string): Promise<string> {
  const mod = url.startsWith('https') ? https : http;
  return new Promise((resolve, reject) => {
    const req = mod.get(url, { headers: { 'User-Agent': 'Simulator/1.0' }, timeout: 10000 }, (res) => {
      // Follow redirects
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchPage(res.headers.location).then(resolve).catch(reject);
        return;
      }
      let d = '';
      res.on('data', (c: Buffer) => { if (d.length < 50000) d += c; });
      res.on('end', () => resolve(d));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function extractText(html: string): string {
  // Strip scripts, styles, tags — keep text
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#\d+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.substring(0, 8000);
}

function extractMeta(html: string): Record<string, string> {
  const meta: Record<string, string> = {};
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) meta.title = titleMatch[1].trim();
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  if (descMatch) meta.description = descMatch[1].trim();
  const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
  if (ogTitle) meta.ogTitle = ogTitle[1].trim();
  const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
  if (ogDesc) meta.ogDescription = ogDesc[1].trim();
  const ogType = html.match(/<meta[^>]*property=["']og:type["'][^>]*content=["']([^"']+)["']/i);
  if (ogType) meta.type = ogType[1].trim();
  // Price detection
  const priceMatch = html.match(/[\$\€\£][\d,.]+|[\d,.]+\s*(USD|EUR|IDR|GBP)/i);
  if (priceMatch) meta.price = priceMatch[0];
  return meta;
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json() as { url: string };
    if (!url) return NextResponse.json({ error: 'No URL provided' }, { status: 400 });

    // Fetch the page
    const html = await fetchPage(url);
    const text = extractText(html);
    const meta = extractMeta(html);

    if (text.length < 20 && !meta.title) {
      return NextResponse.json({ error: 'Could not extract content from URL' }, { status: 400 });
    }

    // Ask Claude to generate multiple simulation seeds from page content
    const context = [
      meta.title ? `Title: ${meta.title}` : '',
      meta.description ? `Description: ${meta.description}` : '',
      meta.type ? `Type: ${meta.type}` : '',
      meta.price ? `Price found: ${meta.price}` : '',
      `URL: ${url}`,
      `Page content (first 4000 chars): ${text.substring(0, 4000)}`,
    ].filter(Boolean).join('\n');

    const body = JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      temperature: 0,
      messages: [{
        role: 'user',
        content: `Analyze this webpage and generate 6 different simulation scenarios. Think about WHY someone would be looking at this page, and what they might want to simulate.

${context}

Generate exactly 6 scenarios across these categories:
1. INTENTION — Why is the person on this page? What are they considering doing?
2. CONTENT — A specific simulation based on data/facts found on the page
3. OPPORTUNITY — A business opportunity revealed by the page content
4. RISK — What could go wrong if someone acts on this page's content?
5. COMPETITOR — How to compete with or replicate what this page/site offers
6. MARKET — The broader market/industry this page is about

Return ONLY valid JSON array, no other text:
[
  {"category":"intention","icon":"target","scenario":"One specific sentence...","confidence":0.9},
  {"category":"content","icon":"file-text","scenario":"One specific sentence...","confidence":0.8},
  {"category":"opportunity","icon":"trending-up","scenario":"One specific sentence...","confidence":0.7},
  {"category":"risk","icon":"alert-triangle","scenario":"One specific sentence...","confidence":0.8},
  {"category":"competitor","icon":"users","scenario":"One specific sentence...","confidence":0.6},
  {"category":"market","icon":"bar-chart","scenario":"One specific sentence...","confidence":0.7}
]`
      }]
    });

    const seeds = await new Promise<string>((resolve, reject) => {
      const req = https.request({
        hostname: 'api.anthropic.com', path: '/v1/messages', method: 'POST',
        headers: {
          'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01', 'Content-Length': Buffer.byteLength(body),
        },
      }, (res) => {
        let d = '';
        res.on('data', (c: Buffer) => d += c);
        res.on('end', () => {
          try {
            const j = JSON.parse(d);
            if (j.error) return reject(new Error(j.error.message));
            resolve(j.content?.[0]?.text || '[]');
          } catch (e) { reject(e); }
        });
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });

    let parsedSeeds;
    try {
      const cleaned = seeds.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedSeeds = JSON.parse(cleaned);
    } catch {
      // Fallback: single scenario
      parsedSeeds = [{ category: 'intention', icon: 'target', scenario: seeds.trim(), confidence: 0.8 }];
    }

    return NextResponse.json({ seeds: parsedSeeds, meta, url });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
