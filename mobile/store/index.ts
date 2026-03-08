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
  { day: 'Lun', amount: 2800, goal: 3000 },
  { day: 'Mar', amount: 3000, goal: 3000 },
  { day: 'Mer', amount: 2200, goal: 3000 },
  { day: 'Jeu', amount: 3000, goal: 3000 },
  { day: 'Ven', amount: 2600, goal: 3000 },
  { day: 'Sam', amount: 1800, goal: 3000 },
  { day: 'Dim', amount: 1500, goal: 3000 },
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
  removeExercise: (exerciseId: string) => void;
  updateRestTime: (exerciseId: string, restTime: number) => void;
  updateNotes: (exerciseId: string, notes: string) => void;
  startRestTimer: (seconds: number) => void;
  tickRestTimer: () => void;
  stopRestTimer: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  isActive: true,
  timerSeconds: 1052,
  workoutName: 'Push — Poitrine & Triceps',
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

  removeExercise: (exerciseId) =>
    set((state) => ({
      exercises: state.exercises.filter((ex) => ex.id !== exerciseId),
    })),

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
