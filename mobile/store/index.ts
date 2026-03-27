import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getPlatformStorage } from './storage';
import { todayWorkout, todayMeals, DAILY_GOALS, recentWorkouts } from '../constants/mockData';
import { WEEKLY_TRACKING_API } from '../constants/api';
import type { WorkoutExercise, MealEntry, WorkoutSet, Workout } from '../constants/mockData';

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
  weekHistory: { date: string; amount: number; goal: number }[];
  lastResetDate: string;
  addWater: (amount: number) => void;
  removeEntry: (id: string) => void;
  resetWater: () => void;
  setGoal: (goal: number) => void;
  checkAndResetDaily: () => void;
  syncFromWeb: (apiUrl: string) => Promise<void>;
}

function getTodayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ISO date of the Monday of the current week
function getMondayStr(): string {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun
  const d = new Date(today);
  d.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
  return d.toISOString().split('T')[0];
}

function getIsoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function getFrenchDayLabel(date: Date): string {
  const labels = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  return labels[date.getDay()];
}

function syncHydrationToWeb(currentMl: number): void {
  const now = new Date();
  const payload = {
    semaine: getIsoWeek(now),
    jour: getFrenchDayLabel(now),
    date: getTodayStr(),
    eau: Number((currentMl / 1000).toFixed(2)),
  };
  fetch(WEEKLY_TRACKING_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

export function getShortDayFromDate(dateStr: string): string {
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  // Add T12:00:00 to avoid UTC midnight timezone offset issues
  return dayNames[new Date(dateStr + 'T12:00:00').getDay()];
}

// Génère les 7 derniers jours (dont aujourd'hui) avec les vraies dates ISO
function buildWeekHistory(goal: number, todayAmount = 0): { date: string; amount: number; goal: number }[] {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    return { date: dateStr, amount: i === 6 ? todayAmount : 0, goal };
  });
}

export const useWaterStore = create<WaterState>()(
  persist(
    (set, get) => ({
      current: 0,
      goal: DAILY_GOALS.water,
      entries: [],
      weekHistory: buildWeekHistory(DAILY_GOALS.water),
      lastResetDate: getTodayStr(),

      checkAndResetDaily: () => {
        const state = get();
        const today = getTodayStr();
        if (state.lastResetDate === today) return;

        // Archive previous day's amount into history, then rebuild 7-day window
        const archived = state.weekHistory.map((h) =>
          h.date === state.lastResetDate ? { ...h, amount: state.current } : h
        );

        // Rebuild: keep any existing entries, fill gaps with 0, always end with today
        const byDate = Object.fromEntries(archived.map((h) => [h.date, h]));
        const newHistory = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          const dateStr = d.toISOString().split('T')[0];
          return byDate[dateStr] ?? { date: dateStr, amount: 0, goal: state.goal };
        });

        set({ current: 0, entries: [], weekHistory: newHistory, lastResetDate: today });
      },

      addWater: (amount) => {
        const now = new Date();
        const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const today = getTodayStr();
        const newEntry: WaterEntry = {
          id: `w_${Date.now()}`,
          amount,
          time,
          timestamp: Date.now(),
        };
        set((state) => {
          const newCurrent = state.current + amount;
          // Sync today's bar in the weekly history
          const newHistory = state.weekHistory.map((h) =>
            h.date === today ? { ...h, amount: newCurrent } : h
          );
          return { current: newCurrent, entries: [...state.entries, newEntry], weekHistory: newHistory };
        });
        const latest = get().current;
        syncHydrationToWeb(latest);
      },

      removeEntry: (id) =>
        set((state) => {
          const entry = state.entries.find((e) => e.id === id);
          if (!entry) return state;
          const nextCurrent = Math.max(0, state.current - entry.amount);
          syncHydrationToWeb(nextCurrent);
          return {
            current: nextCurrent,
            entries: state.entries.filter((e) => e.id !== id),
          };
        }),

      resetWater: () => set({ current: 0, entries: [] }),

      setGoal: (goal) => set({ goal }),

      syncFromWeb: async (apiUrl) => {
        try {
          const response = await fetch(apiUrl);
          if (!response.ok) return;
          const rows = await response.json();
          if (!Array.isArray(rows)) return;

          const today = getTodayStr();
          const byDate = new Map<string, number>();
          rows.forEach((r: any) => {
            const date = String(r?.date || "");
            const liters = Number(r?.eau ?? 0);
            if (!date || !Number.isFinite(liters)) return;
            byDate.set(date, Math.max(0, Math.round(liters * 1000)));
          });

          const state = get();
          const nextHistory = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const dateStr = d.toISOString().split('T')[0];
            return {
              date: dateStr,
              amount: byDate.get(dateStr) ?? 0,
              goal: state.goal,
            };
          });
          const cloudToday = byDate.get(today);
          if (typeof cloudToday === 'number') {
            set({
              current: cloudToday,
              weekHistory: nextHistory,
              lastResetDate: today,
            });
          } else {
            set({ weekHistory: nextHistory });
          }
        } catch {
          // keep local values when offline
        }
      },
    }),
    {
      name: 'water-store-v3',
      storage: createJSONStorage(() => getPlatformStorage()),
      partialize: (state) => ({
        current: state.current,
        goal: state.goal,
        entries: state.entries,
        weekHistory: state.weekHistory,
        lastResetDate: state.lastResetDate,
      }),
      // Called after AsyncStorage finishes loading the persisted state.
      // Ensures daily reset fires even when the store hydrates after mount.
      onRehydrateStorage: () => (state) => {
        if (state) state.checkAndResetDaily();
      },
    }
  )
);

