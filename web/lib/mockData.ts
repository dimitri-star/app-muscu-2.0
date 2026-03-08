// ── Dashboard Stats ────────────────────────────────────────────────────────

export const dashboardStats = {
  sessionsThisWeek: 4,
  sessionsTrend: +1,
  totalVolume: "12,450",
  bodyWeight: 82.3,
  bodyWeightTrend: -0.4,
  avgCalories: 2180,
};

// ── Bench Press Progression (8 weeks) ─────────────────────────────────────

export const benchPressData = [
  { week: "S1", kg: 100 },
  { week: "S2", kg: 102.5 },
  { week: "S3", kg: 105 },
  { week: "S4", kg: 105 },
  { week: "S5", kg: 107.5 },
  { week: "S6", kg: 110 },
  { week: "S7", kg: 115 },
  { week: "S8", kg: 120 },
];

// ── Weekly Volume (8 weeks) ────────────────────────────────────────────────

export const weeklyVolumeData = [
  { week: "S1", volume: 9800 },
  { week: "S2", volume: 10500 },
  { week: "S3", volume: 9200 },
  { week: "S4", volume: 11000 },
  { week: "S5", volume: 10800 },
  { week: "S6", volume: 12100 },
  { week: "S7", volume: 11500 },
  { week: "S8", volume: 12450 },
];

// ── Muscle Frequency Radar ─────────────────────────────────────────────────

export const muscleFrequencyData = [
  { subject: "Poitrine", A: 8 },
  { subject: "Dos", A: 8 },
  { subject: "Jambes", A: 6 },
  { subject: "Épaules", A: 6 },
  { subject: "Bras", A: 5 },
  { subject: "Abdos", A: 4 },
];

// ── Body Weight (3 months) ─────────────────────────────────────────────────

export const bodyWeightData = [
  { date: "Jan 1", kg: 80.5 },
  { date: "Jan 8", kg: 80.8 },
  { date: "Jan 15", kg: 81.0 },
  { date: "Jan 22", kg: 81.2 },
  { date: "Feb 1", kg: 81.5 },
  { date: "Feb 8", kg: 81.4 },
  { date: "Feb 15", kg: 81.8 },
  { date: "Feb 22", kg: 82.0 },
  { date: "Mar 1", kg: 82.1 },
  { date: "Mar 8", kg: 82.3 },
];

// ── Recent Sessions ────────────────────────────────────────────────────────

export const recentSessions = [
  {
    id: 1,
    title: "Push — Poitrine & Épaules",
    date: "07 Mar 2026",
    duration: "1h 15min",
    volume: "4 850 kg",
    exercises: 6,
  },
  {
    id: 2,
    title: "Pull — Dos & Biceps",
    date: "06 Mar 2026",
    duration: "1h 05min",
    volume: "3 920 kg",
    exercises: 5,
  },
  {
    id: 3,
    title: "Legs — Quadriceps & Fessiers",
    date: "05 Mar 2026",
    duration: "1h 20min",
    volume: "5 680 kg",
    exercises: 7,
  },
];

// ── All Workouts ───────────────────────────────────────────────────────────

