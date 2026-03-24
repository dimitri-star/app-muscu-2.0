// ── Dashboard Stats ────────────────────────────────────────────────────────

export const dashboardStats = {
  sessionsThisWeek: 4,
  sessionsTrend: +1,
  totalVolume: "12,450",
  bodyWeight: 66.5,
  bodyWeightTrend: -0.3,
  avgCalories: 2200,
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
  { date: "Jan 1",  kg: 68.2 },
  { date: "Jan 8",  kg: 67.8 },
  { date: "Jan 15", kg: 67.5 },
  { date: "Jan 22", kg: 67.2 },
  { date: "Feb 1",  kg: 67.0 },
  { date: "Feb 8",  kg: 67.1 },
  { date: "Feb 15", kg: 66.9 },
  { date: "Feb 22", kg: 66.7 },
  { date: "Mar 1",  kg: 66.6 },
  { date: "Mar 8",  kg: 66.5 },
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
  name: "Bloc 1 — Hybride Force/Cardio/Callisthénie",
  frequency: "7j/7",
  focus: "Sèche + Force + Technique",
  weeks: 4,
  currentWeek: 1,
};

export const weeklySchedule = [
  {
    day: "Lun",
    label: "Bench Halt FORCE + Trac Prona FORCE",
    exercises: [
      { name: "Développé couché haltères", sets: "Séries lourdes", rest: "3-4min", note: "FORCE — objectif 60kg/main" },
      { name: "Tractions pronation lestées", sets: "Séries lourdes", rest: "3-4min", note: "FORCE — technique dorsaux, pas les bras" },
      { name: "Avant-bras", sets: "3x12-15", rest: "60s", note: "Curl inversé + flexion poignets" },
    ],
  },
  {
    day: "Mar",
    label: "Run",
    exercises: [
      { name: "Run Z2", sets: "45-50min", rest: "", note: "Allure 5:20-5:40/km" },
      { name: "OU Fractionné", sets: "10×1'30", rest: "", note: "Z5 effort / Z1 récup" },
    ],
  },
  {
    day: "Mer",
    label: "Lower — Squat technique + Mobilité",
    exercises: [
      { name: "Back Squat", sets: "Technique", rest: "3-4min", note: "Objectif 140×3 propre" },
      { name: "Mobilité chevilles", sets: "3×10/côté", rest: "60s", note: "Correctif prioritaire" },
      { name: "Accessoires jambes", sets: "3x10-12", rest: "2min", note: "RDL / Leg curl" },
    ],
  },
  {
    day: "Jeu",
    label: "Dips VOL + Bench Barre VOL + Trac Supi + OHP Halt",
    exercises: [
      { name: "Dips lestés", sets: "VOLUME", rest: "2-3min", note: "Objectif +102-105kg" },
      { name: "Développé couché barre", sets: "VOLUME", rest: "2-3min", note: "Objectif 127-130kg" },
      { name: "Tractions supination", sets: "VOLUME", rest: "2min", note: "Back-off après prona" },
      { name: "OHP haltères", sets: "VOLUME", rest: "2min", note: "Objectif 38kg/main" },
      { name: "Abdos", sets: "3x15-20", rest: "45s", note: "" },
    ],
  },
  {
    day: "Ven",
    label: "Run",
    exercises: [
      { name: "Run Z2 ou fractionné", sets: "", rest: "", note: "" },
    ],
  },
  {
    day: "Sam",
    label: "Dips FORCE + OHP Barre FORCE + Callisthénie",
    exercises: [
      { name: "Dips lestés", sets: "FORCE", rest: "3-4min", note: "Objectif +102-105kg" },
      { name: "OHP barre", sets: "FORCE", rest: "3-4min", note: "Objectif 65×3" },
      { name: "HSP (pompes mur)", sets: "Objectif 30 reps", rest: "2min", note: "Callisthénie" },
      { name: "HS libre", sets: "Objectif 15s+", rest: "", note: "Callisthénie" },
      { name: "Planche avancée tuck", sets: "5-8s", rest: "", note: "Callisthénie" },
    ],
  },
  {
    day: "Dim",
    label: "Bras + Row + Pompes lestées + EMOM/AMRAP",
    exercises: [
      { name: "Curl barre", sets: "3x5-6", rest: "2min", note: "46kg — objectif +" },
      { name: "Rowing barre", sets: "VOLUME", rest: "2min", note: "81kg volume" },
      { name: "Pompes lestées", sets: "3x max", rest: "2min", note: "" },
      { name: "EMOM / AMRAP", sets: "10-15min", rest: "", note: "Conditioning" },
      { name: "Abdos fonctionnels", sets: "3x15-20", rest: "45s", note: "" },
    ],
  },
];

