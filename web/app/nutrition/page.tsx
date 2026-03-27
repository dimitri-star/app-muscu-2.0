"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Apple, ChevronDown, ChevronUp, Clock, Filter, X, Youtube, Lightbulb, ChefHat, ListOrdered, Droplets, Trophy, Flame, Plus, Pencil, Trash2 } from "lucide-react";
import { recipes, nutritionPlan } from "@/lib/mockData";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ACCENT = "#1DB954";
const CARD_BG = "#FFFFFF";
const BORDER = "#E5E5E5";
const MUTED = "#888888";

type ShoppingItem = {
  id: string;
  label: string;
  exportLabel: string;
  store: "BOUCHER" | "SUPERMARCHE";
};
type GroceryRow = {
  id: string;
  categorie: string;
  article: string;
  quantite: string | null;
  checked: boolean;
};
type WeeklyTrackingRow = {
  date: string;
  eau: number | null;
};

type Recipe = typeof recipes[0];
type AppRecipe = Recipe & { source?: "builtin" | "custom"; youtubeUrl?: string };
type GroceryEditorState = {
  mode: "create" | "edit";
  id?: string;
  categorie: string;
  article: string;
  quantite: string;
} | null;

const GROCERY_CATEGORY_ORDER = [
  "PROTEINES",
  "PRODUITS LAITIERS",
  "FECULENTS",
  "LEGUMES",
  "FRUITS",
  "LIPIDES / OLEAGINEUX",
  "CONDIMENTS / EXTRAS",
  "AUTRE",
];

function normalizeCategoryName(raw: string): string {
  const c = String(raw || "").toUpperCase();
  if (c.includes("PROT")) return "PROTEINES";
  if (c.includes("LAIT")) return "PRODUITS LAITIERS";
  if (c.includes("FEC") || c.includes("RIZ") || c.includes("PATE") || c.includes("PDT")) return "FECULENTS";
  if (c.includes("LEGUME")) return "LEGUMES";
  if (c.includes("FRUIT")) return "FRUITS";
  if (c.includes("LIPIDE") || c.includes("OLEA") || c.includes("NOIX") || c.includes("AMANDE")) return "LIPIDES / OLEAGINEUX";
  if (c.includes("CONDIMENT") || c.includes("EXTRA")) return "CONDIMENTS / EXTRAS";
  return c || "AUTRE";
}

