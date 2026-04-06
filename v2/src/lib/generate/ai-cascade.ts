import https from 'https';
import { repairJSON } from './response-parser';

// ============ CLAUDE API (with prompt caching) ============
function callClaude(staticPrompt: string, dynamicPrompt: string, userMsg: string): Promise<unknown> {
  const systemBlocks: Array<{ type: string; text: string; cache_control?: { type: string } }> = [
    {
      type: 'text',
      text: staticPrompt,
      cache_control: { type: 'ephemeral' }
    },
  ];
  if (dynamicPrompt) {
    systemBlocks.push({ type: 'text', text: dynamicPrompt });
  }

  const body = JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4000,
    temperature: 0,
    system: systemBlocks,
    messages: [{ role: 'user', content: userMsg }]
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.anthropic.com', path: '/v1/messages', method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let d = '';
      res.on('data', (c: Buffer) => d += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          if (j.error) return reject(new Error(j.error.message));
          let content = j.content[0].text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          // Try direct parse first
          try { resolve(JSON.parse(content)); return; } catch { /* continue */ }
          // Try JSON repair before falling back
          try { resolve(JSON.parse(repairJSON(content))); return; } catch { /* continue */ }
          // Extract JSON from surrounding text (Claude sometimes adds commentary)
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try { resolve(JSON.parse(jsonMatch[0])); return; } catch { /* continue */ }
            try { resolve(JSON.parse(repairJSON(jsonMatch[0]))); return; } catch { /* continue */ }
          }
          reject(new Error('No valid JSON found in Claude response'));
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ============ OPENAI FALLBACK (GPT-4o-mini) ============
function callOpenAI(systemPrompt: string, userMsg: string): Promise<unknown> {
  const body = JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMsg }],
    temperature: 0, max_tokens: 4000,
    response_format: { type: 'json_object' }
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.openai.com', path: '/v1/chat/completions', method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let d = '';
      res.on('data', (c: Buffer) => d += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          if (j.error) return reject(new Error(j.error.message));
          resolve(JSON.parse(j.choices[0].message.content));
        } catch {
          try {
            const j2 = JSON.parse(d);
            resolve(JSON.parse(repairJSON(j2.choices[0].message.content)));
          } catch (e) { reject(e); }
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ============ GROQ FALLBACK (3rd tier — free, fast, lower quality) ============
function callGroq(systemPrompt: string, userMsg: string): Promise<unknown> {
  const body = JSON.stringify({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMsg }],
    temperature: 0, max_tokens: 4000,
    response_format: { type: 'json_object' }
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.groq.com', path: '/openai/v1/chat/completions', method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let d = '';
      res.on('data', (c: Buffer) => d += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          if (j.error) return reject(new Error(j.error.message));
          resolve(JSON.parse(j.choices[0].message.content));
        } catch {
          try {
            const j2 = JSON.parse(d);
            resolve(JSON.parse(repairJSON(j2.choices[0].message.content)));
          } catch (e) { reject(e); }
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ============ 3-TIER CASCADE ============
export async function callAICascade(
  staticPrompt: string,
  dynamicPrompt: string,
  userMsg: string,
): Promise<{ flow: Record<string, unknown>; provider: string }> {
  try {
    const flow = await callClaude(staticPrompt, dynamicPrompt, userMsg) as Record<string, unknown>;
    return { flow, provider: 'claude' };
  } catch (claudeErr) {
    console.warn('[API] Claude failed, trying OpenAI:', (claudeErr as Error).message);
    const fullPrompt = dynamicPrompt ? `${staticPrompt}\n\n${dynamicPrompt}` : staticPrompt;
    try {
      const flow = await callOpenAI(fullPrompt, userMsg) as Record<string, unknown>;
      return { flow, provider: 'openai' };
    } catch (openaiErr) {
      console.warn('[API] OpenAI failed, trying Groq:', (openaiErr as Error).message);
      const flow = await callGroq(fullPrompt, userMsg) as Record<string, unknown>;
      return { flow, provider: 'groq' };
    }
  }
}