export const archivedPrograms = [
  {
    name: "Ancien Bloc — PPL Force/Volume",
    duration: "6 semaines",
    period: "Fév — Mar 2026",
    focus: "Force + Volume (Dips PR +100kg, Trac +45kg, Squat 150kg)",
  },
];

// ── Personal Records ───────────────────────────────────────────────────────

export const personalRecords = [
  {
    id: 1,
    exercise: "Développé Couché Haltères",
    weight: 58,
    reps: 1,
    date: "21 Mar 2026",
    muscleGroup: "Poitrine",
    notes: "PR par bras — objectif Bloc 1 : 60kg/main",
    progression: [40, 44, 46, 50, 52, 54, 56, 58],
  },
  {
    id: 2,
    exercise: "Développé Couché Barre",
    weight: 125,
    reps: 1,
    date: "Estimé",
    muscleGroup: "Poitrine",
    notes: "Estimé — objectif Bloc 1 : 127-130kg",
    progression: [80, 90, 100, 107.5, 112.5, 117.5, 120, 125],
  },
  {
    id: 3,
    exercise: "Dips Lestés",
    weight: 100,
    reps: 2,
    date: "S4 ancien bloc",
    muscleGroup: "Poitrine / Triceps",
    notes: "+100kg de lest — objectif Bloc 1 : +102-105kg",
    progression: [40, 50, 60, 70, 80, 90, 95, 100],
  },
  {
    id: 4,
    exercise: "Tractions Pronation Lestées",
    weight: 45,
    reps: 1,
    date: "S4 ancien bloc",
    muscleGroup: "Dos",
    notes: "RPE 10 — tire avec les bras. Correctif technique en cours.",
    progression: [0, 10, 20, 30, 35, 40, 42, 45],
  },
  {
    id: 5,
    exercise: "Back Squat",
    weight: 150,
    reps: 1,
    date: "S5 ancien bloc",
    muscleGroup: "Jambes",
    notes: "Technique à revoir — objectif Bloc 1 : 140×3 propre",
    progression: [80, 100, 115, 125, 135, 140, 145, 150],
  },
  {
    id: 6,
    exercise: "OHP Barre",
    weight: 65,
    reps: 1,
    date: "Estimé",
    muscleGroup: "Épaules",
    notes: "Estimé — objectif Bloc 1 : 65×3",
    progression: [40, 47.5, 52.5, 55, 57.5, 60, 62.5, 65],
  },
  {
    id: 7,
    exercise: "OHP Haltères",
    weight: 36,
    reps: 1,
    date: "Estimé",
    muscleGroup: "Épaules",
    notes: "Par bras — estimé",
    progression: [24, 26, 28, 30, 32, 34, 36],
  },
  {
    id: 8,
    exercise: "Soulevé de Terre Roumain",
    weight: 120,
    reps: 6,
    date: "",
    muscleGroup: "Ischio-jambiers",
    notes: "Avec ceinture",
    progression: [60, 80, 90, 100, 110, 115, 120],
  },
  {
    id: 9,
    exercise: "Curl Barre",
    weight: 46,
    reps: 5,
    date: "",
    muscleGroup: "Bras",
    notes: "Strict",
    progression: [30, 35, 38, 40, 42, 44, 46],
  },
  {
    id: 10,
    exercise: "Rowing Barre",
    weight: 81,
    reps: 6,
    date: "",
    muscleGroup: "Dos",
    notes: "",
    progression: [50, 60, 65, 70, 75, 78, 81],
  },
];

