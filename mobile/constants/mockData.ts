export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  category: string;
  equipment: string;
}

export interface WorkoutSet {
  id: string;
  reps: number;
  weight: number;
  done: boolean;
  rpe?: number; // Rate of Perceived Exertion 1-10
}

export interface WorkoutExercise {
  id: string;
  exercise: Exercise;
  sets: WorkoutSet[];
  restTime: number;
  notes?: string;
}

export interface Workout {
  id: string;
  name: string;
  date: string;
  duration: number; // minutes
  exercises: WorkoutExercise[];
  totalVolume: number;
  description?: string;
  totalSets?: number;
  tags?: string[];
}

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  servingUnit: string;
}

export interface MealEntry {
  id: string;
  foodItem: FoodItem;
  quantity: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface DayProgram {
  day: string;
  shortDay: string;
  type: 'push' | 'pull' | 'legs' | 'rest' | 'cardio' | 'full';
  label: string;
  exercises: string[];
  color: string;
}

export interface PersonalRecord {
  id: string;
  exercise: string;
  weight: number;
  reps: number;
  date: string;
  notes?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  bio: string;
  age: number;
  height: number;
  weight: number;
  followers: number;
  following: number;
  totalWorkouts: number;
}

// ─── USER PROFILE ─────────────────────────────────────────────────────────────

export const userProfile: UserProfile = {
  id: 'user_001',
  name: 'Dimitri',
  username: 'dimitri.alv',
  bio: 'Sèche & Force — Bloc 1',
  age: 22,
  height: 163,
  weight: 66.5,
  followers: 12,
  following: 8,
  totalWorkouts: 156,
};

// ─── EXERCISES DATABASE ───────────────────────────────────────────────────────

export const exercisesDB: Exercise[] = [
  { id: 'e1',  name: 'Développé couché',               muscleGroup: 'Poitrine',           category: 'Compound',  equipment: 'Barre' },
  { id: 'e2',  name: 'Développé incliné haltères',     muscleGroup: 'Poitrine',           category: 'Compound',  equipment: 'Haltères' },
  { id: 'e3',  name: 'Élévations latérales',           muscleGroup: 'Épaules',            category: 'Isolation', equipment: 'Haltères' },
  { id: 'e4',  name: 'Développé militaire',            muscleGroup: 'Épaules',            category: 'Compound',  equipment: 'Barre' },
  { id: 'e5',  name: 'Triceps poulie haute',           muscleGroup: 'Triceps',            category: 'Isolation', equipment: 'Câble' },
  { id: 'e6',  name: 'Tractions',                      muscleGroup: 'Dos',                category: 'Compound',  equipment: 'Barre de traction' },
  { id: 'e7',  name: 'Rowing barre',                   muscleGroup: 'Dos',                category: 'Compound',  equipment: 'Barre' },
  { id: 'e8',  name: 'Curl biceps barre',              muscleGroup: 'Biceps',             category: 'Isolation', equipment: 'Barre' },
  { id: 'e9',  name: 'Squat barre',                    muscleGroup: 'Quadriceps',         category: 'Compound',  equipment: 'Barre' },
  { id: 'e10', name: 'Soulevé de terre',               muscleGroup: 'Dos / Ischio',       category: 'Compound',  equipment: 'Barre' },
  { id: 'e11', name: 'Presse à cuisses',               muscleGroup: 'Quadriceps',         category: 'Compound',  equipment: 'Machine' },
  { id: 'e12', name: 'Mollets debout',                 muscleGroup: 'Mollets',            category: 'Isolation', equipment: 'Machine' },
  // Programme bloc 6 semaines
  { id: 'e13', name: 'Dips lestés',                    muscleGroup: 'Poitrine / Triceps', category: 'Compound',  equipment: 'Barres parallèles' },
  { id: 'e14', name: 'Tractions lestées',              muscleGroup: 'Dos',                category: 'Compound',  equipment: 'Barre de traction' },
  { id: 'e15', name: 'Back Squat',                     muscleGroup: 'Quadriceps',         category: 'Compound',  equipment: 'Barre' },
  { id: 'e16', name: 'Soulevé de terre roumain',       muscleGroup: 'Ischio-jambiers',    category: 'Compound',  equipment: 'Barre' },
  { id: 'e17', name: 'DB Shoulder Press',              muscleGroup: 'Épaules',            category: 'Compound',  equipment: 'Haltères' },
  { id: 'e18', name: 'Row unilatéral',                 muscleGroup: 'Dos',                category: 'Compound',  equipment: 'Haltère' },
  { id: 'e19', name: 'Curl marteau',                   muscleGroup: 'Biceps',             category: 'Isolation', equipment: 'Haltères' },
  { id: 'e20', name: 'Triceps OH',                     muscleGroup: 'Triceps',            category: 'Isolation', equipment: 'Haltère' },
  { id: 'e21', name: 'Leg curl',                       muscleGroup: 'Ischio-jambiers',    category: 'Isolation', equipment: 'Machine' },
  { id: 'e22', name: 'Pendulum squat',                 muscleGroup: 'Quadriceps',         category: 'Compound',  equipment: 'Machine' },
  { id: 'e23', name: 'Muscle-Up',                      muscleGroup: 'Dos / Poitrine',     category: 'Compound',  equipment: 'Barre de traction' },
  { id: 'e24', name: 'Tour du rack',                   muscleGroup: 'Bras',               category: 'Isolation', equipment: 'Haltères' },
  { id: 'e25', name: 'Développé couché haltères',      muscleGroup: 'Poitrine',           category: 'Compound',  equipment: 'Haltères' },
  { id: 'e26', name: 'Curl barre',                     muscleGroup: 'Biceps',             category: 'Isolation', equipment: 'Barre' },
  { id: 'e27', name: 'OHP',                            muscleGroup: 'Épaules',            category: 'Compound',  equipment: 'Barre' },
  { id: 'e28', name: 'Row posé',                       muscleGroup: 'Dos',                category: 'Compound',  equipment: 'Barre' },
  { id: 'e29', name: 'Moto',                           muscleGroup: 'Dos',                category: 'Isolation', equipment: 'Câble' },
  // Avant-bras
  { id: 'e30', name: 'Curl inversé barre',             muscleGroup: 'Avant-bras',         category: 'Isolation', equipment: 'Barre' },
  { id: 'e31', name: 'Curl inversé haltères',          muscleGroup: 'Avant-bras',         category: 'Isolation', equipment: 'Haltères' },
  { id: 'e32', name: 'Flexion poignets barre',         muscleGroup: 'Avant-bras',         category: 'Isolation', equipment: 'Barre' },
  { id: 'e33', name: 'Extension poignets barre',       muscleGroup: 'Avant-bras',         category: 'Isolation', equipment: 'Barre' },
  { id: 'e34', name: 'Farmer carry',                   muscleGroup: 'Avant-bras',         category: 'Compound',  equipment: 'Haltères' },
  { id: 'e35', name: 'Dead hang',                      muscleGroup: 'Avant-bras',         category: 'Isolation', equipment: 'Barre de traction' },
];

// ─── PERSONAL RECORDS ─────────────────────────────────────────────────────────

export const personalRecords: PersonalRecord[] = [
  { id: 'pr_001', exercise: 'Développé couché haltères',         weight: 58,  reps: 1, date: '21 Mar 2026',   notes: 'PR Bench haltères — par bras' },
  { id: 'pr_002', exercise: 'Développé couché',                  weight: 125, reps: 1, date: 'Estimé',        notes: 'PR Bench barre — estimé' },
  { id: 'pr_003', exercise: 'Dips lestés',                       weight: 100, reps: 2, date: 'S4 ancien bloc', notes: '+100kg de lest, 2 reps' },
  { id: 'pr_004', exercise: 'Tractions pronation lestées',       weight: 45,  reps: 1, date: 'S4 ancien bloc', notes: 'RPE 10 — tire avec bras' },
  { id: 'pr_005', exercise: 'Back Squat',                        weight: 150, reps: 1, date: 'S5 ancien bloc', notes: 'Technique à revoir' },
  { id: 'pr_006', exercise: 'OHP barre',                         weight: 65,  reps: 1, date: 'Estimé',        notes: 'PR OHP barre — estimé' },
  { id: 'pr_007', exercise: 'OHP haltères',                      weight: 36,  reps: 1, date: 'Estimé',        notes: 'Par bras — estimé' },
  { id: 'pr_008', exercise: 'Soulevé de terre roumain',          weight: 120, reps: 6, date: '',               notes: 'RDL ceinture' },
  { id: 'pr_009', exercise: 'Curl barre',                        weight: 46,  reps: 5, date: '',               notes: 'Curl barre strict' },
  { id: 'pr_010', exercise: 'Rowing barre',                      weight: 81,  reps: 6, date: '',               notes: 'Row barre' },
];

// ─── RECENT WORKOUTS ──────────────────────────────────────────────────────────

export const recentWorkouts: Workout[] = [
  {
    id: 'w1',
    name: 'Sam — Épaules & Bras',
    date: '2026-03-08',
    duration: 72,
    totalVolume: 8540,
    totalSets: 18,
    description: 'Bonne séance, OHP propre à 61.5kg. Curls lourds 3×5 à 45kg strict. PR OHP + Curl barre.',
    tags: ['Force', 'Hypertrophie'],
    exercises: [
      { id: 'we1', exercise: exercisesDB[26], restTime: 180, sets: [
        { id: 's1', reps: 3, weight: 61.5, done: true },
        { id: 's2', reps: 3, weight: 61.5, done: true },
        { id: 's3', reps: 5, weight: 61.5, done: true },
      ]},
      { id: 'we2', exercise: exercisesDB[27], restTime: 180, sets: [
        { id: 's4', reps: 5, weight: 78, done: true },
        { id: 's5', reps: 5, weight: 78, done: true },
        { id: 's6', reps: 12, weight: 66, done: true },
      ]},
      { id: 'we3', exercise: exercisesDB[25], restTime: 120, sets: [
        { id: 's7', reps: 5, weight: 45, done: true },
        { id: 's8', reps: 5, weight: 45, done: true },
        { id: 's9', reps: 5, weight: 45, done: true },
      ]},
      { id: 'we4', exercise: exercisesDB[18], restTime: 120, sets: [
        { id: 's10', reps: 10, weight: 20, done: true },
        { id: 's11', reps: 10, weight: 20, done: true },
        { id: 's12', reps: 8,  weight: 20, done: true },
      ]},
      { id: 'we5', exercise: exercisesDB[19], restTime: 120, sets: [
        { id: 's13', reps: 8, weight: 40, done: true },
        { id: 's14', reps: 8, weight: 40, done: true },
        { id: 's15', reps: 8, weight: 40, done: true },
      ]},
      { id: 'we6', exercise: exercisesDB[28], restTime: 90, sets: [
        { id: 's16', reps: 12, weight: 10, done: true },
        { id: 's17', reps: 12, weight: 10, done: true },
        { id: 's18', reps: 12, weight: 10, done: true },
      ]},
    ],
  },
  {
    id: 'w2',
    name: 'Jeu — Dips & Tractions & Bench',
    date: '2026-03-06',
    duration: 85,
    totalVolume: 12350,
    totalSets: 16,
    description: 'Dips force 2×2 à 95kg RPE 9 + Tractions 3×6 à 25kg. Gros volume.',
    tags: ['Force'],
    exercises: [
      { id: 'we7', exercise: exercisesDB[12], restTime: 240, sets: [
        { id: 's19', reps: 2, weight: 95, done: true },
        { id: 's20', reps: 2, weight: 95, done: true },
      ]},
      { id: 'we8', exercise: exercisesDB[13], restTime: 180, sets: [
        { id: 's21', reps: 6, weight: 25, done: true },
        { id: 's22', reps: 6, weight: 25, done: true },
        { id: 's23', reps: 8, weight: 20, done: true },
      ]},
      { id: 'we9', exercise: exercisesDB[0], restTime: 180, sets: [
        { id: 's24', reps: 6, weight: 95, done: true },
        { id: 's25', reps: 6, weight: 95, done: true },
      ]},
      { id: 'we10', exercise: exercisesDB[22], restTime: 90, sets: [
        { id: 's26', reps: 1, weight: 0, done: true },
        { id: 's27', reps: 1, weight: 0, done: true },
        { id: 's28', reps: 1, weight: 0, done: true },
      ]},
    ],
  },
  {
    id: 'w3',
    name: 'Mer — Squat & Legs',
    date: '2026-03-05',
    duration: 68,
    totalVolume: 9800,
    totalSets: 14,
    description: 'Back Squat 2×2 à 140kg RPE 9, PR! RDL 3×6 à 100kg. PR Squat 170kg single.',
    tags: ['Force'],
    exercises: [
      { id: 'we11', exercise: exercisesDB[14], restTime: 240, sets: [
        { id: 's29', reps: 1, weight: 170, done: true },
        { id: 's30', reps: 3, weight: 145, done: true },
        { id: 's31', reps: 3, weight: 145, done: true },
      ]},
      { id: 'we12', exercise: exercisesDB[21], restTime: 180, sets: [
        { id: 's32', reps: 10, weight: 20, done: true },
        { id: 's33', reps: 10, weight: 20, done: true },
        { id: 's34', reps: 12, weight: 20, done: true },
      ]},
      { id: 'we13', exercise: exercisesDB[15], restTime: 180, sets: [
        { id: 's35', reps: 6, weight: 100, done: true },
        { id: 's36', reps: 6, weight: 100, done: true },
        { id: 's37', reps: 6, weight: 100, done: true },
      ]},
      { id: 'we14', exercise: exercisesDB[20], restTime: 120, sets: [
        { id: 's38', reps: 12, weight: 35, done: true },
        { id: 's39', reps: 12, weight: 35, done: true },
      ]},
    ],
  },
  {
    id: 'w4',
    name: 'Mar — Dips Volume & Épaules',
    date: '2026-03-04',
    duration: 62,
    totalVolume: 7200,
    totalSets: 14,
    description: 'Dips 2×5 à 80kg RPE 8 + tempo 4s descente. Shoulder press 3×8 à 30kg.',
    tags: ['Hypertrophie'],
    exercises: [
      { id: 'we15', exercise: exercisesDB[12], restTime: 180, sets: [
        { id: 's40', reps: 5, weight: 80, done: true },
        { id: 's41', reps: 5, weight: 80, done: true },
        { id: 's42', reps: 7, weight: 72.5, done: true },
      ]},
      { id: 'we16', exercise: exercisesDB[16], restTime: 180, sets: [
        { id: 's43', reps: 8, weight: 30, done: true },
        { id: 's44', reps: 8, weight: 30, done: true },
        { id: 's45', reps: 10, weight: 28, done: true },
      ]},
      { id: 'we17', exercise: exercisesDB[17], restTime: 120, sets: [
        { id: 's46', reps: 10, weight: 40, done: true },
        { id: 's47', reps: 10, weight: 40, done: true },
        { id: 's48', reps: 10, weight: 40, done: true },
      ]},
      { id: 'we18', exercise: exercisesDB[23], restTime: 90, sets: [
        { id: 's49', reps: 12, weight: 12, done: true },
        { id: 's50', reps: 12, weight: 12, done: true },
      ]},
    ],
  },
  {
    id: 'w5',
    name: 'Lun — Bench & Tractions (lourd)',
    date: '2026-03-03',
    duration: 78,
    totalVolume: 10200,
    totalSets: 14,
    description: 'Bench 1×4 à 105kg + 1×5 à 97.5kg. Tractions lestées 3×4 à 30kg.',
    tags: ['Force'],
    exercises: [
      { id: 'we19', exercise: exercisesDB[0], restTime: 300, sets: [
        { id: 's51', reps: 4, weight: 105, done: true },
        { id: 's52', reps: 5, weight: 97.5, done: true },
      ]},
      { id: 'we20', exercise: exercisesDB[13], restTime: 300, sets: [
        { id: 's53', reps: 4, weight: 30, done: true },
        { id: 's54', reps: 4, weight: 30, done: true },
        { id: 's55', reps: 4, weight: 30, done: true },
      ]},
      { id: 'we21', exercise: exercisesDB[0], restTime: 180, sets: [
        { id: 's56', reps: 2, weight: 75, done: true },
        { id: 's57', reps: 2, weight: 75, done: true },
        { id: 's58', reps: 2, weight: 75, done: true },
      ]},
      { id: 'we22', exercise: exercisesDB[6], restTime: 180, sets: [
        { id: 's59', reps: 6, weight: 80, done: true },
        { id: 's60', reps: 6, weight: 80, done: true },
        { id: 's61', reps: 12, weight: 68, done: true },
      ]},
    ],
  },
];

// ─── TODAY'S ACTIVE WORKOUT ───────────────────────────────────────────────────
// Mardi S5 : Dips Volume + DB Shoulder Press + Row unilatéral + Tour du rack

export const todayWorkout: WorkoutExercise[] = [
  {
    id: 'tw1',
    exercise: exercisesDB[12], // Dips lestés
    restTime: 180,
    notes: 'S5 — 2-3×6-7 @+80kg, RPE 7-8',
    sets: [
      { id: 'ts1', reps: 7, weight: 80, done: false },
      { id: 'ts2', reps: 7, weight: 80, done: false },
      { id: 'ts3', reps: 6, weight: 80, done: false },
    ],
  },
  {
    id: 'tw2',
    exercise: exercisesDB[16], // DB Shoulder Press
    restTime: 180,
    notes: '3×8-10 @30kg, RPE 8 — 3e dégressif',
    sets: [
      { id: 'ts4', reps: 10, weight: 30, done: false },
      { id: 'ts5', reps: 10, weight: 30, done: false },
      { id: 'ts6', reps: 8,  weight: 28, done: false },
    ],
  },
  {
    id: 'tw3',
    exercise: exercisesDB[17], // Row unilatéral
    restTime: 120,
    notes: '3×10 @40kg, RPE 8 — 1s étirement bas',
    sets: [
      { id: 'ts7', reps: 10, weight: 40, done: false },
      { id: 'ts8', reps: 10, weight: 40, done: false },
      { id: 'ts9', reps: 10, weight: 40, done: false },
    ],
  },
  {
    id: 'tw4',
    exercise: exercisesDB[23], // Tour du rack
    restTime: 90,
    notes: '2× @12kg, RPE 7-8',
    sets: [
      { id: 'ts10', reps: 12, weight: 12, done: false },
      { id: 'ts11', reps: 12, weight: 12, done: false },
    ],
  },
];

// ─── NUTRITION ────────────────────────────────────────────────────────────────

export const foodDatabase: FoodItem[] = [
  { id: 'f1',  name: 'Blanc de poulet',      calories: 165, protein: 31,   carbs: 0,    fat: 3.6,  servingSize: 100, servingUnit: 'g' },
  { id: 'f2',  name: 'Riz basmati cuit',     calories: 130, protein: 2.7,  carbs: 28,   fat: 0.3,  servingSize: 100, servingUnit: 'g' },
  { id: 'f3',  name: "Flocons d'avoine",     calories: 389, protein: 17,   carbs: 66,   fat: 7,    servingSize: 100, servingUnit: 'g' },
  { id: 'f4',  name: 'Yaourt grec 0%',       calories: 59,  protein: 10,   carbs: 3.6,  fat: 0.4,  servingSize: 100, servingUnit: 'g' },
  { id: 'f5',  name: 'Whey protéine',        brand: 'MyProtein', calories: 120, protein: 24, carbs: 3, fat: 1.5, servingSize: 30, servingUnit: 'g' },
  { id: 'f6',  name: 'Banane',               calories: 89,  protein: 1.1,  carbs: 23,   fat: 0.3,  servingSize: 100, servingUnit: 'g' },
  { id: 'f7',  name: 'Oeuf entier',          calories: 155, protein: 13,   carbs: 1.1,  fat: 11,   servingSize: 100, servingUnit: 'g' },
  { id: 'f8',  name: 'Beurre de cacahuète',  calories: 598, protein: 25,   carbs: 20,   fat: 50,   servingSize: 100, servingUnit: 'g' },
  { id: 'f9',  name: 'Saumon',               calories: 208, protein: 20,   carbs: 0,    fat: 13,   servingSize: 100, servingUnit: 'g' },
  { id: 'f10', name: 'Brocoli',              calories: 34,  protein: 2.8,  carbs: 6.6,  fat: 0.4,  servingSize: 100, servingUnit: 'g' },
];

export const todayMeals: MealEntry[] = [
  { id: 'm1', foodItem: foodDatabase[2], quantity: 80,  mealType: 'breakfast' },
  { id: 'm2', foodItem: foodDatabase[3], quantity: 150, mealType: 'breakfast' },
  { id: 'm3', foodItem: foodDatabase[5], quantity: 120, mealType: 'breakfast' },
  { id: 'm4', foodItem: foodDatabase[0], quantity: 200, mealType: 'lunch' },
  { id: 'm5', foodItem: foodDatabase[1], quantity: 180, mealType: 'lunch' },
  { id: 'm6', foodItem: foodDatabase[9], quantity: 150, mealType: 'lunch' },
  { id: 'm7', foodItem: foodDatabase[4], quantity: 1,   mealType: 'snack' },
  { id: 'm8', foodItem: foodDatabase[5], quantity: 100, mealType: 'snack' },
  { id: 'm9', foodItem: foodDatabase[8], quantity: 150, mealType: 'dinner' },
  { id: 'm10', foodItem: foodDatabase[1], quantity: 150, mealType: 'dinner' },
];

// ─── BLOC 1 — HYBRIDE FORCE/CARDIO/CALISTHÉNIE ────────────────────────────────
// Objectif : Sèche + Force + Technique (trac/squat) + Reprise course + Calisthénie

export const weeklyProgram: DayProgram[] = [
  {
    day: 'Lundi',
    shortDay: 'Lun',
    type: 'push',
    label: 'Bench Halt FORCE + Tractions Prona FORCE',
    color: '#4C9FFF',
    exercises: [
      'Développé couché haltères FORCE — objectif 60kg/main',
      'Tractions pronation FORCE — technique dorsaux (objectif -bras)',
      'Avant-bras — curl inversé / flexion poignets',
    ],
  },
  {
    day: 'Mardi',
    shortDay: 'Mar',
    type: 'cardio',
    label: 'Run — Z2 ou Fractionné',
    color: '#1DB954',
    exercises: [
      'Run Z2 45-50min @5:20-5:40/km',
      'OU Fractionné 10×1\'30',
    ],
  },
  {
    day: 'Mercredi',
    shortDay: 'Mer',
    type: 'legs',
    label: 'Lower — Squat technique + Mobilité',
    color: '#FF6B35',
    exercises: [
      'Back Squat technique — objectif 140×3 propre',
      'Mobilité chevilles',
      'Accessoires jambes',
    ],
  },
  {
    day: 'Jeudi',
    shortDay: 'Jeu',
    type: 'full',
    label: 'Dips VOL + Bench Barre VOL + Trac Supi + OHP Halt',
    color: '#EC4899',
    exercises: [
      'Dips lestés VOLUME — objectif +102-105kg',
      'Développé couché barre VOLUME — objectif 127-130kg',
      'Tractions supination VOLUME',
      'OHP haltères VOLUME — objectif 38kg/main',
      'Abdos',
    ],
  },
  {
    day: 'Vendredi',
    shortDay: 'Ven',
    type: 'cardio',
    label: 'Run',
    color: '#1DB954',
    exercises: [
      'Run Z2 ou fractionné',
    ],
  },
  {
    day: 'Samedi',
    shortDay: 'Sam',
    type: 'push',
    label: 'Dips FORCE + OHP Barre FORCE + Callisthénie',
    color: '#F59E0B',
    exercises: [
      'Dips lestés FORCE — objectif +102-105kg',
      'OHP barre FORCE — objectif 65×3',
      'Callisthénie — HSP 30 pompes mur / HS libre 15s+ / Planche adv tuck 5-8s',
    ],
  },
  {
    day: 'Dimanche',
    shortDay: 'Dim',
    type: 'pull',
    label: 'Bras + Row + Pompes lestées + EMOM/AMRAP',
    color: '#A855F7',
    exercises: [
      'Renfo bras — curl barre 46kg, objectif +',
      'Row barre 81kg volume',
      'Pompes lestées',
      'EMOM / AMRAP',
      'Abdos',
    ],
  },
];

// ─── GOALS ────────────────────────────────────────────────────────────────────

export const DAILY_GOALS = {
  calories: 2200,
  protein: 140,
  carbs: 275,
  fat: 60,
  water: 2600, // ml — objectif Dimitri sèche
};

// ─── WORKOUT_DAYS FOR CALENDAR (March 2026) ───────────────────────────────────

export const MARCH_2026_WORKOUT_DAYS = [3, 4, 5, 6, 8, 10];
