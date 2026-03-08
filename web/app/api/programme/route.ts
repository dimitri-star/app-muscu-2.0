import { NextResponse } from 'next/server';
import { getProgram, saveProgram } from '@/lib/programState';

export async function GET() {
  const program = getProgram();
  return NextResponse.json(program, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function PUT(request: Request) {
  try {
    const program = await request.json();
    saveProgram(program);
    return NextResponse.json({ ok: true }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
