"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Dumbbell,
  Scale,
  Flame,
  Calendar,
} from "lucide-react";
import { useUserStore } from "@/lib/userStore";
import type { SavedSeance } from "@/lib/seanceState";
import { createClient as createSupabaseClient } from "@/utils/supabase/client";

const ACCENT = "#1DB954";
const CARD_BG = "#FFFFFF";
const BORDER = "#E5E5E5";
const MUTED = "#666666";

const LIFT_OPTIONS = ["Bench", "Dips", "Tractions", "Squat", "OHP"] as const;
type LiftOption = (typeof LIFT_OPTIONS)[number];

const getWeekStart = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
};

const toISO = (date: Date) => date.toISOString().split("T")[0];
const weekLabel = (start: Date) => `S${Math.ceil((start.getDate() + 6) / 7)}`;

type WeeklyRow = {
  semaine: number;
  jour: string;
  poids: number | null;
  calories: number | null;
};

const muscleFromExercise = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("bench") || n.includes("dips") || n.includes("pompes")) return "Poitrine";
  if (n.includes("tractions") || n.includes("trac") || n.includes("row")) return "Dos";
  if (n.includes("squat") || n.includes("leg") || n.includes("fente")) return "Jambes";
  if (n.includes("ohp") || n.includes("elevation") || n.includes("shoulder")) return "Épaules";
  if (n.includes("curl") || n.includes("triceps") || n.includes("biceps")) return "Bras";
  if (n.includes("ab") || n.includes("gainage") || n.includes("crunch")) return "Abdos";
  return "Bras";
};