export const allWorkouts = [
  {
    id: 1,
    title: "Push — Poitrine & Épaules",
    date: "07 Mar 2026",
    duration: "1h 15min",
    volume: "4 850 kg",
    exerciseCount: 6,
    muscleGroup: "Poitrine",
    topExercises: ["Développé couché 120kg", "Press épaules 75kg", "Dips +20kg"],
  },
  {
    id: 2,
    title: "Pull — Dos & Biceps",
    date: "06 Mar 2026",
    duration: "1h 05min",
    volume: "3 920 kg",
    exerciseCount: 5,
    muscleGroup: "Dos",
    topExercises: ["Tractions +30kg", "Rowing barre 100kg", "Curl barre 50kg"],
  },
  {
    id: 3,
    title: "Legs — Quadriceps & Fessiers",
    date: "05 Mar 2026",
    duration: "1h 20min",
    volume: "5 680 kg",
    exerciseCount: 7,
    muscleGroup: "Jambes",
    topExercises: ["Squat 140kg", "Leg press 200kg", "Romanian DL 120kg"],
  },
  {
    id: 4,
    title: "Push — Poitrine & Triceps",
    date: "03 Mar 2026",
    duration: "1h 10min",
    volume: "4 200 kg",
    exerciseCount: 5,
    muscleGroup: "Poitrine",
    topExercises: ["Développé incliné 100kg", "Écarté haltères 30kg", "Pushdown câble"],
  },
  {
    id: 5,
    title: "Pull — Dos & Biceps",
    date: "02 Mar 2026",
    duration: "58min",
    volume: "3 750 kg",
    exerciseCount: 5,
    muscleGroup: "Dos",
    topExercises: ["Lat pulldown 90kg", "Rowing câble 70kg", "Curl marteau 20kg"],
  },
  {
    id: 6,
    title: "Legs — Ischio & Mollets",
    date: "01 Mar 2026",
    duration: "1h 00min",
    volume: "4 500 kg",
    exerciseCount: 6,
    muscleGroup: "Jambes",
    topExercises: ["Leg curl 80kg", "Good morning 80kg", "Calf raise 160kg"],
  },
  {
    id: 7,
    title: "Push — Épaules Focus",
    date: "28 Fév 2026",
    duration: "1h 05min",
    volume: "3 980 kg",
    exerciseCount: 6,
    muscleGroup: "Épaules",
    topExercises: ["Press militaire 80kg", "Élévations lat 18kg", "Face pulls 30kg"],
  },
  {
    id: 8,
    title: "Pull — Grand dorsal",
    date: "26 Fév 2026",
    duration: "1h 15min",
    volume: "4 100 kg",
    exerciseCount: 5,
    muscleGroup: "Dos",
    topExercises: ["Tractions lestées +35kg", "Rowing unilatéral 50kg"],
  },
  {
    id: 9,
    title: "Legs — Full Legs",
    date: "25 Fév 2026",
    duration: "1h 30min",
    volume: "6 200 kg",
    exerciseCount: 8,
    muscleGroup: "Jambes",
    topExercises: ["Squat 135kg", "Fentes marchées 80kg", "Presse 220kg"],
  },
  {
    id: 10,
    title: "Bras & Abdos",
    date: "23 Fév 2026",
    duration: "55min",
    volume: "2 800 kg",
    exerciseCount: 6,
    muscleGroup: "Bras",
    topExercises: ["Curl barre 55kg", "Dips +25kg", "Planche 1min"],
  },
];

// ── Programme PPL ──────────────────────────────────────────────────────────

export const currentProgram = {
  name: "PPL — Force & Hypertrophie",
  frequency: "6j/7",
  focus: "Prise de masse",
  weeks: 8,
  currentWeek: 5,
};

export const weeklySchedule = [
  {
    day: "Lun",
    label: "Push",
    exercises: [
      { name: "Développé couché", sets: "4x5", rest: "3min" },
      { name: "Press épaules", sets: "3x8", rest: "2min" },
      { name: "Développé incliné", sets: "3x10", rest: "2min" },
      { name: "Écarté câble", sets: "3x12", rest: "90s" },
      { name: "Pushdown", sets: "3x15", rest: "60s" },
    ],
  },
  {
    day: "Mar",
    label: "Pull",
    exercises: [
      { name: "Tractions lestées", sets: "4x6", rest: "3min" },
      { name: "Rowing barre", sets: "4x6", rest: "2min30" },
      { name: "Lat pulldown", sets: "3x10", rest: "2min" },
      { name: "Rowing câble", sets: "3x12", rest: "90s" },
      { name: "Curl barre", sets: "3x10", rest: "90s" },
    ],
  },
  {
    day: "Mer",
    label: "Legs",
    exercises: [
      { name: "Squat", sets: "4x5", rest: "4min" },
      { name: "Leg press", sets: "3x10", rest: "3min" },
      { name: "Romanian DL", sets: "3x8", rest: "2min30" },
      { name: "Leg curl", sets: "3x12", rest: "90s" },
      { name: "Calf raise", sets: "4x15", rest: "60s" },
    ],
  },
  {
    day: "Jeu",
    label: "Push",
    exercises: [
      { name: "Press incliné", sets: "4x8", rest: "2min30" },
      { name: "Développé haltères", sets: "3x10", rest: "2min" },
      { name: "Élévations lat", sets: "4x15", rest: "60s" },
      { name: "Écarté haltères", sets: "3x12", rest: "90s" },
      { name: "Extension triceps", sets: "3x12", rest: "60s" },
    ],
  },
  {
    day: "Ven",
    label: "Pull",
    exercises: [
      { name: "Deadlift", sets: "4x4", rest: "4min" },
      { name: "Rowing unilatéral", sets: "3x10", rest: "2min" },
      { name: "Face pulls", sets: "3x15", rest: "60s" },
      { name: "Curl marteau", sets: "3x12", rest: "90s" },
      { name: "Curl concentré", sets: "2x15", rest: "60s" },
    ],
  },
  {
    day: "Sam",
    label: "Legs",
    exercises: [
      { name: "Front squat", sets: "4x6", rest: "3min" },
      { name: "Fentes marchées", sets: "3x10", rest: "2min" },
      { name: "Good morning", sets: "3x10", rest: "2min" },
      { name: "Leg extension", sets: "3x15", rest: "60s" },
      { name: "Abdos", sets: "3x20", rest: "45s" },
    ],
  },
  {
    day: "Dim",
    label: "Repos",
    exercises: [],
  },
];