const SHOPPING_GROUPS: {
  title: string;
  subtitle?: string;
  items: ShoppingItem[];
}[] = [
  {
    title: "PROTEINES",
    subtitle: "Boucher ~54 EUR/sem",
    items: [
      { id: "poulet", label: "Filet de poulet 1 kg", exportLabel: "Poulet 1kg", store: "BOUCHER" },
      { id: "steak5", label: "Steak haché 5% 1 kg", exportLabel: "Steak haché 5% 1kg", store: "BOUCHER" },
      { id: "cheval", label: "Rumsteak de cheval x2", exportLabel: "Cheval x2 rumsteaks", store: "BOUCHER" },
      { id: "dinde", label: "Dinde ~500g-1kg", exportLabel: "Dinde 500g-1kg", store: "BOUCHER" },
      { id: "oeufs", label: "Oeufs x20 (2 boites de 10)", exportLabel: "Oeufs x20", store: "SUPERMARCHE" },
      { id: "foie", label: "Foie de volaille 200g (1x/sem)", exportLabel: "Foie de volaille 200g", store: "BOUCHER" },
      { id: "sardines", label: "Sardines conserve x4", exportLabel: "Sardines conserve x4", store: "SUPERMARCHE" },
    ],
  },
  {
    title: "PRODUITS LAITIERS",
    items: [
      { id: "fb0", label: "Fromage blanc 0% (x3-4 pots)", exportLabel: "Fromage blanc 0% x4", store: "SUPERMARCHE" },
      { id: "fb3", label: "Fromage blanc 3% (x2 pots)", exportLabel: "Fromage blanc 3% x2", store: "SUPERMARCHE" },
      { id: "brebis", label: "Fromage de brebis", exportLabel: "Fromage brebis", store: "SUPERMARCHE" },
      { id: "carresfrais", label: "Carrés frais", exportLabel: "Carrés frais", store: "SUPERMARCHE" },
    ],
  },
  {
    title: "FECULENTS",
    items: [
      { id: "riz", label: "Riz basmati (1 paquet)", exportLabel: "Riz basmati", store: "SUPERMARCHE" },
      { id: "patatedouce", label: "Patate douce (1-1.5 kg)", exportLabel: "Patate douce 1.5kg", store: "SUPERMARCHE" },
      { id: "pdt", label: "Pomme de terre (1 kg)", exportLabel: "Pomme de terre 1kg", store: "SUPERMARCHE" },
      { id: "ebly", label: "Blé type Ebly", exportLabel: "Blé Ebly", store: "SUPERMARCHE" },
      { id: "lentilles", label: "Lentilles", exportLabel: "Lentilles", store: "SUPERMARCHE" },
      { id: "pain", label: "Pain complet / levain", exportLabel: "Pain complet", store: "SUPERMARCHE" },
    ],
  },
  {
    title: "LEGUMES",
    items: [
      { id: "brocolis", label: "Brocolis surgelés (x2 sachets)", exportLabel: "Brocolis surgelés x2", store: "SUPERMARCHE" },
      { id: "courgettes", label: "Courgettes surgelées (x2 sachets)", exportLabel: "Courgettes surgelées x2", store: "SUPERMARCHE" },
      { id: "epinards", label: "Épinards frais", exportLabel: "Épinards frais", store: "SUPERMARCHE" },
      { id: "asperges", label: "Asperges", exportLabel: "Asperges", store: "SUPERMARCHE" },
      { id: "betteraves", label: "Betteraves", exportLabel: "Betteraves", store: "SUPERMARCHE" },
      { id: "carottes", label: "Carottes", exportLabel: "Carottes", store: "SUPERMARCHE" },
    ],
  },
  {
    title: "FRUITS",
    items: [
      { id: "bananes", label: "Bananes (régime)", exportLabel: "Bananes", store: "SUPERMARCHE" },
      { id: "kiwis", label: "Kiwis (x6-8)", exportLabel: "Kiwis x8", store: "SUPERMARCHE" },
      { id: "fruitsrouges", label: "Fruits rouges surgelés", exportLabel: "Fruits rouges surgelés", store: "SUPERMARCHE" },
      { id: "dattes", label: "Dattes", exportLabel: "Dattes", store: "SUPERMARCHE" },
    ],
  },
  {
    title: "LIPIDES / OLEAGINEUX",
    items: [
      { id: "amandes", label: "Amandes (vrac)", exportLabel: "Amandes vrac", store: "SUPERMARCHE" },
      { id: "noix", label: "Cerneaux de noix", exportLabel: "Noix", store: "SUPERMARCHE" },
      { id: "huile", label: "Huile d'olive vierge extra", exportLabel: "Huile olive", store: "SUPERMARCHE" },
      { id: "avocat", label: "Avocat x2-3 (pour la semaine)", exportLabel: "Avocat x3", store: "SUPERMARCHE" },
      { id: "chia", label: "Graines de chia", exportLabel: "Graines de chia", store: "SUPERMARCHE" },
    ],
  },
  {
    title: "CONDIMENTS / EXTRAS",
    items: [
      { id: "ail", label: "Ail frais", exportLabel: "Ail", store: "SUPERMARCHE" },
      { id: "oignons", label: "Oignons", exportLabel: "Oignons", store: "SUPERMARCHE" },
      { id: "gingembre", label: "Gingembre frais", exportLabel: "Gingembre", store: "SUPERMARCHE" },
      { id: "miel", label: "Miel", exportLabel: "Miel", store: "SUPERMARCHE" },
      { id: "chocolat", label: "Chocolat noir 85%+", exportLabel: "Chocolat noir 85%", store: "SUPERMARCHE" },
    ],
  },
];


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

const RECIPE_IMAGES: Record<number, string> = {
  1: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1200&q=80",
  2: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
  3: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=80",
  4: "https://images.unsplash.com/photo-1612240498936-65f5101365d2?auto=format&fit=crop&w=1200&q=80",
  5: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=1200&q=80",
  6: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80",
};

function youtubeIdFromUrl(url?: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/i);
  return m?.[1] ?? null;
}

function recipeImageUrl(recipe: AppRecipe): string {
  const ytId = youtubeIdFromUrl(recipe.youtubeUrl);
  if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  return RECIPE_IMAGES[Number(recipe.id)] ?? "";
}