// ─── WORKOUT STORE ────────────────────────────────────────────────────────────

export interface CustomExercise {
  id: string;
  name: string;
  muscle: string;
  equipment: string;
  isCustom?: true;
}

function makeUid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

interface WorkoutState {
  isActive: boolean;
  workoutStartTime: number | null;
  workoutName: string;
  exercises: WorkoutExercise[];
  restTimerActive: boolean;
  restTimerSeconds: number;
  restTimerTotal: number;
  savedWorkouts: Workout[];
  customExercises: CustomExercise[];
  startWorkout: () => void;
  endWorkout: () => void;
  saveWorkout: (data: { name: string; duration: number; exercises: WorkoutExercise[] }) => void;
  tickTimer: () => void;
  toggleSetDone: (exerciseId: string, setId: string) => void;
  updateSet: (exerciseId: string, setId: string, field: keyof WorkoutSet, value: number | boolean) => void;
  addSet: (exerciseId: string) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  addExercise: (exercise: import('../constants/mockData').Exercise) => void;
  addExerciseFromProgram: (exercise: import('../constants/mockData').Exercise, numSets: number, reps: number, restTime: number, notes?: string) => void;
  removeExercise: (exerciseId: string) => void;
  clearExercises: () => void;
  deleteWorkout: (workoutId: string) => void;
  updateRestTime: (exerciseId: string, restTime: number) => void;
  updateNotes: (exerciseId: string, notes: string) => void;
  startRestTimer: (seconds: number) => void;
  tickRestTimer: () => void;
  stopRestTimer: () => void;
  addCustomExercise: (ex: CustomExercise) => void;
  checkStaleWorkout: () => void;
  syncSavedWorkoutsFromApi: (apiUrl: string) => Promise<void>;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      isActive: false,
      workoutStartTime: null,
      workoutName: 'Séance',
      exercises: [],
      restTimerActive: false,
      restTimerSeconds: 90,
      restTimerTotal: 90,
      savedWorkouts: [],
      customExercises: [],

      startWorkout: () => set({ isActive: true, workoutStartTime: Date.now() }),
      endWorkout: () => set({ isActive: false, workoutStartTime: null }),

      saveWorkout: ({ name, duration, exercises }) => {
        let totalVolume = 0;
        let totalSets = 0;
        exercises.forEach((ex) => {
          ex.sets.forEach((s) => {
            if (s.done) {
              totalVolume += s.reps * s.weight;
              totalSets++;
            }
          });
        });

        const today = new Date().toISOString().split('T')[0];
        const newWorkout: Workout = {
          id: `saved_${Date.now()}`,
          name,
          date: today,
          duration: Math.max(1, Math.round(duration / 60)),
          exercises,
          totalVolume,
          totalSets,
        };

        set((state) => ({
          savedWorkouts: [newWorkout, ...state.savedWorkouts],
          isActive: false,
          workoutStartTime: null,
        }));
      },

