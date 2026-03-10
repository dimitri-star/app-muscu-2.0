import { create } from 'zustand';
import { todayWorkout, todayMeals, DAILY_GOALS } from '../constants/mockData';
import type { WorkoutExercise, MealEntry, WorkoutSet } from '../constants/mockData';

// ─── WATER STORE ──────────────────────────────────────────────────────────────

export interface WaterEntry {
  id: string;
  amount: number;
  time: string; // "HH:MM"
  timestamp: number;
}

interface WaterState {
  current: number;
  goal: number;
  entries: WaterEntry[];
  weekHistory: { day: string; amount: number; goal: number }[];
  addWater: (amount: number) => void;
  removeEntry: (id: string) => void;
  resetWater: () => void;
  setGoal: (goal: number) => void;
}

const initialEntries: WaterEntry[] = [
  { id: 'w1', amount: 500, time: '07:30', timestamp: Date.now() - 5 * 3600000 },
  { id: 'w2', amount: 250, time: '09:15', timestamp: Date.now() - 3.5 * 3600000 },
  { id: 'w3', amount: 500, time: '11:00', timestamp: Date.now() - 2 * 3600000 },
  { id: 'w4', amount: 250, time: '13:30', timestamp: Date.now() - 1 * 3600000 },
];

const initialWeekHistory = [
  { day: 'Mar', amount: 2800, goal: 3100 },
  { day: 'Mer', amount: 3100, goal: 3100 },
  { day: 'Jeu', amount: 3100, goal: 3100 },
  { day: 'Ven', amount: 2400, goal: 3100 },
  { day: 'Sam', amount: 3100, goal: 3100 },
  { day: 'Dim', amount: 2600, goal: 3100 },
  { day: 'Lun', amount: 3100, goal: 3100 },
];

export const useWaterStore = create<WaterState>((set, get) => ({
  current: initialEntries.reduce((acc, e) => acc + e.amount, 0),
  goal: DAILY_GOALS.water,
  entries: initialEntries,
  weekHistory: initialWeekHistory,

  addWater: (amount) => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newEntry: WaterEntry = {
      id: `w_${Date.now()}`,
      amount,
      time,
      timestamp: Date.now(),
    };
    set((state) => ({
      current: Math.min(state.current + amount, state.goal),
      entries: [...state.entries, newEntry],
    }));
  },

  removeEntry: (id) =>
    set((state) => {
      const entry = state.entries.find((e) => e.id === id);
      if (!entry) return state;
      return {
        current: Math.max(0, state.current - entry.amount),
        entries: state.entries.filter((e) => e.id !== id),
      };
    }),

  resetWater: () => set({ current: 0, entries: [] }),

  setGoal: (goal) => set({ goal }),
}));

// ─── WORKOUT STORE ────────────────────────────────────────────────────────────

interface WorkoutState {
  isActive: boolean;
  timerSeconds: number;
  workoutName: string;
  exercises: WorkoutExercise[];
  restTimerActive: boolean;
  restTimerSeconds: number;
  restTimerTotal: number;
  startWorkout: () => void;
  endWorkout: () => void;
  tickTimer: () => void;
  toggleSetDone: (exerciseId: string, setId: string) => void;
  updateSet: (exerciseId: string, setId: string, field: keyof WorkoutSet, value: number | boolean) => void;
  addSet: (exerciseId: string) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  addExercise: (exercise: import('../constants/mockData').Exercise) => void;
  addExerciseFromProgram: (exercise: import('../constants/mockData').Exercise, numSets: number, reps: number, restTime: number, notes?: string) => void;
  removeExercise: (exerciseId: string) => void;
  clearExercises: () => void;
  updateRestTime: (exerciseId: string, restTime: number) => void;
  updateNotes: (exerciseId: string, notes: string) => void;
  startRestTimer: (seconds: number) => void;
  tickRestTimer: () => void;
  stopRestTimer: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  isActive: false,
  timerSeconds: 0,
  workoutName: 'Mar — Dips Volume & Épaules',
  exercises: todayWorkout,
  restTimerActive: false,
  restTimerSeconds: 90,
  restTimerTotal: 90,

