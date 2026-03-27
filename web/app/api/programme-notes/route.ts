import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET() {
  if (!supabase) return NextResponse.json({}, { headers: CORS });
  const { data, error } = await supabase.from("programme_notes").select("note_key,note_value");
  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: CORS });
  const payload = Object.fromEntries((data || []).map((row) => [String(row.note_key), String(row.note_value || "")]));
  return NextResponse.json(payload, { headers: CORS });
}

export async function PUT(request: Request) {
  try {
    if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503, headers: CORS });
    const body = await request.json();
    const noteKey = String(body?.noteKey || "").trim();
    const noteValue = String(body?.noteValue || "");
    if (!noteKey) return NextResponse.json({ error: "Missing noteKey" }, { status: 400, headers: CORS });
    const { error } = await supabase.from("programme_notes").upsert(
      { note_key: noteKey, note_value: noteValue, updated_at: new Date().toISOString() },
      { onConflict: "note_key" }
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: CORS });
    return NextResponse.json({ ok: true }, { headers: CORS });
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400, headers: CORS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}
