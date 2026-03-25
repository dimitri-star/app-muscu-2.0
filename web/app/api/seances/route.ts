import { NextResponse } from "next/server";
import { getSeances, saveSeance, type SavedSeance } from "@/lib/seanceState";
import fs from "fs";
import path from "path";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET() {
  const seances = getSeances();
  return NextResponse.json(seances, { headers: CORS });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Compute totalVolume / totalSets from mobile Workout format if not provided
    let totalVolume = body.totalVolume ?? 0;
    let totalSets = body.totalSets ?? 0;
    if (totalVolume === 0 && body.exercises?.length) {
      body.exercises.forEach((ex: { sets?: { done?: boolean; reps?: number; weight?: number }[] }) => {
        ex.sets?.forEach((s) => {
          if (s.done) {
            totalVolume += (s.reps ?? 0) * (s.weight ?? 0);
            totalSets++;
          }
        });
      });
    }

    const seance: SavedSeance = {
      id: body.id || `seance_${Date.now()}`,
      name: body.name || body.title || "Séance",
      date: body.date || new Date().toISOString().split("T")[0],
      duration: body.duration ?? 0,
      totalVolume,
      totalSets,
      source: body.source || "mobile",
      exercises: (body.exercises || []).map(
        (ex: { exercise?: { name?: string }; name?: string; sets?: object[]; notes?: string }) => ({
          name: ex.exercise?.name ?? ex.name ?? "Exercice",
          sets: ex.sets ?? [],
          notes: ex.notes ?? "",
        })
      ),
    };

    saveSeance(seance);
    return NextResponse.json({ ok: true, id: seance.id }, { headers: CORS });
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400, headers: CORS });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const seances = getSeances();
    const updated = seances.filter((s) => s.id !== id);
    const DATA_FILE = path.join(process.cwd(), ".seances-data.json");
    fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2), "utf-8");
    return NextResponse.json({ ok: true }, { headers: CORS });
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500, headers: CORS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}