  startWorkout: () => set({ isActive: true, timerSeconds: 0 }),
  endWorkout: () => set({ isActive: false }),

  tickTimer: () => set((state) => ({ timerSeconds: state.timerSeconds + 1 })),

  toggleSetDone: (exerciseId, setId) =>
    set((state) => ({
      exercises: state.exercises.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, sets: ex.sets.map((s) => s.id === setId ? { ...s, done: !s.done } : s) }
          : ex
      ),
    })),

  updateSet: (exerciseId, setId, field, value) =>
    set((state) => ({
      exercises: state.exercises.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, sets: ex.sets.map((s) => s.id === setId ? { ...s, [field]: value } : s) }
          : ex
      ),
    })),

  addSet: (exerciseId) =>
    set((state) => ({
      exercises: state.exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        const newSet: WorkoutSet = {
          id: `set_${Date.now()}`,
          reps: lastSet?.reps ?? 10,
          weight: lastSet?.weight ?? 0,
          done: false,
        };
        return { ...ex, sets: [...ex.sets, newSet] };
      }),
    })),

  removeSet: (exerciseId, setId) =>
    set((state) => ({
      exercises: state.exercises.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, sets: ex.sets.filter((s) => s.id !== setId) }
          : ex
      ),
    })),

  addExercise: (exercise) =>
    set((state) => ({
      exercises: [
        ...state.exercises,
        {
          id: `ex_${Date.now()}`,
          exercise,
          sets: [{ id: `set_${Date.now()}`, reps: 10, weight: 0, done: false }],
          restTime: 90,
          notes: '',
        },
      ],
    })),

  addExerciseFromProgram: (exercise, numSets, reps, restTime, notes = '') =>
    set((state) => {
      const ts = Date.now();
      const rand = Math.random().toString(36).slice(2, 7);
      return {
        exercises: [
          ...state.exercises,
          {
            id: `ex_${ts}_${rand}`,
            exercise,
            sets: Array.from({ length: numSets }, (_, i) => ({
              id: `set_${ts}_${rand}_${i}`,
              reps,
              weight: 0,
              done: false,
            })),
            restTime,
            notes,
          },
        ],
      };
    }),

  removeExercise: (exerciseId) =>
    set((state) => ({
      exercises: state.exercises.filter((ex) => ex.id !== exerciseId),
    })),

  clearExercises: () => set({ exercises: [] }),

  updateRestTime: (exerciseId, restTime) =>
    set((state) => ({
      exercises: state.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, restTime } : ex
      ),
    })),

  updateNotes: (exerciseId, notes) =>
    set((state) => ({
      exercises: state.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, notes } : ex
      ),
    })),

  startRestTimer: (seconds) =>
    set({ restTimerActive: true, restTimerSeconds: seconds, restTimerTotal: seconds }),

  tickRestTimer: () =>
    set((state) => {
      if (state.restTimerSeconds <= 1) return { restTimerActive: false, restTimerSeconds: 0 };
      return { restTimerSeconds: state.restTimerSeconds - 1 };
    }),

  stopRestTimer: () => set({ restTimerActive: false, restTimerSeconds: 0 }),
}));

// ─── NUTRITION STORE ──────────────────────────────────────────────────────────

interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionState {
  meals: MealEntry[];
  goals: typeof DAILY_GOALS;
  getTotals: () => MacroTotals;
  getMealTotals: (mealType: MealEntry['mealType']) => MacroTotals;
  addMeal: (meal: MealEntry) => void;
  removeMeal: (id: string) => void;
}

