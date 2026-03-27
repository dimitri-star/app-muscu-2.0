import { NextResponse } from 'next/server';
import { getProgram, saveProgram } from '@/lib/programState';
import { supabase } from '@/lib/supabase';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function GET() {
  if (supabase) {
    const { data } = await supabase
      .from('programmes')
      .select('data')
      .eq('id', 'bloc1')
      .maybeSingle();
    if (data?.data) {
      return NextResponse.json(data.data, { headers: CORS });
    }
  }
  const program = getProgram();
  return NextResponse.json(program, { headers: CORS });
}

export async function PUT(request: Request) {
  try {
    const program = await request.json();
    if (supabase) {
      const { error } = await supabase
        .from('programmes')
        .upsert(
          { id: 'bloc1', data: program, updated_at: new Date().toISOString() },
          { onConflict: 'id' }
        );
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500, headers: CORS });
      }
      return NextResponse.json({ ok: true }, { headers: CORS });
    }
    saveProgram(program);
    return NextResponse.json({ ok: true }, { headers: CORS });
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400, headers: CORS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS,
  });
}
