"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dumbbell, Clock, Weight, LayoutGrid, List, ChevronDown, Download, Smartphone, Trash2 } from "lucide-react";
import type { SavedSeance } from "@/lib/seanceState";

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  const [y, m, d] = iso.split("-").map(Number);
  return `${String(d).padStart(2, "0")} ${months[m - 1]} ${y}`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function formatVolume(kg: number): string {
  if (kg === 0) return "—";
  return `${kg.toLocaleString("fr-FR")} kg`;
}

function inferMuscleGroup(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("upper") || lower.includes("bench") || lower.includes("dips") || lower.includes("lundi") || lower.includes("jeudi") || lower.includes("samedi")) return "Poitrine";
  if (lower.includes("trac") || lower.includes("row") || lower.includes("dos")) return "Dos";
  if (lower.includes("squat") || lower.includes("leg") || lower.includes("lower") || lower.includes("mercredi")) return "Jambes";
  if (lower.includes("ohp") || lower.includes("épaule")) return "Épaules";
  if (lower.includes("curl") || lower.includes("tri") || lower.includes("bras") || lower.includes("dimanche")) return "Bras";
  if (lower.includes("run") || lower.includes("cardio") || lower.includes("mardi") || lower.includes("vendredi")) return "Cardio";
  return "Full Body";
}

function seanceToDisplayWorkout(s: SavedSeance) {
  const topExercises = s.exercises
    .slice(0, 3)
    .map((ex) => {
      const doneSet = ex.sets.find((set) => set.done && set.weight > 0);
      return doneSet ? `${ex.name} ${doneSet.weight}kg x${doneSet.reps}` : ex.name;
    });
  return {
    id: s.id,
    title: s.name,
    date: formatDate(s.date),
    isoDate: s.date,
    duration: formatDuration(s.duration),
    volume: formatVolume(s.totalVolume),
    exerciseCount: s.exercises.length,
    muscleGroup: inferMuscleGroup(s.name),
    topExercises,
    source: s.source,
  };
}

// ── Export CSV ─────────────────────────────────────────────────────────────

