"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, TrendingUp, Calendar } from "lucide-react";
import { personalRecords } from "@/lib/mockData";
import { LineChart, Line, Tooltip } from "recharts";

const ACCENT = "#1DB954";
const CARD_BG = "#FFFFFF";
const BORDER = "#E5E5E5";
const MUTED = "#888888";

const muscleGroupTabs = ["Tous", "Poitrine", "Dos", "Jambes", "Épaules", "Bras"];

type DbRecord = {
  id: string;
  exercice: string;
  groupe: string;
  poids: number;
  reps: number;
  date: string;
  notes?: string | null;
};

type UiRecord = {
  id: string;
  exercice: string;
  groupe: string;
  poids: number;
  reps: number;
  date: string;
  notes?: string | null;
  progression: number[];
};

function fallbackRecords(): UiRecord[] {
  return personalRecords.map((record) => ({
    id: String(record.id),
    exercice: record.exercise,
    groupe: record.muscleGroup,
    poids: Number(record.weight),
    reps: Number(record.reps),
    date: record.date,
    notes: record.notes,
    progression: record.progression.map((value) => Number(value)),
  }));
}

export default function RecordsPage() {
  const [activeTab, setActiveTab] = useState("Tous");
  const [records, setRecords] = useState<UiRecord[]>(fallbackRecords);

  useEffect(() => {
    fetch("/api/records")
      .then((r) => r.json())
      .then((d: DbRecord[]) => {
        if (!Array.isArray(d) || d.length === 0) {
          setRecords(fallbackRecords());
          return;
        }
        setRecords(
          d.map((item) => ({
            id: item.id,
            exercice: item.exercice,
            groupe: item.groupe,
            poids: Number(item.poids),
            reps: Number(item.reps),
            date: item.date,
            notes: item.notes,
            progression: [Number(item.poids)],
          }))
        );
      })
      .catch(() => setRecords(fallbackRecords()));
  }, []);

  const groupedTop = useMemo(() => {
    const map = new Map<string, DbRecord>();
    records.forEach((r) => {
      const key = r.exercice;
      const prev = map.get(key);
      if (!prev || Number(r.poids) > Number(prev.poids)) map.set(key, r);
    });
    return [...map.values()];
  }, [records]);

  const filtered =
    activeTab === "Tous"
      ? records
      : records.filter((pr) => pr.groupe === activeTab);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: "rgba(245,158,11,0.15)" }}
        >
          <Trophy className="w-6 h-6" style={{ color: "#F59E0B" }} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Records Personnels (PR)</h1>
          <p style={{ color: MUTED }} className="mt-0.5 text-sm">
            {records.length} records enregistrés
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4">
        {(groupedTop.slice(0, 4).length ? groupedTop.slice(0, 4) : [
          { exercice: "Aucune donnée", poids: 0, reps: 0 },
        ] as Partial<DbRecord>[]).map((stat) => (
          <Card
            key={`${stat.exercice}-${stat.poids}`}
            style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}
          >
            <CardContent className="p-4 text-center">
              <p style={{ color: MUTED }} className="text-xs mb-1">{stat.exercice}</p>
              <p className="text-2xl font-bold" style={{ color: "#F59E0B" }}>{Number(stat.poids ?? 0)} kg</p>
              <p style={{ color: MUTED }} className="text-xs">x{Number(stat.reps ?? 0)} reps</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList
          className="gap-1"
          style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}
        >
          {muscleGroupTabs.map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="text-xs data-[state=active]:text-black"
              style={{
                color: activeTab === tab ? "#1A1A1A" : MUTED,
              }}
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* PR Cards Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map((pr) => {
          const values = pr.progression.length > 0 ? pr.progression : [Number(pr.poids)];
          const sparkData = values.map((v, i) => ({ i, v: Number(v) }));
          const firstValue = values[0] ?? Number(pr.poids);
          const latestValue = values[values.length - 1] ?? Number(pr.poids);
          return (
            <Card
              key={pr.id}
              style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="w-4 h-4" style={{ color: "#F59E0B" }} />
                      <h3 className="text-base font-bold text-gray-900">{pr.exercice}</h3>
                      <Badge
                        className="text-xs"
                        style={{
                          backgroundColor: "rgba(29,185,84,0.15)",
                          color: ACCENT,
                          border: "none",
                        }}
                      >
                        {pr.groupe}
                      </Badge>
                    </div>

                    <div className="flex items-baseline gap-2 my-2">
                      <span className="text-4xl font-black" style={{ color: "#F59E0B" }}>
                        {pr.poids}
                        <span className="text-xl">kg</span>
                      </span>
                      <span className="text-lg font-semibold" style={{ color: MUTED }}>
                        × {pr.reps} rep{Number(pr.reps) > 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs" style={{ color: MUTED }}>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(pr.date).toLocaleDateString("fr-FR")}
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" style={{ color: ACCENT }} />
                        <span style={{ color: ACCENT }}>
                          PR validé
                        </span>
                      </div>
                    </div>

                    {pr.notes && (
                      <p className="text-xs mt-2 italic" style={{ color: MUTED }}>
                        &quot;{pr.notes}&quot;
                      </p>
                    )}

                  </div>

                  <div className="ml-4 w-28 h-16 rounded-md" style={{ backgroundColor: "#FAFAFA", border: `1px solid ${BORDER}` }}>
                    <LineChart width={112} height={48} data={sparkData}>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#FFFFFF",
                          border: `1px solid ${BORDER}`,
                          borderRadius: 6,
                          fontSize: 11,
                          color: "#1A1A1A",
                        }}
                        formatter={(v) => [`${v} kg`]}
                        labelFormatter={() => ""}
                      />
                      <Line
                        type="monotone"
                        dataKey="v"
                        stroke={latestValue >= firstValue ? ACCENT : "#EF4444"}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 3, fill: latestValue >= firstValue ? ACCENT : "#EF4444" }}
                      />
                    </LineChart>
                    <p className="text-center text-[10px]" style={{ color: MUTED }}>
                      courbe
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
