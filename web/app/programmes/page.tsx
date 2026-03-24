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
            {DAY_TYPE_LABELS[day.type]}
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
    details: ["Durée: 45-50 min", "Allure cible: 5:20-5:40 /km", "Zone cardiaque: Z2 (conversation possible)", "Terrain: plat ou légèrement vallonné"],
    note: "Base aérobie — le cœur du plan. Ne pas partir trop vite.",
  },
  {
    jour: "Vendredi", type: "Z2 ou Fractionné", couleur: "#F59E0B",
    details: ["Option A — Z2: 45min @ 5:20-5:40/km", "Option B — Fractionné: 10×1'30 effort / 1' récup", "Allure fractionné: 4:30-4:50/km", "Récupération: marche ou jogging très lent"],
    note: "Alterner Z2 / Fractionné semaine sur semaine. Commencer par Z2 si jambes lourdes.",
  },
];

const PROGRES_COURSE = [
  { sem: "S1-S2", objectif: "Reprise — 2×30-35min Z2", fait: true },
  { sem: "S3-S4", objectif: "Allonger — 2×40min Z2", fait: false },
  { sem: "S5-S6", objectif: "Intégrer fractionnés — 10×1'30", fait: false },
  { sem: "S7-S8", objectif: "Sortie longue 55-60min Z2 + fractionné", fait: false },
];

function CourseTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Fréquence", value: "2×/semaine", sub: "Mar + Ven", color: ACCENT },
          { label: "Allure Z2 cible", value: "5:20-5:40", sub: "min/km", color: "#4C9FFF" },
          { label: "Fractionné", value: "10×1'30", sub: "récup 1min", color: "#F59E0B" },
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

          {/* Weekly Schedule */}
          <Card style={{ backgroundColor: CARD_BG, border: `1px solid ${isEditing ? ACCENT + "50" : BORDER}` }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4" style={{ color: ACCENT }} />
                  Planning hebdomadaire
                </CardTitle>
                {isEditing && <span className="text-xs" style={{ color: MUTED }}>Cliquez pour modifier</span>}
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <div className="grid" style={{ gridTemplateColumns: `repeat(${program.days.length}, minmax(130px, 1fr))` }}>
                {program.days.map((day) => (
                  <DayColumn key={day.id} day={day} isEditing={isEditing}
                    onUpdateExercise={(exId, field, value) => updateExercise(day.id, exId, field, value)}
                    onAddExercise={() => addExercise(day.id)}
                    onDeleteExercise={(exId) => deleteExercise(day.id, exId)}
                    onUpdateDay={(field, value) => updateDay(day.id, field, value)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

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
