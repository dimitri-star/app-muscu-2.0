import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET() {
  if (!supabase) return NextResponse.json([], { headers: CORS });
  const { data } = await supabase
    .from("grocery_list")
    .select("*")
    .order("ordre", { ascending: true });
  return NextResponse.json(data || [], { headers: CORS });
}

export async function PUT(request: Request) {
  try {
    if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503, headers: CORS });
    const body = await request.json();
    const { id, checked } = body || {};
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400, headers: CORS });
    const { error } = await supabase.from("grocery_list").update({ checked: !!checked }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: CORS });
    return NextResponse.json({ ok: true }, { headers: CORS });
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400, headers: CORS });
  }
}

export async function POST(request: Request) {
  try {
    if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503, headers: CORS });
    const body = await request.json();
    if (body?.action === "reset") {
      const { error } = await supabase.from("grocery_list").update({ checked: false }).neq("id", "");
      if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: CORS });
      return NextResponse.json({ ok: true }, { headers: CORS });
    }
    return NextResponse.json({ error: "Invalid action" }, { status: 400, headers: CORS });
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400, headers: CORS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}
