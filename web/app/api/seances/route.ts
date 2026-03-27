import { NextResponse } from "next/server";
import { type SavedSeance } from "@/lib/seanceState";
import { supabase } from "@/lib/supabase";
import { getProgram, saveProgram } from "@/lib/programState";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function buildAutoSummary(body: any): string {
  const exCount = Array.isArray(body?.exercises) ? body.exercises.length : 0;
  const setCount = Array.isArray(body?.exercises)
    ? body.exercises.reduce((acc: number, ex: any) => acc + (Array.isArray(ex?.sets) ? ex.sets.length : 0), 0)
    : 0;
  const doneSets = Array.isArray(body?.exercises)
    ? body.exercises.flatMap((ex: any) => (Array.isArray(ex?.sets) ? ex.sets : [])).filter((s: any) => Boolean(s?.done))
    : [];
  const maxWeight = doneSets.reduce((m: number, s: any) => Math.max(m, Number(s?.weight ?? 0)), 0);
  const avgReps = doneSets.length > 0
    ? (doneSets.reduce((acc: number, s: any) => acc + Number(s?.reps ?? 0), 0) / doneSets.length).toFixed(1)
    : "0";

  const meta = body?.sessionMeta ?? {};
  const lines = [
    `Exercices: ${exCount}`,
    `Series: ${setCount} (${doneSets.length} validees)`,
    `Charge max: ${maxWeight > 0 ? `${maxWeight} kg` : "n/a"}`,
    `Reps moyennes: ${avgReps}`,
  ];
  if (typeof body?.rpeMax === "number") lines.push(`RPE max: ${body.rpeMax}/10`);
  if (typeof meta?.energyRating === "number") lines.push(`Energie: ${meta.energyRating}/5`);
  if (meta?.sleepHours) lines.push(`Sommeil: ${meta.sleepHours}h`);
  if (typeof meta?.moodRating === "number") lines.push(`Humeur: ${meta.moodRating}/5`);
  if (typeof meta?.soreness === "number") lines.push(`Courbatures: ${meta.soreness}/5`);
  return lines.join(" | ");
}

function buildExerciseSessionNote(ex: any): string {
  const doneSets = (ex?.sets || []).filter((s: any) => s?.done);
  if (!doneSets.length) return ex?.notes ? String(ex.notes) : "";
  const repsPart = doneSets.map((s: any) => Number(s?.reps ?? 0)).join("/");
  const weightVals = doneSets.map((s: any) => Number(s?.weight ?? 0)).filter((w: number) => w > 0);
  const weightPart = weightVals.length ? `${Math.min(...weightVals)}-${Math.max(...weightVals)}kg` : "PDC";
  const rpeVals = doneSets.map((s: any) => Number(s?.rpe)).filter((v: number) => Number.isFinite(v));
  const rpePart = rpeVals.length ? `RPE ${Math.min(...rpeVals)}-${Math.max(...rpeVals)}` : "";
  const base = `${doneSets.length}x (${repsPart}) ${weightPart}`.trim();
  return [base, rpePart, ex?.notes ? String(ex.notes) : ""].filter(Boolean).join(" | ");
}