export const archivedPrograms = [
  {
    name: "Full Body Débutant",
    duration: "12 semaines",
    period: "Juin — Août 2025",
    focus: "Base de force",
  },
  {
    name: "Upper / Lower Split",
    duration: "8 semaines",
    period: "Sep — Oct 2025",
    focus: "Hypertrophie",
  },
  {
    name: "GVT — German Volume Training",
    duration: "6 semaines",
    period: "Nov — Déc 2025",
    focus: "Volume",
  },
];

// ── Personal Records ───────────────────────────────────────────────────────

export const personalRecords = [
  {
    id: 1,
    exercise: "Développé Couché",
    weight: 120,
    reps: 1,
    date: "15 Fév 2026",
    muscleGroup: "Poitrine",
    notes: "Nouveau PR ! Bonne profondeur.",
    progression: [80, 90, 100, 107.5, 110, 115, 120],
  },
  {
    id: 2,
    exercise: "Squat",
    weight: 140,
    reps: 1,
    date: "20 Fév 2026",
    muscleGroup: "Jambes",
    notes: "ATG, ceinture utilisée.",
    progression: [100, 110, 120, 125, 130, 135, 140],
  },
  {
    id: 3,
    exercise: "Soulevé de Terre",
    weight: 160,
    reps: 1,
    date: "22 Jan 2026",
    muscleGroup: "Dos",
    notes: "Sumo stance, straps.",
    progression: [120, 130, 140, 145, 150, 155, 160],
  },
  {
    id: 4,
    exercise: "Développé Épaules",
    weight: 75,
    reps: 1,
    date: "10 Fév 2026",
    muscleGroup: "Épaules",
    notes: "Assis, haltères.",
    progression: [50, 57.5, 62.5, 67.5, 70, 72.5, 75],
  },
  {
    id: 5,
    exercise: "Tractions Lestées",
    weight: 30,
    reps: 5,
    date: "01 Mar 2026",
    muscleGroup: "Dos",
    notes: "+30kg de lest, 5 reps propres.",
    progression: [0, 5, 10, 15, 20, 25, 30],
  },
  {
    id: 6,
    exercise: "Curl Barre",
    weight: 60,
    reps: 6,
    date: "25 Fév 2026",
    muscleGroup: "Bras",
    notes: "Strict, pas de balancement.",
    progression: [40, 45, 50, 52.5, 55, 57.5, 60],
  },
  {
    id: 7,
    exercise: "Dips Lestés",
    weight: 35,
    reps: 5,
    date: "18 Fév 2026",
    muscleGroup: "Poitrine",
    notes: "Amplitude complète.",
    progression: [0, 10, 15, 20, 25, 30, 35],
  },
  {
    id: 8,
    exercise: "Press Incliné",
    weight: 105,
    reps: 3,
    date: "12 Mar 2026",
    muscleGroup: "Poitrine",
    notes: "30° d'inclinaison.",
    progression: [70, 80, 87.5, 92.5, 97.5, 100, 105],
  },
];

