"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Target,
  Utensils,
  Droplets,
  Ruler,
  Save,
  CheckCircle,
} from "lucide-react";
import { userProfile } from "@/lib/mockData";

const ACCENT = "#1DB954";
const CARD_BG = "#FFFFFF";
const BORDER = "#E5E5E5";
const MUTED = "#888888";

const goals = [
  { key: "masse", label: "Prise de masse", desc: "Surplus calorique, focus volume" },
  { key: "seche", label: "Sèche", desc: "Déficit calorique, maintenir masse" },
  { key: "maintien", label: "Maintien", desc: "Calories de maintenance" },
  { key: "force", label: "Force", desc: "Charges maximales, faibles reps" },
];

function InputField({
  label,
  value,
  onChange,
  unit,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  unit?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium mb-1.5 block" style={{ color: MUTED }}>
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-lg px-3 py-2.5 text-sm outline-none transition-all focus:ring-1"
          style={{
            backgroundColor: "#F5F5F5",
            border: `1px solid ${BORDER}`,
            color: "#1A1A1A",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = ACCENT;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = BORDER;
          }}
        />
        {unit && <span className="text-xs" style={{ color: MUTED }}>{unit}</span>}
      </div>
    </div>
  );
}

export default function ParametresPage() {
  const [profile, setProfile] = useState({
    name: userProfile.name,
    age: String(userProfile.age),
    height: String(userProfile.height),
    weight: String(userProfile.weight),
  });
  const [goal, setGoal] = useState(userProfile.goal);
  const [macros, setMacros] = useState(userProfile.macros);
  const [water, setWater] = useState(userProfile.waterGoal);
  const [measurements, setMeasurements] = useState(userProfile.measurements);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="p-8 space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        <p style={{ color: MUTED }} className="mt-1 text-sm">
          Gérez votre profil et vos objectifs
        </p>
      </div>

      {/* Profile */}
      <Card style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-4 h-4" style={{ color: ACCENT }} />
            Profil
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <InputField
            label="Nom complet"
            value={profile.name}
            onChange={(v) => setProfile({ ...profile, name: v })}
          />
          <InputField
            label="Âge"
            value={profile.age}
            onChange={(v) => setProfile({ ...profile, age: v })}
            unit="ans"
            type="number"
          />
          <InputField
            label="Taille"
            value={profile.height}
            onChange={(v) => setProfile({ ...profile, height: v })}
            unit="cm"
            type="number"
          />
          <InputField
            label="Poids"
            value={profile.weight}
            onChange={(v) => setProfile({ ...profile, weight: v })}
            unit="kg"
            type="number"
          />
        </CardContent>
      </Card>

      {/* Goals */}
      <Card style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Target className="w-4 h-4" style={{ color: ACCENT }} />
            Objectif
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {goals.map((g) => (
              <button
                key={g.key}
                onClick={() => setGoal(g.key as typeof goal)}
                className="flex items-center gap-3 p-4 rounded-xl text-left transition-all"
                style={{
                  backgroundColor: goal === g.key ? "rgba(29,185,84,0.08)" : "#F5F5F5",
                  border: `1px solid ${goal === g.key ? ACCENT : BORDER}`,
                }}
              >
                <div
                  className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  style={{ borderColor: goal === g.key ? ACCENT : BORDER }}
                >
                  {goal === g.key && (
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: ACCENT }}
                    />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: goal === g.key ? ACCENT : "#1A1A1A" }}>
                    {g.label}
                  </p>
                  <p className="text-xs" style={{ color: MUTED }}>{g.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Macro targets */}
      <Card style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Utensils className="w-4 h-4" style={{ color: ACCENT }} />
            Objectifs macros journaliers
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-4 gap-4">
          {[
            { key: "kcal", label: "Calories", unit: "kcal", color: "#EF4444" },
            { key: "protein", label: "Protéines", unit: "g", color: ACCENT },
            { key: "carbs", label: "Glucides", unit: "g", color: "#4C9BE8" },
            { key: "fat", label: "Lipides", unit: "g", color: "#F59E0B" },
          ].map((m) => (
            <div key={m.key}>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: m.color }}>
                {m.label}
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={macros[m.key as keyof typeof macros]}
                  onChange={(e) =>
                    setMacros({ ...macros, [m.key]: Number(e.target.value) })
                  }
                  className="flex-1 rounded-lg px-3 py-2.5 text-sm outline-none transition-all focus:ring-1"
                  style={{
                    backgroundColor: "#F5F5F5",
                    border: `1px solid ${BORDER}`,
                    color: "#1A1A1A",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = m.color; }}
                  onBlur={(e) => { e.target.style.borderColor = BORDER; }}
                />
                <span className="text-xs" style={{ color: MUTED }}>{m.unit}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Water goal */}
      <Card style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Droplets className="w-4 h-4" style={{ color: "#4C9BE8" }} />
            Objectif hydratation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: MUTED }}>
                Objectif quotidien
              </span>
              <Badge
                style={{
                  backgroundColor: "rgba(76,155,232,0.15)",
                  color: "#4C9BE8",
                  border: "none",
                }}
              >
                {water.toFixed(1)} L / jour
              </Badge>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              step={0.25}
              value={water}
              onChange={(e) => setWater(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: "#4C9BE8" }}
            />
            <div className="flex justify-between text-xs" style={{ color: MUTED }}>
              <span>1 L</span>
              <span>2.5 L</span>
              <span>5 L</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Measurements */}
      <Card style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Ruler className="w-4 h-4" style={{ color: "#8B5CF6" }} />
            Mensurations
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-4 gap-4">
          {[
            { key: "arms", label: "Bras" },
            { key: "thighs", label: "Cuisses" },
            { key: "waist", label: "Tour de taille" },
            { key: "hips", label: "Hanches" },
          ].map((m) => (
            <div key={m.key}>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: MUTED }}>
                {m.label}
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={measurements[m.key as keyof typeof measurements]}
                  onChange={(e) =>
                    setMeasurements({
                      ...measurements,
                      [m.key]: Number(e.target.value),
                    })
                  }
                  className="flex-1 rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
                  style={{
                    backgroundColor: "#F5F5F5",
                    border: `1px solid ${BORDER}`,
                    color: "#1A1A1A",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "#8B5CF6"; }}
                  onBlur={(e) => { e.target.style.borderColor = BORDER; }}
                />
                <span className="text-xs" style={{ color: MUTED }}>cm</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Separator style={{ backgroundColor: BORDER }} />

      {/* Save button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="flex items-center gap-2 font-semibold px-8"
          style={{
            backgroundColor: saved ? "rgba(29,185,84,0.15)" : ACCENT,
            color: saved ? ACCENT : "#FFFFFF",
            border: saved ? `1px solid ${ACCENT}` : "none",
          }}
        >
          {saved ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Enregistré !
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Enregistrer les modifications
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
