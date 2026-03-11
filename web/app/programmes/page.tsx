"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Archive,
  Calendar,
  CheckCircle2,
  Download,
  Dumbbell,
  Pencil,
  Plus,
  Printer,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { archivedPrograms } from "@/lib/mockData";
import type { Program, ProgramDay, ProgramExercise, DayType } from "@/lib/programTypes";

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCENT = "#1DB954";
const CARD_BG = "#FFFFFF";
const BORDER = "#E5E5E5";
const MUTED = "#888888";
const BG = "#0F0F1A";

const DAY_COLORS: Record<DayType, string> = {
  push: "#4C9FFF",
  pull: "#1DB954",
  legs: "#F59E0B",
  rest: "#6B7280",
  cardio: "#EF4444",
  full: "#9C27B0",
};

const DAY_TYPE_LABELS: Record<DayType, string> = {
  push: "Push",
  pull: "Pull",
  legs: "Legs",
  rest: "Repos",
  cardio: "Cardio",
  full: "Full Body",
};

// ─── Components ───────────────────────────────────────────────────────────────

function ExerciseRow({
  exercise,
  color,
  isEditing,
  onUpdate,
  onDelete,
}: {
  exercise: ProgramExercise;
  color: string;
  isEditing: boolean;
  onUpdate: (field: keyof ProgramExercise, value: string) => void;
  onDelete: () => void;
}) {
  if (isEditing) {
    return (
      <div
        className="rounded-lg p-2 flex gap-2 items-start"
        style={{ backgroundColor: "#EEEEEE", border: `1px solid ${BORDER}` }}
      >
        <div className="flex-1 space-y-1.5">
          <input
            value={exercise.name}
            onChange={(e) => onUpdate("name", e.target.value)}
            placeholder="Nom de l'exercice"
            className="w-full text-xs bg-transparent text-gray-900 border-b outline-none pb-0.5"
            style={{ borderColor: color }}
          />
          <div className="flex gap-2">
            <input
              value={exercise.sets}
              onChange={(e) => onUpdate("sets", e.target.value)}
              placeholder="Séries"
              className="w-16 text-xs bg-transparent outline-none border-b"
              style={{ borderColor: BORDER, color }}
            />
            <input
              value={exercise.rest}
              onChange={(e) => onUpdate("rest", e.target.value)}
              placeholder="Repos"
              className="w-16 text-xs bg-transparent outline-none border-b"
              style={{ borderColor: BORDER, color: MUTED }}
            />
          </div>
        </div>
        <button
          onClick={onDelete}
          className="mt-1 opacity-50 hover:opacity-100 transition-opacity"
        >
          <Trash2 className="w-3.5 h-3.5" style={{ color: "#EF4444" }} />
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg p-2" style={{ backgroundColor: "#F5F5F5" }}>
      <p className="text-xs font-medium text-gray-900 leading-tight">{exercise.name}</p>
      <p className="text-xs mt-0.5" style={{ color }}>
        {exercise.sets}
      </p>
      <p className="text-xs" style={{ color: MUTED }}>
        Repos: {exercise.rest}
      </p>
    </div>
  );
}

function DayColumn({
  day,
  isEditing,
  onUpdateExercise,
  onAddExercise,
  onDeleteExercise,
  onUpdateDay,
}: {
  day: ProgramDay;
  isEditing: boolean;
  onUpdateExercise: (exId: string, field: keyof ProgramExercise, value: string) => void;
  onAddExercise: () => void;
  onDeleteExercise: (exId: string) => void;
  onUpdateDay: (field: keyof ProgramDay, value: string) => void;
}) {
  const color = day.color;
  const isRest = day.type === "rest";

  return (
    <div
      className="p-3 border-r last:border-r-0 flex flex-col"
      style={{ borderColor: BORDER, minWidth: 0 }}
    >
      {/* Day header */}
      <div className="mb-3 flex-shrink-0">
        <p className="text-xs font-bold text-gray-900 mb-1">{day.day}</p>
        {isEditing ? (
          <input
            value={day.label}
            onChange={(e) => onUpdateDay("label", e.target.value)}
            className="text-xs font-medium px-1.5 py-0.5 rounded-md w-full bg-transparent border outline-none"
            style={{ borderColor: color, color }}
          />
        ) : (
          <span
            className="text-xs font-medium px-1.5 py-0.5 rounded-md inline-block"
            style={{
              backgroundColor: `${color}20`,
              color,
            }}
          >
            {DAY_TYPE_LABELS[day.type]}
          </span>
        )}
      </div>

      {/* Exercises */}
      <div className="space-y-2 flex-1">
        {isRest && !isEditing ? (
          <p className="text-xs" style={{ color: MUTED }}>
            Récupération active
          </p>
        ) : (
          day.exercises.map((ex) => (
            <ExerciseRow
              key={ex.id}
              exercise={ex}
              color={color}
              isEditing={isEditing}
              onUpdate={(field, value) => onUpdateExercise(ex.id, field, value)}
              onDelete={() => onDeleteExercise(ex.id)}
            />
          ))
        )}

        {isEditing && (
          <button
            onClick={onAddExercise}
            className="w-full rounded-lg py-1.5 text-xs font-medium flex items-center justify-center gap-1 transition-opacity hover:opacity-80"
            style={{ backgroundColor: `${color}15`, color, border: `1px dashed ${color}50` }}
          >
            <Plus className="w-3 h-3" />
            Ajouter
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProgrammesPage() {
  const [program, setProgram] = useState<Program | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/programme")
      .then((r) => r.json())
      .then((data) => {
        setProgram(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const save = async () => {
    if (!program) return;
    setIsSaving(true);
    try {
      await fetch("/api/programme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(program),
      });
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportJSON = () => {
    if (!program) return;
    const blob = new Blob([JSON.stringify(program, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `programme-${program.name.replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => window.print();

  const cancelEdit = () => {
    // Re-fetch to discard changes
    fetch("/api/programme")
      .then((r) => r.json())
      .then(setProgram);
    setIsEditing(false);
  };

  const updateExercise = (
    dayId: string,
    exId: string,
    field: keyof ProgramExercise,
    value: string
  ) => {
    setProgram((p) =>
      p
        ? {
            ...p,
            days: p.days.map((d) =>
              d.id === dayId
                ? {
                    ...d,
                    exercises: d.exercises.map((e) =>
                      e.id === exId ? { ...e, [field]: value } : e
                    ),
                  }
                : d
            ),
          }
        : p
    );
  };

  const addExercise = (dayId: string) => {
    setProgram((p) =>
      p
        ? {
            ...p,
            days: p.days.map((d) =>
              d.id === dayId
                ? {
                    ...d,
                    exercises: [
                      ...d.exercises,
                      {
                        id: `ex_${Date.now()}`,
                        name: "Nouvel exercice",
                        sets: "3×10",
                        rest: "90s",
                      },
                    ],
                  }
                : d
            ),
          }
        : p
    );
  };

  const deleteExercise = (dayId: string, exId: string) => {
    setProgram((p) =>
      p
        ? {
            ...p,
            days: p.days.map((d) =>
              d.id === dayId
                ? { ...d, exercises: d.exercises.filter((e) => e.id !== exId) }
                : d
            ),
          }
        : p
    );
  };

  const updateDay = (dayId: string, field: keyof ProgramDay, value: string) => {
    setProgram((p) =>
      p
        ? {
            ...p,
            days: p.days.map((d) =>
              d.id === dayId ? { ...d, [field]: value } : d
            ),
          }
        : p
    );
  };

  const updateProgramField = (field: keyof Program, value: string | number) => {
    setProgram((p) => (p ? { ...p, [field]: value } : p));
  };

  const progressPct = program
    ? Math.round((program.currentWeek / program.weeks) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: ACCENT, borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="p-8 text-center" style={{ color: MUTED }}>
        Impossible de charger le programme.
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Programmes</h1>
          <p style={{ color: MUTED }} className="mt-1 text-sm">
            Gérez vos programmes d&apos;entraînement
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: "rgba(29,185,84,0.15)", color: ACCENT }}
            >
              <CheckCircle2 className="w-4 h-4" />
              Synchronisé avec le mobile
            </div>
          )}
          {isEditing ? (
            <>
              <Button
                onClick={cancelEdit}
                variant="outline"
                className="flex items-center gap-2"
                style={{ borderColor: BORDER, color: MUTED, backgroundColor: "transparent" }}
              >
                <X className="w-4 h-4" />
                Annuler
              </Button>
              <Button
                onClick={save}
                disabled={isSaving}
                className="flex items-center gap-2 font-semibold"
                style={{ backgroundColor: ACCENT, color: BG }}
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Sauvegarde..." : "Enregistrer & Synchroniser"}
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="flex items-center gap-2"
                style={{ borderColor: BORDER, color: MUTED, backgroundColor: "transparent" }}
              >
                <Pencil className="w-4 h-4" />
                Modifier le programme
              </Button>
              <Button
                style={{ backgroundColor: ACCENT, color: BG }}
                className="font-semibold flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Nouveau programme
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Current Program Card */}
      <Card style={{ backgroundColor: CARD_BG, border: `1px solid ${isEditing ? ACCENT + "50" : BORDER}` }}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "rgba(29,185,84,0.15)" }}
              >
                <Dumbbell className="w-6 h-6" style={{ color: ACCENT }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {isEditing ? (
                    <input
                      value={program.name}
                      onChange={(e) => updateProgramField("name", e.target.value)}
                      className="text-xl font-bold bg-transparent text-gray-900 border-b outline-none pb-0.5"
                      style={{ borderColor: ACCENT, minWidth: 280 }}
                    />
                  ) : (
                    <h2 className="text-xl font-bold text-gray-900">{program.name}</h2>
                  )}
                  <Badge style={{ backgroundColor: ACCENT, color: BG }} className="text-xs font-bold">
                    ACTIF
                  </Badge>
                </div>
                {isEditing ? (
                  <div className="flex gap-3 mt-1">
                    <input
                      value={program.frequency}
                      onChange={(e) => updateProgramField("frequency", e.target.value)}
                      placeholder="Fréquence"
                      className="text-sm bg-transparent border-b outline-none pb-0.5 w-20"
                      style={{ borderColor: BORDER, color: MUTED }}
                    />
                    <input
                      value={program.focus}
                      onChange={(e) => updateProgramField("focus", e.target.value)}
                      placeholder="Objectif"
                      className="text-sm bg-transparent border-b outline-none pb-0.5 w-40"
                      style={{ borderColor: BORDER, color: MUTED }}
                    />
                  </div>
                ) : (
                  <p style={{ color: MUTED }} className="text-sm mt-0.5">
                    {program.frequency} · Objectif: {program.focus}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <span className="text-gray-900 font-bold">S</span>
                  <input
                    type="number"
                    value={program.currentWeek}
                    onChange={(e) => updateProgramField("currentWeek", Number(e.target.value))}
                    className="text-2xl font-bold bg-transparent text-gray-900 border-b outline-none w-8 text-center"
                    style={{ borderColor: ACCENT }}
                  />
                  <span className="text-gray-900 font-bold">/</span>
                  <input
                    type="number"
                    value={program.weeks}
                    onChange={(e) => updateProgramField("weeks", Number(e.target.value))}
                    className="text-2xl font-bold bg-transparent text-gray-900 border-b outline-none w-8 text-center"
                    style={{ borderColor: ACCENT }}
                  />
                </div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  S{program.currentWeek}/{program.weeks}
                </p>
              )}
              <p style={{ color: MUTED }} className="text-xs">semaines</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs" style={{ color: MUTED }}>
              <span>Progression</span>
              <span style={{ color: ACCENT }}>{progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-2" style={{ backgroundColor: BORDER }} />
          </div>
        </CardContent>
      </Card>

      {/* Weekly Schedule Table */}
      <Card style={{ backgroundColor: CARD_BG, border: `1px solid ${isEditing ? ACCENT + "50" : BORDER}` }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4" style={{ color: ACCENT }} />
              Planning hebdomadaire
            </CardTitle>
            {isEditing && (
              <span className="text-xs" style={{ color: MUTED }}>
                Cliquez sur un exercice pour le modifier
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <div className="grid" style={{ gridTemplateColumns: `repeat(${program.days.length}, minmax(130px, 1fr))` }}>
            {program.days.map((day) => (
              <DayColumn
                key={day.id}
                day={day}
                isEditing={isEditing}
                onUpdateExercise={(exId, field, value) =>
                  updateExercise(day.id, exId, field, value)
                }
                onAddExercise={() => addExercise(day.id)}
                onDeleteExercise={(exId) => deleteExercise(day.id, exId)}
                onUpdateDay={(field, value) => updateDay(day.id, field, value)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mobile Sync Info */}
      <Card style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "rgba(29,185,84,0.15)" }}
              >
                <span className="text-sm">📱</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Synchronisation Mobile</p>
                <p className="text-xs" style={{ color: MUTED }}>
                  L&apos;app mobile se met à jour automatiquement via{" "}
                  <code
                    className="px-1 py-0.5 rounded text-xs"
                    style={{ backgroundColor: "#F0F0F0", color: ACCENT }}
                  >
                    /api/programme
                  </code>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportJSON}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{ backgroundColor: "#E5E5E5", color: "#555555" }}
                title="Télécharger le programme en JSON"
              >
                <Download className="w-3.5 h-3.5" />
                JSON
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{ backgroundColor: "#E5E5E5", color: "#555555" }}
                title="Imprimer / Exporter en PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                PDF
              </button>
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: "rgba(29,185,84,0.1)", color: ACCENT }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                API active
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Archived Programs */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Archive className="w-5 h-5" style={{ color: MUTED }} />
          Programmes archivés
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {archivedPrograms.map((prog, i) => (
            <Card
              key={i}
              style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "#E5E5E5" }}
                  >
                    <Dumbbell className="w-4 h-4" style={{ color: MUTED }} />
                  </div>
                  <Badge
                    variant="outline"
                    className="text-xs"
                    style={{ borderColor: BORDER, color: MUTED }}
                  >
                    Terminé
                  </Badge>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{prog.name}</h3>
                <p className="text-xs" style={{ color: MUTED }}>
                  {prog.duration} · {prog.period}
                </p>
                <p className="text-xs mt-1" style={{ color: ACCENT }}>
                  {prog.focus}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3 text-xs"
                  style={{ borderColor: BORDER, color: MUTED, backgroundColor: "transparent" }}
                >
                  Reprendre
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
