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
  duration: number; // in minutes
  exercises: WorkoutExercise[];
  totalVolume: number;
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

// ─── EXERCISES DATABASE ─────────────────────────────────────────────────────

export const exercisesDB: Exercise[] = [
  {
    id: 'e1',
    name: 'Développé couché',
    muscleGroup: 'Poitrine',
    category: 'Compound',
    equipment: 'Barre',
  },
  {
    id: 'e2',
    name: 'Développé incliné haltères',
    muscleGroup: 'Poitrine',
    category: 'Compound',
    equipment: 'Haltères',
  },
  {
    id: 'e3',
    name: 'Élévations latérales',
    muscleGroup: 'Épaules',
    category: 'Isolation',
    equipment: 'Haltères',
  },
  {
    id: 'e4',
    name: 'Développé militaire',
    muscleGroup: 'Épaules',
    category: 'Compound',
    equipment: 'Barre',
  },
  {
    id: 'e5',
    name: 'Triceps poulie haute',
    muscleGroup: 'Triceps',
    category: 'Isolation',
    equipment: 'Câble',
  },
  {
    id: 'e6',
    name: 'Tractions',
    muscleGroup: 'Dos',
    category: 'Compound',
    equipment: 'Barre de traction',
  },
  {
    id: 'e7',
    name: 'Rowing barre',
    muscleGroup: 'Dos',
    category: 'Compound',
    equipment: 'Barre',
  },
  {
    id: 'e8',
    name: 'Curl biceps barre',
    muscleGroup: 'Biceps',
    category: 'Isolation',
    equipment: 'Barre',
  },
  {
    id: 'e9',
    name: 'Squat barre',
    muscleGroup: 'Quadriceps',
    category: 'Compound',
    equipment: 'Barre',
  },
  {
    id: 'e10',
    name: 'Soulevé de terre',
    muscleGroup: 'Dos / Ischio',
    category: 'Compound',
    equipment: 'Barre',
  },
  {
    id: 'e11',
    name: 'Presse à cuisses',
    muscleGroup: 'Quadriceps',
    category: 'Compound',
    equipment: 'Machine',
  },
  {
    id: 'e12',
    name: 'Mollets debout',
    muscleGroup: 'Mollets',
    category: 'Isolation',
    equipment: 'Machine',
  },
];

// ─── RECENT WORKOUTS ─────────────────────────────────────────────────────────

export const recentWorkouts: Workout[] = [
  {
    id: 'w1',
    name: 'Pull - Dos & Biceps',
    date: '2024-03-04',
    duration: 62,
    totalVolume: 8420,
    exercises: [
      {
        id: 'we1',
        exercise: exercisesDB[5],
        restTime: 90,
        sets: [
          { id: 's1', reps: 8, weight: 0, done: true },
          { id: 's2', reps: 7, weight: 0, done: true },
          { id: 's3', reps: 6, weight: 0, done: true },
          { id: 's4', reps: 6, weight: 0, done: true },
        ],
      },
      {
        id: 'we2',
        exercise: exercisesDB[6],
        restTime: 90,
        sets: [
          { id: 's5', reps: 10, weight: 70, done: true },
          { id: 's6', reps: 10, weight: 70, done: true },
          { id: 's7', reps: 8, weight: 70, done: true },
          { id: 's8', reps: 8, weight: 70, done: true },
        ],
      },
      {
        id: 'we3',
        exercise: exercisesDB[7],
        restTime: 60,
        sets: [
          { id: 's9', reps: 12, weight: 40, done: true },
          { id: 's10', reps: 12, weight: 40, done: true },
          { id: 's11', reps: 10, weight: 42.5, done: true },
        ],
      },
    ],
  },
  {
    id: 'w2',
    name: 'Push - Poitrine & Triceps',
    date: '2024-03-02',
    duration: 58,
    totalVolume: 9650,
    exercises: [
      {
        id: 'we4',
        exercise: exercisesDB[0],
        restTime: 120,
        sets: [
          { id: 's12', reps: 6, weight: 90, done: true },
          { id: 's13', reps: 6, weight: 90, done: true },
          { id: 's14', reps: 5, weight: 92.5, done: true },
          { id: 's15', reps: 5, weight: 92.5, done: true },
        ],
      },
      {
        id: 'we5',
        exercise: exercisesDB[1],
        restTime: 90,
        sets: [
          { id: 's16', reps: 10, weight: 28, done: true },
          { id: 's17', reps: 10, weight: 28, done: true },
          { id: 's18', reps: 8, weight: 30, done: true },
        ],
      },
      {
        id: 'we6',
        exercise: exercisesDB[4],
        restTime: 60,
        sets: [
          { id: 's19', reps: 15, weight: 30, done: true },
          { id: 's20', reps: 15, weight: 30, done: true },
          { id: 's21', reps: 12, weight: 32.5, done: true },
        ],
      },
    ],
  },
  {
    id: 'w3',
    name: 'Legs - Quadris & Mollets',
    date: '2024-02-29',
    duration: 75,
    totalVolume: 18900,
    exercises: [
      {
        id: 'we7',
        exercise: exercisesDB[8],
        restTime: 180,
        sets: [
          { id: 's22', reps: 5, weight: 110, done: true },
          { id: 's23', reps: 5, weight: 110, done: true },
          { id: 's24', reps: 5, weight: 115, done: true },
          { id: 's25', reps: 4, weight: 115, done: true },
        ],
      },
      {
        id: 'we8',
        exercise: exercisesDB[10],
        restTime: 120,
        sets: [
          { id: 's26', reps: 12, weight: 150, done: true },
          { id: 's27', reps: 12, weight: 150, done: true },
          { id: 's28', reps: 10, weight: 160, done: true },
        ],
      },
    ],
  },
];

