import { NextResponse } from "next/server";
import { type SavedSeance } from "@/lib/seanceState";
import { supabase } from "@/lib/supabase";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET() {
  const { data, error } = await supabase
    .from("workouts")
    .select("id,date,type,duree_min,volume_total,rpe_max,notes,workout_exercises(id,exercice,charge_reelle,reps_reelles,rpe_reel,notes,ordre)")
    .order("date", { ascending: false });

  if (error) {
    return NextResponse.json([], { headers: CORS });
  }

  const seances: SavedSeance[] = (data || []).map((w) => {
    let workoutNote = "";
    let sessionMeta: SavedSeance["sessionMeta"] = null;
    const rawNotes = (w.notes as string | null) ?? "";
    if (rawNotes.startsWith("__META__")) {
      try {
        const parsed = JSON.parse(rawNotes.replace("__META__", ""));
        workoutNote = parsed?.note ?? "";
        sessionMeta = parsed?.sessionMeta ?? null;
      } catch {
        workoutNote = rawNotes;
      }
    } else {
      workoutNote = rawNotes;
    }

    return {
      id: w.id,
      name: w.type || "Séance",
      date: w.date,
      duration: w.duree_min ?? 0,
      totalVolume: Number(w.volume_total ?? 0),
      totalSets: (w.workout_exercises || []).length,
      source: "mobile",
      notes: workoutNote,
      sessionMeta,
      exercises: (w.workout_exercises || [])
        .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0))
        .map((ex) => ({
          name: ex.exercice,
          notes: ex.notes ?? "",
          sets: [
            {
              reps: Number((ex.reps_reelles || "0").split(",")[0]?.trim() || 0),
              weight: Number((ex.charge_reelle || "0").replace(/[^\d.-]/g, "")) || 0,
              done: true,
            },
          ],
        })),
    };
  });

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

    const payloadDate = body.date || new Date().toISOString().split("T")[0];
    const workoutType = body.name || body.title || "Séance";
    const duration = body.duration ?? 0;

    const mergedNotes =
      body.sessionMeta
        ? `__META__${JSON.stringify({ note: body.notes ?? "", sessionMeta: body.sessionMeta })}`
        : (body.notes ?? null);

    const { data: workout, error: workoutError } = await supabase
      .from("workouts")
      .insert({
        date: payloadDate,
        type: workoutType,
        duree_min: duration,
        volume_total: totalVolume,
        rpe_max: body.rpeMax ?? null,
        notes: mergedNotes,
      })
      .select("id")
      .single();

    if (workoutError || !workout) {
      return NextResponse.json({ error: "DB error" }, { status: 500, headers: CORS });
    }

    const exercisesRows = (body.exercises || []).map(
      (ex: { exercise?: { name?: string }; name?: string; sets?: { reps?: number; weight?: number; done?: boolean; rpe?: number }[]; notes?: string }, idx: number) => {
        const name = ex.exercise?.name ?? ex.name ?? "Exercice";
        const doneSets = (ex.sets || []).filter((s) => s.done);
        const repsStr = doneSets.map((s) => s.reps ?? 0).join(", ");
        const firstSet = doneSets[0];
        return {
          workout_id: workout.id,
          exercice: name,
          format: `${(ex.sets || []).length}x`,
          charge_reelle: firstSet?.weight ? `${firstSet.weight}` : null,
          reps_reelles: repsStr || null,
          rpe_reel: firstSet?.rpe ?? null,
          notes: ex.notes ?? null,
          ordre: idx,
        };
      }
    );

    if (exercisesRows.length > 0) {
      await supabase.from("workout_exercises").insert(exercisesRows);
    }

    return NextResponse.json({ ok: true, id: workout.id }, { headers: CORS });
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400, headers: CORS });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await supabase.from("workouts").delete().eq("id", id);
    return NextResponse.json({ ok: true }, { headers: CORS });
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500, headers: CORS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}