// ── Nutrition ──────────────────────────────────────────────────────────────

export const todayMacros = {
  calories: { current: 1680, target: 2200 },
  protein: { current: 105, target: 140 },
  carbs: { current: 210, target: 275 },
  fat: { current: 38, target: 60 },
};

export const meals = [
  {
    id: 1,
    name: "Petit-déjeuner",
    time: "07:30",
    calories: 530,
    items: [
      { name: "Oeufs au plat", qty: "3 oeufs", calories: 210, protein: 18, carbs: 1, fat: 15 },
      { name: "Fromage blanc 0%", qty: "150g", calories: 75, protein: 12, carbs: 5, fat: 0 },
      { name: "Banane ou kiwi", qty: "1", calories: 80, protein: 1, carbs: 20, fat: 0 },
      { name: "Miel", qty: "8g", calories: 24, protein: 0, carbs: 6, fat: 0 },
      { name: "Graines de chia", qty: "10g", calories: 49, protein: 2, carbs: 4, fat: 3 },
      { name: "Fruits rouges surgelés", qty: "40g", calories: 20, protein: 0, carbs: 5, fat: 0 },
    ],
  },
  {
    id: 2,
    name: "Déjeuner",
    time: "12:00",
    calories: 730,
    items: [
      { name: "Dinde ou poulet CRU", qty: "180g", calories: 280, protein: 42, carbs: 0, fat: 6 },
      { name: "Riz basmati CRU", qty: "90g", calories: 320, protein: 6, carbs: 72, fat: 1 },
      { name: "Brocolis / épinards", qty: "200g", calories: 60, protein: 4, carbs: 8, fat: 1 },
      { name: "Betteraves", qty: "100g", calories: 43, protein: 2, carbs: 10, fat: 0 },
      { name: "Huile olive", qty: "5ml", calories: 45, protein: 0, carbs: 0, fat: 5 },
      { name: "Ail + oignon cru", qty: "1 gousse + 30g", calories: 20, protein: 0, carbs: 5, fat: 0 },
    ],
  },
  {
    id: 3,
    name: "Collation",
    time: "15:30",
    calories: 230,
    items: [
      { name: "Banane", qty: "1", calories: 100, protein: 1, carbs: 25, fat: 0 },
      { name: "Amandes", qty: "15g", calories: 90, protein: 3, carbs: 3, fat: 8 },
      { name: "Dattes (juste avant salle)", qty: "2", calories: 56, protein: 0, carbs: 15, fat: 0 },
    ],
  },
  {
    id: 4,
    name: "Dîner",
    time: "20:00",
    calories: 710,
    items: [
      { name: "Steak haché / cheval CRU", qty: "170g", calories: 290, protein: 32, carbs: 0, fat: 12 },
      { name: "Patate douce CRU", qty: "220g", calories: 198, protein: 3, carbs: 46, fat: 0 },
      { name: "Courgettes / asperges", qty: "200g", calories: 40, protein: 2, carbs: 6, fat: 0 },
      { name: "Oeufs", qty: "2", calories: 140, protein: 12, carbs: 1, fat: 10 },
      { name: "Fromage blanc 0%", qty: "150g", calories: 75, protein: 12, carbs: 5, fat: 0 },
      { name: "Avocat (2-3×/sem)", qty: "1/2", calories: 80, protein: 1, carbs: 2, fat: 8 },
      { name: "Chocolat noir 85%", qty: "10g", calories: 58, protein: 1, carbs: 3, fat: 5 },
    ],
  },
];

export const weeklyMacros = [
  { day: "Lun", calories: 2210, protein: 138, carbs: 278, fat: 61 },
  { day: "Mar", calories: 2190, protein: 135, carbs: 272, fat: 59 },
  { day: "Mer", calories: 2230, protein: 142, carbs: 280, fat: 62 },
  { day: "Jeu", calories: 2200, protein: 140, carbs: 275, fat: 60 },
  { day: "Ven", calories: 2180, protein: 137, carbs: 270, fat: 58 },
  { day: "Sam", calories: 2250, protein: 143, carbs: 282, fat: 63 },
  { day: "Dim", calories: 1680, protein: 105, carbs: 210, fat: 38 },
];

