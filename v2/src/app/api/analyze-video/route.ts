import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

/**
 * Video to Scenario API
 * 1. Extract audio → transcribe with Whisper
 * 2. Extract frames → analyze with Claude Vision
 * 3. Combine into a simulation scenario
 */

function callWhisper(audioBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');

  const boundary = '----FormBoundary' + Math.random().toString(36).substring(2);
  const parts: Buffer[] = [];

  parts.push(Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: ${mimeType}\r\n\r\n`
  ));
  parts.push(audioBuffer);
  parts.push(Buffer.from('\r\n'));
  parts.push(Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="model"\r\n\r\nwhisper-1\r\n`
  ));
  parts.push(Buffer.from(`--${boundary}--\r\n`));

  const body = Buffer.concat(parts);

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.openai.com', path: '/v1/audio/transcriptions', method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': `multipart/form-data; boundary=${boundary}`, 'Content-Length': body.length },
    }, (res) => {
      let d = '';
      res.on('data', (c: Buffer) => d += c);
      res.on('end', () => {
        try { const j = JSON.parse(d); resolve(j.text || ''); } catch { reject(new Error('Whisper parse error')); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function callClaudeVision(frames: string[], transcript: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

  const imageContent = frames.map((b64, i) => ({
    type: 'image' as const,
    source: { type: 'base64' as const, media_type: 'image/jpeg' as const, data: b64 },
  }));

  const body = JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    temperature: 0,
    messages: [{
      role: 'user',
      content: [
        ...imageContent,
        {
          type: 'text',
          content: `These are ${frames.length} frames from a video.${transcript ? `\n\nAudio transcript: "${transcript}"` : ''}

Analyze this video and generate a ONE-SENTENCE simulation scenario that captures what the video is about. The scenario should be actionable and specific, suitable for a life/business simulator. Examples: "A barista opens a specialty coffee shop in Bandung", "A developer learns React to freelance on Upwork".

Return ONLY the scenario sentence, nothing else.`
        }
      ]
    }]
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.anthropic.com', path: '/v1/messages', method: 'POST',
      headers: {
        'Content-Type': 'application/json', 'x-api-key': apiKey,
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
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const videoFile = formData.get('video') as File | null;
    if (!videoFile) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await videoFile.arrayBuffer());
    const mimeType = videoFile.type || 'video/mp4';

    // Step 0: Extract metadata sent by client (GPS, date, device)
    const metaJson = formData.get('metadata') as string | null;
    const metadata: Record<string, string> = metaJson ? JSON.parse(metaJson) : {};

    // Step 1: Transcribe audio from video (Whisper accepts video files directly)
    let transcript = '';
    try {
      transcript = await callWhisper(buffer, videoFile.name || 'video.mp4', mimeType);
    } catch (err) {
      console.warn('[Video] Whisper transcription failed:', (err as Error).message);
    }

    // Step 2: Extract frames from video as base64
    // Since we can't use ffmpeg in serverless, we send the video file info to Claude
    // and use the transcript as the primary source
    // For frame extraction, the client will send pre-extracted frames
    const framesJson = formData.get('frames') as string | null;
    const frames: string[] = framesJson ? JSON.parse(framesJson) : [];

    let scenario = '';

    // Build metadata context string
    const metaContext = Object.entries(metadata).length > 0
      ? '\n\nVideo metadata: ' + Object.entries(metadata).map(([k, v]) => `${k}: ${v}`).join(', ')
      : '';

    if (frames.length > 0) {
      // Use Claude Vision with frames + transcript + metadata
      scenario = await callClaudeVision(frames, transcript + metaContext);
    } else if (transcript) {
      // Audio-only: use transcript directly as scenario basis
      // Ask Claude to convert transcript to scenario
      const body = JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        temperature: 0,
        messages: [{
          role: 'user',
          content: `Convert this video transcript into a ONE-SENTENCE simulation scenario for a life/business simulator. The scenario should be specific and actionable.${metaContext}\n\nTranscript: "${transcript}"\n\nReturn ONLY the scenario sentence.`
        }]
      });

      scenario = await new Promise<string>((resolve, reject) => {
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
              resolve(j.content?.[0]?.text || transcript);
            } catch (e) { reject(e); }
          });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
      });
    } else {
      return NextResponse.json({ error: 'Could not extract audio or frames from video' }, { status: 400 });
    }

    return NextResponse.json({ scenario: scenario.trim(), transcript, metadata });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
