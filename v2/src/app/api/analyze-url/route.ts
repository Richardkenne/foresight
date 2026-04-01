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

    // Ask Claude to generate scenario from page content
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
      max_tokens: 300,
      temperature: 0,
      messages: [{
        role: 'user',
        content: `Analyze this webpage and generate a simulation scenario. The scenario should be a specific, actionable life/business situation that someone visiting this page would be considering.

${context}

Examples:
- Job listing → "A developer applies for a senior React position at $150K in San Francisco"
- Airbnb listing → "A couple books a $80/night villa in Bali for 30 days as digital nomads"
- LinkedIn profile → "A marketing manager with 5 years experience switches to freelancing"
- Business website → "A competitor analysis: how this SaaS achieves $10M ARR"
- News article → "Impact of AI on freelance developers in 2025"

Return ONLY the scenario sentence, nothing else.`
      }]
    });

    const scenario = await new Promise<string>((resolve, reject) => {
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
            resolve(j.content?.[0]?.text || '');
          } catch (e) { reject(e); }
        });
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });

    return NextResponse.json({ scenario: scenario.trim(), meta, url });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
