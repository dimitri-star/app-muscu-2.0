"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Apple, ChevronDown, ChevronUp, Clock, Filter, X, Youtube, Lightbulb, ChefHat, ListOrdered } from "lucide-react";
import { recipes, nutritionPlan } from "@/lib/mockData";

const ACCENT = "#1DB954";
const CARD_BG = "#FFFFFF";
const BORDER = "#E5E5E5";
const MUTED = "#888888";


function PlanMealAccordion({ meal }: { meal: typeof nutritionPlan.days[0]['meals'][0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b last:border-b-0" style={{ borderColor: BORDER }}>
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-black/5 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900">{meal.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-xs">
            <span style={{ color: "#EF4444" }} className="font-bold">{meal.calories} kcal</span>
            <span style={{ color: ACCENT }}>{meal.protein}g P</span>
            <span style={{ color: "#4C9BE8" }}>{meal.carbs}g G</span>
            <span style={{ color: "#F59E0B" }}>{meal.fat}g L</span>
          </div>
          {open ? (
            <ChevronUp className="w-4 h-4" style={{ color: MUTED }} />
          ) : (
            <ChevronDown className="w-4 h-4" style={{ color: MUTED }} />
          )}
        </div>
      </button>
      {open && meal.items && (
        <div className="px-4 pb-3">
          <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ backgroundColor: "#F8F8F8", borderBottom: `1px solid ${BORDER}` }}>
                  {["Aliment", "Qté (CRU)", "Prot.", "Gluc.", "Lip.", "Kcal", "Rôle"].map((h) => (
                    <th key={h} className="text-left px-3 py-2 font-medium" style={{ color: MUTED }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {meal.items.map((item, i) => (
                  <tr key={i} style={{ borderBottom: i < meal.items!.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                    <td className="px-3 py-2 font-medium text-gray-900">{item.name}</td>
                    <td className="px-3 py-2" style={{ color: MUTED }}>{item.qty}</td>
                    <td className="px-3 py-2 font-medium" style={{ color: ACCENT }}>{item.protein}g</td>
                    <td className="px-3 py-2" style={{ color: "#4C9BE8" }}>{item.carbs}g</td>
                    <td className="px-3 py-2" style={{ color: "#F59E0B" }}>{item.fat}g</td>
                    <td className="px-3 py-2 font-medium text-gray-900">{item.calories}</td>
                    <td className="px-3 py-2 text-xs italic" style={{ color: "#6B7280" }}>{'note' in item ? (item as {note?: string}).note : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
  const [activeRecipeFilter, setActiveRecipeFilter] = useState("Tous");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

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

      <Tabs defaultValue="plans">
        <TabsList style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
          <TabsTrigger value="plans" className="text-sm">Plans</TabsTrigger>
          <TabsTrigger value="recettes" className="text-sm">Recettes</TabsTrigger>
        </TabsList>

        {/* ── PLANS TAB ── */}
        <TabsContent value="plans" className="mt-6 space-y-6">
          {/* Active plan summary */}
          <Card style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
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
                    <p className="text-xs mt-0.5" style={{ color: MUTED }}>
                      Ajustement : +20g riz midi ou +50g patate soir pour atteindre 275g glucides
                    </p>
                  </div>
                </div>
                <div className="flex gap-6 text-center">
                  {[
                    { label: "Calories", value: `${nutritionPlan.target.calories}`, unit: "kcal", color: "#EF4444" },
                    { label: "Protéines", value: `${nutritionPlan.target.protein}`, unit: "g", color: ACCENT },
                    { label: "Glucides", value: `${nutritionPlan.target.carbs}`, unit: "g", color: "#4C9BE8" },
                    { label: "Lipides", value: `${nutritionPlan.target.fat}`, unit: "g", color: "#F59E0B" },
                  ].map((t) => (
                    <div key={t.label}>
                      <p className="text-xl font-black" style={{ color: t.color }}>{t.value}<span className="text-xs font-normal ml-0.5">{t.unit}</span></p>
                      <p className="text-xs mt-0.5" style={{ color: MUTED }}>{t.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed meals — accordion per repas */}
          {nutritionPlan.days.map((day, di) => (
            <Card key={di} style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
              <CardHeader className="pb-0">
                <CardTitle className="text-sm font-semibold text-gray-900">{day.day}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 mt-2">
                {day.meals.map((meal, mi) => (
                  <PlanMealAccordion key={mi} meal={meal} />
                ))}
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
