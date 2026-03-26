import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET() {
  if (!supabase) return NextResponse.json([], { headers: CORS });
  const { data } = await supabase
    .from("weekly_tracking")
    .select("*")
    .order("semaine", { ascending: true })
    .order("date", { ascending: true });
  return NextResponse.json(data || [], { headers: CORS });
}

export async function POST(request: Request) {
  try {
    if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503, headers: CORS });
    const body = await request.json();
    const rows = Array.isArray(body) ? body : [body];
    const { error } = await supabase.from("weekly_tracking").upsert(rows, { onConflict: "semaine,jour" });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers: CORS });
    }
    return NextResponse.json({ ok: true }, { headers: CORS });
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400, headers: CORS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}
