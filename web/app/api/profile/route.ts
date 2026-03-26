import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json(null, { status: 500, headers: CORS });
  return NextResponse.json(data, { headers: CORS });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { data: current } = await supabase
      .from("profiles")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (current?.id) {
      const { error } = await supabase.from("profiles").update(body).eq("id", current.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: CORS });
      return NextResponse.json({ ok: true, id: current.id }, { headers: CORS });
    }

    const { data, error } = await supabase.from("profiles").insert(body).select("id").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: CORS });
    return NextResponse.json({ ok: true, id: data.id }, { headers: CORS });
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400, headers: CORS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}
