"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Apple, Flame, ChevronDown, ChevronUp, Clock, Filter, X, Youtube, Lightbulb, ChefHat, ListOrdered } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { todayMacros, meals, weeklyMacros, recipes, nutritionPlan } from "@/lib/mockData";
import { useUserStore } from "@/lib/userStore";

const ACCENT = "#1DB954";
const CARD_BG = "#FFFFFF";
const BORDER = "#E5E5E5";
const MUTED = "#888888";

const macroColors = {
  Protéines: "#1DB954",
  Glucides: "#4C9BE8",
  Lipides: "#F59E0B",
};

function MacroRing({
  label,
  current,
  target,
  unit,
  color,
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}) {
  const pct = Math.round((current / target) * 100);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
          <circle cx="40" cy="40" r="32" fill="none" stroke={BORDER} strokeWidth="8" />
          <circle
            cx="40"
            cy="40"
            r="32"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 32}`}
            strokeDashoffset={`${2 * Math.PI * 32 * (1 - pct / 100)}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-gray-900">{pct}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-gray-900">
          {current}{unit}
          <span style={{ color: MUTED }}>/{target}{unit}</span>
        </p>
        <p className="text-xs" style={{ color: MUTED }}>{label}</p>
      </div>
    </div>
  );
}

function MealAccordion({
  meal,
}: {
  meal: typeof meals[0];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${BORDER}`, backgroundColor: CARD_BG }}
    >
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-black/5 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "rgba(29,185,84,0.15)" }}
          >
            <Apple className="w-4 h-4" style={{ color: ACCENT }} />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900">{meal.name}</p>
            <p className="text-xs" style={{ color: MUTED }}>{meal.time}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" style={{ color: "#EF4444" }} />
            <span className="text-sm font-bold text-gray-900">{meal.calories}</span>
            <span className="text-xs" style={{ color: MUTED }}>kcal</span>
          </div>
          {open ? (
            <ChevronUp className="w-4 h-4" style={{ color: MUTED }} />
          ) : (
            <ChevronDown className="w-4 h-4" style={{ color: MUTED }} />
          )}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-2 border-t" style={{ borderColor: BORDER }}>
          <div
            className="grid grid-cols-4 gap-2 text-xs font-medium py-2"
            style={{ color: MUTED }}
          >
            <span>Aliment</span>
            <span className="text-center">Qté</span>
            <span className="text-center">Prot.</span>
            <span className="text-right">Kcal</span>
          </div>
          {meal.items.map((item, i) => (
            <div key={i} className="grid grid-cols-4 gap-2 text-xs">
              <span className="text-gray-900">{item.name}</span>
              <span className="text-center" style={{ color: MUTED }}>{item.qty}</span>
              <span className="text-center" style={{ color: ACCENT }}>{item.protein}g</span>
              <span className="text-right text-gray-900">{item.calories}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type Recipe = typeof recipes[0];

function RecipeModal({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) {
  const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(recipe.youtubeQuery)}`;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
        style={{ backgroundColor: CARD_BG }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Photo header */}
        <div
          className="relative h-48 flex items-center justify-center rounded-t-2xl overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${recipe.color}33, ${recipe.color}66)` }}
        >
          <span className="text-8xl">{recipe.emoji}</span>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all"
            style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="absolute bottom-3 left-4 flex gap-1.5 flex-wrap">
            {recipe.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ backgroundColor: "rgba(255,255,255,0.9)", color: recipe.color }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Title + meta */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{recipe.name}</h2>
              <div className="flex items-center gap-1 mt-1" style={{ color: MUTED }}>
                <Clock className="w-3.5 h-3.5" />
                <span className="text-sm">{recipe.time}</span>
              </div>
            </div>
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-80"
              style={{ backgroundColor: "#FF0000", color: "#FFFFFF" }}
            >
              <Youtube className="w-4 h-4" /> Voir sur YouTube
            </a>
          </div>

          {/* Macros grid */}
          <div
            className="grid grid-cols-4 gap-3 rounded-xl p-4"
            style={{ backgroundColor: "#F8F8F8" }}
          >
            {[
              { label: "Calories", value: `${recipe.calories}`, unit: "kcal", color: "#EF4444" },
              { label: "Protéines", value: `${recipe.protein}`, unit: "g", color: ACCENT },
              { label: "Glucides", value: `${recipe.carbs}`, unit: "g", color: "#4C9BE8" },
              { label: "Lipides", value: `${recipe.fat}`, unit: "g", color: "#F59E0B" },
            ].map((m) => (
              <div key={m.label} className="text-center">
                <p className="text-xl font-black" style={{ color: m.color }}>{m.value}<span className="text-xs font-normal ml-0.5">{m.unit}</span></p>
                <p className="text-xs mt-0.5" style={{ color: MUTED }}>{m.label}</p>
              </div>
            ))}
          </div>

          {/* Ingredients table */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ChefHat className="w-4 h-4" style={{ color: ACCENT }} />
              <h3 className="text-sm font-bold text-gray-900">Ingrédients</h3>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ backgroundColor: "#F8F8F8", borderBottom: `1px solid ${BORDER}` }}>
                    {["Aliment", "Quantité", "Prot.", "Gluc.", "Lip.", "Kcal"].map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-medium" style={{ color: MUTED }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recipe.ingredientDetails.map((ing, i) => (
                    <tr key={i} style={{ borderBottom: i < recipe.ingredientDetails.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                      <td className="px-3 py-2 font-medium text-gray-900">{ing.name}</td>
                      <td className="px-3 py-2" style={{ color: MUTED }}>{ing.qty}</td>
                      <td className="px-3 py-2 font-medium" style={{ color: ACCENT }}>{ing.protein}g</td>
                      <td className="px-3 py-2" style={{ color: "#4C9BE8" }}>{ing.carbs}g</td>
                      <td className="px-3 py-2" style={{ color: "#F59E0B" }}>{ing.fat}g</td>
                      <td className="px-3 py-2 font-medium text-gray-900">{ing.calories}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Steps */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ListOrdered className="w-4 h-4" style={{ color: ACCENT }} />
              <h3 className="text-sm font-bold text-gray-900">Instructions</h3>
            </div>
            <ol className="space-y-2">
              {recipe.steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: recipe.color }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-700 pt-0.5">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Tip */}
          {recipe.tip && (
            <div
              className="flex gap-3 rounded-xl p-4"
              style={{ backgroundColor: "rgba(29,185,84,0.08)", border: `1px solid rgba(29,185,84,0.2)` }}
            >
              <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: ACCENT }} />
              <p className="text-sm" style={{ color: "#1A5C35" }}>{recipe.tip}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NutritionPage() {
  const { profile } = useUserStore();
  const [activeRecipeFilter, setActiveRecipeFilter] = useState("Tous");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Override macro targets with values from user settings
  const macroTargets = {
    calories: { current: todayMacros.calories.current, target: profile.macros.kcal },
    protein: { current: todayMacros.protein.current, target: profile.macros.protein },
    carbs: { current: todayMacros.carbs.current, target: profile.macros.carbs },
    fat: { current: todayMacros.fat.current, target: profile.macros.fat },
  };

  const allTags = ["Tous", "Protéiné", "Low-carb", "Rapide", "Budget", "Pro-testo", "Petit-déj"];
  const filteredRecipes =
    activeRecipeFilter === "Tous"
      ? recipes
      : recipes.filter((r) => r.tags.includes(activeRecipeFilter));

  return (
    <div className="p-8 space-y-6">
      {selectedRecipe && (
        <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      )}
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Nutrition</h1>
        <p style={{ color: MUTED }} className="mt-1 text-sm">
          Suivi nutritionnel et plans alimentaires
        </p>
      </div>

      <Tabs defaultValue="suivi">
        <TabsList style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
          <TabsTrigger value="suivi" className="text-sm">Suivi</TabsTrigger>
          <TabsTrigger value="plans" className="text-sm">Plans</TabsTrigger>
          <TabsTrigger value="recettes" className="text-sm">Recettes</TabsTrigger>
        </TabsList>

        {/* ── SUIVI TAB ── */}
        <TabsContent value="suivi" className="mt-6 space-y-6">
          {/* Macro rings */}
          <Card style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Flame className="w-4 h-4" style={{ color: "#EF4444" }} />
                Macros du jour — 8 Mars 2026
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-around">
                {/* Calories */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative w-28 h-28">
                    <svg viewBox="0 0 80 80" className="w-28 h-28 -rotate-90">
                      <circle cx="40" cy="40" r="32" fill="none" stroke={BORDER} strokeWidth="8" />
                      <circle
                        cx="40"
                        cy="40"
                        r="32"
                        fill="none"
                        stroke="#EF4444"
                        strokeWidth="8"
                        strokeDasharray={`${2 * Math.PI * 32}`}
                        strokeDashoffset={`${2 * Math.PI * 32 * (1 - macroTargets.calories.current / macroTargets.calories.target)}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-base font-black text-gray-900">{macroTargets.calories.current}</span>
                      <span className="text-xs" style={{ color: MUTED }}>kcal</span>
                    </div>
                  </div>
                  <p className="text-xs" style={{ color: MUTED }}>
                    / {macroTargets.calories.target} kcal
                  </p>
                </div>
                <MacroRing label="Protéines" current={macroTargets.protein.current} target={macroTargets.protein.target} unit="g" color={macroColors.Protéines} />
                <MacroRing label="Glucides" current={macroTargets.carbs.current} target={macroTargets.carbs.target} unit="g" color={macroColors.Glucides} />
                <MacroRing label="Lipides" current={macroTargets.fat.current} target={macroTargets.fat.target} unit="g" color={macroColors.Lipides} />
              </div>

              <div className="mt-4 space-y-2">
                {[
                  { label: "Protéines", current: macroTargets.protein.current, target: macroTargets.protein.target, color: macroColors.Protéines },
                  { label: "Glucides", current: macroTargets.carbs.current, target: macroTargets.carbs.target, color: macroColors.Glucides },
                  { label: "Lipides", current: macroTargets.fat.current, target: macroTargets.fat.target, color: macroColors.Lipides },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: MUTED }}>{m.label}</span>
                      <span className="text-gray-900 font-medium">{m.current}g / {m.target}g</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ backgroundColor: BORDER }}>
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, Math.round((m.current / m.target) * 100))}%`,
                          backgroundColor: m.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Meals */}
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-gray-900">Repas du jour</h2>
            {meals.map((meal) => (
              <MealAccordion key={meal.id} meal={meal} />
            ))}
          </div>

          {/* Weekly macro chart */}
          <Card style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-900">
                Macros hebdomadaires
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={weeklyMacros}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                  <XAxis dataKey="day" stroke={MUTED} tick={{ fontSize: 11 }} />
                  <YAxis stroke={MUTED} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      border: `1px solid ${BORDER}`,
                      borderRadius: 8,
                      color: "#1A1A1A",
                    }}
                  />
                  <Area type="monotone" dataKey="protein" stroke="#1DB954" fill="rgba(29,185,84,0.1)" strokeWidth={2} name="Protéines (g)" />
                  <Area type="monotone" dataKey="carbs" stroke="#4C9BE8" fill="rgba(76,155,232,0.1)" strokeWidth={2} name="Glucides (g)" />
                  <Area type="monotone" dataKey="fat" stroke="#F59E0B" fill="rgba(245,158,11,0.1)" strokeWidth={2} name="Lipides (g)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── PLANS TAB ── */}
        <TabsContent value="plans" className="mt-6 space-y-6">
          {/* Active plan */}
          <Card style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "rgba(29,185,84,0.15)" }}
                  >
                    <Apple className="w-5 h-5" style={{ color: ACCENT }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-gray-900">{nutritionPlan.name}</h2>
                      <Badge style={{ backgroundColor: ACCENT, color: "#FFFFFF" }} className="text-xs font-bold">
                        ACTIF
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 text-center">
                  {[
                    { label: "Calories", value: `${nutritionPlan.target.calories} kcal` },
                    { label: "Protéines", value: `${nutritionPlan.target.protein}g` },
                    { label: "Glucides", value: `${nutritionPlan.target.carbs}g` },
                    { label: "Lipides", value: `${nutritionPlan.target.fat}g` },
                  ].map((t) => (
                    <div key={t.label}>
                      <p className="text-lg font-bold" style={{ color: ACCENT }}>{t.value}</p>
                      <p className="text-xs" style={{ color: MUTED }}>{t.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Day-by-day plan */}
          {nutritionPlan.days.map((day, di) => (
            <Card key={di} style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-900">{day.day}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                      {["Repas", "Kcal", "Prot.", "Glucides", "Lipides"].map((h) => (
                        <th key={h} className="text-left text-xs font-medium px-4 py-2" style={{ color: MUTED }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {day.meals.map((meal, mi) => (
                      <tr key={mi} style={{ borderBottom: mi < day.meals.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                        <td className="px-4 py-2 text-sm text-gray-900">{meal.name}</td>
                        <td className="px-4 py-2 text-sm font-medium" style={{ color: "#EF4444" }}>{meal.calories}</td>
                        <td className="px-4 py-2 text-sm" style={{ color: ACCENT }}>{meal.protein}g</td>
                        <td className="px-4 py-2 text-sm" style={{ color: "#4C9BE8" }}>{meal.carbs}g</td>
                        <td className="px-4 py-2 text-sm" style={{ color: "#F59E0B" }}>{meal.fat}g</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── RECETTES TAB ── */}
        <TabsContent value="recettes" className="mt-6 space-y-6">
          {/* Filter tags */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" style={{ color: MUTED }} />
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveRecipeFilter(tag)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  backgroundColor: activeRecipeFilter === tag ? ACCENT : "#E5E5E5",
                  color: activeRecipeFilter === tag ? "#FFFFFF" : MUTED,
                }}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {filteredRecipes.map((recipe) => (
              <Card
                key={recipe.id}
                className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5"
                style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}
                onClick={() => setSelectedRecipe(recipe)}
              >
                {/* Photo header */}
                <div
                  className="h-32 flex items-center justify-center rounded-t-lg overflow-hidden relative"
                  style={{ background: `linear-gradient(135deg, ${recipe.color}22, ${recipe.color}44)` }}
                >
                  <span className="text-5xl">{recipe.emoji}</span>
                  <div className="absolute bottom-2 right-2">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: "rgba(255,255,255,0.9)", color: recipe.color }}
                    >
                      {recipe.time}
                    </span>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-center gap-1 mb-1.5 flex-wrap">
                    {recipe.tags.slice(0, 2).map((tag) => (
                      <Badge
                        key={tag}
                        className="text-xs"
                        style={{
                          backgroundColor: "rgba(29,185,84,0.12)",
                          color: ACCENT,
                          border: "none",
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 leading-tight">{recipe.name}</h3>

                  <div className="grid grid-cols-4 gap-1 mt-3">
                    <div className="text-center">
                      <p className="text-sm font-bold" style={{ color: "#EF4444" }}>{recipe.calories}</p>
                      <p className="text-xs" style={{ color: MUTED }}>kcal</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold" style={{ color: ACCENT }}>{recipe.protein}g</p>
                      <p className="text-xs" style={{ color: MUTED }}>prot.</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold" style={{ color: "#4C9BE8" }}>{recipe.carbs}g</p>
                      <p className="text-xs" style={{ color: MUTED }}>gluc.</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold" style={{ color: "#F59E0B" }}>{recipe.fat}g</p>
                      <p className="text-xs" style={{ color: MUTED }}>lip.</p>
                    </div>
                  </div>

                  <div
                    className="mt-3 pt-2 border-t flex items-center justify-between"
                    style={{ borderColor: BORDER }}
                  >
                    <p className="text-xs" style={{ color: MUTED }}>
                      {recipe.ingredientDetails.length} ingrédients · {recipe.steps.length} étapes
                    </p>
                    <span className="text-xs font-semibold" style={{ color: ACCENT }}>Voir →</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