export default function DashboardPage() {
  const { profile } = useUserStore();
  const [seances, setSeances] = useState<SavedSeance[]>([]);
  const [selectedLift, setSelectedLift] = useState<LiftOption>("Bench");
  const [weeklyRows, setWeeklyRows] = useState<WeeklyRow[]>([]);

  useEffect(() => {
    const runId = `run_${Date.now()}`;
    const load = () =>
      fetch("/api/seances")
        .then(async (r) => {
          const payload = await r.json();
          // #region agent log
          fetch("http://127.0.0.1:7752/ingest/cb263419-a4c8-413d-beba-702a940871fa", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "44a1c0" }, body: JSON.stringify({ sessionId: "44a1c0", runId, hypothesisId: "H2", location: "app/page.tsx:88", message: "seances_api_response", data: { ok: r.ok, status: r.status, isArray: Array.isArray(payload), length: Array.isArray(payload) ? payload.length : -1 }, timestamp: Date.now() }) }).catch(() => {});
          // #endregion
          return payload;
        })
        .then((d) => setSeances(Array.isArray(d) ? d : []))
        .catch((error) => {
          // #region agent log
          fetch("http://127.0.0.1:7752/ingest/cb263419-a4c8-413d-beba-702a940871fa", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "44a1c0" }, body: JSON.stringify({ sessionId: "44a1c0", runId, hypothesisId: "H2", location: "app/page.tsx:95", message: "seances_api_error", data: { message: error instanceof Error ? error.message : String(error) }, timestamp: Date.now() }) }).catch(() => {});
          // #endregion
          setSeances([]);
        });
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const runId = `run_${Date.now()}`;
    const loadWeekly = () =>
      fetch("/api/weekly-tracking")
        .then(async (r) => {
          const rows = await r.json();
          // #region agent log
          fetch("http://127.0.0.1:7752/ingest/cb263419-a4c8-413d-beba-702a940871fa", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "44a1c0" }, body: JSON.stringify({ sessionId: "44a1c0", runId, hypothesisId: "H2", location: "app/page.tsx:109", message: "weekly_api_response", data: { ok: r.ok, status: r.status, isArray: Array.isArray(rows), length: Array.isArray(rows) ? rows.length : -1 }, timestamp: Date.now() }) }).catch(() => {});
          // #endregion
          return rows;
        })
        .then((rows: WeeklyRow[]) => setWeeklyRows(Array.isArray(rows) ? rows : []))
        .catch((error) => {
          // #region agent log
          fetch("http://127.0.0.1:7752/ingest/cb263419-a4c8-413d-beba-702a940871fa", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "44a1c0" }, body: JSON.stringify({ sessionId: "44a1c0", runId, hypothesisId: "H2", location: "app/page.tsx:116", message: "weekly_api_error", data: { message: error instanceof Error ? error.message : String(error) }, timestamp: Date.now() }) }).catch(() => {});
          // #endregion
          setWeeklyRows([]);
        });
    loadWeekly();
    const supabase = createSupabaseClient();
    const channel = supabase
      .channel("dashboard-weekly")
      .on("postgres_changes", { event: "*", schema: "public", table: "weekly_tracking" }, () => loadWeekly())
      .on("postgres_changes", { event: "*", schema: "public", table: "workouts" }, () => {
        fetch("/api/seances")
          .then((r) => r.json())
          .then((d) => setSeances(Array.isArray(d) ? d : []))
          .catch(() => {});
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const data = useMemo(() => {
    const nowWeekStart = getWeekStart();
    const lastWeekStart = new Date(nowWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const nowIso = toISO(nowWeekStart);
    const lastIso = toISO(lastWeekStart);

    const weeklyMap = new Map<string, SavedSeance[]>();
    seances.forEach((s) => {
      const ws = toISO(getWeekStart(new Date(s.date)));
      weeklyMap.set(ws, [...(weeklyMap.get(ws) || []), s]);
    });

    const currentWeekSeances = weeklyMap.get(nowIso) || [];
    const previousWeekSeances = weeklyMap.get(lastIso) || [];
    const sessionsThisWeek = currentWeekSeances.length;
    const sessionsTrend = sessionsThisWeek - previousWeekSeances.length;
    const totalVolume = Math.round(currentWeekSeances.reduce((acc, s) => acc + (s.totalVolume || 0), 0));

    const weekIdx = Math.max(1, Math.min(4, Math.floor((new Date().getDate() - 1) / 7) + 1));
    const prevIdx = Math.max(1, weekIdx - 1);
    const weekWeightVals = weeklyRows.filter((r) => r.semaine === weekIdx && r.poids !== null).map((r) => Number(r.poids));
    const prevWeekWeightVals = weeklyRows.filter((r) => r.semaine === prevIdx && r.poids !== null).map((r) => Number(r.poids));
    const allWeightVals = weeklyRows.filter((r) => r.poids !== null).map((r) => Number(r.poids));
    const latestWeight = weekWeightVals.length
      ? weekWeightVals[weekWeightVals.length - 1]
      : allWeightVals.length
        ? allWeightVals[allWeightVals.length - 1]
        : profile.weight;
    const currentWeekWeightAvg = weekWeightVals.length ? weekWeightVals.reduce((a, b) => a + b, 0) / weekWeightVals.length : null;
    const prevWeekWeightAvg = prevWeekWeightVals.length ? prevWeekWeightVals.reduce((a, b) => a + b, 0) / prevWeekWeightVals.length : null;

    const caloriesVals = weeklyRows.filter((r) => r.semaine === weekIdx && r.calories !== null).map((r) => Number(r.calories));
    const allCaloriesVals = weeklyRows.filter((r) => r.calories !== null).map((r) => Number(r.calories));
    const avgCalories = caloriesVals.length
      ? Math.round(caloriesVals.reduce((a, b) => a + b, 0) / caloriesVals.length)
      : allCaloriesVals.length
        ? Math.round(allCaloriesVals.reduce((a, b) => a + b, 0) / allCaloriesVals.length)
        : profile.macros.kcal;

    const weeklyVolumeData = [...weeklyMap.entries()]
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .slice(-8)
      .map(([w, list]) => ({ week: weekLabel(new Date(w)), volume: Math.round(list.reduce((acc, s) => acc + s.totalVolume, 0)) }));

    const liftToken: Record<LiftOption, string[]> = {
      Bench: ["bench", "développé couché"],
      Dips: ["dips"],
      Tractions: ["traction", "trac"],
      Squat: ["squat"],
      OHP: ["ohp", "overhead press", "military press"],
    };
    const benchPressData = [...weeklyMap.entries()]
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .slice(-8)
      .map(([w, list]) => {
        const maxKg = list.flatMap((s) => s.exercises).flatMap((e) => e.sets.map((st) => ({ ...st, name: e.name })))
          .filter((st) => st.done && liftToken[selectedLift].some((token) => st.name.toLowerCase().includes(token)))
          .reduce((m, st) => Math.max(m, st.weight || 0), 0);
        return { week: weekLabel(new Date(w)), kg: maxKg || 0 };
      });

    const bodyWeightData = [1, 2, 3, 4].map((w) => {
      const vals = weeklyRows.filter((r) => r.semaine === w && r.poids !== null).map((r) => Number(r.poids));
      const mean = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      return { date: `S${w}`, kg: Number(mean.toFixed(1)) };
    });

    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const muscleCounts: Record<string, number> = { Poitrine: 0, Dos: 0, Jambes: 0, Épaules: 0, Bras: 0, Abdos: 0 };
    seances.filter((s) => new Date(s.date) >= monthAgo).forEach((s) => {
      s.exercises.forEach((ex) => {
        const doneSets = ex.sets.filter((set) => set.done).length;
        muscleCounts[muscleFromExercise(ex.name)] += doneSets;
      });
    });
    const muscleFrequencyData = Object.entries(muscleCounts).map(([subject, A]) => ({ subject, A }));

    return {
      sessionsThisWeek,
      sessionsTrend,
      totalVolume,
      latestWeight: Number(latestWeight.toFixed(1)),
      weightDiff: currentWeekWeightAvg !== null && prevWeekWeightAvg !== null ? Number((currentWeekWeightAvg - prevWeekWeightAvg).toFixed(1)) : null,
      avgCalories,
      benchPressData,
      weeklyVolumeData,
      bodyWeightData,
      muscleFrequencyData,
      recentSessions: seances.slice(0, 6),
    };
  }, [profile.macros.kcal, profile.weight, seances, selectedLift, weeklyRows]);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1A1A1A]">Bonjour, {profile.name.split(" ")[0]} 👋</h1>
        <p style={{ color: MUTED }} className="mt-1 text-sm">
          Semaine du 3 — 9 Mars 2026
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        {/* Sessions */}
        <Card style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span style={{ color: MUTED }} className="text-xs font-medium uppercase tracking-wide">
                Séances / semaine
              </span>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "rgba(29,185,84,0.15)" }}
              >
                <Calendar className="w-4 h-4" style={{ color: ACCENT }} />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-[#1A1A1A]">
                {data.sessionsThisWeek}
              </span>
              <span style={{ color: MUTED }} className="text-sm mb-0.5">
                séances
              </span>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3" style={{ color: ACCENT }} />
              <span className="text-xs" style={{ color: ACCENT }}>
                {data.sessionsTrend >= 0 ? "+" : ""}{data.sessionsTrend} vs semaine dernière
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Volume */}
        <Card style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span style={{ color: MUTED }} className="text-xs font-medium uppercase tracking-wide">
                Volume total
              </span>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "rgba(76,155,232,0.15)" }}
              >
                <Dumbbell className="w-4 h-4" style={{ color: "#4C9BE8" }} />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-[#1A1A1A]">
                {data.totalVolume}
              </span>
              <span style={{ color: MUTED }} className="text-sm mb-0.5">
                kg
              </span>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3" style={{ color: ACCENT }} />
              <span className="text-xs" style={{ color: ACCENT }}>
                {data.totalVolume > 0 ? "Basé sur tes séances réelles" : "Aucune donnée"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Body Weight */}
        <Card style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span style={{ color: MUTED }} className="text-xs font-medium uppercase tracking-wide">
                Poids de corps
              </span>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "rgba(245,158,11,0.15)" }}
              >
                <Scale className="w-4 h-4" style={{ color: "#F59E0B" }} />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-[#1A1A1A]">
                {data.latestWeight}
              </span>
              <span style={{ color: MUTED }} className="text-sm mb-0.5">
                kg
              </span>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingDown className="w-3 h-3" style={{ color: "#F59E0B" }} />
              <span className="text-xs" style={{ color: "#F59E0B" }}>
                {data.weightDiff !== null ? `${data.weightDiff >= 0 ? "+" : ""}${data.weightDiff} kg vs semaine dernière` : "Aucune donnée"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Calories */}
        <Card style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span style={{ color: MUTED }} className="text-xs font-medium uppercase tracking-wide">
                Calories moy/jour
              </span>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "rgba(239,68,68,0.15)" }}
              >
                <Flame className="w-4 h-4" style={{ color: "#EF4444" }} />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-[#1A1A1A]">
                {data.avgCalories.toLocaleString("fr-FR")}
              </span>
              <span style={{ color: MUTED }} className="text-sm mb-0.5">
                kcal
              </span>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3" style={{ color: ACCENT }} />
              <span className="text-xs" style={{ color: ACCENT }}>
                Cible: {profile.macros.kcal.toLocaleString("fr-FR")} kcal
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Bench Press */}
        <Card style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#1A1A1A]">
              Evolution du {selectedLift}
            </CardTitle>
            <div className="flex gap-1 mt-2">
              {LIFT_OPTIONS.map((lift) => (
                <button
                  key={lift}
                  onClick={() => setSelectedLift(lift)}
                  className="px-2 py-1 rounded text-xs"
                  style={{ backgroundColor: selectedLift === lift ? ACCENT : "#ECECEC", color: selectedLift === lift ? "#fff" : MUTED }}
                >
                  {lift}
                </button>
              ))}
            </div>
            <p style={{ color: MUTED }} className="text-xs">
              8 dernières semaines (kg)
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.benchPressData}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                <XAxis dataKey="week" stroke={MUTED} tick={{ fontSize: 11 }} />
                <YAxis stroke={MUTED} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 8,
                    color: "#1A1A1A",
                  }}
                  formatter={(v) => [`${v} kg`, selectedLift]}
                />
                <Line
                  type="monotone"
                  dataKey="kg"
                  stroke={ACCENT}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: ACCENT, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: ACCENT }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Volume */}
        <Card style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#1A1A1A]">
              Volume d&apos;entraînement
            </CardTitle>
            <p style={{ color: MUTED }} className="text-xs">
              8 dernières semaines (kg)
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.weeklyVolumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                <XAxis dataKey="week" stroke={MUTED} tick={{ fontSize: 11 }} />
                <YAxis stroke={MUTED} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 8,
                    color: "#1A1A1A",
                  }}
                  formatter={(v) => [`${Number(v).toLocaleString("fr-FR")} kg`, "Volume"]}
                />
                <Bar dataKey="volume" fill={ACCENT} radius={[4, 4, 0, 0]} opacity={0.9} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Radar Chart */}
        <Card style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#1A1A1A]">
              Fréquence par groupe musculaire
            </CardTitle>
            <p style={{ color: MUTED }} className="text-xs">
              Séries effectuées ce mois
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={data.muscleFrequencyData}>
                <PolarGrid stroke={BORDER} />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: MUTED }} />
                <PolarRadiusAxis tick={{ fontSize: 10, fill: MUTED }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 8,
                    color: "#1A1A1A",
                  }}
                />
                <Radar
                  dataKey="A"
                  stroke={ACCENT}
                  fill={ACCENT}
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Body Weight Chart */}
        <Card style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#1A1A1A]">
              Evolution du poids de corps
            </CardTitle>
            <p style={{ color: MUTED }} className="text-xs">
              3 derniers mois (kg)
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.bodyWeightData}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                <XAxis dataKey="date" stroke={MUTED} tick={{ fontSize: 10 }} />
                <YAxis stroke={MUTED} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 8,
                    color: "#1A1A1A",
                  }}
                  formatter={(v) => [`${v} kg`, "Poids"]}
                />
                <Line
                  type="monotone"
                  dataKey="kg"
                  stroke="#4C9BE8"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#4C9BE8", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-[#1A1A1A]">
            Séances récentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.recentSessions.length === 0 && (
            <p className="text-sm" style={{ color: MUTED }}>Aucune donnée</p>
          )}
          {data.recentSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between rounded-lg px-4 py-3"
              style={{ backgroundColor: "#F5F5F5", border: `1px solid ${BORDER}` }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "rgba(29,185,84,0.15)" }}
                >
                  <Dumbbell className="w-5 h-5" style={{ color: ACCENT }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1A]">{session.name}</p>
                  <p className="text-xs" style={{ color: MUTED }}>
                    {session.date} · {session.exercises.length} exercices
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-right">
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1A]">{Math.round(session.totalVolume)} kg</p>
                  <p className="text-xs" style={{ color: MUTED }}>
                    volume
                  </p>
                </div>
                <div>
                  <Badge
                    variant="outline"
                    className="text-xs"
                    style={{ borderColor: BORDER, color: MUTED }}
                  >
                    {session.duration} min
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
