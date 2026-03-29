import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

export async function POST(req: NextRequest) {
  try {
    const { image, exif } = await req.json() as {
      image: string; // base64 data URL
      exif?: {
        lat?: number;
        lng?: number;
        datetime?: string;
        camera?: string;
      };
    };

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Extract base64 data and media type from data URL
    const match = image.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
    }
    const mediaType = match[1];
    const base64Data = match[2];

    // Build context from EXIF
    const exifLines: string[] = [];
    if (exif?.lat != null && exif?.lng != null) {
      exifLines.push(`GPS coordinates: ${exif.lat.toFixed(4)}, ${exif.lng.toFixed(4)}`);
    }
    if (exif?.datetime) exifLines.push(`Photo taken: ${exif.datetime}`);
    if (exif?.camera) exifLines.push(`Camera: ${exif.camera}`);
    const exifContext = exifLines.length > 0 ? `\nEXIF METADATA:\n${exifLines.join('\n')}` : '';

    const prompt = buildPrompt(exifContext);

    // Call Claude Vision API (raw https, same pattern as generate/route.ts)
    const analysis = await callClaudeVision(mediaType, base64Data, prompt);

    return NextResponse.json(analysis);
  } catch (err) {
    console.error('Photo analysis error:', err);
    return NextResponse.json({ error: 'Failed to analyze photo' }, { status: 500 });
  }
}

function callClaudeVision(mediaType: string, base64Data: string, prompt: string): Promise<unknown> {
  const body = JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mediaType,
            data: base64Data,
          },
        },
        { type: 'text', text: prompt },
      ],
    }],
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let d = '';
      res.on('data', (c: Buffer) => d += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          if (j.error) return reject(new Error(j.error.message));
          const text = j.content[0].text;
          // Extract JSON
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            resolve(JSON.parse(jsonMatch[0]));
          } else {
            reject(new Error('No JSON in Claude response'));
          }
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function buildPrompt(exifContext: string): string {
  return `You are a scene decomposition engine for a life/career simulator.

Analyze this photo across 5 layers:
1. OBJECTS — What physical things do you see? (people, vehicles, buildings, signs, food, equipment)
2. ACTIVITIES — What are people doing? What's happening? (commuting, eating, working, shopping, exercising)
3. ECONOMY — What economic signals are visible? (business types, price levels, infrastructure quality, development stage)
4. TIME — What time of day does it look like? (from lighting, shadows, activity patterns)
5. LOCATION — Where could this be? (from architecture, signs, vegetation, vehicles, road style)
${exifContext}

Based on your analysis, generate 3-5 SIMULATION SEEDS — each is a unique simulation scenario inspired by what you see in this photo. Each seed should be:
- Deeply connected to the visual context (not generic)
- Specific to the location/time/activity visible
- Interesting to simulate (has branching outcomes, probabilities, real-world data)
- Diverse (cover different aspects: economic, social, personal, systemic)

Respond ONLY with this JSON (no markdown, no backticks):
{
  "seeds": [
    {
      "id": 1,
      "title": "Short compelling title (max 40 chars)",
      "scenario": "Detailed scenario description for the simulator (2-3 sentences, specific to what's visible, include location/context)",
      "category": "one of: business, money, career, life, urban, social",
      "confidence": 85,
      "icon": "one of: building, car, users, coffee, trending-up, briefcase, map-pin, clock, dollar-sign, globe, heart, zap, shopping-cart, truck, home"
    }
  ],
  "context": {
    "location": "Best guess of location (city, country) or null",
    "time_of_day": "morning/afternoon/evening/night or null",
    "scene_type": "urban-street/cafe/office/market/residential/nature/transport/etc",
    "objects": ["list", "of", "key", "objects"],
    "activities": ["list", "of", "activities"],
    "economic_signals": ["list", "of", "economic", "indicators"]
  }
}

IMPORTANT:
- The "scenario" field is what gets fed to the simulator — make it rich and specific
- Include real location names if you can identify them (from signs, architecture, GPS)
- Include time-relevant details (rush hour patterns, market hours, nightlife)
- Each seed should lead to a DIFFERENT type of simulation (don't repeat themes)
- Confidence should reflect how well the seed matches what's actually visible`;
}