function RecipeModal({ recipe, onClose }: { recipe: AppRecipe; onClose: () => void }) {
  const youtubeUrl = recipe.youtubeUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(recipe.youtubeQuery)}`;
  const imageUrl = recipeImageUrl(recipe);
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
          style={{ background: `linear-gradient(135deg, ${recipe.color}22, ${recipe.color}55)` }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={recipe.name}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : null}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.35), rgba(0,0,0,0.08))" }} />
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
  const [selectedRecipe, setSelectedRecipe] = useState<AppRecipe | null>(null);
  const [customRecipes, setCustomRecipes] = useState<AppRecipe[]>([]);
  const [showRecipeCreator, setShowRecipeCreator] = useState(false);
  const [recipeYoutubeUrl, setRecipeYoutubeUrl] = useState("");
  const [recipeRawText, setRecipeRawText] = useState("");
  const [recipeGenerating, setRecipeGenerating] = useState(false);
  const [recipeCreatorError, setRecipeCreatorError] = useState<string | null>(null);
  const [shoppingChecked, setShoppingChecked] = useState<Record<string, boolean>>({});
  const [groceryRows, setGroceryRows] = useState<GroceryRow[]>([]);
  const [groceryEditor, setGroceryEditor] = useState<GroceryEditorState>(null);
  const [weeklyRows, setWeeklyRows] = useState<WeeklyTrackingRow[]>([]);
  const [exportToast, setExportToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("nutrition_shopping_list_checked");
      if (raw) setShoppingChecked(JSON.parse(raw));
    } catch {
      // ignore corrupted local data
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("nutrition_custom_recipes_v1");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setCustomRecipes(parsed);
    } catch {
      // ignore corrupted local data
    }
  }, []);

  useEffect(() => {
    const load = () =>
      fetch("/api/grocery")
        .then((r) => r.json())
        .then((rows: GroceryRow[]) => setGroceryRows(Array.isArray(rows) ? rows : []))
        .catch(() => setGroceryRows([]));
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const load = () =>
      fetch("/api/weekly-tracking")
        .then((r) => r.json())
        .then((rows: WeeklyTrackingRow[]) => setWeeklyRows(Array.isArray(rows) ? rows : []))
        .catch(() => setWeeklyRows([]));
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  const saveCustomRecipes = (next: AppRecipe[]) => {
    setCustomRecipes(next);
    try {
      localStorage.setItem("nutrition_custom_recipes_v1", JSON.stringify(next));
    } catch {
      // ignore localStorage failures
    }
  };

  const allTags = ["Tous", "Protéiné", "Low-carb", "Rapide", "Budget", "Pro-testo", "Petit-déj"];
  const allRecipes: AppRecipe[] = [...customRecipes, ...recipes.map((r) => ({ ...r, source: "builtin" as const }))];
  const filteredRecipes =
    activeRecipeFilter === "Tous"
      ? allRecipes
      : allRecipes.filter((r) => r.tags.includes(activeRecipeFilter));

  const toggleShoppingItem = (id: string) => {
    if (groceryRows.length > 0) {
      const row = groceryRows.find((r) => r.id === id);
      const next = !(row?.checked ?? false);
      setGroceryRows((prev) => prev.map((r) => (r.id === id ? { ...r, checked: next } : r)));
      fetch("/api/grocery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, checked: next }),
      }).catch(() => {});
      return;
    }
    setShoppingChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem("nutrition_shopping_list_checked", JSON.stringify(next));
      } catch {
        // ignore localStorage failures
      }
      return next;
    });
  };

  const resetShoppingList = () => {
    if (groceryRows.length > 0) {
      setGroceryRows((prev) => prev.map((r) => ({ ...r, checked: false })));
      fetch("/api/grocery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      }).catch(() => {});
      return;
    }
    setShoppingChecked({});
    try {
      localStorage.setItem("nutrition_shopping_list_checked", JSON.stringify({}));
    } catch {
      // ignore localStorage failures
    }
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

  const exportText = () => {
    if (groceryRows.length > 0) {
      const boucherRows = groceryRows.filter((r) => !r.checked && r.categorie.toLowerCase().includes("proté"));
      const superRows = groceryRows.filter((r) => !r.checked && !r.categorie.toLowerCase().includes("proté"));
      return `🛒 LISTE DE COURSES

BOUCHER
${boucherRows.length ? boucherRows.map((r) => `- ${r.article}${r.quantite ? ` ${r.quantite}` : ""}`).join("\n") : "- (déjà acheté)"}