export const recipes = [
  {
    id: 1,
    name: "Poulet patate douce ail gingembre",
    time: "20 min",
    calories: 550,
    protein: 42,
    carbs: 55,
    fat: 12,
    tags: ["Protéiné", "Rapide", "Pro-testo"],
    emoji: "🍗",
    color: "#F59E0B",
    ingredients: ["180g poulet CRU", "220g patate douce CRU", "200g courgettes", "2 gousses ail", "5g gingembre", "5ml huile olive"],
    ingredientDetails: [
      { name: "Poulet (blanc)", qty: "180g CRU", protein: 38, carbs: 0, fat: 4, calories: 189 },
      { name: "Patate douce", qty: "220g CRU", protein: 3, carbs: 46, fat: 0, calories: 196 },
      { name: "Courgettes", qty: "200g", protein: 2, carbs: 5, fat: 0, calories: 28 },
      { name: "Ail + gingembre", qty: "2 gousses + 5g", protein: 0, carbs: 3, fat: 0, calories: 12 },
      { name: "Huile d'olive", qty: "5ml", protein: 0, carbs: 0, fat: 5, calories: 44 },
    ],
    steps: [
      "Préchauffer le four à 200°C. Couper la patate douce en cubes de ~2cm.",
      "Mélanger les cubes avec un filet d'huile, sel, poivre. Enfourner 20 min (retourner à mi-cuisson).",
      "Pendant ce temps, émincer l'ail et râper le gingembre.",
      "Dans une poêle chaude, dorer le poulet coupé en lanières 4-5 min côté peau.",
      "Ajouter ail + gingembre, mélanger 1 min.",
      "Ajouter les courgettes en rondelles, cuire 3-4 min à feu vif.",
      "Dresser : patate douce + poulet + légumes. Assaisonner sel/poivre/herbes.",
    ],
    tip: "Variante : ajouter du curry et du lait de coco pour plus de goût (+ ~30 kcal).",
    youtubeQuery: "poulet patate douce gingembre healthy musculation",
  },
  {
    id: 2,
    name: "Steak haché cheval + épinards oignon",
    time: "15 min",
    calories: 420,
    protein: 38,
    carbs: 8,
    fat: 18,
    tags: ["Protéiné", "Pro-testo", "Low-carb"],
    emoji: "🥩",
    color: "#EF4444",
    ingredients: ["170g steak haché CRU ou cheval", "200g épinards frais", "50g oignon émincé", "1 gousse ail", "5ml huile olive"],
    ingredientDetails: [
      { name: "Steak haché 5% ou cheval", qty: "170g CRU", protein: 35, carbs: 0, fat: 10, calories: 235 },
      { name: "Épinards frais", qty: "200g", protein: 5, carbs: 3, fat: 1, calories: 40 },
      { name: "Oignon", qty: "50g émincé", protein: 1, carbs: 5, fat: 0, calories: 22 },
      { name: "Ail", qty: "1 gousse", protein: 0, carbs: 1, fat: 0, calories: 5 },
      { name: "Huile d'olive", qty: "5ml", protein: 0, carbs: 0, fat: 5, calories: 44 },
    ],
    steps: [
      "Émincer finement l'oignon et écraser la gousse d'ail.",
      "Dans une poêle, faire revenir oignon + ail dans l'huile à feu moyen, 3 min.",
      "Ajouter le steak haché, l'écraser à la spatule pour obtenir de la viande hachée émiettée.",
      "Cuire 4-5 min en mélangeant régulièrement. Saler, poivrer.",
      "Baisser le feu, ajouter les épinards frais en plusieurs fois (ils réduisent beaucoup).",
      "Mélanger 2-3 min jusqu'à ce que les épinards soient fondus. Rectifier l'assaisonnement.",
    ],
    tip: "Le cheval est plus maigre et plus riche en fer que le bœuf — parfait pour la sèche.",
    youtubeQuery: "steak haché épinards recette musculation sèche",
  },
  {
    id: 3,
    name: "Bowl sardines riz betteraves",
    time: "10 min",
    calories: 580,
    protein: 48,
    carbs: 65,
    fat: 14,
    tags: ["Protéiné", "Rapide", "Budget"],
    emoji: "🐟",
    color: "#3B82F6",
    ingredients: ["2 boites sardines", "90g riz basmati CRU (cuit la veille)", "100g betteraves", "30g oignon cru"],
    ingredientDetails: [
      { name: "Sardines à l'huile d'olive (égouttées)", qty: "2 boîtes (~200g)", protein: 40, carbs: 0, fat: 12, calories: 272 },
      { name: "Riz basmati cuit", qty: "90g CRU → ~270g cuit", protein: 6, carbs: 65, fat: 1, calories: 292 },
      { name: "Betteraves cuite", qty: "100g", protein: 2, carbs: 10, fat: 0, calories: 45 },
      { name: "Oignon cru", qty: "30g", protein: 0, carbs: 2, fat: 0, calories: 12 },
    ],
    steps: [
      "Préparer le riz la veille : cuire 90g de riz basmati dans 180ml eau salée, laisser refroidir, conserver au frigo.",
      "Couper les betteraves en petits cubes. Émincer l'oignon cru finement.",
      "Réchauffer le riz 2 min au micro-ondes.",
      "Égoutter les sardines. Les disposer sur le riz chaud.",
      "Ajouter betteraves + oignon par-dessus.",
      "Optionnel : filet de citron, quelques gouttes de vinaigre balsamique.",
    ],
    tip: "Les sardines sont parmi les meilleures sources d'omega-3 et calcium. 2 boîtes/semaine minimum.",
    youtubeQuery: "bowl sardines riz betterave meal prep",
  },
  {
    id: 4,
    name: "Omelette épinards fromage brebis",
    time: "8 min",
    calories: 420,
    protein: 32,
    carbs: 4,
    fat: 28,
    tags: ["Protéiné", "Rapide", "Low-carb"],
    emoji: "🥚",
    color: "#8B5CF6",
    ingredients: ["4 oeufs", "100g épinards", "20g fromage brebis", "1 gousse ail"],
    ingredientDetails: [
      { name: "Oeufs entiers", qty: "4 oeufs (~220g)", protein: 25, carbs: 1, fat: 20, calories: 284 },
      { name: "Épinards frais", qty: "100g", protein: 3, carbs: 2, fat: 0, calories: 23 },
      { name: "Fromage brebis", qty: "20g", protein: 3, carbs: 0, fat: 6, calories: 66 },
      { name: "Ail", qty: "1 gousse", protein: 0, carbs: 1, fat: 0, calories: 5 },
    ],
    steps: [
      "Battre les 4 oeufs à la fourchette avec une pincée de sel et de poivre.",
      "Faire revenir ail émincé dans une poêle anti-adhésive légèrement huilée, 1 min.",
      "Ajouter les épinards, cuire 2 min jusqu'à ce qu'ils réduisent. Retirer et réserver.",
      "Verser les oeufs battus dans la poêle chaude. Laisser coaguler à feu moyen-doux.",
      "Dès que les bords sont pris (centre encore légèrement liquide), déposer épinards + fromage brebis émietté.",
      "Plier l'omelette en deux. Couper le feu. Servir immédiatement.",
    ],
    tip: "Les oeufs entiers = une des meilleures sources de testostérone naturelle grâce au cholestérol des jaunes.",
    youtubeQuery: "omelette épinards protéinée musculation petit déjeuner",
  },
  {
    id: 5,
    name: "Foie de volaille poêlé oignon",
    time: "12 min",
    calories: 280,
    protein: 32,
    carbs: 5,
    fat: 12,
    tags: ["Protéiné", "Pro-testo", "Budget"],
    emoji: "🫀",
    color: "#1DB954",
    ingredients: ["150g foie de poulet", "50g oignon", "1 gousse ail", "5ml huile olive"],
    ingredientDetails: [
      { name: "Foie de poulet", qty: "150g", protein: 30, carbs: 1, fat: 7, calories: 185 },
      { name: "Oignon", qty: "50g", protein: 1, carbs: 4, fat: 0, calories: 20 },
      { name: "Ail", qty: "1 gousse", protein: 0, carbs: 1, fat: 0, calories: 5 },
      { name: "Huile d'olive", qty: "5ml", protein: 0, carbs: 0, fat: 5, calories: 44 },
    ],
    steps: [
      "Rincer les foies sous l'eau froide, retirer les filaments et parties vertes.",
      "Émincer l'oignon et écraser l'ail.",
      "Faire revenir oignon + ail dans l'huile à feu moyen, 3 min.",
      "Monter le feu à vif, ajouter les foies en une couche.",
      "Cuire 3 min d'un côté sans toucher (ils dorent).",
      "Retourner, cuire 2-3 min. L'intérieur doit rester légèrement rosé — ne pas surcuire.",
      "Saler, poivrer en fin de cuisson. Servir immédiatement.",
    ],
    tip: "1x/semaine max à cause de la vitamine A et des métaux lourds. Excellente source de zinc et fer héminique (testostérone++).",
    youtubeQuery: "foie de volaille recette rapide santé fer zinc",
  },
  {
    id: 6,
    name: "Fromage blanc chia fruits rouges miel",
    time: "3 min",
    calories: 180,
    protein: 14,
    carbs: 22,
    fat: 3,
    tags: ["Rapide", "Petit-déj", "Pro-testo"],
    emoji: "🫐",
    color: "#6366F1",
    ingredients: ["150g fromage blanc 0%", "10g graines de chia", "40g fruits rouges surgelés", "8g miel"],
    ingredientDetails: [
      { name: "Fromage blanc 0%", qty: "150g", protein: 12, carbs: 6, fat: 0, calories: 72 },
      { name: "Graines de chia", qty: "10g", protein: 2, carbs: 4, fat: 3, calories: 49 },
      { name: "Fruits rouges surgelés", qty: "40g", protein: 0, carbs: 6, fat: 0, calories: 24 },
      { name: "Miel", qty: "8g", protein: 0, carbs: 6, fat: 0, calories: 24 },
    ],
    steps: [
      "Verser 150g de fromage blanc dans un bol.",
      "Ajouter les graines de chia, mélanger.",
      "Sortir les fruits rouges du congélateur 5-10 min avant (ou passer 30s au micro-ondes).",
      "Disposer les fruits rouges sur le fromage blanc.",
      "Verser le miel par-dessus.",
      "Mélanger légèrement avant de déguster. Attendre 2 min que le chia commence à gonfler.",
    ],
    tip: "Consommer dans les 20 min post-réveil pour casser le jeûne nocturne. Ajouter 30g de flocons d'avoine pour +15g glucides si jour d'entraînement.",
    youtubeQuery: "fromage blanc chia fruits rouges petit déjeuner sportif",
  },
];

export const nutritionPlan = {
  name: "Sèche — 2200 kcal",
  target: { calories: 2200, protein: 140, carbs: 275, fat: 60 },
  days: [
    {
      day: "Tous les jours",
      meals: [
        { name: "Petit-déjeuner (7h30)", calories: 530, protein: 33, carbs: 55, fat: 20 },
        { name: "Déjeuner (12h)", calories: 730, protein: 45, carbs: 95, fat: 12 },
        { name: "Collation (15h30)", calories: 230, protein: 5, carbs: 35, fat: 8 },
        { name: "Dîner (20h)", calories: 710, protein: 55, carbs: 70, fat: 20 },
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
  name: "Dimitri",
  age: 22,
  height: 163,
  weight: 66.5,
  goal: "seche" as "masse" | "seche" | "maintien" | "force",
  macros: { protein: 140, carbs: 275, fat: 60, kcal: 2200 },
  waterGoal: 2.6,
  measurements: {
    arms: 38,
    thighs: 58,
    waist: 76,
    hips: 90,
  },
};
