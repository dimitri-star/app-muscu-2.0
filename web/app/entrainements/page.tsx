"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dumbbell, Clock, Weight, LayoutGrid, List, ChevronDown } from "lucide-react";
import { allWorkouts } from "@/lib/mockData";

const ACCENT = "#1DB954";
const CARD_BG = "#1A1A2E";
const BORDER = "#2A2A3E";
const MUTED = "#8888A0";

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
          <h1 className="text-3xl font-bold text-white">Entraînements</h1>
          <p style={{ color: MUTED }} className="mt-1 text-sm">
            {allWorkouts.length} séances enregistrées
          </p>
        </div>
        <Button
          style={{ backgroundColor: ACCENT, color: "#0F0F1A" }}
          className="font-semibold"
        >
          + Nouvelle séance
        </Button>
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
                  selectedMuscle === mg ? ACCENT : "#2A2A3E",
                color: selectedMuscle === mg ? "#0F0F1A" : MUTED,
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
              backgroundColor: viewMode === "cards" ? "#2A2A3E" : "transparent",
              color: viewMode === "cards" ? "#E8E8F0" : MUTED,
            }}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Cards
          </button>
          <button
            onClick={() => setViewMode("table")}
            className="px-3 py-2 flex items-center gap-1.5 text-xs font-medium transition-all"
            style={{
              backgroundColor: viewMode === "table" ? "#2A2A3E" : "transparent",
              color: viewMode === "table" ? "#E8E8F0" : MUTED,
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

                <h3 className="text-sm font-bold text-white mb-1">{workout.title}</h3>

                <div className="grid grid-cols-3 gap-2 my-3">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Clock className="w-3 h-3" style={{ color: MUTED }} />
                    </div>
                    <p className="text-xs font-semibold text-white">{workout.duration}</p>
                    <p className="text-xs" style={{ color: MUTED }}>durée</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Weight className="w-3 h-3" style={{ color: MUTED }} />
                    </div>
                    <p className="text-xs font-semibold text-white">{workout.volume}</p>
                    <p className="text-xs" style={{ color: MUTED }}>volume</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Dumbbell className="w-3 h-3" style={{ color: MUTED }} />
                    </div>
                    <p className="text-xs font-semibold text-white">{workout.exerciseCount}</p>
                    <p className="text-xs" style={{ color: MUTED }}>exercices</p>
                  </div>
                </div>

                <div
                  className="rounded-lg p-2.5 space-y-1"
                  style={{ backgroundColor: "#12122A" }}
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
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                    style={{
                      borderBottom: i < filtered.length - 1 ? `1px solid ${BORDER}` : "none",
                    }}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-white">{w.title}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: MUTED }}>{w.date}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: MUTED }}>{w.duration}</td>
                    <td className="px-4 py-3 text-sm text-white font-medium">{w.volume}</td>
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