// ─── TODAY'S ACTIVE WORKOUT ───────────────────────────────────────────────────

export const todayWorkout: WorkoutExercise[] = [
  {
    id: 'tw1',
    exercise: exercisesDB[0],
    restTime: 120,
    sets: [
      { id: 'ts1', reps: 6, weight: 90, done: true },
      { id: 'ts2', reps: 6, weight: 90, done: true },
      { id: 'ts3', reps: 5, weight: 92.5, done: false },
      { id: 'ts4', reps: 5, weight: 92.5, done: false },
    ],
  },
  {
    id: 'tw2',
    exercise: exercisesDB[1],
    restTime: 90,
    sets: [
      { id: 'ts5', reps: 10, weight: 28, done: false },
      { id: 'ts6', reps: 10, weight: 28, done: false },
      { id: 'ts7', reps: 8, weight: 30, done: false },
    ],
  },
  {
    id: 'tw3',
    exercise: exercisesDB[2],
    restTime: 60,
    sets: [
      { id: 'ts8', reps: 15, weight: 12, done: false },
      { id: 'ts9', reps: 15, weight: 12, done: false },
      { id: 'ts10', reps: 12, weight: 14, done: false },
    ],
  },
];

// ─── NUTRITION ────────────────────────────────────────────────────────────────

export const foodDatabase: FoodItem[] = [
  {
    id: 'f1',
    name: 'Blanc de poulet',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    servingSize: 100,
    servingUnit: 'g',
  },
  {
    id: 'f2',
    name: 'Riz basmati cuit',
    calories: 130,
    protein: 2.7,
    carbs: 28,
    fat: 0.3,
    servingSize: 100,
    servingUnit: 'g',
  },
  {
    id: 'f3',
    name: 'Flocons d\'avoine',
    calories: 389,
    protein: 17,
    carbs: 66,
    fat: 7,
    servingSize: 100,
    servingUnit: 'g',
  },
  {
    id: 'f4',
    name: 'Yaourt grec 0%',
    calories: 59,
    protein: 10,
    carbs: 3.6,
    fat: 0.4,
    servingSize: 100,
    servingUnit: 'g',
  },
  {
    id: 'f5',
    name: 'Whey protéine',
    brand: 'MyProtein',
    calories: 120,
    protein: 24,
    carbs: 3,
    fat: 1.5,
    servingSize: 30,
    servingUnit: 'g',
  },
  {
    id: 'f6',
    name: 'Banane',
    calories: 89,
    protein: 1.1,
    carbs: 23,
    fat: 0.3,
    servingSize: 100,
    servingUnit: 'g',
  },
  {
    id: 'f7',
    name: 'Oeuf entier',
    calories: 155,
    protein: 13,
    carbs: 1.1,
    fat: 11,
    servingSize: 100,
    servingUnit: 'g',
  },
  {
    id: 'f8',
    name: 'Beurre de cacahuète',
    calories: 598,
    protein: 25,
    carbs: 20,
    fat: 50,
    servingSize: 100,
    servingUnit: 'g',
  },
  {
    id: 'f9',
    name: 'Saumon',
    calories: 208,
    protein: 20,
    carbs: 0,
    fat: 13,
    servingSize: 100,
    servingUnit: 'g',
  },
  {
    id: 'f10',
    name: 'Brocoli',
    calories: 34,
    protein: 2.8,
    carbs: 6.6,
    fat: 0.4,
    servingSize: 100,
    servingUnit: 'g',
  },
];