// ── Nutrition ──────────────────────────────────────────────────────────────

export const todayMacros = {
  calories: { current: 1847, target: 2500 },
  protein: { current: 142, target: 180 },
  carbs: { current: 210, target: 280 },
  fat: { current: 52, target: 70 },
};

export const meals = [
  {
    id: 1,
    name: "Petit-déjeuner",
    time: "07:30",
    calories: 520,
    items: [
      { name: "Flocons d'avoine", qty: "80g", calories: 300, protein: 10, carbs: 55, fat: 6 },
      { name: "Banane", qty: "1 grande", calories: 105, protein: 1, carbs: 27, fat: 0 },
      { name: "Whey protéine", qty: "30g", calories: 115, protein: 25, carbs: 3, fat: 1 },
    ],
  },
  {
    id: 2,
    name: "Déjeuner",
    time: "12:30",
    calories: 680,
    items: [
      { name: "Riz blanc cuit", qty: "200g", calories: 260, protein: 5, carbs: 58, fat: 1 },
      { name: "Blanc de poulet", qty: "180g", calories: 270, protein: 56, carbs: 0, fat: 3 },
      { name: "Légumes vapeur", qty: "150g", calories: 50, protein: 3, carbs: 10, fat: 0 },
      { name: "Huile d'olive", qty: "10ml", calories: 90, protein: 0, carbs: 0, fat: 10 },
    ],
  },
  {
    id: 3,
    name: "Collation pré-training",
    time: "17:00",
    calories: 320,
    items: [
      { name: "Pain de mie complet", qty: "2 tranches", calories: 180, protein: 8, carbs: 32, fat: 2 },
      { name: "Beurre de cacahuète", qty: "20g", calories: 120, protein: 5, carbs: 3, fat: 10 },
      { name: "Pomme", qty: "1 moyenne", calories: 80, protein: 0, carbs: 21, fat: 0 },
    ],
  },
  {
    id: 4,
    name: "Dîner",
    time: "20:00",
    calories: 327,
    items: [
      { name: "Saumon", qty: "150g", calories: 250, protein: 35, carbs: 0, fat: 12 },
      { name: "Patate douce", qty: "150g", calories: 129, protein: 2, carbs: 30, fat: 0 },
      { name: "Épinards", qty: "100g", calories: 23, protein: 3, carbs: 4, fat: 0 },
    ],
  },
];

export const weeklyMacros = [
  { day: "Lun", calories: 2450, protein: 175, carbs: 290, fat: 68 },
  { day: "Mar", calories: 2380, protein: 168, carbs: 275, fat: 65 },
  { day: "Mer", calories: 2620, protein: 185, carbs: 310, fat: 72 },
  { day: "Jeu", calories: 2100, protein: 145, carbs: 240, fat: 58 },
  { day: "Ven", calories: 2500, protein: 178, carbs: 295, fat: 67 },
  { day: "Sam", calories: 2800, protein: 190, carbs: 330, fat: 78 },
  { day: "Dim", calories: 1847, protein: 142, carbs: 210, fat: 52 },
];

