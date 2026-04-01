import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const pdfFile = formData.get('pdf') as File | null;
    if (!pdfFile) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await pdfFile.arrayBuffer());
    const b64 = buffer.toString('base64');

    // Send PDF to Claude as document (Claude supports PDF natively)
    const body = JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      temperature: 0,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: b64 },
          },
          {
            type: 'text',
            text: `Analyze this document and generate a ONE-SENTENCE simulation scenario for a life/business simulator.

The scenario should be specific and actionable based on what the document is about. Examples:
- Business plan → "A solo founder launches a SaaS for restaurant management with $20K capital"
- Resume/CV → "A data scientist with 3 years experience applies for senior roles in Europe"
- Financial statement → "A small business with $50K revenue tries to reach $200K in 12 months"
- Contract → "A freelancer negotiates a $15K retainer contract with a US client"
- Research paper → "Impact of [topic] on [industry] — key findings and implications"

Return ONLY the scenario sentence, nothing else.`
          }
        ]
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

    return NextResponse.json({ scenario: scenario.trim(), filename: pdfFile.name });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
