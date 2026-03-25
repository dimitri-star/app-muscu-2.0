"use client";

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
import {
  dashboardStats,
  benchPressData,
  weeklyVolumeData,
  muscleFrequencyData,
  bodyWeightData,
  recentSessions,
} from "@/lib/mockData";
import { useUserStore } from "@/lib/userStore";

const ACCENT = "#1DB954";
const CARD_BG = "#FFFFFF";
const BORDER = "#E5E5E5";
const MUTED = "#666666";

export default function DashboardPage() {
  const { profile } = useUserStore();

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
                {dashboardStats.sessionsThisWeek}
              </span>
              <span style={{ color: MUTED }} className="text-sm mb-0.5">
                séances
              </span>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3" style={{ color: ACCENT }} />
              <span className="text-xs" style={{ color: ACCENT }}>
                +{dashboardStats.sessionsTrend} vs semaine dernière
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
                {dashboardStats.totalVolume}
              </span>
              <span style={{ color: MUTED }} className="text-sm mb-0.5">
                kg
              </span>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3" style={{ color: ACCENT }} />
              <span className="text-xs" style={{ color: ACCENT }}>
                +8% vs semaine dernière
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
                {profile.weight}
              </span>
              <span style={{ color: MUTED }} className="text-sm mb-0.5">
                kg
              </span>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingDown className="w-3 h-3" style={{ color: "#F59E0B" }} />
              <span className="text-xs" style={{ color: "#F59E0B" }}>
                {dashboardStats.bodyWeightTrend} kg cette semaine
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
                {dashboardStats.avgCalories.toLocaleString("fr-FR")}
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
              Evolution du Bench Press
            </CardTitle>
            <p style={{ color: MUTED }} className="text-xs">
              8 dernières semaines (kg)
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={benchPressData}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                <XAxis dataKey="week" stroke={MUTED} tick={{ fontSize: 11 }} />
                <YAxis stroke={MUTED} tick={{ fontSize: 11 }} domain={[95, 125]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 8,
                    color: "#1A1A1A",
                  }}
                  formatter={(v) => [`${v} kg`, "Bench Press"]}
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
              <BarChart data={weeklyVolumeData}>
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
              <RadarChart data={muscleFrequencyData}>
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
              <LineChart data={bodyWeightData}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                <XAxis dataKey="date" stroke={MUTED} tick={{ fontSize: 10 }} />
                <YAxis stroke={MUTED} tick={{ fontSize: 11 }} domain={[65, 69]} />
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
          {recentSessions.map((session) => (
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
                  <p className="text-sm font-semibold text-[#1A1A1A]">{session.title}</p>
                  <p className="text-xs" style={{ color: MUTED }}>
                    {session.date} · {session.exercises} exercices
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-right">
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1A]">{session.volume}</p>
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
                    {session.duration}
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
