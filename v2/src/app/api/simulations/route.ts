import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || '';

// GET — list simulations (anonymous: all with null user_id)
export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id');

  let url = `${SUPABASE_URL}/rest/v1/simulations?select=id,scenario,title,provider,data_source,created_at&order=created_at.desc&limit=50`;
  if (userId) {
    url += `&user_id=eq.${userId}`;
  } else {
    url += `&user_id=is.null`;
  }

  const res = await fetch(url, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
  });

  const data = await res.json();
  return NextResponse.json(data);
}

// POST — save a simulation
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { scenario, title, flow, provider, data_source, user_id } = body;

  if (!scenario || !flow) {
    return NextResponse.json({ error: 'Missing scenario or flow' }, { status: 400 });
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/simulations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({
      scenario,
      title: title || scenario.substring(0, 100),
      flow,
      provider: provider || null,
      data_source: data_source || null,
      user_id: user_id || null,
    }),
  });

  const data = await res.json();
  if (!res.ok) return NextResponse.json({ error: data }, { status: res.status });
  return NextResponse.json(data[0] || data, { status: 201 });
}