      tickTimer: () => {},
      addCustomExercise: (ex) => set((state) => ({ customExercises: [...state.customExercises, ex] })),

      checkStaleWorkout: () => {
        const state = get();
        if (!state.isActive || !state.workoutStartTime) return;
        const d = new Date(state.workoutStartTime);
        const startDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (startDate !== getTodayStr()) {
          set({ isActive: false, workoutStartTime: null });
        }
      },

      syncSavedWorkoutsFromApi: async (apiUrl: string) => {
        try {
          const response = await fetch(apiUrl);
          if (!response.ok) return;
          const data = await response.json();
          if (!Array.isArray(data)) return;

          const toWorkout = (w: any): Workout => ({
            id: String(w.id ?? makeUid('saved')),
            name: String(w.name ?? 'Séance'),
            date: String(w.date ?? getTodayStr()),
            duration: Number(w.duration ?? 0),
            totalVolume: Number(w.totalVolume ?? 0),
            totalSets: Number(w.totalSets ?? 0),
            exercises: Array.isArray(w.exercises)
              ? w.exercises.map((ex: any, exIdx: number) => ({
                  id: makeUid(`sync_ex_${exIdx}`),
                  exercise: {
                    id: makeUid(`sync_def_${exIdx}`),
                    name: String(ex?.name ?? 'Exercice'),
                    muscleGroup: 'Autre',
                    category: 'Compound',
                    equipment: 'Autre',
                  },
                  sets: Array.isArray(ex?.sets)
                    ? ex.sets.map((s: any, setIdx: number) => ({
                        id: makeUid(`sync_set_${setIdx}`),
                        reps: Number(s?.reps ?? 0),
                        weight: Number(s?.weight ?? 0),
                        done: Boolean(s?.done),
                      }))
                    : [],
                  restTime: 90,
                  notes: ex?.notes ? String(ex.notes) : '',
                }))
              : [],
          });

          const remoteWorkouts = data.map(toWorkout);
          set((state) => {
            const byId = new Map<string, Workout>();
            [...remoteWorkouts, ...state.savedWorkouts].forEach((w) => {
              if (!byId.has(w.id)) byId.set(w.id, w);
            });
            const merged = Array.from(byId.values()).sort((a, b) => (a.date < b.date ? 1 : -1));
            return { savedWorkouts: merged };
          });
        } catch {
          // keep local state if remote sync fails
        }
      },

      toggleSetDone: (exerciseId, setId) =>
        set((state) => {
          const exIndex = state.exercises.findIndex((ex) => ex.id === exerciseId);
          if (exIndex === -1) return state;
          const nextExercises = [...state.exercises];
          const target = nextExercises[exIndex];
          nextExercises[exIndex] = {
            ...target,
            sets: target.sets.map((s) => (s.id === setId ? { ...s, done: !s.done } : s)),
          };
          return { exercises: nextExercises };
        }),

      updateSet: (exerciseId, setId, field, value) =>
        set((state) => {
          const exIndex = state.exercises.findIndex((ex) => ex.id === exerciseId);
          if (exIndex === -1) return state;
          const nextExercises = [...state.exercises];
          const target = nextExercises[exIndex];
          nextExercises[exIndex] = {
            ...target,
            sets: target.sets.map((s) => (s.id === setId ? { ...s, [field]: value } : s)),
          };
          return { exercises: nextExercises };
        }),

      addSet: (exerciseId) =>
        set((state) => {
          const exIndex = state.exercises.findIndex((ex) => ex.id === exerciseId);
          if (exIndex === -1) return state;
          const nextExercises = [...state.exercises];
          const target = nextExercises[exIndex];
          const lastSet = target.sets[target.sets.length - 1];
          const newSet: WorkoutSet = {
            id: makeUid('set'),
            reps: lastSet?.reps ?? 10,
            weight: lastSet?.weight ?? 0,
            done: false,
          };
          nextExercises[exIndex] = { ...target, sets: [...target.sets, newSet] };
          return { exercises: nextExercises };
        }),

      removeSet: (exerciseId, setId) =>
        set((state) => {
          const exIndex = state.exercises.findIndex((ex) => ex.id === exerciseId);
          if (exIndex === -1) return state;
          const nextExercises = [...state.exercises];
          const target = nextExercises[exIndex];
          nextExercises[exIndex] = { ...target, sets: target.sets.filter((s) => s.id !== setId) };
          return { exercises: nextExercises };
        }),

