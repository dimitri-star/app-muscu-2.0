"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, TrendingUp, Calendar } from "lucide-react";
import { personalRecords } from "@/lib/mockData";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const ACCENT = "#1DB954";
const CARD_BG = "#FFFFFF";
const BORDER = "#E5E5E5";
const MUTED = "#888888";

const muscleGroupTabs = ["Tous", "Poitrine", "Dos", "Jambes", "Épaules", "Bras"];

export default function RecordsPage() {
  const [activeTab, setActiveTab] = useState("Tous");

  const filtered =
    activeTab === "Tous"
      ? personalRecords
      : personalRecords.filter((pr) => pr.muscleGroup === activeTab);

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
            {personalRecords.length} records enregistrés
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Bench Press", value: "120 kg", sub: "1RM" },
          { label: "Squat", value: "140 kg", sub: "1RM" },
          { label: "Deadlift", value: "160 kg", sub: "1RM" },
          { label: "Total Powerlifting", value: "420 kg", sub: "SBD" },
        ].map((stat) => (
          <Card
            key={stat.label}
            style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}
          >
            <CardContent className="p-4 text-center">
              <p style={{ color: MUTED }} className="text-xs mb-1">{stat.label}</p>
              <p className="text-2xl font-bold" style={{ color: "#F59E0B" }}>{stat.value}</p>
              <p style={{ color: MUTED }} className="text-xs">{stat.sub}</p>
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
          const sparkData = pr.progression.map((v, i) => ({ i, v }));
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
                      <h3 className="text-base font-bold text-gray-900">{pr.exercise}</h3>
                      <Badge
                        className="text-xs"
                        style={{
                          backgroundColor: "rgba(29,185,84,0.15)",
                          color: ACCENT,
                          border: "none",
                        }}
                      >
                        {pr.muscleGroup}
                      </Badge>
                    </div>

                    <div className="flex items-baseline gap-2 my-2">
                      <span className="text-4xl font-black" style={{ color: "#F59E0B" }}>
                        {pr.weight}
                        <span className="text-xl">kg</span>
                      </span>
                      <span className="text-lg font-semibold" style={{ color: MUTED }}>
                        × {pr.reps} rep{pr.reps > 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs" style={{ color: MUTED }}>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {pr.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" style={{ color: ACCENT }} />
                        <span style={{ color: ACCENT }}>
                          +{pr.progression[pr.progression.length - 1] - pr.progression[0]} kg depuis début
                        </span>
                      </div>
                    </div>

                    {pr.notes && (
                      <p className="text-xs mt-2 italic" style={{ color: MUTED }}>
                        &quot;{pr.notes}&quot;
                      </p>
                    )}
                  </div>

                  {/* Mini sparkline */}
                  <div className="ml-4 w-28 h-16">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sparkData}>
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
                          stroke={ACCENT}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 3, fill: ACCENT }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                    <p className="text-center text-xs" style={{ color: MUTED }}>
                      progression
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
