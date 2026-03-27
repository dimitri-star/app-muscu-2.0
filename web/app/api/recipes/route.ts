import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET() {
  if (!supabase) return NextResponse.json([], { headers: CORS });
  const { data, error } = await supabase
    .from("recipes_custom")
    .select("id,payload")
    .order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: CORS });
  const rows = (data || []).map((row) => ({
    ...(typeof row.payload === "object" && row.payload ? row.payload : {}),
    id: row.id,
  }));
  return NextResponse.json(rows, { headers: CORS });
}

export async function POST(request: Request) {
  try {
    if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503, headers: CORS });
    const body = await request.json();
    const id = String(body?.id || "").trim();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400, headers: CORS });
    const { error } = await supabase.from("recipes_custom").upsert(
      { id, payload: body, updated_at: new Date().toISOString() },
      { onConflict: "id" }
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: CORS });
    return NextResponse.json({ ok: true }, { headers: CORS });
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400, headers: CORS });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503, headers: CORS });
    const body = await request.json();
    const id = String(body?.id || "").trim();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400, headers: CORS });
    const { error } = await supabase.from("recipes_custom").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: CORS });
    return NextResponse.json({ ok: true }, { headers: CORS });
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400, headers: CORS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}