export const recipes = [
  {
    id: 1,
    name: "Bol de Riz au Thon",
    time: "10 min",
    calories: 480,
    protein: 45,
    carbs: 65,
    fat: 8,
    tags: ["Protéiné", "Rapide"],
    ingredients: ["200g riz cuit", "1 boîte thon", "Sauce soja", "Avocat"],
  },
  {
    id: 2,
    name: "Omelette Fromage & Épinards",
    time: "8 min",
    calories: 380,
    protein: 30,
    carbs: 4,
    fat: 26,
    tags: ["Low-carb", "Rapide"],
    ingredients: ["4 œufs", "50g emmental", "100g épinards", "Beurre"],
  },
  {
    id: 3,
    name: "Shake Masse Post-Training",
    time: "3 min",
    calories: 620,
    protein: 55,
    carbs: 80,
    fat: 10,
    tags: ["Protéiné"],
    ingredients: ["2 scoops whey", "1 banane", "200ml lait", "50g flocons d'avoine"],
  },
  {
    id: 4,
    name: "Poulet Patate Douce Curry",
    time: "25 min",
    calories: 550,
    protein: 50,
    carbs: 60,
    fat: 10,
    tags: ["Protéiné"],
    ingredients: ["200g poulet", "200g patate douce", "Curry", "Lait de coco"],
  },
  {
    id: 5,
    name: "Salade Grecque Thon",
    time: "10 min",
    calories: 320,
    protein: 38,
    carbs: 15,
    fat: 14,
    tags: ["Low-carb", "Rapide"],
    ingredients: ["Thon", "Concombre", "Tomates cerises", "Feta", "Olives"],
  },
  {
    id: 6,
    name: "Pancakes Protéinés",
    time: "15 min",
    calories: 440,
    protein: 42,
    carbs: 48,
    fat: 8,
    tags: ["Protéiné"],
    ingredients: ["1 banane", "2 œufs", "1 scoop whey", "Myrtilles"],
  },
];

export const nutritionPlan = {
  name: "Prise de masse — 2800 kcal",
  target: { calories: 2800, protein: 200, carbs: 330, fat: 80 },
  days: [
    {
      day: "Lundi (Entraînement)",
      meals: [
        { name: "Petit-déjeuner", calories: 600, protein: 35, carbs: 80, fat: 15 },
        { name: "Déjeuner", calories: 750, protein: 60, carbs: 90, fat: 18 },
        { name: "Pré-training", calories: 400, protein: 25, carbs: 55, fat: 8 },
        { name: "Post-training", calories: 500, protein: 50, carbs: 65, fat: 10 },
        { name: "Dîner", calories: 550, protein: 40, carbs: 60, fat: 15 },
      ],
    },
    {
      day: "Mardi (Repos)",
      meals: [
        { name: "Petit-déjeuner", calories: 520, protein: 30, carbs: 65, fat: 14 },
        { name: "Déjeuner", calories: 680, protein: 55, carbs: 80, fat: 16 },
        { name: "Collation", calories: 300, protein: 20, carbs: 35, fat: 8 },
        { name: "Dîner", calories: 500, protein: 38, carbs: 55, fat: 14 },
      ],
    },
  ],
};

// ── Assistant Sample Chat ──────────────────────────────────────────────────

export const initialMessages = [
  {
    role: "user" as const,
    content: "Analyse ma semaine d'entraînement",
  },
  {
    role: "assistant" as const,
    content: `**Analyse de ta semaine d'entraînement** 💪

Voici un résumé détaillé de tes performances :

**Volume par groupe musculaire :**

| Groupe | Séries | Volume estimé |
|--------|--------|---------------|
| Poitrine | 18 | 4 850 kg |
| Dos | 17 | 3 920 kg |
| Jambes | 22 | 5 680 kg |
| Épaules | 12 | 1 800 kg |

**Points positifs :**
- Volume total excellent : **12 450 kg** (+8% vs semaine précédente)
- 4 séances complétées, cohérent avec ton programme PPL
- Nouveau PR au Bench Press (120kg)

**Recommandations :**
1. **Récupération** : Assure-toi de dormir 8h — clé pour la prise de masse
2. **Nutrition** : Tes apports en protéines (142g) sont légèrement sous ta cible (180g). Ajoute un shake post-training
3. **Volume épaules** : Un peu faible comparé au reste — envisage 2 séries d'élévations latérales supplémentaires

Continues comme ça, tu es sur la bonne trajectoire ! 🎯`,
  },
];

// ── Parameters / Settings ──────────────────────────────────────────────────

export const userProfile = {
  name: "Dimitri Alvarez",
  age: 25,
  height: 180,
  weight: 82.3,
  goal: "masse" as "masse" | "seche" | "maintien" | "force",
  macros: { protein: 180, carbs: 280, fat: 70, kcal: 2500 },
  waterGoal: 3.0,
  measurements: {
    arms: 40,
    thighs: 62,
    waist: 82,
    hips: 98,
  },
};
