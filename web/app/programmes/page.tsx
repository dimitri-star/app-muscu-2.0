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
  Flame,
  Pencil,
  Plus,
  Printer,
  Save,
  Target,
  Trash2,
  TrendingUp,
  Wind,
  Wrench,
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

type ProgramTab = "programme" | "objectifs" | "course" | "correctifs" | "suivi";
const TABS: { key: ProgramTab; label: string; icon: React.ReactNode }[] = [
  { key: "programme", label: "Programme", icon: <Dumbbell className="w-3.5 h-3.5" /> },
  { key: "objectifs", label: "Objectifs", icon: <Target className="w-3.5 h-3.5" /> },
  { key: "suivi", label: "Suivi hebdo", icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { key: "course", label: "Plan course", icon: <Wind className="w-3.5 h-3.5" /> },
  { key: "correctifs", label: "Correctifs", icon: <Wrench className="w-3.5 h-3.5" /> },
];

// ─── Exercise Row ─────────────────────────────────────────────────────────────

function ExerciseRow({
  exercise, color, isEditing, onUpdate, onDelete,
}: {
  exercise: ProgramExercise; color: string; isEditing: boolean;
  onUpdate: (field: keyof ProgramExercise, value: string) => void;
  onDelete: () => void;
}) {
  if (isEditing) {
    return (
      <div className="rounded-lg p-2 flex gap-2 items-start" style={{ backgroundColor: "#EEEEEE", border: `1px solid ${BORDER}` }}>
        <div className="flex-1 space-y-1.5">
          <input value={exercise.name} onChange={(e) => onUpdate("name", e.target.value)} placeholder="Nom de l'exercice" className="w-full text-xs bg-transparent text-gray-900 border-b outline-none pb-0.5" style={{ borderColor: color }} />
          <div className="flex gap-2">
            <input value={exercise.sets} onChange={(e) => onUpdate("sets", e.target.value)} placeholder="Séries" className="w-16 text-xs bg-transparent outline-none border-b" style={{ borderColor: BORDER, color }} />
            <input value={exercise.rest} onChange={(e) => onUpdate("rest", e.target.value)} placeholder="Repos" className="w-16 text-xs bg-transparent outline-none border-b" style={{ borderColor: BORDER, color: MUTED }} />
          </div>
        </div>
        <button onClick={onDelete} className="mt-1 opacity-50 hover:opacity-100 transition-opacity">
          <Trash2 className="w-3.5 h-3.5" style={{ color: "#EF4444" }} />
        </button>
      </div>
    );
  }
  return (
    <div className="rounded-lg p-2" style={{ backgroundColor: "#F5F5F5" }}>
      <p className="text-xs font-medium text-gray-900 leading-tight">{exercise.name}</p>
      <p className="text-xs mt-0.5" style={{ color }}>{exercise.sets}</p>
      <p className="text-xs" style={{ color: MUTED }}>Repos: {exercise.rest}</p>
    </div>
  );
}

// ─── Day Column ───────────────────────────────────────────────────────────────

function DayColumn({
  day, isEditing, onUpdateExercise, onAddExercise, onDeleteExercise, onUpdateDay,
}: {
  day: ProgramDay; isEditing: boolean;
  onUpdateExercise: (exId: string, field: keyof ProgramExercise, value: string) => void;
  onAddExercise: () => void;
  onDeleteExercise: (exId: string) => void;
  onUpdateDay: (field: keyof ProgramDay, value: string) => void;
}) {
  const color = day.color;
  const isRest = day.type === "rest";
  return (
    <div className="p-3 border-r last:border-r-0 flex flex-col" style={{ borderColor: BORDER, minWidth: 0 }}>
      <div className="mb-3 flex-shrink-0">
        <p className="text-xs font-bold text-gray-900 mb-1">{day.day}</p>
        {isEditing ? (
          <input value={day.label} onChange={(e) => onUpdateDay("label", e.target.value)} className="text-xs font-medium px-1.5 py-0.5 rounded-md w-full bg-transparent border outline-none" style={{ borderColor: color, color }} />
        ) : (
          <span className="text-xs font-medium px-1.5 py-0.5 rounded-md inline-block" style={{ backgroundColor: `${color}20`, color }}>
            {day.label}
          </span>
        )}
      </div>
      <div className="space-y-2 flex-1">
        {isRest && !isEditing ? (
          <p className="text-xs" style={{ color: MUTED }}>Récupération active</p>
        ) : (
          day.exercises.map((ex) => (
            <ExerciseRow key={ex.id} exercise={ex} color={color} isEditing={isEditing} onUpdate={(field, value) => onUpdateExercise(ex.id, field, value)} onDelete={() => onDeleteExercise(ex.id)} />
          ))
        )}
        {isEditing && (
          <button onClick={onAddExercise} className="w-full rounded-lg py-1.5 text-xs font-medium flex items-center justify-center gap-1 transition-opacity hover:opacity-80" style={{ backgroundColor: `${color}15`, color, border: `1px dashed ${color}50` }}>
            <Plus className="w-3 h-3" /> Ajouter
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Bloc 1 — Programme Détaillé 4 Semaines ──────────────────────────────────

const BLOC1_WEEKS_INFO = [
  { num: 1, label: "S1", sublabel: "Relance", description: "Technique prioritaire, charges réduites exprès." },
  { num: 2, label: "S2", sublabel: "Accumulation", description: "Montée progressive du volume et des charges." },
  { num: 3, label: "S3", sublabel: "Accum.+", description: "Volume maximal du bloc, intensité haute." },
  { num: 4, label: "S4", sublabel: "Intensif.", description: "Singles lourds Lun/Sam. Mini-deload Ven/Dim." },
];

const BLOC1_DAY_COLORS = ["#4C9FFF", "#EF4444", "#F59E0B", "#9C27B0", "#EF4444", "#1DB954", "#A855F7"];

type ExBloc1 = { nom: string; format: string; rpe: string; charge: string; repos: string; consignes: string };
type JourBloc1 = { shortLabel: string; type: string; label: string; duration: string; color: string; exercises: ExBloc1[] };

const BLOC1_PROGRAMME: Record<number, JourBloc1[]> = {
  1: [
    {
      shortLabel: "LUN", type: "Upper A — Force", label: "Bench halt FORCE + Trac prona FORCE + AB", duration: "~65 min", color: "#4C9FFF",
      exercises: [
        { nom: "Bench haltères FORCE", format: "2×4", rpe: "7-8", charge: "50 kg/main", repos: "3-5'", consignes: "Stop 1s rep1" },
        { nom: "Bench halt levier (back-off)", format: "1×6-8", rpe: "6-7", charge: "42-44 kg/main", repos: "2-3'", consignes: "Cap technique" },
        { nom: "Band pull-apart (activation)", format: "3×15", rpe: "--", charge: "Bande légère", repos: "45\"", consignes: "AVANT tractions" },
        { nom: "Scapular pull-ups (activation)", format: "2×10", rpe: "--", charge: "PDC", repos: "45\"", consignes: "Omoplates vers le bas" },
        { nom: "Trac prona FORCE (TEMPO 2-1-X-0)", format: "2×4-5", rpe: "7", charge: "+15-18 kg", repos: "3-5'", consignes: "TECHNIQUE: pecs→barre, coudes→hanches, pencher arrière" },
        { nom: "Trac levier (back-off)", format: "1×6-8", rpe: "6", charge: "+8-10 kg", repos: "2'", consignes: "Même trajectoire" },
        { nom: "Forearms tour rack DÉGRESSIF", format: "1×(15→10→5 kg)", rpe: "8-10", charge: "15→10→5 kg", repos: "--", consignes: "Échec total sur le 5 kg" },
        { nom: "Extension poignet poulie", format: "2×15", rpe: "7", charge: "Léger", repos: "60\"", consignes: "Intérieur avant-bras" },
      ],
    },
    {
      shortLabel: "MAR", type: "Run Z2", label: "Course endurance fondamentale", duration: "25-30 min", color: "#EF4444",
      exercises: [
        { nom: "Run Z2", format: "25-30 min", rpe: "3-4", charge: "6:00-6:30/km", repos: "--", consignes: "Observer tibias, garder conversation possible" },
      ],
    },
    {
      shortLabel: "MER", type: "Lower", label: "Squat technique + mobilité + RDL + Pendulum + Leg curl", duration: "~70 min", color: "#F59E0B",
      exercises: [
        { nom: "Mobilité chevilles", format: "2×10/côté", rpe: "--", charge: "--", repos: "--", consignes: "Wall ankle stretch + goblet squat pause 30s" },
        { nom: "Back Squat (TECHNIQUE)", format: "2×4-5", rpe: "7", charge: "110-115 kg", repos: "3-5'", consignes: "TALONS PLANTÉS, 2s desc, 1s bas. Charge réduite." },
        { nom: "Squat levier (back-off)", format: "1×6-8", rpe: "6", charge: "88-95 kg", repos: "3'", consignes: "Qualité" },
        { nom: "Pendulum squat", format: "2×10", rpe: "7", charge: "18-20 kg", repos: "2-3'", consignes: "--" },
        { nom: "RDL belt squat", format: "2×6", rpe: "7-8", charge: "100 kg", repos: "2-3'", consignes: "2s excentrique" },
        { nom: "Leg curl", format: "2×12", rpe: "7", charge: "30-32 kg", repos: "2'", consignes: "1s squeeze" },
      ],
    },
    {
      shortLabel: "JEU", type: "Upper B — Volume", label: "Dips VOL + Bench barre VOL + Trac supi 4×+ OHP halt + AB", duration: "~85 min", color: "#9C27B0",
      exercises: [
        { nom: "Dips VOLUME", format: "2×8", rpe: "7-8", charge: "+65-70 kg", repos: "2-3'", consignes: "Amplitude complète, 1s en bas" },
        { nom: "Dips levier (dégressif)", format: "1×15-20", rpe: "7", charge: "+30 kg", repos: "--", consignes: "Échec contrôlé" },
        { nom: "Bench barre VOLUME", format: "2×6", rpe: "7-8", charge: "92-95 kg", repos: "2-3'", consignes: "Stop 1s rep1" },
        { nom: "Trac supination VOL (TEMPO 2-1-X-0)", format: "4×6-8", rpe: "7", charge: "+12-15 kg", repos: "2-3'", consignes: "4 SÉRIES, pecs→barre, squeeze" },
        { nom: "OHP haltères VOLUME", format: "2×10", rpe: "7-8", charge: "26 kg/main", repos: "2-3'", consignes: "--" },
        { nom: "Forearms moto", format: "2×", rpe: "7", charge: "10 kg", repos: "90\"", consignes: "--" },
      ],
    },
    {
      shortLabel: "VEN", type: "Run fractionné", label: "Fractionné Z5 — PAS à jeun", duration: "25-40 min", color: "#EF4444",
      exercises: [
        { nom: "Run fractionné (PAS à jeun)", format: "6×1' Z5 / 1' Z1", rpe: "7-8", charge: "--", repos: "--", consignes: "Collation 45-60 min avant" },
      ],
    },
    {
      shortLabel: "SAM", type: "Upper C — Force + Cali", label: "Dips FORCE + OHP barre FORCE + HSP + Planche + FL + L-sit", duration: "~85 min", color: "#1DB954",
      exercises: [
        { nom: "Dips FORCE", format: "2×3", rpe: "7-8", charge: "+80 kg", repos: "3-5'", consignes: "1s en bas, lockout complet" },
        { nom: "Dips levier (back-off)", format: "1×5", rpe: "7", charge: "+60-65 kg", repos: "2-3'", consignes: "--" },
        { nom: "OHP barre FORCE", format: "2×5", rpe: "7-8", charge: "55-58 kg", repos: "3-4'", consignes: "--" },
        { nom: "OHP levier (back-off)", format: "1×8", rpe: "6-7", charge: "45 kg", repos: "2-3'", consignes: "--" },
        { nom: "HSP pompes mur", format: "3×8-10", rpe: "7", charge: "PDC", repos: "90\"", consignes: "Amplitude complète" },
        { nom: "Handstand libre (essais)", format: "8-10 essais", rpe: "--", charge: "PDC", repos: "30-45\"", consignes: "Kick-up, noter durée max" },
        { nom: "Planche tuck (RÉTROVERSION)", format: "4×5-8s", rpe: "7-8", charge: "PDC", repos: "90\"", consignes: "Bassin rétroversion, PAS dos arrondi" },
        { nom: "Front lever tuck hold", format: "3×10-15s", rpe: "7", charge: "PDC", repos: "90\"", consignes: "Omoplates rétractées" },
        { nom: "L-sit parallettes", format: "3×15-20s", rpe: "7", charge: "PDC", repos: "60\"", consignes: "--" },
      ],
    },
    {
      shortLabel: "DIM", type: "Renfo + Conditioning", label: "Curls + Tri + Row + Pompes lestées + EMOM 16 min + Abdos", duration: "~60 min", color: "#A855F7",
      exercises: [
        { nom: "Curl barre strict", format: "2×8 + 1×dég.", rpe: "7-8", charge: "40-42 kg", repos: "2'", consignes: "--" },
        { nom: "Curl marteau", format: "2×10 + 1×dég.", rpe: "7-8", charge: "20 kg/bras", repos: "2'", consignes: "--" },
        { nom: "Triceps OH", format: "2×10 + 1×dég.", rpe: "7-8", charge: "36-38 kg", repos: "2'", consignes: "--" },
        { nom: "Row unilatéral", format: "3×10", rpe: "7-8", charge: "24-26 kg", repos: "90\"", consignes: "--" },
        { nom: "Pompes lestées", format: "3×10-12", rpe: "7-8", charge: "+10 kg", repos: "90\"", consignes: "--" },
        { nom: "EMOM 16 min (4 tours)", format: "Thrusters×8 / Trac×5 / KB×12 / Pompes×12", rpe: "7-8", charge: "@30 / PDC / @20 / PDC", repos: "--", consignes: "4 tours complets" },
        { nom: "Hollow body hold", format: "3×30s", rpe: "6-7", charge: "PDC", repos: "60\"", consignes: "--" },
        { nom: "Dead bug", format: "3×8/côté", rpe: "6", charge: "PDC", repos: "45\"", consignes: "--" },
        { nom: "Gainage latéral", format: "2×30s/côté", rpe: "6", charge: "PDC", repos: "45\"", consignes: "--" },
      ],
    },
  ],
  2: [
    {
      shortLabel: "LUN", type: "Upper A — Force", label: "Bench halt FORCE + speed + Trac prona FORCE + AB", duration: "~65 min", color: "#4C9FFF",
      exercises: [
        { nom: "Bench haltères FORCE", format: "2×3-4", rpe: "7-8", charge: "52-54 kg/main", repos: "3-5'", consignes: "Stop 1s rep1" },
        { nom: "Bench halt speed (activation)", format: "2×3", rpe: "6", charge: "36-38 kg/main", repos: "2'", consignes: "Explosif à la montée" },
        { nom: "Activation (pull-apart + scapular)", format: "3×15 + 2×10", rpe: "--", charge: "Bande / PDC", repos: "45\"", consignes: "Avant tractions" },
        { nom: "Trac prona FORCE (TEMPO 2-1-X-0)", format: "2×4", rpe: "7-8", charge: "+20-24 kg", repos: "3-5'", consignes: "Technique dorsaux, PAS les bras" },
        { nom: "Trac levier (back-off)", format: "1×6", rpe: "6", charge: "+12-14 kg", repos: "2'", consignes: "Même trajectoire" },
        { nom: "Forearms AB dégressif + Extension poulie", format: "1×dég + 2×15", rpe: "7-8", charge: "Dégressif / Léger", repos: "60\"", consignes: "--" },
      ],
    },
    {
      shortLabel: "MAR", type: "Run Z2", label: "Course endurance fondamentale", duration: "30-35 min", color: "#EF4444",
      exercises: [
        { nom: "Run Z2", format: "30-35 min", rpe: "3-4", charge: "5:50-6:10/km", repos: "--", consignes: "Allure stable, conversation possible" },
      ],
    },
    {
      shortLabel: "MER", type: "Lower", label: "Squat + mobilité + Pendulum + RDL + Leg curl", duration: "~70 min", color: "#F59E0B",
      exercises: [
        { nom: "Mobilité chevilles", format: "2×10/côté", rpe: "--", charge: "--", repos: "--", consignes: "Wall ankle stretch + goblet squat pause 30s" },
        { nom: "Back Squat", format: "2×4", rpe: "7-8", charge: "118-122 kg", repos: "3-5'", consignes: "TALONS PLANTÉS, 2s desc" },
        { nom: "Squat levier (back-off)", format: "1×6", rpe: "6", charge: "98-102 kg", repos: "3'", consignes: "Qualité" },
        { nom: "Pendulum squat", format: "3×10", rpe: "7", charge: "20-22 kg", repos: "2-3'", consignes: "--" },
        { nom: "RDL belt squat", format: "2×5-6", rpe: "7-8", charge: "105-108 kg", repos: "2-3'", consignes: "2s excentrique" },
        { nom: "Leg curl (3e dégressif)", format: "3×10-12", rpe: "7", charge: "33-35 kg", repos: "2'", consignes: "1s squeeze" },
      ],
    },
    {
      shortLabel: "JEU", type: "Upper B — Volume", label: "Dips VOL + Bench barre + Trac supi 4× + OHP + AB moto", duration: "~85 min", color: "#9C27B0",
      exercises: [
        { nom: "Dips VOLUME", format: "2×6-8", rpe: "7-8", charge: "+72-75 kg", repos: "2-3'", consignes: "Amplitude, 1s en bas" },
        { nom: "Dips levier (dégressif)", format: "1×12-15", rpe: "7", charge: "+35-40 kg", repos: "--", consignes: "Échec contrôlé" },
        { nom: "Bench barre VOLUME", format: "2×6", rpe: "7-8", charge: "95-97 kg", repos: "2-3'", consignes: "Stop 1s rep1" },
        { nom: "Trac supination VOL", format: "4×6-8", rpe: "7", charge: "+15-18 kg", repos: "2-3'", consignes: "4 SÉRIES, pecs→barre, squeeze" },
        { nom: "OHP haltères VOLUME", format: "3×8-10", rpe: "7-8", charge: "28 kg/main", repos: "2-3'", consignes: "--" },
        { nom: "Forearms moto", format: "3×", rpe: "7", charge: "10 kg", repos: "90\"", consignes: "--" },
      ],
    },
    {
      shortLabel: "VEN", type: "Run fractionné", label: "Fractionné Z5 — PAS à jeun", duration: "25-40 min", color: "#EF4444",
      exercises: [
        { nom: "Run fractionné (PAS à jeun)", format: "8×1' Z5 / 1' Z1", rpe: "7-8", charge: "--", repos: "--", consignes: "Collation 45-60 min avant" },
      ],
    },
    {
      shortLabel: "SAM", type: "Upper C — Force + Cali", label: "Dips FORCE + OHP barre FORCE + Cali complet", duration: "~85 min", color: "#1DB954",
      exercises: [
        { nom: "Dips FORCE", format: "2×3", rpe: "7-8", charge: "+85 kg", repos: "3-5'", consignes: "1s en bas, lockout" },
        { nom: "Dips levier (back-off)", format: "1×5", rpe: "7", charge: "+65-70 kg", repos: "2-3'", consignes: "--" },
        { nom: "OHP barre FORCE", format: "2×4-5", rpe: "7-8", charge: "58-60 kg", repos: "3-4'", consignes: "--" },
        { nom: "OHP levier (back-off)", format: "1×6-8", rpe: "6-7", charge: "47-48 kg", repos: "2-3'", consignes: "--" },
        { nom: "HSP pompes mur", format: "3×10-12", rpe: "7", charge: "PDC", repos: "90\"", consignes: "Amplitude complète" },
        { nom: "Handstand libre (essais)", format: "10 essais", rpe: "--", charge: "PDC", repos: "30-45\"", consignes: "Kick-up, noter durée max" },
        { nom: "Planche tuck", format: "4×6-10s", rpe: "7-8", charge: "PDC", repos: "90\"", consignes: "Rétroversion bassin" },
        { nom: "Front lever tuck hold", format: "3×15-20s", rpe: "7", charge: "PDC", repos: "90\"", consignes: "Omoplates rétractées" },
        { nom: "L-sit parallettes", format: "3×20-25s", rpe: "7", charge: "PDC", repos: "60\"", consignes: "--" },
      ],
    },
    {
      shortLabel: "DIM", type: "Renfo + Conditioning", label: "Curls + Tri + Row + Pompes + EMOM 20 min + Abdos", duration: "~60 min", color: "#A855F7",
      exercises: [
        { nom: "Curl barre strict", format: "3×6 + 1×dég.", rpe: "7-8", charge: "43-45 kg", repos: "2'", consignes: "--" },
        { nom: "Curl marteau", format: "2×10 + 1×dég.", rpe: "7-8", charge: "20-21 kg/bras", repos: "2'", consignes: "--" },
        { nom: "Triceps OH", format: "2×10 + 1×dég.", rpe: "7-8", charge: "38-40 kg", repos: "2'", consignes: "--" },
        { nom: "Row unilatéral", format: "3×10", rpe: "7-8", charge: "28-30 kg", repos: "90\"", consignes: "--" },
        { nom: "Pompes lestées", format: "3×12", rpe: "7-8", charge: "+12 kg", repos: "90\"", consignes: "--" },
        { nom: "EMOM 20 min (5 tours)", format: "Thrusters×8 / Trac×5 / KB×12 / Pompes×12", rpe: "7-8", charge: "@30 / PDC / @20 / PDC", repos: "--", consignes: "5 tours" },
        { nom: "Hollow body hold", format: "3×35s", rpe: "6-7", charge: "PDC", repos: "60\"", consignes: "--" },
        { nom: "Ab wheel", format: "3×8", rpe: "7", charge: "PDC", repos: "60\"", consignes: "--" },
        { nom: "Gainage latéral", format: "3×30s/côté", rpe: "6", charge: "PDC", repos: "45\"", consignes: "--" },
      ],
    },
  ],
  3: [
    {
      shortLabel: "LUN", type: "Upper A — Force", label: "Bench halt FORCE + speed + Trac prona FORCE + AB", duration: "~65 min", color: "#4C9FFF",
      exercises: [
        { nom: "Bench haltères FORCE", format: "2×3", rpe: "7-8", charge: "54-56 kg/main", repos: "3-5'", consignes: "Stop 1s rep1" },
        { nom: "Bench halt speed", format: "2×3", rpe: "6", charge: "38-40 kg/main", repos: "2'", consignes: "Explosif" },
        { nom: "Activation (pull-apart + scapular)", format: "3×15 + 2×10", rpe: "--", charge: "Bande / PDC", repos: "45\"", consignes: "Avant tractions" },
        { nom: "Trac prona FORCE (TEMPO 2-1-X-0)", format: "2×3-4", rpe: "7-8", charge: "+25-28 kg", repos: "3-5'", consignes: "Technique dorsaux" },
        { nom: "Trac levier (back-off)", format: "1×5-6", rpe: "6", charge: "+16-18 kg", repos: "2'", consignes: "Même trajectoire" },
        { nom: "Forearms AB dégressif + Extension poulie", format: "1×dég + 2×15", rpe: "7-8", charge: "Dégressif / Léger", repos: "60\"", consignes: "--" },
      ],
    },
    {
      shortLabel: "MAR", type: "Run Z2", label: "Course endurance fondamentale", duration: "35-40 min", color: "#EF4444",
      exercises: [
        { nom: "Run Z2", format: "35-40 min", rpe: "3-4", charge: "5:40-6:00/km", repos: "--", consignes: "Allure progressive" },
      ],
    },
    {
      shortLabel: "MER", type: "Lower", label: "Squat + mobilité + Pendulum dégressif + RDL + Leg curl", duration: "~70 min", color: "#F59E0B",
      exercises: [
        { nom: "Mobilité chevilles", format: "2×10/côté", rpe: "--", charge: "--", repos: "--", consignes: "Wall ankle stretch + goblet squat pause 30s" },
        { nom: "Back Squat", format: "2×3-4", rpe: "7-8", charge: "125-130 kg", repos: "3-5'", consignes: "TALONS PLANTÉS, 2s desc" },
        { nom: "Squat levier (back-off)", format: "1×5", rpe: "6", charge: "105-108 kg", repos: "3'", consignes: "Qualité" },
        { nom: "Pendulum squat (3e dégressif)", format: "3×10-12", rpe: "7", charge: "22 kg", repos: "2-3'", consignes: "Dernier set dégressif" },
        { nom: "RDL belt squat", format: "2×5", rpe: "7-8", charge: "110-112 kg", repos: "2-3'", consignes: "2s excentrique" },
        { nom: "Leg curl (3e dégressif)", format: "3×10-12", rpe: "7", charge: "35-38 kg", repos: "2'", consignes: "1s squeeze" },
      ],
    },
    {
      shortLabel: "JEU", type: "Upper B — Volume", label: "Dips VOL + tempo + Bench barre + Trac supi 4× + OHP + AB", duration: "~85 min", color: "#9C27B0",
      exercises: [
        { nom: "Dips VOLUME", format: "2×5-6", rpe: "7-8", charge: "+76-80 kg", repos: "2-3'", consignes: "Amplitude, 1s en bas" },
        { nom: "Dips tempo (4s desc + 1s pause)", format: "1×3", rpe: "7", charge: "+60 kg", repos: "3'", consignes: "Très contrôlé" },
        { nom: "Bench barre VOLUME", format: "2×6", rpe: "7-8", charge: "98-100 kg", repos: "2-3'", consignes: "Stop 1s rep1" },
        { nom: "Trac supination VOL", format: "4×6", rpe: "7-8", charge: "+18-22 kg", repos: "2-3'", consignes: "4 SÉRIES, pecs→barre" },
        { nom: "OHP haltères VOLUME", format: "3×8", rpe: "7-8", charge: "30 kg/main", repos: "2-3'", consignes: "--" },
        { nom: "Forearms moto", format: "3×", rpe: "7", charge: "11 kg", repos: "90\"", consignes: "--" },
      ],
    },
    {
      shortLabel: "VEN", type: "Run fractionné", label: "Fractionné Z4-Z5 long — PAS à jeun", duration: "35-45 min", color: "#EF4444",
      exercises: [
        { nom: "Run fractionné (PAS à jeun)", format: "8×1'30 Z4-Z5 / 1'30 Z1", rpe: "7-8", charge: "--", repos: "--", consignes: "Collation avant, récup marche/jogging lent" },
      ],
    },
    {
      shortLabel: "SAM", type: "Upper C — Force + Cali", label: "Dips FORCE + single + OHP barre FORCE + Cali max", duration: "~85 min", color: "#1DB954",
      exercises: [
        { nom: "Dips FORCE", format: "2×3", rpe: "7-8", charge: "+88-90 kg", repos: "3-5'", consignes: "1s en bas, lockout" },
        { nom: "Dips single (si propre)", format: "1×1", rpe: "8-9", charge: "+95-100 kg", repos: "5'", consignes: "Seulement si S2 propre" },
        { nom: "OHP barre FORCE", format: "2×3-4", rpe: "7-8", charge: "60-62 kg", repos: "3-4'", consignes: "--" },
        { nom: "OHP levier (back-off)", format: "1×6", rpe: "6-7", charge: "50 kg", repos: "2-3'", consignes: "--" },
        { nom: "HSP pompes mur", format: "3×12-15", rpe: "7", charge: "PDC", repos: "90\"", consignes: "Amplitude complète" },
        { nom: "Handstand libre (essais)", format: "10-12 essais", rpe: "--", charge: "PDC", repos: "30-45\"", consignes: "Kick-up, noter durée max" },
        { nom: "Planche tuck", format: "4×8-12s", rpe: "7-8", charge: "PDC", repos: "90\"", consignes: "Rétroversion bassin" },
        { nom: "Front lever tuck hold", format: "4×15-20s", rpe: "7", charge: "PDC", repos: "90\"", consignes: "Omoplates rétractées" },
        { nom: "L-sit parallettes", format: "4×20-25s", rpe: "7", charge: "PDC", repos: "60\"", consignes: "--" },
      ],
    },
    {
      shortLabel: "DIM", type: "Renfo + Conditioning", label: "Curls + Tri + Row + Pompes + EMOM 24 min + Abdos", duration: "~60 min", color: "#A855F7",
      exercises: [
        { nom: "Curl barre strict", format: "3×5-6 + 1×dég.", rpe: "7-8", charge: "45-46 kg", repos: "2'", consignes: "--" },
        { nom: "Curl marteau", format: "3×8-10 + 1×dég.", rpe: "7-8", charge: "21 kg/bras", repos: "2'", consignes: "--" },
        { nom: "Triceps OH", format: "3×8-12 + 1×dég.", rpe: "7-8", charge: "40-41 kg", repos: "2'", consignes: "--" },
        { nom: "Row unilatéral", format: "3×10", rpe: "7-8", charge: "32-34 kg", repos: "90\"", consignes: "--" },
        { nom: "Pompes lestées", format: "3×12-15", rpe: "7-8", charge: "+15 kg", repos: "90\"", consignes: "--" },
        { nom: "EMOM 24 min (6 tours)", format: "Thrusters×8 / Trac×5 / KB×12 / Pompes×12", rpe: "7-8", charge: "@30 / PDC / @20 / PDC", repos: "--", consignes: "6 tours" },
        { nom: "Hollow body hold", format: "3×40s", rpe: "6-7", charge: "PDC", repos: "60\"", consignes: "--" },
        { nom: "Ab wheel", format: "3×12", rpe: "7", charge: "PDC", repos: "60\"", consignes: "--" },
        { nom: "V-ups", format: "3×12", rpe: "6-7", charge: "PDC", repos: "45\"", consignes: "--" },
      ],
    },
  ],
  4: [
    {
      shortLabel: "LUN", type: "Upper A — Force MAX", label: "Bench halt FORCE + top single + Trac prona FORCE + AB", duration: "~65 min", color: "#4C9FFF",
      exercises: [
        { nom: "Bench haltères FORCE", format: "2×2", rpe: "7-8", charge: "56-58 kg/main", repos: "3-5'", consignes: "Stop 1s rep1" },
        { nom: "Bench halt top single (si propre)", format: "1×1", rpe: "8-9", charge: "58-60 kg/main", repos: "5'", consignes: "Seulement si S3 propre" },
        { nom: "Activation (pull-apart + scapular)", format: "3×15 + 2×10", rpe: "--", charge: "Bande / PDC", repos: "45\"", consignes: "Avant tractions" },
        { nom: "Trac prona FORCE (TEMPO 2-1-X-0)", format: "2×2-3", rpe: "7-8", charge: "+30-35 kg", repos: "3-5'", consignes: "Technique dorsaux" },
        { nom: "Trac levier (back-off)", format: "1×5", rpe: "6", charge: "+20-22 kg", repos: "2'", consignes: "Même trajectoire" },
        { nom: "Forearms AB dégressif + Extension poulie", format: "1×dég + 2×15", rpe: "7-8", charge: "Dégressif / Léger", repos: "60\"", consignes: "--" },
      ],
    },
    {
      shortLabel: "MAR", type: "Run Z2", label: "Course endurance fondamentale", duration: "35-40 min", color: "#EF4444",
      exercises: [
        { nom: "Run Z2", format: "35-40 min", rpe: "3-4", charge: "5:40-5:50/km", repos: "--", consignes: "Allure soutenue" },
      ],
    },
    {
      shortLabel: "MER", type: "Lower", label: "Squat max + mobilité + Pendulum + RDL + Leg curl", duration: "~70 min", color: "#F59E0B",
      exercises: [
        { nom: "Mobilité chevilles", format: "2×10/côté", rpe: "--", charge: "--", repos: "--", consignes: "Wall ankle stretch + goblet squat" },
        { nom: "Back Squat", format: "2×3", rpe: "7-8", charge: "130-135 kg", repos: "3-5'", consignes: "TALONS PLANTÉS, 2s desc" },
        { nom: "Squat levier (back-off)", format: "1×5", rpe: "6", charge: "110-112 kg", repos: "3'", consignes: "Qualité" },
        { nom: "Pendulum squat (3e dégressif)", format: "3×10", rpe: "7", charge: "22 kg", repos: "2-3'", consignes: "--" },
        { nom: "RDL belt squat", format: "2×5", rpe: "7-8", charge: "112-115 kg", repos: "2-3'", consignes: "2s excentrique" },
        { nom: "Leg curl (3e dégressif)", format: "3×10", rpe: "7", charge: "38-40 kg", repos: "2'", consignes: "1s squeeze" },
      ],
    },
    {
      shortLabel: "JEU", type: "Upper B — Volume", label: "Dips VOL + tempo + Bench barre + Trac supi 4× + OHP + AB", duration: "~85 min", color: "#9C27B0",
      exercises: [
        { nom: "Dips VOLUME", format: "2×5", rpe: "7-8", charge: "+80-82 kg", repos: "2-3'", consignes: "Amplitude, 1s en bas" },
        { nom: "Dips tempo (4s desc + 1s pause)", format: "1×3", rpe: "7", charge: "+65 kg", repos: "3'", consignes: "Très contrôlé" },
        { nom: "Bench barre VOLUME", format: "2×6", rpe: "7-8", charge: "100-102 kg", repos: "2-3'", consignes: "Stop 1s rep1" },
        { nom: "Trac supination VOL", format: "4×6", rpe: "7-8", charge: "+22-25 kg", repos: "2-3'", consignes: "4 SÉRIES, pecs→barre" },
        { nom: "OHP haltères VOLUME", format: "3×6-8", rpe: "7-8", charge: "32 kg/main", repos: "2-3'", consignes: "--" },
        { nom: "Forearms moto", format: "3×", rpe: "7", charge: "11 kg", repos: "90\"", consignes: "--" },
      ],
    },
    {
      shortLabel: "VEN", type: "Run Z2 LÉGER (mini-deload)", label: "Récupération active — PAS de fractionné", duration: "25-30 min", color: "#EF4444",
      exercises: [
        { nom: "Run Z2 léger (mini-deload)", format: "25-30 min", rpe: "3", charge: "6:00/km", repos: "--", consignes: "Pas de fractionné cette semaine" },
      ],
    },
    {
      shortLabel: "SAM", type: "Upper C — Force MAX + Cali réduit", label: "Dips FORCE + single + OHP barre FORCE + Cali réduit", duration: "~75 min", color: "#1DB954",
      exercises: [
        { nom: "Dips FORCE", format: "2×2-3", rpe: "7-8", charge: "+92-95 kg", repos: "3-5'", consignes: "1s en bas, lockout" },
        { nom: "Dips single (si propre)", format: "1×1", rpe: "9", charge: "+100-105 kg", repos: "5'", consignes: "Bilan du bloc" },
        { nom: "OHP barre FORCE", format: "2×3", rpe: "7-8", charge: "62-65 kg", repos: "3-4'", consignes: "--" },
        { nom: "OHP levier (back-off)", format: "1×5", rpe: "6-7", charge: "52 kg", repos: "2-3'", consignes: "--" },
        { nom: "HSP pompes mur (réduit)", format: "2×10", rpe: "7", charge: "PDC", repos: "90\"", consignes: "Amplitude complète" },
        { nom: "Handstand libre (essais, réduit)", format: "5 essais", rpe: "--", charge: "PDC", repos: "30-45\"", consignes: "Bilan durée max" },
        { nom: "Planche + FL (réduit)", format: "3×8s", rpe: "7", charge: "PDC", repos: "90\"", consignes: "Rétroversion bassin" },
        { nom: "L-sit parallettes", format: "2×20s", rpe: "7", charge: "PDC", repos: "60\"", consignes: "--" },
      ],
    },
    {
      shortLabel: "DIM", type: "MINI-DELOAD + Bilan Bloc", label: "Charges S1 — EMOM 12 min — Bilan", duration: "~50 min", color: "#A855F7",
      exercises: [
        { nom: "Curl barre (deload)", format: "2×8", rpe: "6", charge: "35 kg", repos: "2'", consignes: "Charges S1 — récupération" },
        { nom: "Curl marteau (deload)", format: "2×10", rpe: "6", charge: "18 kg/bras", repos: "2'", consignes: "--" },
        { nom: "Triceps OH (deload)", format: "2×10", rpe: "6", charge: "30 kg", repos: "2'", consignes: "--" },
        { nom: "Row unilatéral (deload)", format: "2×10", rpe: "6", charge: "24 kg", repos: "90\"", consignes: "--" },
        { nom: "Pompes lestées (deload)", format: "2×10", rpe: "6", charge: "+10 kg", repos: "90\"", consignes: "--" },
        { nom: "EMOM 12 min (3 tours)", format: "Thrusters×8 / Trac×5 / KB×12 / Pompes×12", rpe: "6-7", charge: "@30 / PDC / @20 / PDC", repos: "--", consignes: "Charges S1 — BILAN BLOC" },
        { nom: "Hollow body hold", format: "2×30s", rpe: "6", charge: "PDC", repos: "60\"", consignes: "--" },
        { nom: "Dead bug", format: "2×8/côté", rpe: "6", charge: "PDC", repos: "45\"", consignes: "--" },
      ],
    },
  ],
};

// ─── Day Accordion ────────────────────────────────────────────────────────────

function DayAccordion({
  jour, dayIndex, weekNum, isExpanded, onToggle, notes, onUpdateNote, isToday,
}: {
  jour: JourBloc1; dayIndex: number; weekNum: number;
  isExpanded: boolean; onToggle: () => void;
  notes: Record<string, string>;
  onUpdateNote: (exIndex: number, value: string) => void;
  isToday: boolean;
}) {
  return (
    <Card style={{ border: `1px solid ${isExpanded ? jour.color + "70" : isToday ? jour.color + "40" : BORDER}`, backgroundColor: CARD_BG }}>
      <button className="w-full text-left" onClick={onToggle}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-1">
                <span
                  className="text-xs font-black px-2.5 py-1 rounded-lg"
                  style={{ backgroundColor: jour.color + "20", color: jour.color }}
                >
                  {jour.shortLabel}
                </span>
                {isToday && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: jour.color, color: "#fff" }}>
                    AUJOURD&apos;HUI
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{jour.type}</p>
                <p className="text-xs mt-0.5" style={{ color: MUTED }}>{jour.label}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "#F5F5F5", color: MUTED }}>{jour.duration}</span>
              <span className="text-sm" style={{ color: MUTED }}>{isExpanded ? "▲" : "▼"}</span>
            </div>
          </div>
        </CardContent>
      </button>
      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[900px]">
                <thead>
                  <tr style={{ backgroundColor: "#F8F8F8", borderBottom: `1px solid ${BORDER}` }}>
                    {["Exercice", "Format", "RPE", "Charge cible", "Repos", "Consignes techniques", "✏️ Notes séance"].map((h) => (
                      <th key={h} className="text-left px-3 py-2.5 font-semibold" style={{ color: MUTED }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {jour.exercises.map((ex, ei) => {
                    const noteKey = `${weekNum}_${dayIndex}_${ei}`;
                    return (
                      <tr key={ei} style={{ borderBottom: ei < jour.exercises.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                        <td className="px-3 py-2.5 font-semibold text-gray-900 max-w-[160px]">{ex.nom}</td>
                        <td className="px-3 py-2.5 font-black whitespace-nowrap" style={{ color: jour.color }}>{ex.format}</td>
                        <td className="px-3 py-2.5 font-medium whitespace-nowrap" style={{ color: ex.rpe === "--" ? MUTED : "#EF4444" }}>{ex.rpe}</td>
                        <td className="px-3 py-2.5 font-semibold text-gray-900 whitespace-nowrap">{ex.charge}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: MUTED }}>{ex.repos}</td>
                        <td className="px-3 py-2.5 text-gray-600 max-w-[200px]">{ex.consignes}</td>
                        <td className="px-3 py-2.5 w-[180px]">
                          <input
                            type="text"
                            placeholder="Charge réelle, RPE, notes..."
                            value={notes[noteKey] || ""}
                            onChange={(e) => onUpdateNote(ei, e.target.value)}
                            className="w-full text-xs px-2 py-1.5 rounded-lg border outline-none focus:ring-1 transition-all"
                            style={{
                              borderColor: notes[noteKey] ? jour.color + "60" : BORDER,
                              backgroundColor: notes[noteKey] ? jour.color + "08" : "#F8F8F8",
                              color: "#333",
                            }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Tab: Objectifs ───────────────────────────────────────────────────────────

const OBJECTIFS_FORCE = [
  { lift: "Bench haltères", actuel: "58 kg/main", bloc1: "60 kg/main", bloc2: "62-64 kg/main", pct: 75 },
  { lift: "Bench barre", actuel: "~125 kg", bloc1: "127-130 kg", bloc2: "132-135 kg", pct: 70 },
  { lift: "Dips lestés", actuel: "+100 kg", bloc1: "+102-105 kg", bloc2: "+107-110 kg", pct: 65 },
  { lift: "Tractions pronation", actuel: "+45 kg (bras)", bloc1: "+35 kg dorsaux", bloc2: "+40-42 kg", pct: 30 },
  { lift: "Back Squat", actuel: "150×1 technique bof", bloc1: "140×3 propre", bloc2: "150×2-3 propre", pct: 50 },
  { lift: "OHP barre", actuel: "65 kg", bloc1: "65×3", bloc2: "67-68 kg", pct: 60 },
];

const OBJECTIFS_CALI = [
  { move: "HSP (pompes mur)", cible: "30 reps consécutives", status: "En cours" },
  { move: "HS libre", cible: "15 secondes+", status: "En cours" },
  { move: "Planche avancée tuck", cible: "5-8 secondes", status: "En cours" },
];

const WEEK_CHARGES: Record<number, { exercice: string; format: string; charge: string }[]> = {
  1: [
    { exercice: "Bench halt FORCE", format: "2×4", charge: "50 kg/main" },
    { exercice: "Bench halt BO", format: "1×6-8", charge: "42-44 kg/main" },
    { exercice: "Trac prona FORCE", format: "2×4-5", charge: "+15-18 kg" },
    { exercice: "Trac BO", format: "1×6-8", charge: "+8-10 kg" },
    { exercice: "Back Squat", format: "2×4-5", charge: "110-115 kg" },
    { exercice: "Squat BO", format: "1×6-8", charge: "88-95 kg" },
    { exercice: "Dips VOL", format: "2×8", charge: "+65-70 kg" },
    { exercice: "Bench barre VOL", format: "2×6", charge: "92-95 kg" },
    { exercice: "Trac supi VOL", format: "4×6-8", charge: "+12-15 kg" },
    { exercice: "OHP halt VOL", format: "2×10", charge: "26 kg/main" },
    { exercice: "Dips FORCE", format: "2×3", charge: "+80 kg" },
    { exercice: "OHP barre FORCE", format: "2×5", charge: "55-58 kg" },
    { exercice: "RDL belt", format: "2×6", charge: "100 kg" },
    { exercice: "Curl barre", format: "2×8+dég", charge: "40-42 kg" },
    { exercice: "Pompes lestées", format: "3×10-12", charge: "+10 kg" },
  ],
  2: [
    { exercice: "Bench halt FORCE", format: "2×3-4", charge: "52-54 kg/main" },
    { exercice: "Trac prona FORCE", format: "2×4", charge: "+20-24 kg" },
    { exercice: "Back Squat", format: "2×4", charge: "118-122 kg" },
    { exercice: "Dips VOL", format: "2×6-8", charge: "+72-75 kg" },
    { exercice: "Bench barre VOL", format: "2×6", charge: "95-97 kg" },
    { exercice: "Trac supi VOL", format: "4×6-8", charge: "+15-18 kg" },
    { exercice: "OHP halt VOL", format: "3×8-10", charge: "28 kg/main" },
    { exercice: "Dips FORCE", format: "2×3", charge: "+85 kg" },
    { exercice: "OHP barre FORCE", format: "2×4-5", charge: "58-60 kg" },
    { exercice: "RDL belt", format: "2×5-6", charge: "105-108 kg" },
    { exercice: "Curl barre", format: "3×6+dég", charge: "43-45 kg" },
    { exercice: "Pompes lestées", format: "3×12", charge: "+12 kg" },
  ],
  3: [
    { exercice: "Bench halt FORCE", format: "2×3", charge: "54-56 kg/main" },
    { exercice: "Trac prona FORCE", format: "2×3-4", charge: "+25-28 kg" },
    { exercice: "Back Squat", format: "2×3-4", charge: "125-130 kg" },
    { exercice: "Dips VOL", format: "2×5-6", charge: "+76-80 kg" },
    { exercice: "Bench barre VOL", format: "2×6", charge: "98-100 kg" },
    { exercice: "Trac supi VOL", format: "4×6", charge: "+18-22 kg" },
    { exercice: "OHP halt VOL", format: "3×8", charge: "30 kg/main" },
    { exercice: "Dips FORCE", format: "2×3 + single", charge: "+88-90 kg / single +95-100" },
    { exercice: "OHP barre FORCE", format: "2×3-4", charge: "60-62 kg" },
    { exercice: "RDL belt", format: "2×5", charge: "110-112 kg" },
    { exercice: "Curl barre", format: "3×5-6+dég", charge: "45-46 kg" },
    { exercice: "Pompes lestées", format: "3×12-15", charge: "+15 kg" },
  ],
  4: [
    { exercice: "Bench halt FORCE", format: "2×2 + single", charge: "56-58 kg/main / single 58-60" },
    { exercice: "Trac prona FORCE", format: "2×2-3", charge: "+30-35 kg" },
    { exercice: "Back Squat", format: "2×3", charge: "130-135 kg" },
    { exercice: "Dips VOL", format: "2×5 + tempo 1×3", charge: "+80-82 kg" },
    { exercice: "Bench barre VOL", format: "2×6", charge: "100-102 kg" },
    { exercice: "Trac supi VOL", format: "4×6", charge: "+22-25 kg" },
    { exercice: "OHP halt VOL", format: "3×6-8", charge: "32 kg/main" },
    { exercice: "Dips FORCE", format: "2×2-3 + single", charge: "+92-95 kg / single +100-105" },
    { exercice: "OHP barre FORCE", format: "2×3", charge: "62-65 kg" },
    { exercice: "RDL belt", format: "2×5", charge: "112-115 kg" },
    { exercice: "Curl barre", format: "2×8 (deload)", charge: "35 kg" },
    { exercice: "Pompes lestées", format: "2×10 (deload)", charge: "+10 kg" },
  ],
};

function ObjectifsTab() {
  return (
    <div className="space-y-6">
      {/* Physique */}
      <div className="grid grid-cols-2 gap-4">
        <Card style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(29,185,84,0.15)" }}>
                <Target className="w-4 h-4" style={{ color: ACCENT }} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">Physique — Fin Bloc 2</p>
                <p className="text-xs" style={{ color: MUTED }}>Sèche en cours</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Poids cible</span>
                <span className="text-sm font-bold text-gray-900">66 kg max</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Poids actuel</span>
                <span className="text-sm font-bold" style={{ color: ACCENT }}>66.5 kg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">BF cible</span>
                <span className="text-sm font-bold text-gray-900">10-11%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">BF actuel estimé</span>
                <span className="text-sm font-bold" style={{ color: ACCENT }}>12-13%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(156,39,176,0.15)" }}>
                <Flame className="w-4 h-4" style={{ color: "#9C27B0" }} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">Callisthénie — Fin Bloc 1</p>
                <p className="text-xs" style={{ color: MUTED }}>Skills gymniques</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {OBJECTIFS_CALI.map((c) => (
                <div key={c.move} className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-900">{c.move}</p>
                    <p className="text-xs" style={{ color: MUTED }}>{c.cible}</p>
                  </div>
                  <Badge className="text-xs" style={{ backgroundColor: "rgba(156,39,176,0.15)", color: "#9C27B0", border: "none" }}>
                    {c.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Force */}
      <Card style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: ACCENT }} />
            Objectifs Force — Bloc 1 & Bloc 2
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                {["Lift", "Actuel", "Cible Bloc 1", "Cible Bloc 2", "Progression"].map((h) => (
                  <th key={h} className="text-left text-xs font-medium px-4 py-3" style={{ color: MUTED }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {OBJECTIFS_FORCE.map((row, i) => (
                <tr key={row.lift} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: i < OBJECTIFS_FORCE.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{row.lift}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: MUTED }}>{row.actuel}</td>
                  <td className="px-4 py-3 text-sm font-medium" style={{ color: ACCENT }}>{row.bloc1}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: "#4C9FFF" }}>{row.bloc2}</td>
                  <td className="px-4 py-3 w-36">
                    <div className="flex items-center gap-2">
                      <Progress value={row.pct} className="h-1.5 flex-1" style={{ backgroundColor: BORDER }} />
                      <span className="text-xs font-medium" style={{ color: row.pct >= 70 ? ACCENT : MUTED }}>{row.pct}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Tab: Plan Course ─────────────────────────────────────────────────────────

const SEANCES_COURSE = [
  {
    jour: "Mardi", type: "Z2 endurance", couleur: "#1DB954",
    details: [
      "S1: 25-30 min @ 6:00-6:30/km",
      "S2: 30-35 min @ 5:50-6:10/km",
      "S3: 35-40 min @ 5:40-5:50/km",
      "S4: 35-40 min Z2 léger (pas de fractionné — mini-deload)",
    ],
    note: "À jeun si possible le matin. Garder Z2 strict — conversation possible tout le long.",
  },
  {
    jour: "Vendredi", type: "Fractionné Z4-Z5", couleur: "#F59E0B",
    details: [
      "S1: 6×1' effort Z4-Z5 / 1' récup",
      "S2: 8×1' effort Z4-Z5 / 1' récup",
      "S3: 8×1'30 effort Z4-Z5 / 1' récup",
      "S4: Z2 léger 25-30 min seulement (deload — pas de fractionné)",
    ],
    note: "PAS à jeun. Collation 45-60min avant. Récup entre efforts : marche ou jogging très lent.",
  },
];

const PROGRES_COURSE = [
  { sem: "S1", objectif: "25-30min Z2 (Mar) + 6×1' fractionné (Ven)", fait: true },
  { sem: "S2", objectif: "30-35min Z2 (Mar) + 8×1' fractionné (Ven)", fait: false },
  { sem: "S3", objectif: "35-40min Z2 (Mar) + 8×1'30 fractionné (Ven)", fait: false },
  { sem: "S4", objectif: "Mini-deload : 2×Z2 léger 25-30min, pas de fractionné", fait: false },
];

function CourseTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Fréquence", value: "2×/sem", sub: "Mar + Ven", color: ACCENT },
          { label: "Z2 S1 cible", value: "25-30 min", sub: "6:00-6:30/km", color: "#4C9FFF" },
          { label: "Fractionné S1", value: "6×1'", sub: "Z4-Z5 / 1' récup", color: "#F59E0B" },
        ].map((stat) => (
          <Card key={stat.label} style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-xs font-medium text-gray-900 mt-0.5">{stat.sub}</p>
              <p className="text-xs mt-1" style={{ color: MUTED }}>{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {SEANCES_COURSE.map((s) => (
          <Card key={s.jour} style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${s.couleur}20` }}>
                    <Wind className="w-4 h-4" style={{ color: s.couleur }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{s.jour}</p>
                    <p className="text-xs font-medium" style={{ color: s.couleur }}>{s.type}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 mb-3">
                {s.details.map((d, i) => (
                  <p key={i} className="text-xs text-gray-700">• {d}</p>
                ))}
              </div>
              <div className="rounded-lg p-2.5" style={{ backgroundColor: `${s.couleur}10`, border: `1px solid ${s.couleur}30` }}>
                <p className="text-xs" style={{ color: s.couleur }}>💡 {s.note}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-4 h-4" style={{ color: ACCENT }} />
            Progression sur le bloc
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {PROGRES_COURSE.map((p) => (
            <div key={p.sem} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: p.fait ? ACCENT : BORDER }}>
                {p.fait && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
              <span className="text-xs font-semibold text-gray-500 w-12 flex-shrink-0">{p.sem}</span>
              <span className="text-sm text-gray-700">{p.objectif}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Tab: Correctifs ──────────────────────────────────────────────────────────

const CORRECTIFS = [
  {
    exercice: "Tractions pronation",
    probleme: "Tire avec les bras (biceps) au lieu des dorsaux",
    couleur: "#EF4444",
    consignes: [
      "Avant de tirer : abaisser et rétracter les omoplates (dépression scapulaire)",
      "Initier le mouvement en pensant 'coudes vers les hanches', pas 'mains vers les épaules'",
      "Visualisation : écraser une orange sous les aisselles",
      "Exercice correctif : dead hang 3×30s + scapular pulls 3×10",
      "RPE actuel 10 à +45kg — réduire le lest jusqu'à technique propre, puis reprendre",
    ],
    objectif: "Passer de +45kg (bras) à +35kg (dorsaux) propre en Bloc 1",
  },
  {
    exercice: "Back Squat",
    probleme: "Technique à revoir — probable manque de mobilité cheville",
    couleur: "#F59E0B",
    consignes: [
      "Échauffement obligatoire : ankle circles 2×20/côté avant chaque séance jambes",
      "Drill : squat face au mur 3×10 (pieds à 10cm) pour forcer la dorsiflexion",
      "Chaussures : préférer chaussures à talonnette (weightlifting shoes) ou plaque sous talons",
      "Descente : 2 secondes contrôlées, pause en bas si besoin",
      "Charges : priorité à 140×3 PROPRE avant de monter à 150",
    ],
    objectif: "Bloc 1 : 140×3 avec technique propre. Bloc 2 : 150×2-3 propre",
  },
  {
    exercice: "OHP barre",
    probleme: "Technique à consolider avant de pousser les charges",
    couleur: "#4C9FFF",
    consignes: [
      "Grip légèrement plus large que les épaules, poignets droits (pas en hyperextension)",
      "Au départ : barre sur les deltos antérieurs, coudes légèrement en avant",
      "Poussée : path légèrement arc — partir devant le visage, finir derrière la tête",
      "Fessiers et abdos gainés pendant toute la montée (pas de lordose)",
      "Descente contrôlée 2s",
    ],
    objectif: "Bloc 1 : 65×3. Bloc 2 : 67-68 kg",
  },
];

function CorrectifsTab() {
  const [open, setOpen] = useState<string | null>(CORRECTIFS[0].exercice);
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl" style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
        <p className="text-sm text-red-700 font-medium">⚠️ Ces correctifs sont prioritaires sur l&apos;augmentation des charges. Technique d&apos;abord, kilos ensuite.</p>
      </div>
      {CORRECTIFS.map((c) => (
        <Card key={c.exercice} style={{ backgroundColor: CARD_BG, border: `1px solid ${open === c.exercice ? c.couleur + "60" : BORDER}` }}>
          <button
            className="w-full text-left"
            onClick={() => setOpen(open === c.exercice ? null : c.exercice)}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${c.couleur}15` }}>
                    <Wrench className="w-4 h-4" style={{ color: c.couleur }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{c.exercice}</p>
                    <p className="text-xs" style={{ color: c.couleur }}>{c.probleme}</p>
                  </div>
                </div>
                <span className="text-lg" style={{ color: MUTED }}>{open === c.exercice ? "▲" : "▼"}</span>
              </div>

              {open === c.exercice && (
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Consignes techniques</p>
                    <div className="space-y-1.5">
                      {c.consignes.map((cs, i) => (
                        <div key={i} className="flex gap-2">
                          <span className="text-xs font-bold flex-shrink-0" style={{ color: c.couleur }}>{i + 1}.</span>
                          <p className="text-xs text-gray-700">{cs}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg p-3" style={{ backgroundColor: `${c.couleur}10`, border: `1px solid ${c.couleur}30` }}>
                    <p className="text-xs font-semibold" style={{ color: c.couleur }}>🎯 Objectif : {c.objectif}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </button>
        </Card>
      ))}
    </div>
  );
}

// ─── Tab: Suivi Hebdo ─────────────────────────────────────────────────────────

const SEMAINE_BLOC1 = [
  { sem: 1, label: "S1", debut: "24 Mar", seances: ["Lun: Bench halt + Trac", "Mar: Run Z2", "Mer: Squat tech", "Jeu: Dips + Bench vol", "Ven: Run", "Sam: Dips FORCE + OHP", "Dim: Bras + Row"], done: [false, false, false, false, false, false, false] },
  { sem: 2, label: "S2", debut: "31 Mar", seances: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"], done: [false, false, false, false, false, false, false] },
  { sem: 3, label: "S3", debut: "7 Avr", seances: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"], done: [false, false, false, false, false, false, false] },
  { sem: 4, label: "S4", debut: "14 Avr", seances: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"], done: [false, false, false, false, false, false, false] },
];

const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const JOUR_COLORS = ["#4C9FFF", "#EF4444", "#F59E0B", "#9C27B0", "#EF4444", "#F59E0B", "#A855F7"];

function SuiviTab() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const toggle = (key: string) => setChecked((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl" style={{ backgroundColor: "rgba(29,185,84,0.08)", border: "1px solid rgba(29,185,84,0.2)" }}>
        <p className="text-sm text-green-700 font-medium">Coche chaque séance effectuée. Objectif : 7 séances / semaine.</p>
      </div>

      {SEMAINE_BLOC1.map((sem) => {
        const doneCount = JOURS.filter((_, i) => checked[`${sem.sem}-${i}`]).length;
        const pct = Math.round((doneCount / 7) * 100);
        return (
          <Card key={sem.sem} style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-gray-900">{sem.label} — semaine du {sem.debut}</p>
                  <p className="text-xs" style={{ color: MUTED }}>{doneCount}/7 séances</p>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={pct} className="w-24 h-2" style={{ backgroundColor: BORDER }} />
                  <span className="text-xs font-bold" style={{ color: pct >= 80 ? ACCENT : MUTED }}>{pct}%</span>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {JOURS.map((jour, i) => {
                  const key = `${sem.sem}-${i}`;
                  const isDone = checked[key];
                  return (
                    <button
                      key={jour}
                      onClick={() => toggle(key)}
                      className="rounded-lg py-2 flex flex-col items-center gap-1 transition-all"
                      style={{
                        backgroundColor: isDone ? JOUR_COLORS[i] + "20" : "#F5F5F5",
                        border: `1px solid ${isDone ? JOUR_COLORS[i] : BORDER}`,
                      }}
                    >
                      <span className="text-xs font-bold" style={{ color: isDone ? JOUR_COLORS[i] : MUTED }}>{jour}</span>
                      <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: isDone ? JOUR_COLORS[i] : BORDER }}>
                        {isDone && <span className="text-white text-xs">✓</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
              {JOURS.some((_, i) => checked[`${sem.sem}-${i}`]) && (
                <div className="mt-3 space-y-1.5 border-t pt-3" style={{ borderColor: BORDER }}>
                  <p className="text-xs font-medium text-gray-500 mb-2">Notes de séance :</p>
                  {JOURS.map((jour, i) => {
                    const key = `${sem.sem}-${i}`;
                    if (!checked[key]) return null;
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-xs font-bold w-8 flex-shrink-0" style={{ color: JOUR_COLORS[i] }}>{jour}</span>
                        <input
                          type="text"
                          placeholder="Charge réelle, RPE, notes..."
                          value={notes[key] || ''}
                          onChange={(e) => setNotes((p) => ({ ...p, [key]: e.target.value }))}
                          className="flex-1 text-xs px-2 py-1.5 rounded-lg border outline-none"
                          style={{ borderColor: BORDER, color: '#333', backgroundColor: '#F8F8F8' }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProgrammesPage() {
  const [activeTab, setActiveTab] = useState<ProgramTab>("programme");
  const [program, setProgram] = useState<Program | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeWeek, setActiveWeek] = useState(1);
  const [expandedDays, setExpandedDays] = useState<number[]>(() => {
    const dow = new Date().getDay(); // 0=Sun,1=Mon,...,6=Sat
    const todayIdx = (dow + 6) % 7; // 0=Lun,...,6=Dim
    return [todayIdx];
  });
  const [seanceNotes, setSeanceNotes] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem("bloc1_seance_notes") || "{}"); } catch { return {}; }
  });

  const updateSeanceNote = (weekNum: number, dayIndex: number, exIndex: number, value: string) => {
    setSeanceNotes((prev) => {
      const next = { ...prev, [`${weekNum}_${dayIndex}_${exIndex}`]: value };
      try { localStorage.setItem("bloc1_seance_notes", JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  const toggleDay = (dayIndex: number) => {
    setExpandedDays((prev) => prev.includes(dayIndex) ? prev.filter((d) => d !== dayIndex) : [...prev, dayIndex]);
  };

  const todayDayIndex = (() => { const dow = new Date().getDay(); return (dow + 6) % 7; })();

  useEffect(() => {
    fetch("/api/programme")
      .then((r) => r.json())
      .then((data) => { setProgram(data); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, []);

  const save = async () => {
    if (!program) return;
    setIsSaving(true);
    try {
      await fetch("/api/programme", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(program) });
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally { setIsSaving(false); }
  };

  const handleExportJSON = () => {
    if (!program) return;
    const blob = new Blob([JSON.stringify(program, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `programme-${program.name.replace(/\s+/g, "-").toLowerCase()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const cancelEdit = () => { fetch("/api/programme").then((r) => r.json()).then(setProgram); setIsEditing(false); };

  const updateExercise = (dayId: string, exId: string, field: keyof ProgramExercise, value: string) =>
    setProgram((p) => p ? { ...p, days: p.days.map((d) => d.id === dayId ? { ...d, exercises: d.exercises.map((e) => e.id === exId ? { ...e, [field]: value } : e) } : d) } : p);

  const addExercise = (dayId: string) =>
    setProgram((p) => p ? { ...p, days: p.days.map((d) => d.id === dayId ? { ...d, exercises: [...d.exercises, { id: `ex_${Date.now()}`, name: "Nouvel exercice", sets: "3×10", rest: "90s" }] } : d) } : p);

  const deleteExercise = (dayId: string, exId: string) =>
    setProgram((p) => p ? { ...p, days: p.days.map((d) => d.id === dayId ? { ...d, exercises: d.exercises.filter((e) => e.id !== exId) } : d) } : p);

  const updateDay = (dayId: string, field: keyof ProgramDay, value: string) =>
    setProgram((p) => p ? { ...p, days: p.days.map((d) => d.id === dayId ? { ...d, [field]: value } : d) } : p);

  const updateProgramField = (field: keyof Program, value: string | number) =>
    setProgram((p) => (p ? { ...p, [field]: value } : p));

  const progressPct = program ? Math.round((program.currentWeek / program.weeks) * 100) : 0;

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: ACCENT, borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Programmes</h1>
          <p style={{ color: MUTED }} className="mt-1 text-sm">Bloc 1 — Hybride Force / Cardio / Callisthénie · 4 semaines</p>
        </div>
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: "rgba(29,185,84,0.15)", color: ACCENT }}>
              <CheckCircle2 className="w-4 h-4" /> Synchronisé avec le mobile
            </div>
          )}
          {activeTab === "programme" && (
            isEditing ? (
              <>
                <Button onClick={cancelEdit} variant="outline" className="flex items-center gap-2" style={{ borderColor: BORDER, color: MUTED, backgroundColor: "transparent" }}>
                  <X className="w-4 h-4" /> Annuler
                </Button>
                <Button onClick={save} disabled={isSaving} className="flex items-center gap-2 font-semibold" style={{ backgroundColor: ACCENT, color: BG }}>
                  <Save className="w-4 h-4" /> {isSaving ? "Sauvegarde..." : "Enregistrer & Sync"}
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setIsEditing(true)} variant="outline" className="flex items-center gap-2" style={{ borderColor: BORDER, color: MUTED, backgroundColor: "transparent" }}>
                  <Pencil className="w-4 h-4" /> Modifier
                </Button>
                <Button style={{ backgroundColor: ACCENT, color: BG }} className="font-semibold flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Nouveau bloc
                </Button>
              </>
            )
          )}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 border-b" style={{ borderColor: BORDER }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all relative"
            style={{ color: activeTab === tab.key ? ACCENT : MUTED }}
          >
            {tab.icon}
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: ACCENT }} />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "programme" && program && (
        <div className="space-y-6">
          {/* Program card */}
          <Card style={{ backgroundColor: CARD_BG, border: `1px solid ${isEditing ? ACCENT + "50" : BORDER}` }}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(29,185,84,0.15)" }}>
                    <Dumbbell className="w-6 h-6" style={{ color: ACCENT }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {isEditing ? (
                        <input value={program.name} onChange={(e) => updateProgramField("name", e.target.value)} className="text-xl font-bold bg-transparent text-gray-900 border-b outline-none pb-0.5" style={{ borderColor: ACCENT, minWidth: 280 }} />
                      ) : (
                        <h2 className="text-xl font-bold text-gray-900">{program.name}</h2>
                      )}
                      <Badge style={{ backgroundColor: ACCENT, color: BG }} className="text-xs font-bold">ACTIF</Badge>
                    </div>
                    {isEditing ? (
                      <div className="flex gap-3 mt-1">
                        <input value={program.frequency} onChange={(e) => updateProgramField("frequency", e.target.value)} placeholder="Fréquence" className="text-sm bg-transparent border-b outline-none pb-0.5 w-20" style={{ borderColor: BORDER, color: MUTED }} />
                        <input value={program.focus} onChange={(e) => updateProgramField("focus", e.target.value)} placeholder="Objectif" className="text-sm bg-transparent border-b outline-none pb-0.5 w-40" style={{ borderColor: BORDER, color: MUTED }} />
                      </div>
                    ) : (
                      <p style={{ color: MUTED }} className="text-sm mt-0.5">{program.frequency} · {program.focus}</p>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <span className="text-gray-900 font-bold">S</span>
                      <input type="number" value={program.currentWeek} onChange={(e) => updateProgramField("currentWeek", Number(e.target.value))} className="text-2xl font-bold bg-transparent text-gray-900 border-b outline-none w-8 text-center" style={{ borderColor: ACCENT }} />
                      <span className="text-gray-900 font-bold">/</span>
                      <input type="number" value={program.weeks} onChange={(e) => updateProgramField("weeks", Number(e.target.value))} className="text-2xl font-bold bg-transparent text-gray-900 border-b outline-none w-8 text-center" style={{ borderColor: ACCENT }} />
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">S{program.currentWeek}/{program.weeks}</p>
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

          {/* Week Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            {BLOC1_WEEKS_INFO.map((w) => (
              <button
                key={w.num}
                onClick={() => { setActiveWeek(w.num); setExpandedDays([]); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  backgroundColor: activeWeek === w.num ? ACCENT : "#F0F0F0",
                  color: activeWeek === w.num ? "#FFFFFF" : MUTED,
                  border: `2px solid ${activeWeek === w.num ? ACCENT : "transparent"}`,
                }}
              >
                <span>{w.label}</span>
                <span className="text-xs font-medium opacity-80">— {w.sublabel}</span>
              </button>
            ))}
            <span className="text-xs ml-2" style={{ color: MUTED }}>
              {BLOC1_WEEKS_INFO[activeWeek - 1].description}
            </span>
          </div>

          {/* Day Accordions */}
          <div className="space-y-3">
            {BLOC1_PROGRAMME[activeWeek].map((jour, di) => (
              <DayAccordion
                key={di}
                jour={jour}
                dayIndex={di}
                weekNum={activeWeek}
                isExpanded={expandedDays.includes(di)}
                onToggle={() => toggleDay(di)}
                notes={seanceNotes}
                onUpdateNote={(exIndex, value) => updateSeanceNote(activeWeek, di, exIndex, value)}
                isToday={di === todayDayIndex}
              />
            ))}
          </div>

          {/* Sync */}
          <Card style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(29,185,84,0.15)" }}>
                    <span className="text-sm">📱</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Synchronisation Mobile</p>
                    <p className="text-xs" style={{ color: MUTED }}>L&apos;app mobile se met à jour via <code className="px-1 py-0.5 rounded text-xs" style={{ backgroundColor: "#F0F0F0", color: ACCENT }}>/api/programme</code></p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleExportJSON} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: "#E5E5E5", color: "#555555" }}>
                    <Download className="w-3.5 h-3.5" /> JSON
                  </button>
                  <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: "#E5E5E5", color: "#555555" }}>
                    <Printer className="w-3.5 h-3.5" /> PDF
                  </button>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium" style={{ backgroundColor: "rgba(29,185,84,0.1)", color: ACCENT }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> API active
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Archived */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Archive className="w-5 h-5" style={{ color: MUTED }} /> Blocs archivés
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {archivedPrograms.map((prog, i) => (
                <Card key={i} style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#E5E5E5" }}>
                        <Dumbbell className="w-4 h-4" style={{ color: MUTED }} />
                      </div>
                      <Badge variant="outline" className="text-xs" style={{ borderColor: BORDER, color: MUTED }}>Terminé</Badge>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">{prog.name}</h3>
                    <p className="text-xs" style={{ color: MUTED }}>{prog.duration} · {prog.period}</p>
                    <p className="text-xs mt-1" style={{ color: ACCENT }}>{prog.focus}</p>
                    <Button variant="outline" size="sm" className="w-full mt-3 text-xs" style={{ borderColor: BORDER, color: MUTED, backgroundColor: "transparent" }}>Consulter</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "objectifs" && <ObjectifsTab />}
      {activeTab === "course" && <CourseTab />}
      {activeTab === "correctifs" && <CorrectifsTab />}
      {activeTab === "suivi" && <SuiviTab />}
    </div>
  );
}