SUPERMARCHE
${superRows.length ? superRows.map((r) => `- ${r.article}${r.quantite ? ` ${r.quantite}` : ""}`).join("\n") : "- (déjà acheté)"}`;
    }

    const boucher = SHOPPING_GROUPS.flatMap((group) =>
      group.items
        .filter((item) => item.store === "BOUCHER" && !shoppingChecked[item.id])
        .map((item) => `- ${item.exportLabel}`)
    );
    const supermarche = SHOPPING_GROUPS.flatMap((group) =>
      group.items
        .filter((item) => item.store === "SUPERMARCHE" && !shoppingChecked[item.id])
        .map((item) => `- ${item.exportLabel}`)
    );

    return `🛒 LISTE DE COURSES

BOUCHER
${boucher.length ? boucher.join("\n") : "- (déjà acheté)"}

SUPERMARCHE
${supermarche.length ? supermarche.join("\n") : "- (déjà acheté)"}`;
  };

  const exportShoppingList = async () => {
    const content = exportText();
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(content);
        setExportToast("Liste copiée !");
        setTimeout(() => setExportToast(null), 2000);
        return;
      } catch {
        // fallback to txt download
      }
    }
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "liste-de-courses.txt";
    a.click();
    URL.revokeObjectURL(url);
    setExportToast("Fichier .txt généré");
    setTimeout(() => setExportToast(null), 2000);
  };

  const createRecipeFromAI = async () => {
    if (!recipeYoutubeUrl.trim() && !recipeRawText.trim()) {
      setRecipeCreatorError("Ajoute un lien YouTube ou un texte de recette.");
      return;
    }
    setRecipeCreatorError(null);
    setRecipeGenerating(true);
    try {
      const prompt = `Transforme ces infos en recette JSON stricte.
Lien YouTube: ${recipeYoutubeUrl || "n/a"}
Texte brut: ${recipeRawText || "n/a"}

