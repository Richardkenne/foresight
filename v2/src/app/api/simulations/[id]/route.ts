import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || '';

// GET — load a single simulation by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/simulations?id=eq.${id}&select=*`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
  });

  const data = await res.json();
  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(data[0]);
}

// DELETE — delete a simulation
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/simulations?id=eq.${id}`, {
    method: 'DELETE',
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
  });

  if (!res.ok) return NextResponse.json({ error: 'Delete failed' }, { status: res.status });
  return NextResponse.json({ deleted: true });
}