function exportToCSV(workouts: ReturnType<typeof seanceToDisplayWorkout>[]) {
  const headers = ["Séance", "Date", "Durée", "Volume", "Exercices", "Groupe Musculaire", "Source"];
  const rows = workouts.map((w) => [
    w.title, w.date, w.duration, w.volume, w.exerciseCount, w.muscleGroup, w.source ?? "web",
  ]);
  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `seances_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Constants ──────────────────────────────────────────────────────────────

const ACCENT = "#1DB954";
const CARD_BG = "#FFFFFF";
const BORDER = "#E5E5E5";
const MUTED = "#888888";

const muscleGroups = ["Tous", "Poitrine", "Dos", "Jambes", "Épaules", "Bras", "Cardio", "Full Body"];

// ── Page ───────────────────────────────────────────────────────────────────

export default function EntrainementsPage() {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [selectedMuscle, setSelectedMuscle] = useState("Tous");
  const [rawSeances, setRawSeances] = useState<SavedSeance[]>([]);
  const [apiSeances, setApiSeances] = useState<ReturnType<typeof seanceToDisplayWorkout>[]>([]);
  const [selectedSeance, setSelectedSeance] = useState<SavedSeance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () =>
      fetch("/api/seances")
        .then((r) => r.json())
        .then((data: SavedSeance[]) => {
          if (Array.isArray(data)) {
            setRawSeances(data);
            setApiSeances(data.map(seanceToDisplayWorkout));
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, []);

  const handleDelete = async (id: string) => {
    // Remove from API (only API sessions can be deleted)
    await fetch("/api/seances", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setRawSeances((prev) => prev.filter((s) => s.id !== id));
    setApiSeances((prev) => prev.filter((s) => s.id !== id));
    if (selectedSeance?.id === id) setSelectedSeance(null);
  };

  const allDisplayWorkouts = [...apiSeances];

  const filtered =
    selectedMuscle === "Tous"
      ? allDisplayWorkouts
      : allDisplayWorkouts.filter((w) => w.muscleGroup === selectedMuscle);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Entraînements</h1>
          <p style={{ color: MUTED }} className="mt-1 text-sm">
            {allDisplayWorkouts.length} séances enregistrées
            {apiSeances.length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: "rgba(29,185,84,0.15)", color: ACCENT }}>
                {apiSeances.length} depuis l&apos;app
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => exportToCSV(filtered)}
            className="font-semibold flex items-center gap-2"
            style={{ borderColor: BORDER, color: MUTED }}
          >
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* API sync info banner */}
      {apiSeances.length === 0 && !loading && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: "rgba(29,185,84,0.06)", border: "1px solid rgba(29,185,84,0.2)" }}>
          <Smartphone className="w-4 h-4 flex-shrink-0" style={{ color: ACCENT }} />
          <p className="text-sm" style={{ color: "#1A5C35" }}>
            Aucune séance enregistrée pour le moment. Enregistre une séance mobile pour la voir ici. API : <code className="px-1 py-0.5 rounded text-xs" style={{ backgroundColor: "rgba(29,185,84,0.15)" }}>/api/seances</code>
          </p>
        </div>
      )}

      {/* Filters + View toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {muscleGroups.map((mg) => (
            <button
              key={mg}
              onClick={() => setSelectedMuscle(mg)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                backgroundColor: selectedMuscle === mg ? ACCENT : "#E5E5E5",
                color: selectedMuscle === mg ? "#FFFFFF" : MUTED,
              }}
            >
              {mg}
            </button>
          ))}
        </div>
        <div className="flex items-center rounded-lg overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
          <button
            onClick={() => setViewMode("cards")}
            className="px-3 py-2 flex items-center gap-1.5 text-xs font-medium transition-all"
            style={{ backgroundColor: viewMode === "cards" ? "#E5E5E5" : "transparent", color: viewMode === "cards" ? "#1A1A1A" : MUTED }}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Cards
          </button>
          <button
            onClick={() => setViewMode("table")}
            className="px-3 py-2 flex items-center gap-1.5 text-xs font-medium transition-all"
            style={{ backgroundColor: viewMode === "table" ? "#E5E5E5" : "transparent", color: viewMode === "table" ? "#1A1A1A" : MUTED }}
          >
            <List className="w-3.5 h-3.5" /> Tableau
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: ACCENT, borderTopColor: "transparent" }} />
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((workout) => (
            <Card
              key={workout.id}
              className="hover:border-green-500/40 transition-colors cursor-pointer"
              style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}
              onClick={() => {
                const full = rawSeances.find((s) => s.id === workout.id);
                if (full) setSelectedSeance(full);
              }}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(29,185,84,0.15)" }}>
                      {workout.source === "mobile" ? (
                        <Smartphone className="w-5 h-5" style={{ color: ACCENT }} />
                      ) : (
                        <Dumbbell className="w-5 h-5" style={{ color: ACCENT }} />
                      )}
                    </div>
                    {workout.source === "mobile" && (
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "rgba(29,185,84,0.15)", color: ACCENT }}>
                        Mobile
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs" style={{ borderColor: BORDER, color: MUTED }}>
                      {workout.date}
                    </Badge>
                    {workout.source === "mobile" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(workout.id);
                        }}
                        className="opacity-40 hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" style={{ color: "#EF4444" }} />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-gray-900 mb-1">{workout.title}</h3>

                <div className="grid grid-cols-3 gap-2 my-3">
                  <div className="text-center">
                    <Clock className="w-3 h-3 mx-auto mb-0.5" style={{ color: MUTED }} />
                    <p className="text-xs font-semibold text-gray-900">{workout.duration}</p>
                    <p className="text-xs" style={{ color: MUTED }}>durée</p>
                  </div>
                  <div className="text-center">
                    <Weight className="w-3 h-3 mx-auto mb-0.5" style={{ color: MUTED }} />
                    <p className="text-xs font-semibold text-gray-900">{workout.volume}</p>
                    <p className="text-xs" style={{ color: MUTED }}>volume</p>
                  </div>
                  <div className="text-center">
                    <Dumbbell className="w-3 h-3 mx-auto mb-0.5" style={{ color: MUTED }} />
                    <p className="text-xs font-semibold text-gray-900">{workout.exerciseCount}</p>
                    <p className="text-xs" style={{ color: MUTED }}>exercices</p>
                  </div>
                </div>

                <div className="rounded-lg p-2.5 space-y-1" style={{ backgroundColor: "#F5F5F5" }}>
                  {workout.topExercises.slice(0, 3).map((ex, i) => (
                    <p key={i} className="text-xs" style={{ color: MUTED }}>• {ex}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  {["Séance", "Date", "Durée", "Volume", "Exercices", "Groupe", "Source"].map((h) => (
                    <th key={h} className="text-left text-xs font-medium px-4 py-3" style={{ color: MUTED }}>
                      <div className="flex items-center gap-1">{h} <ChevronDown className="w-3 h-3" /></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((w, i) => (
                  <tr
                    key={w.id}
                    className="hover:bg-black/5 transition-colors cursor-pointer"
                    style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${BORDER}` : "none" }}
                    onClick={() => {
                      const full = rawSeances.find((s) => s.id === w.id);
                      if (full) setSelectedSeance(full);
                    }}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{w.title}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: MUTED }}>{w.date}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: MUTED }}>{w.duration}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{w.volume}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: MUTED }}>{w.exerciseCount}</td>
                    <td className="px-4 py-3">
                      <Badge className="text-xs" style={{ backgroundColor: "rgba(29,185,84,0.15)", color: ACCENT, border: "none" }}>
                        {w.muscleGroup}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {w.source === "mobile" ? (
                        <span className="flex items-center gap-1 text-xs font-medium" style={{ color: ACCENT }}>
                          <Smartphone className="w-3 h-3" /> Mobile
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: MUTED }}>Web</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {selectedSeance && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          onClick={() => setSelectedSeance(null)}
        >
          <div
            className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl"
            style={{ border: `1px solid ${BORDER}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between px-6 py-5 border-b" style={{ borderColor: BORDER }}>
              <div>
                <p className="text-xs" style={{ color: MUTED }}>{formatDate(selectedSeance.date)}</p>
                <h3 className="text-xl font-bold text-gray-900 mt-1">{selectedSeance.name}</h3>
                <p className="text-xs mt-1" style={{ color: MUTED }}>
                  {selectedSeance.source === "mobile" ? "Source mobile" : "Source web"} · {selectedSeance.exercises.length} exercices
                </p>
              </div>
              <Button variant="outline" onClick={() => setSelectedSeance(null)} style={{ borderColor: BORDER, color: MUTED }}>
                Fermer
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3 px-6 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <div className="rounded-lg p-3 text-center" style={{ backgroundColor: "#F5F5F5" }}>
                <p className="text-lg font-bold text-gray-900">{formatDuration(selectedSeance.duration)}</p>
                <p className="text-xs" style={{ color: MUTED }}>Durée</p>
              </div>
              <div className="rounded-lg p-3 text-center" style={{ backgroundColor: "#F5F5F5" }}>
                <p className="text-lg font-bold text-gray-900">{formatVolume(selectedSeance.totalVolume)}</p>
                <p className="text-xs" style={{ color: MUTED }}>Volume</p>
              </div>
              <div className="rounded-lg p-3 text-center" style={{ backgroundColor: "#F5F5F5" }}>
                <p className="text-lg font-bold text-gray-900">{selectedSeance.totalSets}</p>
                <p className="text-xs" style={{ color: MUTED }}>Séries</p>
              </div>
            </div>

            <div className="px-6 py-5 max-h-[55vh] overflow-y-auto space-y-4">
              {(selectedSeance.notes || selectedSeance.sessionMeta) && (
                <div className="rounded-xl p-3" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#F8F8F8" }}>
                  <p className="text-sm font-bold text-gray-900 mb-2">Ressenti avant sauvegarde</p>
                  {selectedSeance.notes ? (
                    <p className="text-sm mb-2" style={{ color: "#444" }}>{selectedSeance.notes}</p>
                  ) : null}
                  {selectedSeance.sessionMeta && (
                    <div className="flex flex-wrap gap-2">
                      {typeof selectedSeance.sessionMeta.effortRating === "number" && (
                        <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "rgba(29,185,84,0.14)", color: ACCENT }}>
                          Effort {selectedSeance.sessionMeta.effortRating}/10
                        </span>
                      )}
                      {typeof selectedSeance.sessionMeta.energyRating === "number" && (
                        <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "#EFEFEF", color: "#444" }}>
                          Énergie {selectedSeance.sessionMeta.energyRating}/5
                        </span>
                      )}
                      {typeof selectedSeance.sessionMeta.moodRating === "number" && (
                        <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "#EFEFEF", color: "#444" }}>
                          Humeur {selectedSeance.sessionMeta.moodRating}/5
                        </span>
                      )}
                      {selectedSeance.sessionMeta.sleepHours && (
                        <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "#EFEFEF", color: "#444" }}>
                          Sommeil {selectedSeance.sessionMeta.sleepHours}
                        </span>
                      )}
                      {typeof selectedSeance.sessionMeta.sleepQuality === "number" && (
                        <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "#EFEFEF", color: "#444" }}>
                          Qualité sommeil {selectedSeance.sessionMeta.sleepQuality}/5
                        </span>
                      )}
                      {typeof selectedSeance.sessionMeta.morningEnergy === "number" && (
                        <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "#EFEFEF", color: "#444" }}>
                          Énergie matin {selectedSeance.sessionMeta.morningEnergy}/5
                        </span>
                      )}
                      {typeof selectedSeance.sessionMeta.soreness === "number" && (
                        <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "#EFEFEF", color: "#444" }}>
                          Courbatures {selectedSeance.sessionMeta.soreness}/5
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {selectedSeance.exercises.map((ex, exIdx) => (
                <div key={`${ex.name}_${exIdx}`} className="rounded-xl p-3" style={{ border: `1px solid ${BORDER}` }}>
                  <p className="text-sm font-bold text-gray-900 mb-2">{ex.name}</p>
                  <div className="space-y-1.5">
                    {ex.sets.map((set, setIdx) => (
                      <div key={`${exIdx}_${setIdx}`} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ backgroundColor: set.done ? "rgba(29,185,84,0.10)" : "#F8F8F8" }}>
                        <span className="text-xs font-semibold" style={{ color: MUTED }}>Série {setIdx + 1}</span>
                        <span className="text-sm font-semibold text-gray-900">{set.weight > 0 ? `${set.weight} kg × ` : ""}{set.reps} reps</span>
                      </div>
                    ))}
                  </div>
                  {ex.notes && <p className="text-xs mt-2" style={{ color: MUTED }}>Notes: {ex.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