export const todayMeals: MealEntry[] = [
  // Petit-déjeuner
  {
    id: 'm1',
    foodItem: foodDatabase[2],
    quantity: 80,
    mealType: 'breakfast',
  },
  {
    id: 'm2',
    foodItem: foodDatabase[3],
    quantity: 150,
    mealType: 'breakfast',
  },
  {
    id: 'm3',
    foodItem: foodDatabase[5],
    quantity: 120,
    mealType: 'breakfast',
  },
  // Déjeuner
  {
    id: 'm4',
    foodItem: foodDatabase[0],
    quantity: 200,
    mealType: 'lunch',
  },
  {
    id: 'm5',
    foodItem: foodDatabase[1],
    quantity: 180,
    mealType: 'lunch',
  },
  {
    id: 'm6',
    foodItem: foodDatabase[9],
    quantity: 150,
    mealType: 'lunch',
  },
  // Collation
  {
    id: 'm7',
    foodItem: foodDatabase[4],
    quantity: 1,
    mealType: 'snack',
  },
  {
    id: 'm8',
    foodItem: foodDatabase[5],
    quantity: 100,
    mealType: 'snack',
  },
  // Dîner
  {
    id: 'm9',
    foodItem: foodDatabase[8],
    quantity: 150,
    mealType: 'dinner',
  },
  {
    id: 'm10',
    foodItem: foodDatabase[1],
    quantity: 150,
    mealType: 'dinner',
  },
];

// ─── PPL PROGRAM ─────────────────────────────────────────────────────────────

export const weeklyProgram: DayProgram[] = [
  {
    day: 'Lundi',
    shortDay: 'Lun',
    type: 'push',
    label: 'Push — Poitrine & Épaules',
    color: '#4C9FFF',
    exercises: [
      'Développé couché 4×6',
      'Développé incliné haltères 3×10',
      'Développé militaire 3×8',
      'Élévations latérales 3×15',
      'Triceps poulie haute 3×12',
    ],
  },
  {
    day: 'Mardi',
    shortDay: 'Mar',
    type: 'pull',
    label: 'Pull — Dos & Biceps',
    color: '#1DB954',
    exercises: [
      'Tractions 4×6-8',
      'Rowing barre 4×8',
      'Tirage poulie haute 3×10',
      'Curl biceps barre 3×12',
      'Curl marteau 3×12',
    ],
  },
  {
    day: 'Mercredi',
    shortDay: 'Mer',
    type: 'legs',
    label: 'Legs — Quadris & Ischio',
    color: '#FF6B35',
    exercises: [
      'Squat barre 4×5',
      'Soulevé de terre roumain 3×8',
      'Presse à cuisses 3×12',
      'Leg curl 3×12',
      'Mollets debout 4×15',
    ],
  },
  {
    day: 'Jeudi',
    shortDay: 'Jeu',
    type: 'rest',
    label: 'Repos Actif',
    color: '#A0A0A0',
    exercises: ['Marche 30 min', 'Étirements', 'Foam rolling'],
  },
  {
    day: 'Vendredi',
    shortDay: 'Ven',
    type: 'push',
    label: 'Push — Épaules & Triceps',
    color: '#4C9FFF',
    exercises: [
      'Développé militaire 4×6',
      'Développé couché 3×8',
      'Oiseau haltères 3×12',
      'Dips lestés 3×8',
      'Extension triceps 3×15',
    ],
  },
  {
    day: 'Samedi',
    shortDay: 'Sam',
    type: 'pull',
    label: 'Pull — Dos épais & Biceps',
    color: '#1DB954',
    exercises: [
      'Rowing haltère 4×10',
      'Soulevé de terre 3×5',
      'Face pull 3×15',
      'Curl concentration 3×12',
      'Shrugs 3×15',
    ],
  },
  {
    day: 'Dimanche',
    shortDay: 'Dim',
    type: 'rest',
    label: 'Repos complet',
    color: '#A0A0A0',
    exercises: ['Récupération', 'Nutrition', 'Sommeil'],
  },
];

export const DAILY_GOALS = {
  calories: 2500,
  protein: 180,
  carbs: 280,
  fat: 70,
  water: 3000, // ml
};