const calcMacros = (meals: MealEntry[]): MacroTotals =>
  meals.reduce(
    (acc, entry) => {
      const ratio = entry.foodItem.servingUnit === 'g'
        ? entry.quantity / entry.foodItem.servingSize
        : entry.quantity;
      return {
        calories: acc.calories + entry.foodItem.calories * ratio,
        protein: acc.protein + entry.foodItem.protein * ratio,
        carbs: acc.carbs + entry.foodItem.carbs * ratio,
        fat: acc.fat + entry.foodItem.fat * ratio,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

export const useNutritionStore = create<NutritionState>((set, get) => ({
  meals: todayMeals,
  goals: DAILY_GOALS,

  getTotals: () => calcMacros(get().meals),
  getMealTotals: (mealType) => calcMacros(get().meals.filter((m) => m.mealType === mealType)),
  addMeal: (meal) => set((state) => ({ meals: [...state.meals, meal] })),
  removeMeal: (id) => set((state) => ({ meals: state.meals.filter((m) => m.id !== id) })),
}));

// ─── PROGRAMME STORE ───────────────────────────────────────────────────────────

export interface ProgramExercise {
  id: string;
  name: string;
  sets: string;
  rest: string;
}

export type DayType = 'push' | 'pull' | 'legs' | 'rest' | 'cardio' | 'full';

export interface ProgramDay {
  id: string;
  day: string;
  shortDay: string;
  type: DayType;
  label: string;
  color: string;
  exercises: ProgramExercise[];
}

export interface Program {
  id: string;
  name: string;
  frequency: string;
  focus: string;
  weeks: number;
  currentWeek: number;
  days: ProgramDay[];
}

interface ProgramState {
  program: Program | null;
  isLoading: boolean;
  lastSynced: string | null;
  syncError: boolean;
  fetchProgram: (apiUrl: string) => Promise<void>;
}

export const useProgramStore = create<ProgramState>((set) => ({
  program: null,
  isLoading: false,
  lastSynced: null,
  syncError: false,

  fetchProgram: async (apiUrl: string) => {
    set({ isLoading: true, syncError: false });
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(apiUrl, { signal: controller.signal });
      clearTimeout(timeout);
      if (response.ok) {
        const data: Program = await response.json();
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        set({ program: data, isLoading: false, lastSynced: timeStr, syncError: false });
      } else {
        set({ isLoading: false, syncError: true });
      }
    } catch {
      set({ isLoading: false, syncError: true });
    }
  },
}));

// ─── GAMIFICATION STORE ────────────────────────────────────────────────────────

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  condition: string;
  unlocked: boolean;
  unlockedDate?: string;
  category: 'workout' | 'water' | 'general';
}

interface GamificationState {
  workoutStreakWeeks: number;
  workoutStreakTarget: number;
  workoutsThisWeek: number;
  waterStreakDays: number;
  totalXp: number;
  level: string;
  xpToNextLevel: number;
  badges: Badge[];
  addXp: (amount: number) => void;
  completeWaterGoal: () => void;
  completeWorkout: () => void;
}

const XP_LEVELS = [
  { name: 'Débutant', min: 0, max: 499 },
  { name: 'Régulier', min: 500, max: 1999 },
  { name: 'Athlète', min: 2000, max: 4999 },
  { name: 'Machine', min: 5000, max: 9999 },
  { name: 'Légende', min: 10000, max: Infinity },
];

function computeLevel(xp: number) {
  const lvl = XP_LEVELS.find((l) => xp >= l.min && xp <= l.max) ?? XP_LEVELS[0];
  const nextIdx = XP_LEVELS.indexOf(lvl) + 1;
  const next = XP_LEVELS[nextIdx];
  return { level: lvl.name, xpToNextLevel: next ? next.min : lvl.max };
}

const INITIAL_BADGES: Badge[] = [
  { id: 'b1',  name: 'Premier pas',    icon: 'footsteps-outline',          description: 'Compléter sa première séance',            condition: '1 séance',            unlocked: true,  unlockedDate: '8 Sep 2024',  category: 'workout' },
  { id: 'b2',  name: 'Semaine complète', icon: 'calendar-outline',         description: '5 séances en une semaine',                condition: '5 séances/semaine',   unlocked: true,  unlockedDate: '15 Sep 2024', category: 'workout' },
  { id: 'b3',  name: 'Machine',        icon: 'flame-outline',              description: '4 semaines de streak consécutives',       condition: '4 sem. consécutives', unlocked: true,  unlockedDate: '6 Oct 2024',  category: 'workout' },
  { id: 'b4',  name: 'Inarrêtable',   icon: 'infinite-outline',           description: '12 semaines de streak consécutives',      condition: '12 sem. consécutives',unlocked: true,  unlockedDate: '1 Déc 2024',  category: 'workout' },
  { id: 'b5',  name: 'Centurion',      icon: 'trophy-outline',             description: '100 séances totales',                     condition: '100 séances',         unlocked: true,  unlockedDate: '15 Jun 2025', category: 'workout' },
  { id: 'b6',  name: 'Tonnage',        icon: 'barbell-outline',            description: 'Soulever 100 000 kg au total',            condition: '100 000 kg',          unlocked: true,  unlockedDate: '20 Mar 2025', category: 'workout' },
  { id: 'b7',  name: 'PR Hunter',      icon: 'medal-outline',              description: 'Battre 10 records personnels',            condition: '10 PRs battus',       unlocked: true,  unlockedDate: '10 Aoû 2025', category: 'workout' },
  { id: 'b8',  name: 'Demi-année',     icon: 'star-outline',               description: '24 semaines de streak entraînement',     condition: '24 sem. consécutives',unlocked: true,  unlockedDate: '1 Mar 2026',  category: 'workout' },
  { id: 'b9',  name: 'Hydraté',        icon: 'water-outline',              description: '7 jours consécutifs à atteindre l\'objectif eau', condition: '7 jours consécutifs', unlocked: false, category: 'water' },
  { id: 'b10', name: 'Chameau',        icon: 'sunny-outline',              description: '30 jours de streak eau',                  condition: '30 jours consécutifs',unlocked: false, category: 'water' },
  { id: 'b11', name: 'Macro Master',   icon: 'checkmark-circle-outline',   description: '7 jours consécutifs de tracking complet', condition: '7 jours de tracking', unlocked: false, category: 'general' },
  { id: 'b12', name: 'Régulier',       icon: 'clipboard-outline',          description: '30 jours de tracking nutrition',          condition: '30 jours tracking',   unlocked: false, category: 'general' },
];

const INIT_XP = 4850;
const { level: INIT_LEVEL, xpToNextLevel: INIT_NEXT } = computeLevel(INIT_XP);

export const useGamificationStore = create<GamificationState>((set, get) => ({
  workoutStreakWeeks: 24,
  workoutStreakTarget: 5,
  workoutsThisWeek: 4,
  waterStreakDays: 3,
  totalXp: INIT_XP,
  level: INIT_LEVEL,
  xpToNextLevel: INIT_NEXT,
  badges: INITIAL_BADGES,

  addXp: (amount) =>
    set((state) => {
      const xp = state.totalXp + amount;
      const { level, xpToNextLevel } = computeLevel(xp);
      return { totalXp: xp, level, xpToNextLevel };
    }),

  completeWaterGoal: () =>
    set((state) => {
      const xp = state.totalXp + 10;
      const { level, xpToNextLevel } = computeLevel(xp);
      return { waterStreakDays: state.waterStreakDays + 1, totalXp: xp, level, xpToNextLevel };
    }),

  completeWorkout: () =>
    set((state) => {
      const count = state.workoutsThisWeek + 1;
      const xp = state.totalXp + 50;
      const { level, xpToNextLevel } = computeLevel(xp);
      const weeks = count >= state.workoutStreakTarget
        ? state.workoutStreakWeeks + 1
        : state.workoutStreakWeeks;
      return { workoutsThisWeek: count, workoutStreakWeeks: weeks, totalXp: xp, level, xpToNextLevel };
    }),
}));
