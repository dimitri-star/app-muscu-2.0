"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dumbbell, Clock, Weight, LayoutGrid, List, ChevronDown, Download } from "lucide-react";
import { allWorkouts } from "@/lib/mockData";

function exportToCSV() {
  const headers = ["Séance", "Date", "Durée", "Volume", "Exercices", "Groupe Musculaire", "Exercices Principaux"];
  const rows = allWorkouts.map((w) => [
    w.title,
    w.date,
    w.duration,
    w.volume,
    w.exerciseCount,
    w.muscleGroup,
    w.topExercises.join(" | "),
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

const ACCENT = "#1DB954";
const CARD_BG = "#FFFFFF";
const BORDER = "#E5E5E5";
const MUTED = "#888888";

const muscleGroups = ["Tous", "Poitrine", "Dos", "Jambes", "Épaules", "Bras", "Abdos"];

export default function EntrainementsPage() {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [selectedMuscle, setSelectedMuscle] = useState("Tous");

  const filtered =
    selectedMuscle === "Tous"
      ? allWorkouts
      : allWorkouts.filter((w) => w.muscleGroup === selectedMuscle);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Entraînements</h1>
          <p style={{ color: MUTED }} className="mt-1 text-sm">
            {allWorkouts.length} séances enregistrées
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={exportToCSV}
            className="font-semibold flex items-center gap-2"
            style={{ borderColor: BORDER, color: MUTED }}
          >
            <Download className="w-4 h-4" /> Export Excel
          </Button>
          <Button
            style={{ backgroundColor: ACCENT, color: "#FFFFFF" }}
            className="font-semibold"
          >
            + Nouvelle séance
          </Button>
        </div>
      </div>

      {/* Filters + View toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {muscleGroups.map((mg) => (
            <button
              key={mg}
              onClick={() => setSelectedMuscle(mg)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                backgroundColor:
                  selectedMuscle === mg ? ACCENT : "#E5E5E5",
                color: selectedMuscle === mg ? "#FFFFFF" : MUTED,
              }}
            >
              {mg}
            </button>
          ))}
        </div>
        <div
          className="flex items-center rounded-lg overflow-hidden"
          style={{ border: `1px solid ${BORDER}` }}
        >
          <button
            onClick={() => setViewMode("cards")}
            className="px-3 py-2 flex items-center gap-1.5 text-xs font-medium transition-all"
            style={{
              backgroundColor: viewMode === "cards" ? "#E5E5E5" : "transparent",
              color: viewMode === "cards" ? "#1A1A1A" : MUTED,
            }}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Cards
          </button>
          <button
            onClick={() => setViewMode("table")}
            className="px-3 py-2 flex items-center gap-1.5 text-xs font-medium transition-all"
            style={{
              backgroundColor: viewMode === "table" ? "#E5E5E5" : "transparent",
              color: viewMode === "table" ? "#1A1A1A" : MUTED,
            }}
          >
            <List className="w-3.5 h-3.5" /> Tableau
          </button>
        </div>
      </div>

      {viewMode === "cards" ? (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((workout) => (
            <Card
              key={workout.id}
              className="cursor-pointer hover:border-green-500/40 transition-colors"
              style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "rgba(29,185,84,0.15)" }}
                  >
                    <Dumbbell className="w-5 h-5" style={{ color: ACCENT }} />
                  </div>
                  <Badge
                    variant="outline"
                    className="text-xs"
                    style={{ borderColor: BORDER, color: MUTED }}
                  >
                    {workout.date}
                  </Badge>
                </div>

                <h3 className="text-sm font-bold text-gray-900 mb-1">{workout.title}</h3>

                <div className="grid grid-cols-3 gap-2 my-3">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Clock className="w-3 h-3" style={{ color: MUTED }} />
                    </div>
                    <p className="text-xs font-semibold text-gray-900">{workout.duration}</p>
                    <p className="text-xs" style={{ color: MUTED }}>durée</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Weight className="w-3 h-3" style={{ color: MUTED }} />
                    </div>
                    <p className="text-xs font-semibold text-gray-900">{workout.volume}</p>
                    <p className="text-xs" style={{ color: MUTED }}>volume</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Dumbbell className="w-3 h-3" style={{ color: MUTED }} />
                    </div>
                    <p className="text-xs font-semibold text-gray-900">{workout.exerciseCount}</p>
                    <p className="text-xs" style={{ color: MUTED }}>exercices</p>
                  </div>
                </div>

                <div
                  className="rounded-lg p-2.5 space-y-1"
                  style={{ backgroundColor: "#F5F5F5" }}
                >
                  {workout.topExercises.map((ex, i) => (
                    <p key={i} className="text-xs" style={{ color: MUTED }}>
                      • {ex}
                    </p>
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
                  {["Séance", "Date", "Durée", "Volume", "Exercices", "Groupe"].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-medium px-4 py-3"
                      style={{ color: MUTED }}
                    >
                      <div className="flex items-center gap-1">
                        {h} <ChevronDown className="w-3 h-3" />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((w, i) => (
                  <tr
                    key={w.id}
                    className="hover:bg-black/5 transition-colors cursor-pointer"
                    style={{
                      borderBottom: i < filtered.length - 1 ? `1px solid ${BORDER}` : "none",
                    }}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{w.title}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: MUTED }}>{w.date}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: MUTED }}>{w.duration}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{w.volume}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: MUTED }}>{w.exerciseCount}</td>
                    <td className="px-4 py-3">
                      <Badge
                        className="text-xs"
                        style={{
                          backgroundColor: "rgba(29,185,84,0.15)",
                          color: ACCENT,
                          border: "none",
                        }}
                      >
                        {w.muscleGroup}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