function annotateProgramFromWorkout(payloadDate: string, body: any): void {
  try {
    const program = getProgram();
    const weekday = new Date(`${payloadDate}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "long" }).toLowerCase();
    const normalizedWeekday = weekday
      .replace("é", "e")
      .replace("è", "e")
      .replace("ê", "e")
      .replace("à", "a")
      .replace("û", "u");

    const day = program.days.find((d) => d.day.toLowerCase().replace("é", "e").replace("è", "e").replace("ê", "e").replace("à", "a").replace("û", "u") === normalizedWeekday);
    if (!day || !Array.isArray(body?.exercises)) return;

    const nowLabel = new Date().toISOString().slice(0, 10);
    const notesByName = new Map<string, string>();
    body.exercises.forEach((ex: any) => {
      const key = String(ex?.exercise?.name ?? ex?.name ?? "").trim().toLowerCase();
      if (!key) return;
      notesByName.set(key, buildExerciseSessionNote(ex));
    });

    day.exercises = day.exercises.map((ex) => {
      const k = ex.name.trim().toLowerCase();
      const sessionNote = notesByName.get(k);
      if (!sessionNote) return ex;
      return {
        ...ex,
        lastSessionDate: nowLabel,
        lastSessionSummary: sessionNote,
      } as typeof ex & { lastSessionDate?: string; lastSessionSummary?: string };
    });

    saveProgram(program);
  } catch {
    // non-blocking program annotation
  }
}

export async function GET() {
  if (!supabase) return NextResponse.json([], { headers: CORS });
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

    const source = (sessionMeta as { source?: "mobile" | "web" | "programme" | "mobile_course" } | null)?.source ?? "mobile";

    return {
      id: w.id,
      name: w.type || "Séance",
      date: w.date,
      duration: w.duree_min ?? 0,
      totalVolume: Number(w.volume_total ?? 0),
      totalSets: (w.workout_exercises || []).length,
      source,
      notes: workoutNote,
      sessionMeta,
      exercises: (w.workout_exercises || [])
        .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0))
        .map((ex) => {
          if (source === "mobile_course") {
            const secSeries = String(ex.reps_reelles || "")
              .split(",")
              .map((v) => Number(v.trim()))
              .filter((v) => Number.isFinite(v) && v > 0);
            return {
              name: ex.exercice,
              notes: ex.notes ?? "",
              sets: (secSeries.length ? secSeries : [0]).map((sec) => ({
                reps: Math.round(sec / 60),
                weight: 0,
                done: true,
              })),
            };
          }
          return {
            name: ex.exercice,
            notes: ex.notes ?? "",
            sets: [
              {
                reps: Number((ex.reps_reelles || "0").split(",")[0]?.trim() || 0),
                weight: Number((ex.charge_reelle || "0").replace(/[^\d.-]/g, "")) || 0,
                done: true,
              },
            ],
          };
        }),
    };
  });

  return NextResponse.json(seances, { headers: CORS });
}

export async function POST(request: Request) {
  try {
    if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503, headers: CORS });
    const body = await request.json();

    const isCourse = body?.source === "mobile_course";

    // Compute totalVolume / totalSets from mobile Workout format if not provided
    let totalVolume = body.totalVolume ?? 0;
    let totalSets = body.totalSets ?? 0;
    if (!isCourse && totalVolume === 0 && body.exercises?.length) {
      body.exercises.forEach((ex: { sets?: { done?: boolean; reps?: number; weight?: number }[] }) => {
        ex.sets?.forEach((s) => {
          if (s.done) {
            totalVolume += (s.reps ?? 0) * (s.weight ?? 0);
            totalSets++;
          }
        });
      });
    }
    if (isCourse) {
      totalVolume = 0;
      totalSets = Array.isArray(body?.exercises)
        ? body.exercises.reduce((acc: number, ex: any) => acc + ((ex?.sets || []).filter((s: any) => s?.done).length), 0)
        : 0;
    }

    const payloadDate = body.date || new Date().toISOString().split("T")[0];
    const workoutType = body.name || body.title || "Séance";
    const duration = body.duration ?? 0;

    const autoSummary = buildAutoSummary(body);
    const mergedSessionMeta = body.sessionMeta
      ? { ...body.sessionMeta, autoSummary, source: body.source ?? "mobile" }
      : { autoSummary, source: body.source ?? "mobile" };

    const mergedNotes =
      `__META__${JSON.stringify({ note: body.notes ?? "", sessionMeta: mergedSessionMeta })}`;

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
          charge_reelle: isCourse ? null : (firstSet?.weight ? `${firstSet.weight}` : null),
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

    annotateProgramFromWorkout(payloadDate, body);

    return NextResponse.json({ ok: true, id: workout.id }, { headers: CORS });
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400, headers: CORS });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503, headers: CORS });
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