      addExercise: (exercise) =>
        set((state) => ({
          exercises: [
            ...state.exercises,
            {
              id: makeUid('ex'),
              exercise,
              sets: [{ id: makeUid('set'), reps: 10, weight: 0, done: false }],
              restTime: 90,
              notes: '',
            },
          ],
        })),

      addExerciseFromProgram: (exercise, numSets, reps, restTime, notes = '') =>
        set((state) => {
          const exId = makeUid('ex');
          return {
            exercises: [
              ...state.exercises,
              {
                id: exId,
                exercise,
                sets: Array.from({ length: numSets }, (_, i) => ({
                  id: makeUid(`set_${i}`),
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

      deleteWorkout: (workoutId) =>
        set((state) => ({
          savedWorkouts: state.savedWorkouts.filter((w) => w.id !== workoutId),
        })),

      updateRestTime: (exerciseId, restTime) =>
        set((state) => {
          const exIndex = state.exercises.findIndex((ex) => ex.id === exerciseId);
          if (exIndex === -1) return state;
          const nextExercises = [...state.exercises];
          nextExercises[exIndex] = { ...nextExercises[exIndex], restTime };
          return { exercises: nextExercises };
        }),

      updateNotes: (exerciseId, notes) =>
        set((state) => {
          const exIndex = state.exercises.findIndex((ex) => ex.id === exerciseId);
          if (exIndex === -1) return state;
          const nextExercises = [...state.exercises];
          nextExercises[exIndex] = { ...nextExercises[exIndex], notes };
          return { exercises: nextExercises };
        }),

      startRestTimer: (seconds) =>
        set({ restTimerActive: true, restTimerSeconds: seconds, restTimerTotal: seconds }),

      tickRestTimer: () =>
        set((state) => {
          if (state.restTimerSeconds <= 1) return { restTimerActive: false, restTimerSeconds: 0 };
          return { restTimerSeconds: state.restTimerSeconds - 1 };
        }),

      stopRestTimer: () => set({ restTimerActive: false, restTimerSeconds: 0 }),
    }),
    {
      name: 'workout-store-v2',
      storage: createJSONStorage(() => getPlatformStorage()),
      partialize: (state) => ({
        savedWorkouts: state.savedWorkouts,
        customExercises: state.customExercises,
        isActive: state.isActive,
        workoutStartTime: state.workoutStartTime,
        workoutName: state.workoutName,
        exercises: state.exercises,
      }),
    }
  )
);

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
  lastMealDate: string;
  getTotals: () => MacroTotals;
  getMealTotals: (mealType: MealEntry['mealType']) => MacroTotals;
  addMeal: (meal: MealEntry) => void;
  removeMeal: (id: string) => void;
  checkAndResetDaily: () => void;
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

export const useNutritionStore = create<NutritionState>()(
  persist(
    (set, get) => ({
      meals: [],
      goals: DAILY_GOALS,
      lastMealDate: getTodayStr(),

      getTotals: () => calcMacros(get().meals),
      getMealTotals: (mealType) => calcMacros(get().meals.filter((m) => m.mealType === mealType)),
      addMeal: (meal) => set((state) => ({ meals: [...state.meals, meal] })),
      removeMeal: (id) => set((state) => ({ meals: state.meals.filter((m) => m.id !== id) })),

      checkAndResetDaily: () => {
        const today = getTodayStr();
        if (get().lastMealDate === today) return;
        set({ meals: [], lastMealDate: today });
      },
    }),
    {
      name: 'nutrition-store-v2',
      storage: createJSONStorage(() => getPlatformStorage()),
      partialize: (state) => ({
        meals: state.meals,
        goals: state.goals,
        lastMealDate: state.lastMealDate,
      }),
    }
  )
);

// ─── PROGRAMME STORE ───────────────────────────────────────────────────────────

export interface ProgramExercise {
  id: string;
  name: string;
  sets: string;
  rest: string;
  targetSets?: number;
  targetReps?: number;
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
  workoutStreakDays: number;
  lastWorkoutDate: string | null;
  lastWeekStartDate: string;
  waterStreakDays: number;
  totalXp: number;
  level: string;
  xpToNextLevel: number;
  badges: Badge[];
  addXp: (amount: number) => void;
  completeWaterGoal: () => void;
  completeWorkout: () => void;
  syncWorkoutStreakFromHistory: (workoutDates: string[]) => void;
  setStreakTarget: (n: number) => void;
  checkAndResetWeekly: () => void;
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
  { id: 'b1',  name: 'Premier pas',    icon: 'footsteps-outline',          description: 'Compléter sa première séance',            condition: '1 séance',            unlocked: false, category: 'workout' },
  { id: 'b2',  name: 'Semaine complète', icon: 'calendar-outline',         description: '5 séances en une semaine',                condition: '5 séances/semaine',   unlocked: false, category: 'workout' },
  { id: 'b3',  name: 'Machine',        icon: 'flame-outline',              description: '4 semaines de streak consécutives',       condition: '4 sem. consécutives', unlocked: false, category: 'workout' },
  { id: 'b4',  name: 'Inarrêtable',   icon: 'infinite-outline',           description: '12 semaines de streak consécutives',      condition: '12 sem. consécutives',unlocked: false, category: 'workout' },
  { id: 'b5',  name: 'Centurion',      icon: 'trophy-outline',             description: '100 séances totales',                     condition: '100 séances',         unlocked: false, category: 'workout' },
  { id: 'b6',  name: 'Tonnage',        icon: 'barbell-outline',            description: 'Soulever 100 000 kg au total',            condition: '100 000 kg',          unlocked: false, category: 'workout' },
  { id: 'b7',  name: 'PR Hunter',      icon: 'medal-outline',              description: 'Battre 10 records personnels',            condition: '10 PRs battus',       unlocked: false, category: 'workout' },
  { id: 'b8',  name: 'Demi-année',     icon: 'star-outline',               description: '24 semaines de streak entraînement',     condition: '24 sem. consécutives',unlocked: false, category: 'workout' },
  { id: 'b9',  name: 'Hydraté',        icon: 'water-outline',              description: '7 jours consécutifs à atteindre l\'objectif eau', condition: '7 jours consécutifs', unlocked: false, category: 'water' },
  { id: 'b10', name: 'Chameau',        icon: 'sunny-outline',              description: '30 jours de streak eau',                  condition: '30 jours consécutifs',unlocked: false, category: 'water' },
  { id: 'b11', name: 'Macro Master',   icon: 'checkmark-circle-outline',   description: '7 jours consécutifs de tracking complet', condition: '7 jours de tracking', unlocked: false, category: 'general' },
  { id: 'b12', name: 'Régulier',       icon: 'clipboard-outline',          description: '30 jours de tracking nutrition',          condition: '30 jours tracking',   unlocked: false, category: 'general' },
];

const { level: INIT_LEVEL, xpToNextLevel: INIT_NEXT } = computeLevel(0);

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      workoutStreakWeeks: 0,
      workoutStreakTarget: 5,
      workoutsThisWeek: 0,
      workoutStreakDays: 0,
      lastWorkoutDate: null,
      lastWeekStartDate: getMondayStr(),
      waterStreakDays: 0,
      totalXp: 0,
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
          const today = getTodayStr();
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          const isNewDay = state.lastWorkoutDate !== today;
          const streakContinues = state.lastWorkoutDate === yesterday || state.lastWorkoutDate === today;
          const workoutStreakDays = !isNewDay
            ? state.workoutStreakDays
            : streakContinues
            ? state.workoutStreakDays + 1
            : 1;

          const count = state.workoutsThisWeek + 1;
          const xp = state.totalXp + 50;
          const { level, xpToNextLevel } = computeLevel(xp);
          const weeks = count >= state.workoutStreakTarget
            ? state.workoutStreakWeeks + 1
            : state.workoutStreakWeeks;
          return {
            workoutsThisWeek: count,
            workoutStreakWeeks: weeks,
            workoutStreakDays,
            lastWorkoutDate: today,
            totalXp: xp,
            level,
            xpToNextLevel,
          };
        }),

      syncWorkoutStreakFromHistory: (workoutDates) =>
        set((state) => {
          if (!Array.isArray(workoutDates) || workoutDates.length === 0) {
            return state;
          }
          const unique = Array.from(
            new Set(
              workoutDates
                .map((d) => String(d).slice(0, 10))
                .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
            )
          ).sort((a, b) => (a < b ? -1 : 1));
          if (!unique.length) return state;

          const today = getTodayStr();
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          const latest = unique[unique.length - 1];
          if (latest !== today && latest !== yesterday) {
            return { ...state, workoutStreakDays: 0, lastWorkoutDate: latest };
          }

          let streak = 1;
          for (let i = unique.length - 1; i > 0; i -= 1) {
            const curr = new Date(`${unique[i]}T12:00:00`);
            const prev = new Date(`${unique[i - 1]}T12:00:00`);
            const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
            if (diffDays === 1) streak += 1;
            else break;
          }

          return { ...state, workoutStreakDays: streak, lastWorkoutDate: latest };
        }),

      setStreakTarget: (n) => set({ workoutStreakTarget: Math.max(1, Math.min(7, n)) }),

      checkAndResetWeekly: () => {
        const monday = getMondayStr();
        const state = get();
        if (state.lastWeekStartDate === monday) return;
        // New week started: archive streak if target was met last week, then reset count
        const streakContinues = state.workoutsThisWeek >= state.workoutStreakTarget;
        set({
          workoutsThisWeek: 0,
          lastWeekStartDate: monday,
          workoutStreakWeeks: streakContinues ? state.workoutStreakWeeks : 0,
        });
      },
    }),
    {
      name: 'gamification-store-v2',
      storage: createJSONStorage(() => getPlatformStorage()),
      partialize: (state) => ({
        workoutStreakWeeks: state.workoutStreakWeeks,
        workoutStreakTarget: state.workoutStreakTarget,
        workoutsThisWeek: state.workoutsThisWeek,
        workoutStreakDays: state.workoutStreakDays,
        lastWorkoutDate: state.lastWorkoutDate,
        lastWeekStartDate: state.lastWeekStartDate,
        waterStreakDays: state.waterStreakDays,
        totalXp: state.totalXp,
        level: state.level,
        xpToNextLevel: state.xpToNextLevel,
        badges: state.badges,
      }),
    }
  )
);

