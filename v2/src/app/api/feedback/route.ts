import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const FEEDBACK_FILE = path.join(process.cwd(), 'data', 'community-feedback.json');

async function ensureFile() {
  try {
    await fs.access(FEEDBACK_FILE);
  } catch {
    await fs.writeFile(FEEDBACK_FILE, '[]', 'utf-8');
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      simulationId,
      scenario,
      predictedProb,
      actualOutcome,
      timeElapsed,
      details,
      lessons,
    } = body;

    // Validate required fields
    if (!scenario || predictedProb === undefined || !actualOutcome || !timeElapsed) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['success', 'partial', 'failure'].includes(actualOutcome)) {
      return NextResponse.json({ error: 'Invalid outcome value' }, { status: 400 });
    }

    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      simulationId: simulationId || null,
      scenario,
      predictedProb: Number(predictedProb),
      actualOutcome,
      timeElapsed,
      details: details || null,
      lessons: lessons || null,
      submittedAt: new Date().toISOString(),
    };

    // Append to JSON file
    await ensureFile();
    const raw = await fs.readFile(FEEDBACK_FILE, 'utf-8');
    const existing = JSON.parse(raw);
    existing.push(entry);
    await fs.writeFile(FEEDBACK_FILE, JSON.stringify(existing, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Thank you for sharing your outcome. Your feedback helps make predictions more accurate for everyone.',
      id: entry.id,
    });
  } catch (err) {
    console.error('Feedback API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await ensureFile();
    const raw = await fs.readFile(FEEDBACK_FILE, 'utf-8');
    const entries = JSON.parse(raw);
    return NextResponse.json({ entries, total: entries.length });
  } catch (err) {
    console.error('Feedback GET error:', err);
    return NextResponse.json({ entries: [], total: 0 });
  }
}