Retourne UNIQUEMENT un JSON objet:
{
"name":"...",
"time":"20 min",
"calories":550,
"protein":40,
"carbs":50,
"fat":12,
"tags":["Protéiné","Rapide"],
"tip":"...",
"ingredients":["..."],
"steps":["..."],
"youtubeQuery":"..."
}`;
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt, history: [] }),
      });
      const data = await r.json();
      const text = String(data?.response || "");
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      if (start < 0 || end < 0) throw new Error("Réponse IA invalide.");
      const parsed = JSON.parse(text.slice(start, end + 1));
      const next: AppRecipe = {
        id: Date.now(),
        source: "custom",
        youtubeUrl: recipeYoutubeUrl.trim() || undefined,
        name: String(parsed.name || "Nouvelle recette"),
        time: String(parsed.time || "20 min"),
        calories: Number(parsed.calories || 0),
        protein: Number(parsed.protein || 0),
        carbs: Number(parsed.carbs || 0),
        fat: Number(parsed.fat || 0),
        tags: Array.isArray(parsed.tags) && parsed.tags.length ? parsed.tags.map(String) : ["Rapide"],
        emoji: "🍽️",
        color: "#1DB954",
        ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients.map(String) : [],
        ingredientDetails: (Array.isArray(parsed.ingredients) ? parsed.ingredients : []).map((ing: string) => ({
          name: String(ing),
          qty: "à ajuster",
          protein: 0,
          carbs: 0,
          fat: 0,
          calories: 0,
        })),
        steps: Array.isArray(parsed.steps) ? parsed.steps.map(String) : ["Préparation libre."],
        tip: String(parsed.tip || ""),
        youtubeQuery: String(parsed.youtubeQuery || parsed.name || "recette musculation"),
      };
      const merged = [next, ...customRecipes];
      saveCustomRecipes(merged);
      setSelectedRecipe(next);
      setShowRecipeCreator(false);
      setRecipeYoutubeUrl("");
      setRecipeRawText("");
    } catch (e) {
      setRecipeCreatorError(e instanceof Error ? e.message : "Impossible de générer la recette.");
    } finally {
      setRecipeGenerating(false);
    }
  };

  const deleteCustomRecipe = (id: number | string) => {
    const merged = customRecipes.filter((r) => r.id !== id);
    saveCustomRecipes(merged);
    if (selectedRecipe?.id === id) setSelectedRecipe(null);
  };

  const saveGroceryEditor = async () => {
    if (!groceryEditor) return;
    const categorie = groceryEditor.categorie.trim();
    const article = groceryEditor.article.trim();
    const quantite = groceryEditor.quantite.trim();
    if (!categorie || !article) return;

    if (groceryEditor.mode === "create") {
      const tempId = `tmp_${Date.now()}`;
      setGroceryRows((prev) => [...prev, { id: tempId, categorie, article, quantite: quantite || null, checked: false }]);
      const r = await fetch("/api/grocery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", categorie, article, quantite: quantite || null }),
      });
      const created = await r.json().catch(() => null);
      if (created?.id) {
        setGroceryRows((prev) => prev.map((row) => (row.id === tempId ? created : row)));
      }
    } else if (groceryEditor.id) {
      const id = groceryEditor.id;
      setGroceryRows((prev) => prev.map((row) => (row.id === id ? { ...row, categorie, article, quantite: quantite || null } : row)));
      await fetch("/api/grocery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, categorie, article, quantite: quantite || null }),
      }).catch(() => {});
    }
    setGroceryEditor(null);
  };

  const removeGroceryRow = async (id: string) => {
    setGroceryRows((prev) => prev.filter((r) => r.id !== id));
    await fetch("/api/grocery", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => {});
  };

  const waterStats = useMemo(() => {
    const sorted = [...weeklyRows]
      .filter((row) => row.eau !== null)
      .sort((a, b) => (a.date < b.date ? -1 : 1));
    const history = sorted.map((row) => {
      const d = new Date(row.date);
      return {
        date: row.date,
        label: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
        eau: Number(row.eau ?? 0),
      };
    });
    const last14 = history.slice(-14);
    const target = 2.5;
    const avg =
      last14.length > 0
        ? Number((last14.reduce((acc, row) => acc + row.eau, 0) / last14.length).toFixed(2))
        : 0;
    const bestDay = last14.reduce((best, curr) => (curr.eau > best.eau ? curr : best), last14[0]);
    const todayIso = new Date().toISOString().split("T")[0];
    const today = history.find((row) => row.date === todayIso)?.eau ?? 0;

    const getIsoWeek = (dateStr: string) => {
      const d = new Date(`${dateStr}T12:00:00`);
      const utc = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      const dayNum = utc.getUTCDay() || 7;
      utc.setUTCDate(utc.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
      const week = Math.ceil((((utc.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
      return { year: utc.getUTCFullYear(), week };
    };

    const weeklyMap = new Map<string, { label: string; eau: number }>();
    history.forEach((row) => {
      const w = getIsoWeek(row.date);
      const key = `${w.year}-W${String(w.week).padStart(2, "0")}`;
      const prev = weeklyMap.get(key);
      weeklyMap.set(key, {
        label: `S${w.week}`,
        eau: Number(((prev?.eau ?? 0) + row.eau).toFixed(2)),
      });
    });
    const weeklySeries = Array.from(weeklyMap.entries())
      .map(([key, value]) => ({ key, ...value }))
      .sort((a, b) => (a.key < b.key ? -1 : 1));
    const last8Weeks = weeklySeries.slice(-8);

    let streak = 0;
    for (let i = history.length - 1; i >= 0; i -= 1) {
      const current = history[i];
      if (current.eau < target) break;
      if (i < history.length - 1) {
        const prevDate = new Date(history[i + 1].date);
        const currDate = new Date(current.date);
        const diffDays = Math.round((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays !== 1) break;
      }
      streak += 1;
    }

    return {
      target,
      targetWeekly: Number((target * 7).toFixed(1)),
      today,
      avg,
      streak,
      bestDay,
      chartData: last8Weeks,
      historyData: [...last14].reverse(),
    };
  }, [weeklyRows]);

  const groupedGroceryRows = useMemo(() => {
    if (!groceryRows.length) return [];
    const map = new Map<string, GroceryRow[]>();
    groceryRows.forEach((row) => {
      const key = normalizeCategoryName(row.categorie);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(row);
    });
    return Array.from(map.entries())
      .sort((a, b) => {
        const ia = GROCERY_CATEGORY_ORDER.indexOf(a[0]);
        const ib = GROCERY_CATEGORY_ORDER.indexOf(b[0]);
        const va = ia === -1 ? 999 : ia;
        const vb = ib === -1 ? 999 : ib;
        return va - vb || a[0].localeCompare(b[0], "fr");
      })
      .map(([category, rows]) => ({ category, rows }));
  }, [groceryRows]);

  return (
    <div className="p-8 space-y-6">
      {selectedRecipe && (
        <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      )}
      {showRecipeCreator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45" onClick={() => setShowRecipeCreator(false)}>
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border p-6 space-y-4" style={{ borderColor: BORDER }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Ajouter une recette (YouTube + IA)</h3>
              <button onClick={() => setShowRecipeCreator(false)}><X className="w-5 h-5" style={{ color: MUTED }} /></button>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold" style={{ color: MUTED }}>Lien YouTube</p>
              <input value={recipeYoutubeUrl} onChange={(e) => setRecipeYoutubeUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: BORDER }} />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold" style={{ color: MUTED }}>Recette brute (optionnel)</p>
              <textarea value={recipeRawText} onChange={(e) => setRecipeRawText(e.target.value)} rows={6} placeholder="Copie/colle des ingrédients, étapes, notes..." className="w-full rounded-lg border px-3 py-2 text-sm resize-none" style={{ borderColor: BORDER }} />
            </div>
            {recipeCreatorError ? <p className="text-xs font-semibold text-red-600">{recipeCreatorError}</p> : null}
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setShowRecipeCreator(false)} className="px-3 py-2 rounded-lg text-sm font-semibold" style={{ backgroundColor: "#E5E5E5", color: "#555" }}>Annuler</button>
              <button onClick={createRecipeFromAI} disabled={recipeGenerating} className="px-3 py-2 rounded-lg text-sm font-semibold" style={{ backgroundColor: ACCENT, color: "#FFF" }}>
                {recipeGenerating ? "Génération..." : "Créer la recette"}
              </button>
            </div>
          </div>
        </div>
      )}
      {groceryEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45" onClick={() => setGroceryEditor(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border p-6 space-y-4" style={{ borderColor: BORDER }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">{groceryEditor.mode === "create" ? "Ajouter un article" : "Modifier l'article"}</h3>
              <button onClick={() => setGroceryEditor(null)}><X className="w-5 h-5" style={{ color: MUTED }} /></button>
            </div>
            <input value={groceryEditor.categorie} onChange={(e) => setGroceryEditor((s) => (s ? { ...s, categorie: e.target.value } : s))} placeholder="Catégorie (ex: PROTEINES)" className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: BORDER }} />
            <input value={groceryEditor.article} onChange={(e) => setGroceryEditor((s) => (s ? { ...s, article: e.target.value } : s))} placeholder="Article" className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: BORDER }} />
            <input value={groceryEditor.quantite} onChange={(e) => setGroceryEditor((s) => (s ? { ...s, quantite: e.target.value } : s))} placeholder="Quantité (optionnel)" className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: BORDER }} />
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setGroceryEditor(null)} className="px-3 py-2 rounded-lg text-sm font-semibold" style={{ backgroundColor: "#E5E5E5", color: "#555" }}>Annuler</button>
              <button onClick={saveGroceryEditor} className="px-3 py-2 rounded-lg text-sm font-semibold" style={{ backgroundColor: ACCENT, color: "#FFF" }}>Enregistrer</button>
            </div>
          </div>
        </div>
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
          <TabsTrigger value="hydratation" className="text-sm">Hydratation</TabsTrigger>
          <TabsTrigger value="courses" className="text-sm">Liste de courses</TabsTrigger>
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
          <div className="flex items-center justify-end">
            <button
              onClick={() => setShowRecipeCreator(true)}
              className="px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
              style={{ backgroundColor: ACCENT, color: "#FFFFFF" }}
            >
              <Plus className="w-4 h-4" /> Ajouter recette (YouTube + IA)
            </button>
          </div>
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
                  {recipeImageUrl(recipe) ? (
                    <img
                      src={recipeImageUrl(recipe)}
                      alt={recipe.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-105"
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : null}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.3), rgba(0,0,0,0.05))" }} />
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
                  {recipe.source === "custom" && (
                    <div className="flex justify-end mb-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCustomRecipe(recipe.id);
                        }}
                        className="p-1 rounded-md hover:bg-black/5"
                        title="Supprimer la recette"
                      >
                        <Trash2 className="w-4 h-4" style={{ color: "#EF4444" }} />
                      </button>
                    </div>
                  )}
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

        <TabsContent value="hydratation" className="mt-6 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <Card style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs uppercase font-semibold" style={{ color: MUTED }}>Aujourd&apos;hui</p>
                  <Droplets className="w-4 h-4" style={{ color: "#4C9BE8" }} />
                </div>
                <p className="text-3xl font-black text-gray-900">{waterStats.today.toFixed(1)}<span className="text-sm font-medium ml-1">L</span></p>
                <div className="mt-2 mb-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#EAF1FB" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, Math.round((waterStats.today / waterStats.target) * 100))}%`,
                      backgroundColor: "#4C9BE8",
                    }}
                  />
                </div>
                <p className="text-[11px] font-semibold" style={{ color: MUTED }}>
                  {Math.min(100, Math.round((waterStats.today / waterStats.target) * 100))}% de l&apos;objectif
                </p>
                <p className="text-xs mt-1" style={{ color: waterStats.today >= waterStats.target ? ACCENT : MUTED }}>
                  Objectif: {waterStats.target.toFixed(1)}L
                </p>
              </CardContent>
            </Card>
            <Card style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs uppercase font-semibold" style={{ color: MUTED }}>Moyenne (14j)</p>
                  <Flame className="w-4 h-4" style={{ color: ACCENT }} />
                </div>
                <p className="text-3xl font-black text-gray-900">{waterStats.avg.toFixed(1)}<span className="text-sm font-medium ml-1">L</span></p>
                <p className="text-xs mt-1" style={{ color: MUTED }}>Sur {waterStats.chartData.length} jour(s) suivis</p>
              </CardContent>
            </Card>
            <Card style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs uppercase font-semibold" style={{ color: MUTED }}>Streak objectif</p>
                  <Flame className="w-4 h-4" style={{ color: "#F59E0B" }} />
                </div>
                <p className="text-3xl font-black text-gray-900">{waterStats.streak}<span className="text-sm font-medium ml-1">j</span></p>
                <p className="text-xs mt-1" style={{ color: MUTED }}>Jours consécutifs &ge; {waterStats.target.toFixed(1)}L</p>
              </CardContent>
            </Card>
            <Card style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs uppercase font-semibold" style={{ color: MUTED }}>Meilleur jour</p>
                  <Trophy className="w-4 h-4" style={{ color: "#F59E0B" }} />
                </div>
                <p className="text-3xl font-black text-gray-900">{(waterStats.bestDay?.eau ?? 0).toFixed(1)}<span className="text-sm font-medium ml-1">L</span></p>
                <p className="text-xs mt-1" style={{ color: MUTED }}>{waterStats.bestDay?.label ?? "Aucune donnée"}</p>
              </CardContent>
            </Card>
          </div>

          <Card style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-gray-900">Hydratation par semaine</CardTitle>
              <p className="text-xs" style={{ color: MUTED }}>Barres hebdo + ligne objectif (2.5L × 7)</p>
            </CardHeader>
            <CardContent>
              {waterStats.chartData.length === 0 ? (
                <p className="text-sm" style={{ color: MUTED }}>Aucune donnée d&apos;hydratation disponible.</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={waterStats.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke={MUTED} />
                    <YAxis unit="L" tick={{ fontSize: 11 }} stroke={MUTED} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 8 }}
                      formatter={(value) => [`${Number(value).toFixed(1)} L`, "Eau"]}
                    />
                    <ReferenceLine y={waterStats.targetWeekly} stroke={ACCENT} strokeDasharray="6 4" />
                    <Bar
                      dataKey="eau"
                      radius={[6, 6, 0, 0]}
                      fill="#4C9BE8"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-gray-900">Historique journalier</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {waterStats.historyData.length === 0 && (
                <p className="text-sm" style={{ color: MUTED }}>Renseigne `eau` dans le suivi hebdo pour voir l&apos;historique ici.</p>
              )}
              {waterStats.historyData.map((row) => (
                <div
                  key={row.date}
                  className="flex items-center justify-between rounded-lg px-3 py-2"
                  style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}
                >
                  <p className="text-sm font-medium text-gray-900">{row.label}</p>
                  <div className="flex items-center gap-2">
                    <Badge
                      className="text-xs"
                      style={{
                        backgroundColor: row.eau >= waterStats.target ? "rgba(29,185,84,0.12)" : "rgba(76,155,232,0.12)",
                        color: row.eau >= waterStats.target ? ACCENT : "#4C9BE8",
                        border: "none",
                      }}
                    >
                      {row.eau.toFixed(1)} L
                    </Badge>
                    {row.eau >= waterStats.target ? (
                      <span className="text-xs font-semibold" style={{ color: ACCENT }}>objectif atteint</span>
                    ) : (
                      <span className="text-xs font-semibold" style={{ color: MUTED }}>
                        manque {(waterStats.target - row.eau).toFixed(1)}L
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="mt-6 space-y-4">
          <Card style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-gray-900">Liste de courses hebdomadaire</CardTitle>
                  <p className="text-xs mt-1" style={{ color: MUTED }}>
                    Coche les aliments achetés, puis exporte la liste propre pour tes Notes.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {exportToast && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md" style={{ backgroundColor: "rgba(29,185,84,0.12)", color: ACCENT }}>
                      {exportToast}
                    </span>
                  )}
                  <button
                    onClick={resetShoppingList}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ backgroundColor: "#E5E5E5", color: "#555555" }}
                  >
                    Réinitialiser
                  </button>
                  <button
                    onClick={exportShoppingList}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ backgroundColor: ACCENT, color: "#FFFFFF" }}
                  >
                    Exporter
                  </button>
                  <button
                    onClick={() => setGroceryEditor({ mode: "create", categorie: "", article: "", quantite: "" })}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"
                    style={{ backgroundColor: "#111827", color: "#FFFFFF" }}
                  >
                    <Plus className="w-3.5 h-3.5" /> Ajouter
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {groceryRows.length === 0 && SHOPPING_GROUPS.map((group) => (
                <div key={group.title} className="rounded-xl p-4" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}>
                  <div className="mb-3">
                    <p className="text-xs font-black tracking-wide text-gray-900">{group.title}</p>
                    {group.subtitle && (
                      <p className="text-xs mt-0.5" style={{ color: MUTED }}>{group.subtitle}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {group.items.map((item) => {
                      const checked = !!shoppingChecked[item.id];
                      return (
                        <label
                          key={item.id}
                          className="flex items-center gap-2 rounded-lg px-2 py-1.5 cursor-pointer transition-colors"
                          style={{ backgroundColor: checked ? "#F0F0F0" : "transparent" }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleShoppingItem(item.id)}
                            className="w-4 h-4 accent-green-600"
                          />
                          <span
                            className="text-sm"
                            style={{
                              color: checked ? "#9CA3AF" : "#111827",
                              textDecoration: checked ? "line-through" : "none",
                            }}
                          >
                            {item.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
              {groceryRows.length > 0 && (
                <div className="rounded-xl p-4" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}>
                  <p className="text-xs font-black tracking-wide text-gray-900 mb-3">LISTE SUPABASE (SYNC)</p>
                  <div className="space-y-3">
                    {groupedGroceryRows.map((group) => (
                      <div key={group.category} className="rounded-lg p-3" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF" }}>
                        <p className="text-[11px] font-black tracking-wide mb-2" style={{ color: ACCENT }}>
                          {group.category}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {group.rows.map((row) => (
                            <div
                              key={row.id}
                              className="flex items-center gap-2 rounded-lg px-2 py-1.5 cursor-pointer transition-colors"
                              style={{ backgroundColor: row.checked ? "#F0F0F0" : "transparent" }}
                            >
                              <input
                                type="checkbox"
                                checked={!!row.checked}
                                onChange={() => toggleShoppingItem(row.id)}
                                className="w-4 h-4 accent-green-600"
                              />
                              <span
                                className="text-sm"
                                style={{
                                  color: row.checked ? "#9CA3AF" : "#111827",
                                  textDecoration: row.checked ? "line-through" : "none",
                                }}
                              >
                                {row.article}{row.quantite ? ` ${row.quantite}` : ""}
                              </span>
                              <div className="ml-auto flex items-center gap-1">
                                <button
                                  onClick={() => setGroceryEditor({ mode: "edit", id: row.id, categorie: row.categorie, article: row.article, quantite: row.quantite || "" })}
                                  className="p-1 rounded-md hover:bg-black/5"
                                  title="Modifier"
                                >
                                  <Pencil className="w-3.5 h-3.5" style={{ color: MUTED }} />
                                </button>
                                <button
                                  onClick={() => removeGroceryRow(row.id)}
                                  className="p-1 rounded-md hover:bg-black/5"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" style={{ color: "#EF4444" }} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