// ─── CHRONO STORE ──────────────────────────────────────────────────────────────
// Timestamp-based: timers survive tab switches, app backgrounding, and full kills.

export interface LapRecord {
  id: number;
  elapsedSec: number;
  splitSec: number;
}

interface ChronoState {
  // Stopwatch
  swRunning: boolean;
  swStartMs: number | null;
  swAccMs: number;
  swLaps: LapRecord[];
  // Timer (countdown)
  timerPreset: number;
  timerRunning: boolean;
  timerEndMs: number | null;
  timerRemMs: number;
  // Repos (rest countdown, fixed 90s default)
  reposRunning: boolean;
  reposEndMs: number | null;
  reposRemMs: number;
  // Tabata
  tabataRunning: boolean;
  tabataIsWork: boolean;
  tabataPhaseEndMs: number | null;
  tabataPhaseRemMs: number;
  tabataRounds: number;
  // Actions
  swStart: () => void;
  swPause: () => void;
  swReset: () => void;
  swLap: () => void;
  timerSetPreset: (seconds: number) => void;
  timerStart: () => void;
  timerPause: () => void;
  timerReset: () => void;
  reposStart: () => void;
  reposPause: () => void;
  reposReset: () => void;
  tabataStart: () => void;
  tabataPause: () => void;
  tabataReset: () => void;
  tabataCheckAdvance: () => void;
}

