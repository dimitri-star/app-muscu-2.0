import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, OPTIONS",
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
    const { id, checked, categorie, article, quantite } = body || {};
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400, headers: CORS });
    const patch: Record<string, unknown> = {};
    if (typeof checked !== "undefined") patch.checked = !!checked;
    if (typeof categorie === "string") patch.categorie = categorie;
    if (typeof article === "string") patch.article = article;
    if (typeof quantite !== "undefined") patch.quantite = quantite || null;
    const { error } = await supabase.from("grocery_list").update(patch).eq("id", id);
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
    if (body?.action === "create") {
      const categorie = String(body?.categorie || "").trim();
      const article = String(body?.article || "").trim();
      const quantite = body?.quantite ? String(body.quantite).trim() : null;
      if (!categorie || !article) {
        return NextResponse.json({ error: "Missing categorie/article" }, { status: 400, headers: CORS });
      }
      const { data: maxOrd } = await supabase
        .from("grocery_list")
        .select("ordre")
        .order("ordre", { ascending: false })
        .limit(1);
      const ordre = Number(maxOrd?.[0]?.ordre ?? -1) + 1;
      const { data, error } = await supabase
        .from("grocery_list")
        .insert({ categorie, article, quantite, checked: false, ordre })
        .select("*")
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: CORS });
      return NextResponse.json(data, { headers: CORS });
    }
    return NextResponse.json({ error: "Invalid action" }, { status: 400, headers: CORS });
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
    const { error } = await supabase.from("grocery_list").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: CORS });
    return NextResponse.json({ ok: true }, { headers: CORS });
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400, headers: CORS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}