export const useChronoStore = create<ChronoState>()(
  persist(
    (set, get) => ({
      swRunning: false,
      swStartMs: null,
      swAccMs: 0,
      swLaps: [],
      timerPreset: 60,
      timerRunning: false,
      timerEndMs: null,
      timerRemMs: 60000,
      reposRunning: false,
      reposEndMs: null,
      reposRemMs: 90000,
      tabataRunning: false,
      tabataIsWork: true,
      tabataPhaseEndMs: null,
      tabataPhaseRemMs: 20000,
      tabataRounds: 0,

      swStart: () => {
        const s = get();
        if (s.swRunning) return;
        set({ swRunning: true, swStartMs: Date.now() });
      },
      swPause: () => {
        const s = get();
        if (!s.swRunning || s.swStartMs == null) return;
        set({ swRunning: false, swAccMs: s.swAccMs + (Date.now() - s.swStartMs), swStartMs: null });
      },
      swReset: () => set({ swRunning: false, swStartMs: null, swAccMs: 0, swLaps: [] }),
      swLap: () => {
        const s = get();
        const ms = s.swRunning && s.swStartMs != null ? s.swAccMs + (Date.now() - s.swStartMs) : s.swAccMs;
        const elapsedSec = Math.floor(ms / 1000);
        const prevSec = s.swLaps.length > 0 ? s.swLaps[0].elapsedSec : 0;
        set({ swLaps: [{ id: Date.now(), elapsedSec, splitSec: elapsedSec - prevSec }, ...s.swLaps] });
      },

      timerSetPreset: (seconds) =>
        set({ timerPreset: seconds, timerRemMs: seconds * 1000, timerRunning: false, timerEndMs: null }),
      timerStart: () => {
        const s = get();
        if (s.timerRunning || s.timerRemMs <= 0) return;
        set({ timerRunning: true, timerEndMs: Date.now() + s.timerRemMs });
      },
      timerPause: () => {
        const s = get();
        if (!s.timerRunning || s.timerEndMs == null) return;
        set({ timerRunning: false, timerRemMs: Math.max(0, s.timerEndMs - Date.now()), timerEndMs: null });
      },
      timerReset: () => {
        const s = get();
        set({ timerRunning: false, timerEndMs: null, timerRemMs: s.timerPreset * 1000 });
      },

      reposStart: () => {
        const s = get();
        if (s.reposRunning || s.reposRemMs <= 0) return;
        set({ reposRunning: true, reposEndMs: Date.now() + s.reposRemMs });
      },
      reposPause: () => {
        const s = get();
        if (!s.reposRunning || s.reposEndMs == null) return;
        set({ reposRunning: false, reposRemMs: Math.max(0, s.reposEndMs - Date.now()), reposEndMs: null });
      },
      reposReset: () => set({ reposRunning: false, reposEndMs: null, reposRemMs: 90000 }),

      tabataStart: () => {
        const s = get();
        if (s.tabataRunning) return;
        set({ tabataRunning: true, tabataPhaseEndMs: Date.now() + s.tabataPhaseRemMs });
      },
      tabataPause: () => {
        const s = get();
        if (!s.tabataRunning || s.tabataPhaseEndMs == null) return;
        set({
          tabataRunning: false,
          tabataPhaseRemMs: Math.max(0, s.tabataPhaseEndMs - Date.now()),
          tabataPhaseEndMs: null,
        });
      },
      tabataReset: () =>
        set({ tabataRunning: false, tabataIsWork: true, tabataPhaseEndMs: null, tabataPhaseRemMs: 20000, tabataRounds: 0 }),
      tabataCheckAdvance: () => {
        const s = get();
        if (!s.tabataRunning || s.tabataPhaseEndMs == null || Date.now() < s.tabataPhaseEndMs) return;
        const nextIsWork = !s.tabataIsWork;
        const nextMs = nextIsWork ? 20000 : 10000;
        set({
          tabataIsWork: nextIsWork,
          tabataRounds: s.tabataIsWork ? s.tabataRounds + 1 : s.tabataRounds,
          tabataPhaseEndMs: Date.now() + nextMs,
          tabataPhaseRemMs: nextMs,
        });
      },
    }),
    {
      name: 'chrono-store-v1',
      storage: createJSONStorage(() => getPlatformStorage()),
      partialize: (state) => ({
        swRunning: state.swRunning,
        swStartMs: state.swStartMs,
        swAccMs: state.swAccMs,
        swLaps: state.swLaps,
        timerPreset: state.timerPreset,
        timerRunning: state.timerRunning,
        timerEndMs: state.timerEndMs,
        timerRemMs: state.timerRemMs,
        reposRunning: state.reposRunning,
        reposEndMs: state.reposEndMs,
        reposRemMs: state.reposRemMs,
        tabataRunning: state.tabataRunning,
        tabataIsWork: state.tabataIsWork,
        tabataPhaseEndMs: state.tabataPhaseEndMs,
        tabataPhaseRemMs: state.tabataPhaseRemMs,
        tabataRounds: state.tabataRounds,
      }),
    }
  )
);
