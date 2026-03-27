import React, { useCallback, useEffect, useRef, useState, useMemo, useReducer } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  StatusBar,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/theme';
import { getColors, type ThemeColors } from '../../constants/theme';
import { useWorkoutStore, useWaterStore, useProgramStore, useGamificationStore, useChronoStore, getShortDayFromDate } from '../../store';
import type { ProgramExercise } from '../../store';
import { weeklyProgram, exercisesDB } from '../../constants/mockData';
import { PROGRAMME_API, SEANCES_API } from '../../constants/api';
import type { WorkoutExercise, Exercise } from '../../constants/mockData';
import StartWorkoutModal from '../../components/StartWorkoutModal';
import ExerciseSearchModal from '../../components/ExerciseSearchModal';
import SaveWorkoutModal from '../../components/SaveWorkoutModal';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Map exercise name to Exercise object from DB, or create fallback
function resolveExercise(nameWithSets: string): Exercise {
  // Extract the name part (before the sets notation like "4x6")
  const name = nameWithSets.replace(/\s+\d+[x×]\d+(-\d+)?$/, '').trim();
  const found = exercisesDB.find(
    (e) => e.name.toLowerCase() === name.toLowerCase()
  );
  if (found) return found;
  return {
    id: `custom_${Date.now()}_${Math.random()}`,
    name,
    muscleGroup: 'Autre',
    category: 'Compound',
    equipment: 'Autre',
  };
}

// Parse "4×5", "3×8-10", "2×3-4" → { numSets, reps }
function parseProgramSets(setsStr: string): { numSets: number; reps: number } {
  const m = setsStr.match(/(\d+)\s*[x×]\s*(\d+)/i);
  if (!m) return { numSets: 3, reps: 8 };
  return { numSets: parseInt(m[1], 10), reps: parseInt(m[2], 10) };
}

function resolveProgramPrescription(ex: {
  sets: string;
  targetSets?: number;
  targetReps?: number;
}): { numSets: number; reps: number } {
  if (typeof ex.targetSets === 'number' && typeof ex.targetReps === 'number') {
    return { numSets: ex.targetSets, reps: ex.targetReps };
  }
  return parseProgramSets(ex.sets);
}

// Parse "3min", "2-3min", "90s", "120" → seconds
function parseProgramRest(restStr: string): number {
  if (!restStr) return 120;
  const minRange = restStr.match(/(\d+)-(\d+)\s*min/i);
  if (minRange) return Math.round((parseInt(minRange[1]) + parseInt(minRange[2])) / 2) * 60;
  const min = restStr.match(/(\d+)\s*min/i);
  if (min) return parseInt(min[1]) * 60;
  const sec = restStr.match(/(\d+)\s*s/i);
  if (sec) return parseInt(sec[1]);
  return 120;
}

// ─── Sub-tab pill row ─────────────────────────────────────────────────────────

type SeanceTab = 'seance' | 'course' | 'chrono' | 'eau' | 'programme';
const SEANCE_TABS: { key: SeanceTab; label: string }[] = [
  { key: 'seance', label: 'Seance' },
  { key: 'course', label: 'Course' },
  { key: 'chrono', label: 'Chrono' },
  { key: 'eau', label: 'Eau' },
  { key: 'programme', label: 'Programme' },
];

function getSubStyles(colors: ReturnType<typeof getColors>) {
  return StyleSheet.create({
    container: {
      flexGrow: 0,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.separator,
    },
    row: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
    pill: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: 'transparent' },
    pillActive: { backgroundColor: colors.text },
    pillText: { fontSize: 14, fontWeight: '500', color: colors.textSecondary },
    pillTextActive: { color: colors.background, fontWeight: '600' },
  });
}

function SubTabBar({ active, onPress }: { active: SeanceTab; onPress: (t: SeanceTab) => void }) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = getColors(isDark);
  const subStyles = useMemo(() => getSubStyles(colors), [isDark]);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={subStyles.row}
      style={subStyles.container}
    >
      {SEANCE_TABS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[subStyles.pill, isActive && subStyles.pillActive]}
            onPress={() => onPress(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={[subStyles.pillText, isActive && subStyles.pillTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ─── TAB: SEANCE ─────────────────────────────────────────────────────────────

function getSeanceStyles(colors: ThemeColors) {
  return StyleSheet.create({
    exCard: { backgroundColor: colors.card, borderRadius: 12, marginBottom: 12, overflow: 'hidden' },
    exHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 14, paddingBottom: 8, gap: 10 },
    exName: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '700' },
    progressDots: { flexDirection: 'row', gap: 4 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    dotDone: { backgroundColor: colors.accent },
    dotPending: { backgroundColor: colors.textTertiary },
    tableHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingBottom: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.separator },
    colHead: { color: colors.textSecondary, fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
    colNum: { width: 20, minWidth: 20, textAlign: 'center' },
    colReps: { flex: 1, minWidth: 0, textAlign: 'center' },
    colKg: { flex: 1, minWidth: 0, textAlign: 'center' },
    colRpe: { width: 30, minWidth: 30, textAlign: 'center' },
    colCheck: { width: 28, minWidth: 28, alignItems: 'center', justifyContent: 'center' },
    setRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 4 },
    setNum: { color: colors.textSecondary, fontSize: 12, textAlign: 'center' },
    setInput: { flex: 1, minWidth: 0, color: colors.text, fontSize: 12, fontWeight: '600', backgroundColor: colors.input, borderRadius: 6, marginHorizontal: 1, paddingHorizontal: 2, paddingVertical: 5, textAlign: 'center' },
    rpeInput: { color: colors.accent, fontSize: 11, fontWeight: '700', backgroundColor: colors.input, borderRadius: 6, marginHorizontal: 1, paddingHorizontal: 2, paddingVertical: 5, textAlign: 'center', width: 26, minWidth: 26 },
    rpePlaceholder: { color: colors.textTertiary, fontSize: 10 },
    checkbox: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: colors.textTertiary, alignItems: 'center', justifyContent: 'center' },
    checkboxDone: { backgroundColor: colors.accent, borderColor: colors.accent },
    notesRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 8, paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.separator },
    notesInput: { flex: 1, minWidth: 0, color: colors.textSecondary, fontSize: 13, backgroundColor: colors.input, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7, minHeight: 32 },
    addSetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.separator, marginHorizontal: 8, marginBottom: 4 },
    addSetText: { color: colors.text, fontSize: 13, fontWeight: '500' },
  });
}

function ExerciseCard({ ex, styles: sc, colors }: { ex: WorkoutExercise; styles: ReturnType<typeof getSeanceStyles>; colors: ThemeColors }) {
  const { toggleSetDone, updateSet, addSet, removeSet, updateNotes } = useWorkoutStore();
  const [expanded, setExpanded] = useState(true);

  return (
    <View style={sc.exCard}>
      {/* Header */}
      <TouchableOpacity style={sc.exHeader} onPress={() => setExpanded((e) => !e)} activeOpacity={0.7}>
        <Text style={sc.exName}>{ex.exercise.name}</Text>
        <View style={sc.progressDots}>
          {ex.sets.map((s) => (
            <View key={s.id} style={[sc.dot, s.done ? sc.dotDone : sc.dotPending]} />
          ))}
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textTertiary} style={{ marginLeft: 6 }} />
      </TouchableOpacity>
      {expanded && (
        <>
          {/* Column headers */}
          <View style={sc.tableHeader}>
            <Text style={[sc.colHead, sc.colNum]} numberOfLines={1}>#</Text>
            <Text style={[sc.colHead, sc.colReps]} numberOfLines={1}>Reps</Text>
            <Text style={[sc.colHead, sc.colKg]} numberOfLines={1}>kg</Text>
            <Text style={[sc.colHead, sc.colRpe]} numberOfLines={1}>RPE</Text>
            <Text style={[sc.colHead, sc.colCheck]}>✓</Text>
          </View>
          {/* Set rows */}
          {ex.sets.map((s, i) => (
            <View key={s.id} style={sc.setRow}>
              {ex.sets.length > 1 ? (
                <TouchableOpacity style={[sc.colNum, { alignItems: 'center' }]} onPress={() => removeSet(ex.id, s.id)}>
                  <Ionicons name="remove-circle" size={16} color={colors.error} />
                </TouchableOpacity>
              ) : (
                <Text style={[sc.setNum, sc.colNum]}>{i + 1}</Text>
              )}
              <TextInput
                style={[sc.setInput, sc.colReps]}
                value={String(s.reps)}
                keyboardType="numeric"
                onChangeText={(v) => updateSet(ex.id, s.id, 'reps', parseInt(v) || 0)}
                placeholderTextColor={colors.textTertiary}
              />
              <TextInput
                style={[sc.setInput, sc.colKg]}
                value={s.weight > 0 ? String(s.weight) : ''}
                placeholder="0"
                keyboardType="decimal-pad"
                onChangeText={(v) => updateSet(ex.id, s.id, 'weight', parseFloat(v) || 0)}
                placeholderTextColor={colors.textTertiary}
              />
              <TextInput
                style={sc.rpeInput}
                value={s.rpe ? String(s.rpe) : ''}
                placeholder="—"
                keyboardType="numeric"
                maxLength={2}
                onChangeText={(v) => {
                  const n = parseInt(v);
                  if (!isNaN(n) && n >= 1 && n <= 10) updateSet(ex.id, s.id, 'rpe', n);
                  else if (v === '') updateSet(ex.id, s.id, 'rpe', 0);
                }}
                placeholderTextColor={colors.textTertiary}
              />
              <TouchableOpacity style={[sc.colCheck, { alignItems: 'center' }]} onPress={() => toggleSetDone(ex.id, s.id)}>
                <View style={[sc.checkbox, s.done && sc.checkboxDone]}>
                  {s.done && <Ionicons name="checkmark" size={14} color={colors.background} />}
                </View>
              </TouchableOpacity>
            </View>
          ))}
          {/* Notes row */}
          <View style={sc.notesRow}>
            <Ionicons name="create-outline" size={14} color={colors.textTertiary} />
            <TextInput
              style={sc.notesInput}
              value={ex.notes || ''}
              onChangeText={(v) => updateNotes(ex.id, v)}
              placeholder="Notes, sensations, tempo..."
              placeholderTextColor={colors.textTertiary}
              multiline
            />
          </View>
          <TouchableOpacity style={sc.addSetBtn} onPress={() => addSet(ex.id)}>
            <Ionicons name="add" size={16} color={colors.text} />
            <Text style={sc.addSetText}>Ajouter une série</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

function getDayPickerStyles(colors: ThemeColors) {
  return StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    sheet: { backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40, maxHeight: '80%' },
    handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.separator, alignSelf: 'center', marginBottom: 20 },
    title: { color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: 16 },
    dayRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.separator, gap: 12 },
    dayBadge: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    dayShort: { fontSize: 13, fontWeight: '700' },
    dayInfo: { flex: 1 },
    dayLabel: { color: colors.text, fontSize: 15, fontWeight: '600', marginBottom: 2 },
    dayMeta: { color: colors.textSecondary, fontSize: 12 },
    cancelBtn: { alignItems: 'center', paddingVertical: 14, marginTop: 8 },
    cancelText: { color: colors.textSecondary, fontSize: 16, fontWeight: '500' },
  });
}

function ProgramDayPicker({ visible, onClose, onSelectDay }: { visible: boolean; onClose: () => void; onSelectDay: (dayIndex: number) => void }) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = getColors(isDark);
  const dayPickerStyles = useMemo(() => getDayPickerStyles(colors), [isDark]);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={dayPickerStyles.overlay} onPress={onClose}>
        <Pressable style={dayPickerStyles.sheet} onPress={() => {}}>
          <View style={dayPickerStyles.handle} />
          <Text style={dayPickerStyles.title}>Choisir un jour</Text>
          <ScrollView>
            {weeklyProgram.map((day, index) => (
              <TouchableOpacity key={day.day} style={dayPickerStyles.dayRow} onPress={() => { onSelectDay(index); onClose(); }}>
                <View style={[dayPickerStyles.dayBadge, { backgroundColor: day.color + '33' }]}>
                  <Text style={[dayPickerStyles.dayShort, { color: day.color }]}>{day.shortDay}</Text>
                </View>
                <View style={dayPickerStyles.dayInfo}>
                  <Text style={dayPickerStyles.dayLabel}>{day.label}</Text>
                  <Text style={dayPickerStyles.dayMeta}>{day.type === 'rest' ? 'Repos' : `${day.exercises.length} exercices`}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={dayPickerStyles.cancelBtn} onPress={onClose}>
            <Text style={dayPickerStyles.cancelText}>Annuler</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function getActiveStyles(colors: ThemeColors) {
  return StyleSheet.create({
    idleContainer: { padding: 16 },
    idleTitle: { color: colors.text, fontSize: 26, fontWeight: '700', marginBottom: 16 },
    ctaBtn: { backgroundColor: colors.cta, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 28, borderWidth: 2, borderColor: colors.ctaText },
    ctaBtnText: { color: colors.ctaText, fontSize: 16, fontWeight: '700' },
    sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 12 },
    historyCard: { backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 10 },
    historyDate: { color: colors.textSecondary, fontSize: 12, marginBottom: 4 },
    historyName: { color: colors.text, fontSize: 15, fontWeight: '600', marginBottom: 6 },
    historyMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    historyMetaText: { color: colors.textSecondary, fontSize: 13 },
    historyMetaSep: { color: colors.textTertiary, fontSize: 13 },
    activeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
    roundBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
    timerCenter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    timer: { color: colors.accentOrange, fontSize: 20, fontWeight: '700', fontVariant: ['tabular-nums'] },
    workoutName: { color: colors.text, fontSize: 20, fontWeight: '700', paddingHorizontal: 16, marginBottom: 12 },
    // Keep enough space so the add button is never hidden behind the floating tab bar.
    scrollContent: { paddingHorizontal: 16, paddingBottom: Platform.OS === 'ios' ? 210 : 188 },
    addExContainer: {
      position: 'absolute',
      bottom: Platform.OS === 'ios' ? 104 : 90,
      left: 0,
      right: 0,
      paddingHorizontal: 16,
      paddingBottom: Platform.OS === 'ios' ? 12 : 10,
      paddingTop: 10,
      backgroundColor: colors.background,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.separator,
    },
    addExBtn: {
      backgroundColor: colors.accentMuted,
      borderRadius: 12,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: `${colors.accent}55`,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    addExText: { color: colors.accent, fontSize: 16, fontWeight: '700' },
    restBubble: { position: 'absolute', bottom: Platform.OS === 'ios' ? 188 : 172, right: 20, width: 72, height: 72, borderRadius: 36, backgroundColor: colors.accentYellowGreen, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
    restBubbleTime: { color: colors.background, fontSize: 14, fontWeight: '800' },
    restBubbleLabel: { color: colors.background, fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  });
}

// ─── Helpers for mini calendar ────────────────────────────────────────────────

function getWeekDays(): Date[] {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const WEEK_DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

function SeanceContent() {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = getColors(isDark);
  const activeStyles = useMemo(() => getActiveStyles(colors), [isDark]);
  const seanceStyles = useMemo(() => getSeanceStyles(colors), [isDark]);
  const {
    isActive,
    workoutStartTime,
    workoutName,
    exercises,
    restTimerActive,
    restTimerSeconds,
    restTimerTotal,
    startWorkout,
    endWorkout,
    saveWorkout,
    savedWorkouts,
    addExercise,
    clearExercises,
    deleteWorkout,
    tickRestTimer,
    stopRestTimer,
    checkStaleWorkout,
    syncSavedWorkoutsFromApi,
  } = useWorkoutStore();

  const { workoutStreakWeeks, workoutStreakDays, workoutStreakTarget, workoutsThisWeek, setStreakTarget, checkAndResetWeekly, completeWorkout, lastWorkoutDate } = useGamificationStore();
  const [showObjectivesInStreak, setShowObjectivesInStreak] = useState(false);

  // Check daily/weekly resets on focus
  useFocusEffect(
    useCallback(() => {
      checkAndResetWeekly();
      checkStaleWorkout();
      syncSavedWorkoutsFromApi(SEANCES_API);
      const today = toDateStr(new Date());
      const hasTodayWorkout = savedWorkouts.some((w) => w.date === today);
      // Backfill streak state for workouts saved before streak hook was wired.
      if (hasTodayWorkout && lastWorkoutDate !== today) {
        completeWorkout();
      }
    }, [checkAndResetWeekly, checkStaleWorkout, syncSavedWorkoutsFromApi, savedWorkouts, lastWorkoutDate, completeWorkout])
  );

  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [showStartModal, setShowStartModal] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<import('../../constants/mockData').Workout | null>(null);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => { const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() }; });

  // Elapsed seconds computed from startTime (persists across navigation)
  const elapsedSeconds = workoutStartTime ? Math.floor((Date.now() - workoutStartTime) / 1000) : 0;

  // Main workout timer — just force re-render every second
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => forceUpdate(), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  // Rest timer
  useEffect(() => {
    if (restTimerActive) {
      restRef.current = setInterval(() => tickRestTimer(), 1000);
    } else {
      if (restRef.current) clearInterval(restRef.current);
    }
    return () => {
      if (restRef.current) clearInterval(restRef.current);
    };
  }, [restTimerActive]);

  const handleStartEmpty = () => {
    clearExercises();
    startWorkout();
    setShowStartModal(false);
  };

  const { program: webProgram, fetchProgram } = useProgramStore();
  const { addExerciseFromProgram } = useWorkoutStore();

  const handleStartFromProgram = async () => {
    setShowStartModal(false);
    await fetchProgram(PROGRAMME_API);
    setShowDayPicker(true);
  };

  const handleSelectDay = async (dayIndex: number) => {
    if (!useProgramStore.getState().program) {
      await fetchProgram(PROGRAMME_API);
    }

    clearExercises();
    startWorkout();

    const latestWebProgram = useProgramStore.getState().program;
    const webDay = latestWebProgram?.days[dayIndex];
    const localDay = weeklyProgram[dayIndex];
    const isRest = webDay ? webDay.type === 'rest' : localDay.type === 'rest';

    if (!isRest) {
      if (webDay && webDay.exercises.length > 0) {
        webDay.exercises.forEach((ex) => {
          const exercise = resolveExercise(ex.name);
          const { numSets, reps } = resolveProgramPrescription(ex);
          const restTime = parseProgramRest(ex.rest);
          addExerciseFromProgram(exercise, numSets, reps, restTime, `${ex.sets} — repos ${ex.rest}`);
        });
      } else {
        localDay.exercises.forEach((exStr) => {
          addExercise(resolveExercise(exStr));
        });
      }
    }
  };

  const handleExerciseSelect = (item: { id: string; name: string; muscle: string; equipment: string }) => {
    const exercise: Exercise = {
      id: item.id,
      name: item.name,
      muscleGroup: item.muscle,
      category: 'Compound',
      equipment: item.equipment,
    };
    addExercise(exercise);
  };

  const handleSave = async (meta?: {
    title: string;
    description: string;
    tags: string[];
    effortRating: number;
    energyRating: number;
    moodRating: number;
    sleepHours: string;
    sleepQuality: number;
    morningEnergy: number;
    soreness: number;
    visibility: 'Tout le monde' | 'Amis' | 'Prive';
    photos: string[];
  }) => {
    saveWorkout({ name: workoutName, duration: elapsedSeconds, exercises });
    completeWorkout();
    try {
      await fetch(SEANCES_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `mobile_${Date.now()}`,
          name: meta?.title?.trim() ? meta.title.trim() : workoutName,
          date: new Date().toISOString().split('T')[0],
          duration: Math.max(1, Math.round(elapsedSeconds / 60)),
          source: 'mobile',
          rpeMax: meta?.effortRating ?? null,
          notes: meta?.description ?? '',
          sessionMeta: meta
            ? {
                tags: meta.tags,
                effortRating: meta.effortRating,
                energyRating: meta.energyRating,
                moodRating: meta.moodRating,
                sleepHours: meta.sleepHours,
                sleepQuality: meta.sleepQuality,
                morningEnergy: meta.morningEnergy,
                soreness: meta.soreness,
                visibility: meta.visibility,
                photoCount: meta.photos?.length ?? 0,
              }
            : null,
          exercises,
        }),
      });
    } catch {
      // Keep local save even if sync fails
    }
    setShowSaveModal(false);
    Alert.alert('Séance enregistrée !', 'Séance sauvegardée en local et synchronisée vers le web si dispo.');
  };

  const handleAbortWorkout = () => {
    if (Platform.OS === 'web') {
      const ok = typeof window !== 'undefined'
        ? window.confirm('Abandonner la séance ? La progression en cours ne sera pas sauvegardée.')
        : false;
      if (ok) {
        stopRestTimer();
        clearExercises();
        endWorkout();
      }
      return;
    }
    Alert.alert('Abandonner la séance ?', 'La progression en cours ne sera pas sauvegardée.', [
      { text: 'Continuer', style: 'cancel' },
      {
        text: 'Abandonner',
        style: 'destructive',
        onPress: () => {
          stopRestTimer();
          clearExercises();
          endWorkout();
        },
      },
    ]);
  };

  const handleOpenSaveModal = () => {
    if (exercises.length === 0) {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          window.alert('Ajoute au moins un exercice avant de sauvegarder.');
        }
      } else {
        Alert.alert('Aucun exercice', 'Ajoute au moins un exercice avant de sauvegarder.');
      }
      return;
    }
    setShowSaveModal(true);
  };

  if (!isActive) {
    const today = new Date();
    const todayStr = toDateStr(today);
    const weekDays = getWeekDays();
    const workoutDateSet = new Set(savedWorkouts.map((w) => w.date));
    const remaining = Math.max(0, workoutStreakTarget - workoutsThisWeek);
    const motivMsg =
      workoutsThisWeek >= workoutStreakTarget
        ? 'Bravo ! Objectif de la semaine atteint ! 🎉'
        : remaining === 1
        ? "Plus qu'un entraînement pour maintenir ton streak !"
        : `${remaining} entraînements restants cette semaine`;

    return (
      <>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* ── Header ── */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 }}>
            <TouchableOpacity onPress={() => setShowStreakModal(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 22 }}>🔥</Text>
              <Text style={{ color: colors.accent, fontSize: 15, fontWeight: '800' }}>{workoutStreakDays}</Text>
            </TouchableOpacity>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>Entraînements</Text>
            <TouchableOpacity onPress={() => setShowCalendarModal(true)}>
              <Ionicons name="calendar-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* ── Mini calendar ── */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 16, gap: 4 }}
          >
            {weekDays.map((day, i) => {
              const dStr = toDateStr(day);
              const isToday = dStr === todayStr;
              const hasWorkout = workoutDateSet.has(dStr);
              return (
                <View key={i} style={{ alignItems: 'center', width: 44, gap: 4 }}>
                  <Text style={{ color: colors.textTertiary, fontSize: 11, fontWeight: '600' }}>
                    {WEEK_DAY_LABELS[i]}
                  </Text>
                  <View style={{
                    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
                    backgroundColor: isToday ? colors.accent : 'transparent',
                  }}>
                    <Text style={{
                      fontSize: 14, fontWeight: isToday ? '800' : '500',
                      color: isToday ? '#FFFFFF' : colors.text,
                    }}>
                      {day.getDate()}
                    </Text>
                  </View>
                  <View style={{
                    width: 6, height: 6, borderRadius: 3,
                    backgroundColor: hasWorkout ? colors.accent : 'transparent',
                  }} />
                </View>
              );
            })}
          </ScrollView>

          {/* ── Motivational + CTA ── */}
          <View style={{ paddingHorizontal: 16, paddingBottom: 20 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 14 }}>
              {motivMsg}
            </Text>
            <TouchableOpacity
              style={{ backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              onPress={() => setShowStartModal(true)}
            >
              <Ionicons name="play" size={16} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>Commencer un entraînement</Text>
            </TouchableOpacity>
          </View>

          {/* ── Entraînements précédents ── */}
          {savedWorkouts.length > 0 && (
            <View style={{ paddingHorizontal: 16, paddingBottom: 32 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>Entraînements précédents</Text>
                <Text style={{ color: colors.accent, fontSize: 14, fontWeight: '600' }}>Voir tout</Text>
              </View>
              {savedWorkouts.slice(0, 5).map((w) => {
                const totalSets = w.totalSets ?? w.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
                return (
                  <TouchableOpacity
                    key={w.id}
                    style={{ backgroundColor: colors.card, borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => setSelectedWorkout(w)}
                    activeOpacity={0.75}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 3 }}>
                        {w.name}
                      </Text>
                      <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 8 }}>
                        {w.exercises.length} exercice{w.exercises.length !== 1 ? 's' : ''} · {totalSets} série{totalSets !== 1 ? 's' : ''} · {w.duration} min
                      </Text>
                      {w.tags && w.tags.length > 0 && (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                          {w.tags.map((tag) => (
                            <View key={tag} style={{ backgroundColor: colors.cardAlt, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                              <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '500' }}>{tag}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                      <Text style={{ color: colors.textTertiary, fontSize: 11, marginTop: 6 }}>
                        {new Date(w.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </Text>
                    </View>
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.cardAlt, alignItems: 'center', justifyContent: 'center', marginLeft: 10 }}>
                      <Ionicons name="play" size={16} color={colors.text} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {savedWorkouts.length === 0 && (
            <View style={{ alignItems: 'center', paddingTop: 40, paddingHorizontal: 32 }}>
              <Ionicons name="barbell-outline" size={56} color={colors.textTertiary} />
              <Text style={{ color: colors.textSecondary, fontSize: 15, textAlign: 'center', marginTop: 12 }}>
                Aucune séance enregistrée.{'\n'}Lance ton premier entraînement !
              </Text>
            </View>
          )}
        </ScrollView>

        {/* ── Streak Modal ── */}
        <Modal visible={showStreakModal} animationType="slide" transparent onRequestClose={() => setShowStreakModal(false)}>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }}
            activeOpacity={1}
            onPress={() => setShowStreakModal(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={{ backgroundColor: colors.accent, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 28, paddingTop: 16, paddingBottom: 48 }}
              onPress={() => {}}
            >
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.35)', alignSelf: 'center', marginBottom: 20 }} />
              <TouchableOpacity onPress={() => setShowStreakModal(false)} style={{ position: 'absolute', top: 20, right: 24 }}>
                <Ionicons name="close" size={24} color="rgba(255,255,255,0.75)" />
              </TouchableOpacity>
              <Text style={{ fontSize: 72, textAlign: 'center', marginBottom: 4 }}>🔥</Text>
              <Text style={{ fontSize: 72, fontWeight: '900', color: '#FFFFFF', textAlign: 'center', lineHeight: 72 }}>{workoutStreakWeeks}</Text>
              <Text style={{ fontSize: 20, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginBottom: 32, fontWeight: '600' }}>
                semaine{workoutStreakWeeks > 1 ? 's' : ''} de streak
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 24 }}>
                {Array.from({ length: workoutStreakTarget }).map((_, i) => (
                  <View key={i} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: i < workoutsThisWeek ? '#FFFFFF' : 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' }}>
                    {i < workoutsThisWeek && <Ionicons name="checkmark" size={20} color={colors.accent} />}
                  </View>
                ))}
              </View>
              <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: 4 }}>
                {workoutsThisWeek}/{workoutStreakTarget} séances cette semaine
              </Text>
              <Text style={{ fontSize: 16, color: '#FFFFFF', textAlign: 'center', marginBottom: 28, marginTop: 8, fontWeight: '600' }}>
                {remaining === 0 ? 'Bravo ! Streak maintenu cette semaine ! 🎉' : `Plus que ${remaining} entraînement${remaining > 1 ? 's' : ''} pour maintenir ton streak !`}
              </Text>
              {!showObjectivesInStreak ? (
                <TouchableOpacity
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 14, paddingVertical: 15, alignItems: 'center' }}
                  onPress={() => setShowObjectivesInStreak(true)}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>Mes objectifs</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 16 }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700', textAlign: 'center', marginBottom: 14 }}>
                    Séances par semaine
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'center', marginBottom: 14 }}>
                    {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                      <TouchableOpacity
                        key={n}
                        style={{
                          width: 42, height: 42, borderRadius: 21,
                          backgroundColor: n === workoutStreakTarget ? '#FFFFFF' : 'rgba(255,255,255,0.25)',
                          alignItems: 'center', justifyContent: 'center',
                        }}
                        onPress={() => { setStreakTarget(n); setShowObjectivesInStreak(false); }}
                        activeOpacity={0.8}
                      >
                        <Text style={{ color: n === workoutStreakTarget ? colors.accent : '#FFFFFF', fontSize: 16, fontWeight: '800' }}>
                          {n}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity onPress={() => setShowObjectivesInStreak(false)} style={{ alignItems: 'center', paddingVertical: 6 }}>
                    <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Annuler</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Workout detail modal */}
        <Modal visible={selectedWorkout !== null} animationType="slide" transparent onRequestClose={() => setSelectedWorkout(null)}>
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={() => setSelectedWorkout(null)}>
            <Pressable
              style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 12, paddingBottom: 32, maxHeight: '85%' }}
              onPress={(e) => e.stopPropagation()}
            >
              {/* Handle */}
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.separator, alignSelf: 'center', marginBottom: 16 }} />

              {selectedWorkout && (
                <>
                  {/* Header */}
                  <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4 }}>
                      {new Date(selectedWorkout.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </Text>
                    <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: 12 }}>{selectedWorkout.name}</Text>
                    <View style={{ flexDirection: 'row', gap: 16 }}>
                      <View style={{ backgroundColor: colors.card, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, alignItems: 'center' }}>
                        <Text style={{ color: colors.accentOrange, fontSize: 16, fontWeight: '700' }}>{selectedWorkout.duration} min</Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>Durée</Text>
                      </View>
                      <View style={{ backgroundColor: colors.card, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, alignItems: 'center' }}>
                        <Text style={{ color: colors.accentOrange, fontSize: 16, fontWeight: '700' }}>{(selectedWorkout.totalVolume / 1000).toFixed(1)} t</Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>Volume</Text>
                      </View>
                      <View style={{ backgroundColor: colors.card, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, alignItems: 'center' }}>
                        <Text style={{ color: colors.accentOrange, fontSize: 16, fontWeight: '700' }}>{selectedWorkout.totalSets ?? selectedWorkout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)}</Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>Séries</Text>
                      </View>
                    </View>
                  </View>

                  {/* Exercises list */}
                  <ScrollView style={{ paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
                    {selectedWorkout.exercises.map((ex) => (
                      <View key={ex.id} style={{ marginBottom: 14 }}>
                        <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600', marginBottom: 6 }}>{ex.exercise.name}</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                          {ex.sets.map((s, i) => (
                            <View key={s.id} style={{ backgroundColor: s.done ? colors.accentOrange + '22' : colors.card, borderRadius: 8, paddingVertical: 5, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <Text style={{ color: colors.textSecondary, fontSize: 11 }}>S{i + 1}</Text>
                              <Text style={{ color: s.done ? colors.accentOrange : colors.text, fontSize: 13, fontWeight: '600' }}>
                                {s.weight > 0 ? `${s.weight} kg × ` : ''}{s.reps} reps
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    ))}

                    {/* Delete button */}
                    <TouchableOpacity
                      style={{ marginTop: 8, marginBottom: 8, borderRadius: 12, paddingVertical: 14, backgroundColor: '#FF3B3022', alignItems: 'center' }}
                      onPress={() => {
                        Alert.alert(
                          'Supprimer cette séance ?',
                          'Elle sera définitivement retirée de ton historique.',
                          [
                            { text: 'Annuler', style: 'cancel' },
                            {
                              text: 'Supprimer',
                              style: 'destructive',
                              onPress: () => {
                                deleteWorkout(selectedWorkout.id);
                                setSelectedWorkout(null);
                              },
                            },
                          ]
                        );
                      }}
                    >
                      <Text style={{ color: '#FF3B30', fontSize: 15, fontWeight: '600' }}>Supprimer cette séance</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </>
              )}
            </Pressable>
          </Pressable>
        </Modal>

        <StartWorkoutModal
          visible={showStartModal}
          onClose={() => setShowStartModal(false)}
          onStartEmpty={handleStartEmpty}
          onStartFromProgram={handleStartFromProgram}
        />

        <ProgramDayPicker
          visible={showDayPicker}
          onClose={() => setShowDayPicker(false)}
          onSelectDay={handleSelectDay}
        />

        {/* ── Calendar Modal ── */}
        <Modal visible={showCalendarModal} animationType="slide" transparent onRequestClose={() => setShowCalendarModal(false)}>
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }} onPress={() => setShowCalendarModal(false)}>
            <Pressable
              style={{ backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 12, paddingBottom: 36, maxHeight: '88%' }}
              onPress={(e) => e.stopPropagation()}
            >
              {/* Handle */}
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.separator, alignSelf: 'center', marginBottom: 16 }} />

              {/* Month nav */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 }}>
                <TouchableOpacity
                  onPress={() => setCalendarMonth((m) => {
                    const d = new Date(m.year, m.month - 1, 1);
                    return { year: d.getFullYear(), month: d.getMonth() };
                  })}
                  style={{ padding: 8 }}
                >
                  <Ionicons name="chevron-back" size={22} color={colors.text} />
                </TouchableOpacity>
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>
                  {new Date(calendarMonth.year, calendarMonth.month, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </Text>
                <TouchableOpacity
                  onPress={() => setCalendarMonth((m) => {
                    const d = new Date(m.year, m.month + 1, 1);
                    return { year: d.getFullYear(), month: d.getMonth() };
                  })}
                  style={{ padding: 8 }}
                >
                  <Ionicons name="chevron-forward" size={22} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* Day headers */}
              <View style={{ flexDirection: 'row', paddingHorizontal: 12, marginBottom: 8 }}>
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                  <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ color: colors.textTertiary, fontSize: 12, fontWeight: '600' }}>{d}</Text>
                  </View>
                ))}
              </View>

              {/* Calendar grid */}
              {(() => {
                const workoutDates = new Set(savedWorkouts.map((w) => w.date));
                const today = toDateStr(new Date());
                const firstDay = new Date(calendarMonth.year, calendarMonth.month, 1);
                // Monday-based offset: getDay() returns 0=Sun, convert to Mon=0
                const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
                const daysInMonth = new Date(calendarMonth.year, calendarMonth.month + 1, 0).getDate();
                const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
                const weeks: (number | null)[][] = [];
                for (let i = 0; i < totalCells; i += 7) {
                  weeks.push(Array.from({ length: 7 }, (_, j) => {
                    const dayNum = i + j + 1 - startOffset;
                    return dayNum >= 1 && dayNum <= daysInMonth ? dayNum : null;
                  }));
                }
                return (
                  <View style={{ paddingHorizontal: 12 }}>
                    {weeks.map((week, wi) => (
                      <View key={wi} style={{ flexDirection: 'row', marginBottom: 4 }}>
                        {week.map((dayNum, di) => {
                          if (!dayNum) return <View key={di} style={{ flex: 1, height: 44 }} />;
                          const dStr = `${calendarMonth.year}-${String(calendarMonth.month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                          const isToday = dStr === today;
                          const hasWorkout = workoutDates.has(dStr);
                          const matchingWorkout = savedWorkouts.find((w) => w.date === dStr);
                          return (
                            <TouchableOpacity
                              key={di}
                              style={{ flex: 1, height: 44, alignItems: 'center', justifyContent: 'center' }}
                              activeOpacity={hasWorkout ? 0.7 : 1}
                              onPress={() => { if (matchingWorkout) setSelectedWorkout(matchingWorkout); }}
                            >
                              <View style={{
                                width: 36, height: 36, borderRadius: 18,
                                backgroundColor: isToday ? colors.accent : hasWorkout ? colors.accent + '33' : 'transparent',
                                alignItems: 'center', justifyContent: 'center',
                                borderWidth: hasWorkout && !isToday ? 1.5 : 0,
                                borderColor: hasWorkout && !isToday ? colors.accent : 'transparent',
                              }}>
                                <Text style={{
                                  fontSize: 14,
                                  fontWeight: isToday || hasWorkout ? '700' : '400',
                                  color: isToday ? '#FFFFFF' : hasWorkout ? colors.accent : colors.text,
                                }}>
                                  {dayNum}
                                </Text>
                              </View>
                              {hasWorkout && (
                                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.accent, position: 'absolute', bottom: 3 }} />
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    ))}
                  </View>
                );
              })()}

              {/* Legend */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, marginTop: 16 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent }} />
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Séance enregistrée — appuie pour voir les détails</Text>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Active header */}
      <View style={activeStyles.activeHeader}>
        <TouchableOpacity
          style={activeStyles.roundBtn}
          onPress={handleAbortWorkout}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={activeStyles.timerCenter}>
          <Ionicons name="timer-outline" size={14} color={colors.accentOrange} />
          <Text style={activeStyles.timer}>{formatTime(elapsedSeconds)}</Text>
        </View>
        <TouchableOpacity
          style={activeStyles.roundBtn}
          onPress={handleOpenSaveModal}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="checkmark" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <Text style={activeStyles.workoutName}>{workoutName}</Text>

      {/* Exercises */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={activeStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {exercises.map((ex) => (
          <ExerciseCard key={ex.id} ex={ex} styles={seanceStyles} colors={colors} />
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add exercise button */}
      <View style={activeStyles.addExContainer}>
        <TouchableOpacity
          style={activeStyles.addExBtn}
          onPress={() => setShowExerciseModal(true)}
        >
          <Ionicons name="add" size={18} color={colors.ctaText} />
          <Text style={activeStyles.addExText}>Ajouter un exercice</Text>
        </TouchableOpacity>
      </View>

      {/* Rest timer bubble */}
      {restTimerActive && (
        <TouchableOpacity
          style={activeStyles.restBubble}
          onPress={stopRestTimer}
        >
          <Text style={activeStyles.restBubbleTime}>
            {formatTime(restTimerSeconds)}
          </Text>
          <Text style={activeStyles.restBubbleLabel}>REPOS</Text>
        </TouchableOpacity>
      )}

      <ExerciseSearchModal
        visible={showExerciseModal}
        onClose={() => setShowExerciseModal(false)}
        onSelect={handleExerciseSelect}
      />

      <SaveWorkoutModal
        visible={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSave}
        workoutData={{
          name: workoutName,
          duration: elapsedSeconds,
          exercises,
          startTime: workoutStartTime ? new Date(workoutStartTime).toISOString() : new Date().toISOString(),
        }}
      />
    </View>
  );
}

// ─── TAB: CHRONO ─────────────────────────────────────────────────────────────

type ChronoMode = 'chrono' | 'timer' | 'repos' | 'tabata';
const TIMER_PRESETS = [
  { label: '30s', seconds: 30 },
  { label: '1 min', seconds: 60 },
  { label: '1:30', seconds: 90 },
  { label: '2 min', seconds: 120 },
  { label: '3 min', seconds: 180 },
  { label: '5 min', seconds: 300 },
];


function getChronoStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { padding: 16, alignItems: 'center' },
    modeRow: { gap: 8, marginBottom: 32, paddingHorizontal: 4 },
    modePill: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.card },
    modePillActive: { backgroundColor: colors.text },
    modePillText: { color: colors.textSecondary, fontSize: 14, fontWeight: '500' },
    modePillTextActive: { color: colors.background, fontWeight: '600' },
    watchContainer: { alignItems: 'center', width: '100%' },
    bigTime: { color: colors.text, fontSize: 64, fontWeight: '300', fontVariant: ['tabular-nums'], letterSpacing: 2, marginBottom: 32 },
    btnRow: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 16 },
    mainBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 30, minWidth: 130, alignItems: 'center' },
    greenBtn: { backgroundColor: colors.accent },
    orangeBtn: { backgroundColor: colors.accentOrange },
    mainBtnText: { color: colors.background, fontSize: 16, fontWeight: '700' },
    grayBtn: { paddingHorizontal: 18, paddingVertical: 14, borderRadius: 30, backgroundColor: colors.card },
    grayBtnText: { color: colors.text, fontSize: 14, fontWeight: '500' },
    presetRow: { gap: 8, marginBottom: 24, paddingHorizontal: 4 },
    presetPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, backgroundColor: colors.card },
    presetPillActive: { backgroundColor: colors.accent },
    presetText: { color: colors.textSecondary, fontSize: 14, fontWeight: '500' },
    presetTextActive: { color: colors.background, fontWeight: '700' },
    lapsContainer: { width: '100%', marginTop: 16, backgroundColor: colors.card, borderRadius: 12, overflow: 'hidden' },
    lapsTitle: { color: colors.textSecondary, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, letterSpacing: 0.5 },
    lapRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.separator },
    lapNum: { color: colors.text, fontSize: 14, fontWeight: '500', flex: 1 },
    lapSplit: { color: colors.textSecondary, fontSize: 14, fontVariant: ['tabular-nums'], flex: 1, textAlign: 'center' },
    lapTime: { color: colors.text, fontSize: 14, fontWeight: '600', fontVariant: ['tabular-nums'], flex: 1, textAlign: 'right' },
    reposHint: { color: colors.textSecondary, fontSize: 13, marginTop: 8 },
  });
}

function ChronoContent() {
  const [mode, setMode] = useState<ChronoMode>('chrono');
  const [, setTick] = useState(0);
  const isDark = useThemeStore((s) => s.isDark);
  const colors = getColors(isDark);
  const chronoStyles = useMemo(() => getChronoStyles(colors), [isDark]);

  const {
    swRunning, swStartMs, swAccMs, swLaps, swStart, swPause, swReset, swLap,
    timerPreset, timerRunning, timerEndMs, timerRemMs, timerSetPreset, timerStart, timerPause, timerReset,
    reposRunning, reposEndMs, reposRemMs, reposStart, reposPause, reposReset,
    tabataRunning, tabataIsWork, tabataPhaseEndMs, tabataPhaseRemMs, tabataRounds,
    tabataStart, tabataPause, tabataReset, tabataCheckAdvance,
  } = useChronoStore();

  // Single ticker: re-renders display + handles auto-stop/advance
  useEffect(() => {
    const id = setInterval(() => {
      const s = useChronoStore.getState();
      const now = Date.now();
      if (s.timerRunning && s.timerEndMs != null && now >= s.timerEndMs) s.timerPause();
      if (s.reposRunning && s.reposEndMs != null && now >= s.reposEndMs) s.reposPause();
      if (s.tabataRunning) s.tabataCheckAdvance();
      setTick((t) => (t + 1) % 1000);
    }, 500);
    return () => clearInterval(id);
  }, []);

  // Derive display values from timestamps (accurate even after app backgrounding)
  const swElapsedSec = swRunning && swStartMs != null
    ? Math.floor((swAccMs + (Date.now() - swStartMs)) / 1000)
    : Math.floor(swAccMs / 1000);
  const timerRemSec = timerRunning && timerEndMs != null
    ? Math.max(0, Math.ceil((timerEndMs - Date.now()) / 1000))
    : Math.ceil(timerRemMs / 1000);
  const reposRemSec = reposRunning && reposEndMs != null
    ? Math.max(0, Math.ceil((reposEndMs - Date.now()) / 1000))
    : Math.ceil(reposRemMs / 1000);
  const tabataRemSec = tabataRunning && tabataPhaseEndMs != null
    ? Math.max(0, Math.ceil((tabataPhaseEndMs - Date.now()) / 1000))
    : Math.ceil(tabataPhaseRemMs / 1000);

  const CHRONO_MODES: { key: ChronoMode; label: string }[] = [
    { key: 'chrono', label: 'Chrono' },
    { key: 'timer', label: 'Timer' },
    { key: 'repos', label: 'Repos' },
    { key: 'tabata', label: 'Tabata' },
  ];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={chronoStyles.container}>
      {/* Mode selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={chronoStyles.modeRow}>
        {CHRONO_MODES.map((m) => {
          const isActive = mode === m.key;
          return (
            <TouchableOpacity
              key={m.key}
              style={[chronoStyles.modePill, isActive && chronoStyles.modePillActive]}
              onPress={() => setMode(m.key)}
            >
              <Text style={[chronoStyles.modePillText, isActive && chronoStyles.modePillTextActive]}>
                {m.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Stopwatch */}
      {mode === 'chrono' && (
        <View style={chronoStyles.watchContainer}>
          <Text style={chronoStyles.bigTime}>{formatTime(swElapsedSec)}</Text>
          <View style={chronoStyles.btnRow}>
            <TouchableOpacity style={chronoStyles.grayBtn} onPress={swReset}>
              <Text style={chronoStyles.grayBtnText}>Reinitialiser</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[chronoStyles.mainBtn, swRunning ? chronoStyles.orangeBtn : chronoStyles.greenBtn]}
              onPress={() => swRunning ? swPause() : swStart()}
            >
              <Text style={chronoStyles.mainBtnText}>{swRunning ? 'Pause' : 'Demarrer'}</Text>
            </TouchableOpacity>
            {swRunning && (
              <TouchableOpacity style={chronoStyles.grayBtn} onPress={swLap}>
                <Text style={chronoStyles.grayBtnText}>Tour</Text>
              </TouchableOpacity>
            )}
          </View>
          {swLaps.length > 0 && (
            <View style={chronoStyles.lapsContainer}>
              <Text style={chronoStyles.lapsTitle}>Tours</Text>
              {swLaps.map((lap, i) => (
                <View key={lap.id} style={chronoStyles.lapRow}>
                  <Text style={chronoStyles.lapNum}>Tour {swLaps.length - i}</Text>
                  <Text style={chronoStyles.lapSplit}>{formatTime(lap.splitSec)}</Text>
                  <Text style={chronoStyles.lapTime}>{formatTime(lap.elapsedSec)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Timer */}
      {mode === 'timer' && (
        <View style={chronoStyles.watchContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={chronoStyles.presetRow}>
            {TIMER_PRESETS.map((p) => (
              <TouchableOpacity
                key={p.seconds}
                style={[chronoStyles.presetPill, timerPreset === p.seconds && chronoStyles.presetPillActive]}
                onPress={() => timerSetPreset(p.seconds)}
              >
                <Text style={[chronoStyles.presetText, timerPreset === p.seconds && chronoStyles.presetTextActive]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={chronoStyles.bigTime}>{formatTime(timerRemSec)}</Text>
          <View style={chronoStyles.btnRow}>
            <TouchableOpacity style={chronoStyles.grayBtn} onPress={timerReset}>
              <Text style={chronoStyles.grayBtnText}>Reinitialiser</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[chronoStyles.mainBtn, timerRunning ? chronoStyles.orangeBtn : chronoStyles.greenBtn]}
              onPress={() => timerRunning ? timerPause() : timerStart()}
            >
              <Text style={chronoStyles.mainBtnText}>{timerRunning ? 'Pause' : 'Demarrer'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Repos */}
      {mode === 'repos' && (
        <View style={chronoStyles.watchContainer}>
          <Text style={chronoStyles.bigTime}>{formatTime(reposRemSec)}</Text>
          <View style={chronoStyles.btnRow}>
            <TouchableOpacity style={chronoStyles.grayBtn} onPress={reposReset}>
              <Text style={chronoStyles.grayBtnText}>Reinitialiser</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[chronoStyles.mainBtn, reposRunning ? chronoStyles.orangeBtn : chronoStyles.greenBtn]}
              onPress={() => reposRunning ? reposPause() : reposStart()}
            >
              <Text style={chronoStyles.mainBtnText}>{reposRunning ? 'Pause' : 'Demarrer'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={chronoStyles.reposHint}>Duree par defaut: 90 secondes</Text>
        </View>
      )}

      {/* Tabata */}
      {mode === 'tabata' && (
        <View style={chronoStyles.watchContainer}>
          <Text style={[chronoStyles.reposHint, { marginBottom: 8 }]}>
            {tabataIsWork ? 'EFFORT' : 'REPOS'} · Tour {tabataRounds + 1}
          </Text>
          <Text style={[chronoStyles.bigTime, { color: tabataIsWork ? colors.accent : colors.accentOrange }]}>
            {formatTime(tabataRemSec)}
          </Text>
          <Text style={chronoStyles.reposHint}>Tabata: 20s effort / 10s repos</Text>
          <View style={chronoStyles.btnRow}>
            <TouchableOpacity style={chronoStyles.grayBtn} onPress={tabataReset}>
              <Text style={chronoStyles.grayBtnText}>Reinitialiser</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[chronoStyles.mainBtn, tabataRunning ? chronoStyles.orangeBtn : chronoStyles.greenBtn]}
              onPress={() => tabataRunning ? tabataPause() : tabataStart()}
            >
              <Text style={chronoStyles.mainBtnText}>{tabataRunning ? 'Pause' : 'Demarrer'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

// ─── TAB: EAU ─────────────────────────────────────────────────────────────────

const GAUGE_SIZE = 220;
const GAUGE_STROKE = 20;
const GAUGE_RADIUS = (GAUGE_SIZE - GAUGE_STROKE) / 2;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;


const DRINK_TYPES = [
  { id: 'eau', label: 'Eau', icon: 'water-outline' as const },
  { id: 'the', label: 'Thé', icon: 'leaf-outline' as const },
  { id: 'cafe', label: 'Café', icon: 'cafe-outline' as const },
  { id: 'lait', label: 'Lait', icon: 'beaker-outline' as const },
  { id: 'jus', label: 'Jus', icon: 'nutrition-outline' as const },
  { id: 'autres', label: 'Autres', icon: 'ellipsis-horizontal-circle-outline' as const },
];

const QUICK_AMOUNTS = [100, 250, 300, 500, 750, 1000];

function getWaterStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { padding: 16, alignItems: 'center' },
    gaugeWrapper: { width: GAUGE_SIZE, height: GAUGE_SIZE, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    gaugeInner: { position: 'absolute', alignItems: 'center' },
    gaugeMain: { color: colors.text, fontSize: 36, fontWeight: '800' },
    gaugeGoal: { color: colors.textSecondary, fontSize: 14, marginTop: 2 },
    gaugePct: { color: colors.accent, fontSize: 16, fontWeight: '700', marginTop: 4 },
    drinkRow: { flexDirection: 'row', gap: 8, marginBottom: 16, width: '100%' },
    drinkBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 12, backgroundColor: colors.card },
    drinkBtnActive: { backgroundColor: colors.accentMuted, borderWidth: 1, borderColor: colors.accent },
    drinkIcon: { marginBottom: 3 },
    drinkLabel: { color: colors.textSecondary, fontSize: 10, fontWeight: '500' },
    drinkLabelActive: { color: colors.accent, fontWeight: '700' },
    quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16, width: '100%' },
    quickBtn: { width: '31%', backgroundColor: colors.card, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
    quickBtnText: { color: colors.text, fontSize: 14, fontWeight: '600' },
    customRow: { flexDirection: 'row', gap: 8, marginBottom: 16, width: '100%' },
    customInput: { flex: 1, backgroundColor: colors.card, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: colors.text, fontSize: 15 },
    customBtn: { backgroundColor: colors.accent, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12, justifyContent: 'center' },
    customBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
    historyCard: { width: '100%', backgroundColor: colors.card, borderRadius: 12, marginBottom: 16, overflow: 'hidden' },
    historyTitle: { color: colors.textSecondary, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
    entryRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.separator },
    entryTime: { color: colors.textSecondary, fontSize: 13, width: 50 },
    entryAmount: { color: colors.text, fontSize: 14, fontWeight: '600', flex: 1 },
    deleteBtn: { padding: 6 },
    chartCard: { width: '100%', backgroundColor: colors.card, borderRadius: 12, padding: 16 },
    chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 },
    chartTitle: { color: colors.text, fontSize: 15, fontWeight: '600' },
    chartAvg: { color: colors.textSecondary, fontSize: 12 },
    chart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 100 },
    barCol: { alignItems: 'center', flex: 1 },
    barTrack: { height: 80, width: 24, borderRadius: 6, backgroundColor: colors.cardAlt, justifyContent: 'flex-end', overflow: 'hidden', marginBottom: 6 },
    barFill: { width: '100%', borderRadius: 6 },
    barDay: { color: colors.textSecondary, fontSize: 11, fontWeight: '500' },
  });
}

function WaterContent() {
  const { current, goal, weekHistory, entries, addWater, removeEntry, checkAndResetDaily } = useWaterStore();
  const isDark = useThemeStore((s) => s.isDark);
  const colors = getColors(isDark);
  const waterStyles = useMemo(() => getWaterStyles(colors), [isDark]);
  const [selectedDrink, setSelectedDrink] = useState('eau');
  const [customAmount, setCustomAmount] = useState('');

  useEffect(() => {
    checkAndResetDaily();
  }, []);

  const pct = Math.min(current / goal, 1);
  const strokeDash = GAUGE_CIRCUMFERENCE * pct;

  const maxBar = Math.max(...weekHistory.map((d) => d.amount), 1);
  const avgAmount = Math.round(weekHistory.reduce((s, d) => s + d.amount, 0) / weekHistory.length);

  const handleCustomAdd = () => {
    const ml = parseInt(customAmount, 10);
    if (!isNaN(ml) && ml > 0) {
      addWater(ml);
      setCustomAmount('');
    }
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={waterStyles.container} keyboardShouldPersistTaps="handled">
      {/* Animated gauge */}
      <View style={waterStyles.gaugeWrapper}>
        <Svg width={GAUGE_SIZE} height={GAUGE_SIZE}>
          <Circle cx={GAUGE_SIZE / 2} cy={GAUGE_SIZE / 2} r={GAUGE_RADIUS} stroke={colors.card} strokeWidth={GAUGE_STROKE} fill="none" />
          <Circle
            cx={GAUGE_SIZE / 2}
            cy={GAUGE_SIZE / 2}
            r={GAUGE_RADIUS}
            stroke={colors.accent}
            strokeWidth={GAUGE_STROKE}
            fill="none"
            strokeDasharray={`${strokeDash} ${GAUGE_CIRCUMFERENCE}`}
            strokeLinecap="round"
            rotation="-90"
            origin={`${GAUGE_SIZE / 2}, ${GAUGE_SIZE / 2}`}
          />
        </Svg>
        <View style={waterStyles.gaugeInner}>
          <Text style={waterStyles.gaugeMain}>{(current / 1000).toFixed(1)}L</Text>
          <Text style={waterStyles.gaugeGoal}>/ {(goal / 1000).toFixed(0)}L</Text>
          <Text style={waterStyles.gaugePct}>{Math.round(pct * 100)}%</Text>
        </View>
      </View>

      {/* Drink type selector */}
      <View style={waterStyles.drinkRow}>
        {DRINK_TYPES.map((dt) => {
          const active = selectedDrink === dt.id;
          return (
            <TouchableOpacity key={dt.id} style={[waterStyles.drinkBtn, active && waterStyles.drinkBtnActive]} onPress={() => setSelectedDrink(dt.id)} activeOpacity={0.7}>
              <Ionicons name={dt.icon} size={18} color={active ? colors.accent : colors.textSecondary} style={waterStyles.drinkIcon} />
              <Text style={[waterStyles.drinkLabel, active && waterStyles.drinkLabelActive]}>{dt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 6 quick-add buttons in 3×2 grid */}
      <View style={waterStyles.quickGrid}>
        {QUICK_AMOUNTS.map((a) => (
          <TouchableOpacity key={a} style={waterStyles.quickBtn} onPress={() => addWater(a)} activeOpacity={0.8}>
            <Text style={waterStyles.quickBtnText}>+{a} ml</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Custom inline amount input */}
      <View style={waterStyles.customRow}>
        <TextInput
          style={waterStyles.customInput}
          placeholder="Quantité (ml)"
          placeholderTextColor={colors.textTertiary}
          keyboardType="number-pad"
          value={customAmount}
          onChangeText={setCustomAmount}
          returnKeyType="done"
          onSubmitEditing={handleCustomAdd}
        />
        <TouchableOpacity style={waterStyles.customBtn} onPress={handleCustomAdd} activeOpacity={0.85}>
          <Text style={waterStyles.customBtnText}>Ajouter</Text>
        </TouchableOpacity>
      </View>

      {/* Today's entries history */}
      {entries.length > 0 && (
        <View style={waterStyles.historyCard}>
          <Text style={waterStyles.historyTitle}>Historique du jour</Text>
          {[...entries].reverse().map((entry) => (
            <View key={entry.id} style={waterStyles.entryRow}>
              <Text style={waterStyles.entryTime}>{entry.time}</Text>
              <Text style={waterStyles.entryAmount}>{entry.amount} ml</Text>
              <TouchableOpacity style={waterStyles.deleteBtn} onPress={() => removeEntry(entry.id)}>
                <Ionicons name="close" size={16} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* 7-day bar chart */}
      <View style={waterStyles.chartCard}>
        <View style={waterStyles.chartHeader}>
          <Text style={waterStyles.chartTitle}>7 derniers jours</Text>
          <Text style={waterStyles.chartAvg}>Moy. {(avgAmount / 1000).toFixed(1)}L</Text>
        </View>
        <View style={waterStyles.chart}>
          {weekHistory.map((d) => {
            const h = (d.amount / maxBar) * 80;
            const isGoal = d.amount >= d.goal;
            const todayStr = new Date().toISOString().split('T')[0];
            const isToday = d.date === todayStr;
            const label = getShortDayFromDate(d.date);
            return (
              <View key={d.date} style={waterStyles.barCol}>
                <View style={waterStyles.barTrack}>
                  <View style={[waterStyles.barFill, { height: h, backgroundColor: isToday ? colors.accent : isGoal ? colors.accent : colors.info }]} />
                </View>
                <Text style={[waterStyles.barDay, isToday && { color: colors.accent, fontWeight: '700' }]}>{label}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

// ─── TAB: PROGRAMME ───────────────────────────────────────────────────────────

const TODAY_INDEX = new Date().getDay();
const todayProgramIndex = TODAY_INDEX === 0 ? 6 : TODAY_INDEX - 1;

function getProgStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { padding: 16 },
    syncRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.card, borderRadius: 12, padding: 12, marginBottom: 12 },
    syncStatus: { flex: 1, color: colors.textSecondary, fontSize: 12 },
    syncBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.accentMuted, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
    syncBtnText: { color: colors.accent, fontSize: 13, fontWeight: '600' },
    headerCard: { backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.accent },
    programName: { color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 4 },
    programMeta: { color: colors.textSecondary, fontSize: 13 },
    dayCard: { backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
    dayCardToday: { borderColor: colors.cardAlt, backgroundColor: colors.cardAlt },
    dayLeft: { width: 40, alignItems: 'center' },
    dayShort: { fontSize: 13, fontWeight: '700' },
    todayDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.accent, marginTop: 3 },
    dayCenter: { flex: 1, marginLeft: 10 },
    dayLabel: { color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: 2 },
    dayExCount: { color: colors.textSecondary, fontSize: 12 },
    reposBadge: { backgroundColor: colors.tagGreenBg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    reposBadgeText: { color: colors.accent, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
    launchBtn: { backgroundColor: colors.cta, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
    launchBtnText: { color: colors.ctaText, fontSize: 16, fontWeight: '700' },
  });
}

function ProgrammeContent({ onLaunch }: { onLaunch: () => void }) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = getColors(isDark);
  const progStyles = useMemo(() => getProgStyles(colors), [isDark]);
  const { startWorkout, addExercise, clearExercises, addExerciseFromProgram } = useWorkoutStore();
  const { program: webProgram, fetchProgram, isLoading, lastSynced } = useProgramStore();

  const handleLaunchToday = () => {
    clearExercises();
    startWorkout();

    const webDay = webProgram?.days[todayProgramIndex];
    const localDay = weeklyProgram[todayProgramIndex];
    const isRest = webDay ? webDay.type === 'rest' : localDay.type === 'rest';

    if (!isRest) {
      if (webDay && webDay.exercises.length > 0) {
        webDay.exercises.forEach((ex) => {
          const exercise = resolveExercise(ex.name);
          const { numSets, reps } = resolveProgramPrescription(ex);
          const restTime = parseProgramRest(ex.rest);
          addExerciseFromProgram(exercise, numSets, reps, restTime, `${ex.sets} — repos ${ex.rest}`);
        });
      } else {
        localDay.exercises.forEach((exStr) => {
          addExercise(resolveExercise(exStr));
        });
      }
    }
    onLaunch();
  };

  // Decide which day list to display
  const displayDays = webProgram?.days ?? weeklyProgram;
  const programTitle = webProgram ? webProgram.name : 'Bloc Force — S5 Réalisation';
  const programMeta = webProgram
    ? `${webProgram.frequency} · Semaine ${webProgram.currentWeek}/${webProgram.weeks}`
    : '8 fév → 21 mars 2026 · Semaine 5/6';

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={progStyles.container}>
      {/* Sync row */}
      <View style={progStyles.syncRow}>
        <Ionicons name={webProgram ? 'cloud-done-outline' : 'cloud-offline-outline'} size={18} color={webProgram ? colors.accent : colors.textTertiary} />
        <Text style={progStyles.syncStatus}>
          {isLoading ? 'Synchronisation...' : webProgram ? `Synchronisé ${lastSynced ? `à ${lastSynced}` : ''}` : 'Programme local (non synchronisé)'}
        </Text>
        <TouchableOpacity style={progStyles.syncBtn} onPress={() => fetchProgram(PROGRAMME_API)} disabled={isLoading}>
          <Ionicons name="sync-outline" size={14} color={colors.accent} />
          <Text style={progStyles.syncBtnText}>Sync</Text>
        </TouchableOpacity>
      </View>

      <View style={progStyles.headerCard}>
        <Text style={progStyles.programName}>{programTitle}</Text>
        <Text style={progStyles.programMeta}>{programMeta}</Text>
      </View>
      {displayDays.map((day, i) => {
        const isToday = i === todayProgramIndex;
        const isRest = day.type === 'rest';
        return (
          <View key={day.day} style={[progStyles.dayCard, isToday && progStyles.dayCardToday]}>
            <View style={progStyles.dayLeft}>
              <Text style={[progStyles.dayShort, { color: day.color }]}>{day.shortDay}</Text>
              {isToday && <View style={progStyles.todayDot} />}
            </View>
            <View style={progStyles.dayCenter}>
              <Text style={progStyles.dayLabel}>{day.label}</Text>
              <Text style={progStyles.dayExCount}>{isRest ? 'Journée de récupération' : `${day.exercises.length} exercice${day.exercises.length > 1 ? 's' : ''}`}</Text>
            </View>
            {isRest ? (
              <View style={progStyles.reposBadge}>
                <Text style={progStyles.reposBadgeText}>REPOS</Text>
              </View>
            ) : (
              <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
            )}
          </View>
        );
      })}
      <TouchableOpacity style={progStyles.launchBtn} onPress={handleLaunchToday}>
        <Text style={progStyles.launchBtnText}>Lancer la seance du jour</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ─── TAB: COURSE ──────────────────────────────────────────────────────────────

const ZONE_COLORS = ['#60A5FA', '#34D399', '#FCD34D', '#FB923C', '#EF4444'];
const ZONE_SHORT = ['Z1', 'Z2', 'Z3', 'Z4', 'Z5'];

type RunInterval = {
  id: string;
  durationMin: string;
  zone: number; // 1–5
  recoveryMin: string;
  done: boolean;
};

function makeRunUid() {
  return `ri_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function secToMinStr(sec: number): string {
  return sec % 60 === 0 ? String(sec / 60) : (sec / 60).toFixed(1);
}

// Parse running intervals from web ProgramExercise[] (structured API data)
function parseRunFromWebExercises(exercises: ProgramExercise[]): { name: string; intervals: RunInterval[]; notes: string } {
  const noteLines: string[] = [];

  for (const ex of exercises) {
    const s = ex.sets ?? '';

    // Pattern 1: "6×1' Z5 / 1' Z1" — explicit effort zone + recovery zone
    const mFull = s.match(/(\d+)\s*[×x]\s*(\d+)'(\d*)?\s*Z(\d)\s*\/\s*(\d+)'(\d*)?\s*Z(\d)/i);
    if (mFull) {
      const count = parseInt(mFull[1]);
      const effortSec = parseInt(mFull[2]) * 60 + (mFull[3] ? parseInt(mFull[3]) : 0);
      const effortZone = Math.min(5, Math.max(1, parseInt(mFull[4])));
      const recovSec = parseInt(mFull[5]) * 60 + (mFull[6] ? parseInt(mFull[6]) : 0);
      if (ex.rest && ex.rest !== '--') noteLines.push(ex.rest);
      return {
        name: ex.name,
        intervals: Array.from({ length: count }, () => ({
          id: makeRunUid(),
          durationMin: secToMinStr(effortSec),
          zone: effortZone,
          recoveryMin: secToMinStr(recovSec),
          done: false,
        })),
        notes: noteLines.join(' · '),
      };
    }

    // Pattern 2: "6×1' effort / 1' récup" — no explicit zones, zone from name
    const mEffort = s.match(/(\d+)\s*[×x]\s*(\d+)'(\d*)?\s*(?:effort|Z\d).*\/\s*(\d+)'(\d*)?\s*(?:récup|Z\d)/i);
    if (mEffort) {
      const count = parseInt(mEffort[1]);
      const effortSec = parseInt(mEffort[2]) * 60 + (mEffort[3] ? parseInt(mEffort[3]) : 0);
      const recovSec = parseInt(mEffort[4]) * 60 + (mEffort[5] ? parseInt(mEffort[5]) : 0);
      const zMatch = (ex.name + ' ' + s).match(/Z(\d)-?Z?(\d)?/i);
      const zone = zMatch ? Math.min(5, Math.max(1, parseInt(zMatch[2] || zMatch[1]))) : 4;
      if (ex.rest && ex.rest !== '--') noteLines.push(ex.rest);
      return {
        name: ex.name,
        intervals: Array.from({ length: count }, () => ({
          id: makeRunUid(),
          durationMin: secToMinStr(effortSec),
          zone,
          recoveryMin: secToMinStr(recovSec),
          done: false,
        })),
        notes: noteLines.join(' · '),
      };
    }

    // Pattern 3: "N×T'" basic fractionné (no recovery specified)
    const mBasic = s.match(/(\d+)\s*[×x]\s*(\d+)'(\d*)?/);
    if (mBasic) {
      const count = parseInt(mBasic[1]);
      const effortSec = parseInt(mBasic[2]) * 60 + (mBasic[3] ? parseInt(mBasic[3]) : 0);
      const zMatch = (ex.name + ' ' + s).match(/Z(\d)-?Z?(\d)?/i);
      const zone = zMatch ? Math.min(5, Math.max(1, parseInt(zMatch[2] || zMatch[1]))) : 4;
      if (ex.rest && ex.rest !== '--') noteLines.push(ex.rest);
      return {
        name: ex.name,
        intervals: Array.from({ length: count }, () => ({
          id: makeRunUid(),
          durationMin: secToMinStr(effortSec),
          zone,
          recoveryMin: '1',
          done: false,
        })),
        notes: noteLines.join(' · '),
      };
    }

    // Pattern 4: "Z2 25-40 min" or "25-40 min Z2"
    const mZ = s.match(/Z(\d)\s+(\d+)-?(\d+)?\s*min|(\d+)-?(\d+)?\s*min\s*Z(\d)/i);
    if (mZ) {
      const zone = Math.min(5, Math.max(1, parseInt(mZ[1] ?? mZ[6])));
      const min1 = parseInt(mZ[2] ?? mZ[4]);
      const min2 = (mZ[3] ?? mZ[5]) ? parseInt(mZ[3] ?? mZ[5]) : min1;
      const avgMin = Math.round((min1 + min2) / 2);
      if (ex.rest && ex.rest !== '--') noteLines.push(ex.rest);
      return {
        name: ex.name,
        intervals: [{ id: makeRunUid(), durationMin: String(avgMin), zone, recoveryMin: '0', done: false }],
        notes: noteLines.join(' · '),
      };
    }

    // Not an interval exercise — collect as note
    const info = [ex.name, s !== '--' && s ? s : '', ex.rest !== '--' && ex.rest ? ex.rest : ''].filter(Boolean).join(': ');
    if (info) noteLines.push(info);
  }

  return {
    name: 'Course',
    intervals: [{ id: makeRunUid(), durationMin: '30', zone: 2, recoveryMin: '0', done: false }],
    notes: noteLines.join('\n'),
  };
}

// Fallback parser for local DayProgram.exercises (string[])
function parseRunFromLocalDay(exercises: string[]): { name: string; intervals: RunInterval[]; notes: string } {
  for (const ex of exercises) {
    const mFrac = ex.match(/(\d+)\s*[×x]\s*(\d+)'(\d*)?/);
    if (mFrac) {
      const count = parseInt(mFrac[1]);
      const effortSec = parseInt(mFrac[2]) * 60 + (mFrac[3] ? parseInt(mFrac[3]) : 0);
      return {
        name: `Fractionné ${count}×${mFrac[2]}'`,
        intervals: Array.from({ length: count }, () => ({ id: makeRunUid(), durationMin: secToMinStr(effortSec), zone: 4, recoveryMin: '1', done: false })),
        notes: '',
      };
    }
    const mZ = ex.match(/Z(\d)\s+(\d+)-?(\d+)?\s*min/i);
    if (mZ) {
      const zone = Math.min(5, Math.max(1, parseInt(mZ[1])));
      const avgMin = Math.round((parseInt(mZ[2]) + (mZ[3] ? parseInt(mZ[3]) : parseInt(mZ[2]))) / 2);
      return { name: `Run Z${zone} ${avgMin}min`, intervals: [{ id: makeRunUid(), durationMin: String(avgMin), zone, recoveryMin: '0', done: false }], notes: '' };
    }
  }
  return { name: 'Course', intervals: [{ id: makeRunUid(), durationMin: '30', zone: 2, recoveryMin: '0', done: false }], notes: '' };
}

function getCourseStyles(colors: ThemeColors) {
  return StyleSheet.create({
    idleContainer: { padding: 16 },
    idleTitle: { color: colors.text, fontSize: 26, fontWeight: '700', marginBottom: 16 },
    ctaBtn: { backgroundColor: colors.cta, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 12, borderWidth: 2, borderColor: colors.ctaText },
    ctaBtnText: { color: colors.ctaText, fontSize: 16, fontWeight: '700' },
    programBtn: { backgroundColor: colors.card, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 24, flexDirection: 'row', justifyContent: 'center', gap: 8 },
    programBtnText: { color: colors.accent, fontSize: 14, fontWeight: '600' },
    sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 12 },
    historyCard: { backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 10 },
    historyDate: { color: colors.textSecondary, fontSize: 12, marginBottom: 4 },
    historyName: { color: colors.text, fontSize: 15, fontWeight: '600', marginBottom: 6 },
    historyMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    historyMetaText: { color: colors.textSecondary, fontSize: 13 },
    activeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
    roundBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
    timerCenter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    runTimer: { color: '#1DB954', fontSize: 20, fontWeight: '700', fontVariant: ['tabular-nums'] as const },
    sessionNameTxt: { color: colors.text, fontSize: 20, fontWeight: '700', paddingHorizontal: 16, marginBottom: 12 },
    scrollContent: { paddingHorizontal: 16, paddingBottom: Platform.OS === 'ios' ? 210 : 188 },
    statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    statCard: { flex: 1, backgroundColor: colors.card, borderRadius: 10, padding: 10, alignItems: 'center' },
    statValue: { color: colors.text, fontSize: 16, fontWeight: '800', marginBottom: 2 },
    statLabel: { color: colors.textSecondary, fontSize: 10, fontWeight: '600', textTransform: 'uppercase' as const },
    tableCard: { backgroundColor: colors.card, borderRadius: 12, marginBottom: 12, overflow: 'hidden' as const },
    tableHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 8, marginTop: 4, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.separator },
    colHead: { color: colors.textSecondary, fontSize: 10, fontWeight: '600', textTransform: 'uppercase' as const },
    cNum: { width: 24, textAlign: 'center' as const },
    cDur: { flex: 1, textAlign: 'center' as const },
    cZone: { width: 48, textAlign: 'center' as const },
    cRecov: { flex: 1, textAlign: 'center' as const },
    cCheck: { width: 32, textAlign: 'center' as const },
    intervalRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 5 },
    rowNum: { color: colors.textSecondary, fontSize: 12, textAlign: 'center' as const, width: 24 },
    setInput: { flex: 1, color: colors.text, fontSize: 13, fontWeight: '600', backgroundColor: colors.input, borderRadius: 6, marginHorizontal: 2, paddingHorizontal: 2, paddingVertical: 6, textAlign: 'center' as const },
    zoneBadge: { width: 42, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginHorizontal: 2 },
    zoneTxt: { fontSize: 11, fontWeight: '800', color: '#fff' },
    checkbox: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: colors.textTertiary, alignItems: 'center', justifyContent: 'center' },
    checkboxDone: { backgroundColor: '#1DB954', borderColor: '#1DB954' },
    addRowBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.separator },
    addRowTxt: { color: colors.text, fontSize: 13, fontWeight: '500' },
    notesCard: { backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 12 },
    notesLabel: { color: colors.textSecondary, fontSize: 11, fontWeight: '600', textTransform: 'uppercase' as const, marginBottom: 8 },
    notesInput: { color: colors.text, fontSize: 13, minHeight: 60 },
  });
}

function CourseDayPicker({ visible, onClose, onSelectIndex }: {
  visible: boolean;
  onClose: () => void;
  onSelectIndex: (dayIndex: number) => void;
}) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = getColors(isDark);
  const s = useMemo(() => getDayPickerStyles(colors), [isDark]);
  const { program: webProgram } = useProgramStore();

  // Use web programme if available, else local fallback
  const source = webProgram?.days ?? weeklyProgram;
  const cardioDays = source
    .map((d, i) => ({ day: d, index: i }))
    .filter(({ day }) => day.type === 'cardio');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable style={s.sheet} onPress={() => {}}>
          <View style={s.handle} />
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Text style={[s.title, { marginBottom: 0, flex: 1 }]}>Charger depuis le programme</Text>
            {webProgram && <Ionicons name="cloud-done-outline" size={16} color={colors.accent} />}
          </View>
          <ScrollView>
            {cardioDays.map(({ day, index }) => {
              const meta = 'exercises' in day && Array.isArray(day.exercises)
                ? (typeof day.exercises[0] === 'string'
                    ? (day.exercises as string[]).slice(0, 2).join(' · ')
                    : (day.exercises as ProgramExercise[]).map((e) => `${e.name}: ${e.sets}`).slice(0, 2).join(' · '))
                : '';
              return (
                <TouchableOpacity key={day.day} style={s.dayRow} onPress={() => { onSelectIndex(index); onClose(); }}>
                  <View style={[s.dayBadge, { backgroundColor: day.color + '33' }]}>
                    <Text style={[s.dayShort, { color: day.color }]}>{day.shortDay}</Text>
                  </View>
                  <View style={s.dayInfo}>
                    <Text style={s.dayLabel}>{day.label}</Text>
                    <Text style={s.dayMeta} numberOfLines={2}>{meta}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
            <Text style={s.cancelText}>Annuler</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function CourseContent() {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = getColors(isDark);
  const cs = useMemo(() => getCourseStyles(colors), [isDark]);
  const { savedWorkouts, saveWorkout, deleteWorkout } = useWorkoutStore();
  const { completeWorkout } = useGamificationStore();
  const { program: webProgram, fetchProgram, isLoading: programLoading } = useProgramStore();

  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [sessionName, setSessionName] = useState('Course');
  const [intervals, setIntervals] = useState<RunInterval[]>([
    { id: makeRunUid(), durationMin: '10', zone: 2, recoveryMin: '2', done: false },
  ]);
  const [notes, setNotes] = useState('');
  const [km, setKm] = useState('');
  const [pace, setPace] = useState(''); // "5:20" format
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  const runTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch programme from web API on mount (same behaviour as Séance tab)
  useEffect(() => {
    fetchProgram(PROGRAMME_API);
  }, []);

  useEffect(() => {
    if (isActive) {
      runTimerRef.current = setInterval(() => forceUpdate(), 1000);
    } else {
      if (runTimerRef.current) clearInterval(runTimerRef.current);
    }
    return () => { if (runTimerRef.current) clearInterval(runTimerRef.current); };
  }, [isActive]);

  const elapsedSeconds = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
  const totalWorkMin = intervals.reduce((s, i) => s + (parseFloat(i.durationMin) || 0), 0);
  const totalRestMin = intervals.reduce((s, i) => s + (parseFloat(i.recoveryMin) || 0), 0);
  const doneCount = intervals.filter((i) => i.done).length;

  const addInterval = () => {
    const last = intervals[intervals.length - 1];
    setIntervals((prev) => [
      ...prev,
      { id: makeRunUid(), durationMin: last?.durationMin ?? '5', zone: last?.zone ?? 2, recoveryMin: last?.recoveryMin ?? '1', done: false },
    ]);
  };

  const removeInterval = (id: string) => setIntervals((prev) => prev.filter((i) => i.id !== id));
  const updateInterval = (id: string, field: 'durationMin' | 'recoveryMin', value: string) => {
    setIntervals((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };
  const toggleDone = (id: string) => setIntervals((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  const cycleZone = (id: string) => setIntervals((prev) => prev.map((i) => (i.id === id ? { ...i, zone: (i.zone % 5) + 1 } : i)));

  const handleStart = () => { setStartTime(Date.now()); setIsActive(true); };

  // Load day from programme — web data takes priority over local fallback
  const handleLoadFromDayIndex = (dayIndex: number) => {
    const webDay = webProgram?.days[dayIndex];
    const localDay = weeklyProgram[dayIndex];
    let parsed: { name: string; intervals: RunInterval[]; notes: string };
    if (webDay && webDay.exercises.length > 0) {
      parsed = parseRunFromWebExercises(webDay.exercises as ProgramExercise[]);
    } else {
      parsed = parseRunFromLocalDay(localDay.exercises);
    }
    setSessionName(parsed.name);
    setIntervals(parsed.intervals);
    setNotes(parsed.notes);
  };

  const resetCourseDraft = () => {
    setIsActive(false);
    setStartTime(null);
    setIntervals([{ id: makeRunUid(), durationMin: '10', zone: 2, recoveryMin: '2', done: false }]);
    setNotes('');
    setSessionName('Course');
    setKm('');
    setPace('');
  };

  // Opens the save modal (checkmark button)
  const handleOpenSaveModal = () => setShowSaveModal(true);

  // Called from SaveWorkoutModal when the user confirms
  const handleConfirmSave = async (meta: {
    title: string;
    description: string;
    tags: string[];
    effortRating: number;
    energyRating: number;
    moodRating: number;
    sleepHours: string;
    sleepQuality: number;
    morningEnergy: number;
    soreness: number;
    visibility: 'Tout le monde' | 'Amis' | 'Prive';
    photos: string[];
  }) => {
    const durationMin = Math.max(1, Math.round(elapsedSeconds / 60));
    const today = new Date().toISOString().split('T')[0];
    const fullNotes = [meta.description, notes].filter(Boolean).join('\n');
    const runExercise: WorkoutExercise = {
      id: makeRunUid(),
      exercise: { id: 'cardio_run', name: meta.title || sessionName, muscleGroup: 'Cardio', category: 'Cardio', equipment: 'Extérieur' },
      sets: intervals.map((i) => ({
        id: makeRunUid(),
        reps: Math.round((parseFloat(i.durationMin) || 0) * 60),
        // For running sessions, keep "weight" at 0 to avoid fake volume in kg.
        weight: 0,
        rpe: i.zone,
        done: i.done,
      })),
      restTime: 0,
      notes: fullNotes,
    };
    saveWorkout({ name: meta.title || sessionName, duration: elapsedSeconds, exercises: [runExercise] });
    completeWorkout();
    try {
      await fetch(SEANCES_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `mobile_run_${Date.now()}`,
          name: meta.title || sessionName,
          date: today,
          duration: durationMin,
          source: 'mobile_course',
          rpeMax: meta.effortRating ?? null,
          notes: fullNotes,
          sessionMeta: {
            tags: meta.tags,
            effortRating: meta.effortRating,
            energyRating: meta.energyRating,
            moodRating: meta.moodRating,
            sleepHours: meta.sleepHours,
            sleepQuality: meta.sleepQuality,
            morningEnergy: meta.morningEnergy,
            soreness: meta.soreness,
            visibility: meta.visibility,
            photoCount: meta.photos?.length ?? 0,
            km: km || null,
            pace: pace || null,
          },
          exercises: [{
            name: meta.title || sessionName,
            sets: intervals.map((i) => ({
              reps: Math.round((parseFloat(i.durationMin) || 0) * 60),
              weight: 0,
              rpe: i.zone,
              done: i.done,
            })),
          }],
        }),
      });
    } catch {}
    setShowSaveModal(false);
    resetCourseDraft();
    Alert.alert('Course enregistrée !', 'Sauvegardée en local et synchronisée.');
  };

  const handleAbortCourse = () => {
    if (Platform.OS === 'web') {
      const ok = typeof window !== 'undefined'
        ? window.confirm('Supprimer la course en cours et revenir en arrière ?')
        : false;
      if (ok) resetCourseDraft();
      return;
    }

    Alert.alert('Abandonner ?', 'La session ne sera pas sauvegardée.', [
      { text: 'Continuer', style: 'cancel' },
      { text: 'Abandonner', style: 'destructive', onPress: resetCourseDraft },
    ]);
  };

  const recentRuns = savedWorkouts
    .filter((w) => w.exercises?.[0]?.exercise?.muscleGroup === 'Cardio')
    .slice(0, 5);

  const handleDeleteRun = (id: string) => {
    if (Platform.OS === 'web') {
      const ok = typeof window !== 'undefined'
        ? window.confirm('Supprimer cette séance de course ?')
        : false;
      if (!ok) return;
      deleteWorkout(id);
      fetch(SEANCES_API, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      }).catch(() => {
        // local deletion is still completed
      });
      return;
    }

    Alert.alert('Supprimer la séance ?', 'Cette séance sera retirée de ton historique.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          deleteWorkout(id);
          try {
            await fetch(SEANCES_API, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id }),
            });
          } catch {
            // local deletion is still completed
          }
        },
      },
    ]);
  };

  if (!isActive) {
    return (
      <>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={cs.idleContainer} showsVerticalScrollIndicator={false}>
          {/* Sync status (mirrors Séance tab) */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.card, borderRadius: 10, padding: 10, marginBottom: 16 }}>
            <Ionicons name={webProgram ? 'cloud-done-outline' : 'cloud-offline-outline'} size={16} color={webProgram ? colors.accent : colors.textTertiary} />
            <Text style={{ flex: 1, color: colors.textSecondary, fontSize: 12 }}>
              {programLoading ? 'Synchronisation...' : webProgram ? `Synchronisé — ${webProgram.name}` : 'Programme local (non synchronisé)'}
            </Text>
            <TouchableOpacity onPress={() => fetchProgram(PROGRAMME_API)} disabled={programLoading}>
              <Ionicons name="sync-outline" size={16} color={colors.accent} />
            </TouchableOpacity>
          </View>

          <Text style={cs.idleTitle}>Course</Text>
          <TouchableOpacity style={cs.ctaBtn} onPress={handleStart} activeOpacity={0.85}>
            <Text style={cs.ctaBtnText}>Commencer une session libre</Text>
          </TouchableOpacity>
          <TouchableOpacity style={cs.programBtn} onPress={() => setShowDayPicker(true)} activeOpacity={0.85}>
            <Ionicons name="list-outline" size={18} color={colors.accent} />
            <Text style={cs.programBtnText}>Charger depuis le programme</Text>
          </TouchableOpacity>
          {recentRuns.length > 0 && (
            <>
              <Text style={cs.sectionTitle}>Sessions récentes</Text>
              {recentRuns.map((w) => (
                <View key={w.id} style={cs.historyCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={cs.historyDate}>{w.date}</Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteRun(w.id)}
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                      style={{ paddingHorizontal: 6, paddingVertical: 4 }}
                    >
                      <Ionicons name="trash-outline" size={15} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                  <Text style={cs.historyName}>{w.name}</Text>
                  <View style={cs.historyMeta}>
                    <Ionicons name="time-outline" size={13} color={colors.textSecondary} />
                    <Text style={cs.historyMetaText}>{w.duration} min</Text>
                    <Text style={cs.historyMetaText}>·</Text>
                    <Text style={cs.historyMetaText}>{w.exercises?.[0]?.sets?.length ?? 0} intervalles</Text>
                  </View>
                </View>
              ))}
            </>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
        <CourseDayPicker
          visible={showDayPicker}
          onClose={() => setShowDayPicker(false)}
          onSelectIndex={(idx) => { handleLoadFromDayIndex(idx); handleStart(); }}
        />
      </>
    );
  }

  return (
    <>
      <View style={cs.activeHeader}>
        <TouchableOpacity
          style={cs.roundBtn}
          onPress={handleAbortCourse}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={18} color={colors.text} />
        </TouchableOpacity>
        <View style={cs.timerCenter}>
          <Ionicons name="walk-outline" size={16} color="#1DB954" />
          <Text style={cs.runTimer}>{formatTime(elapsedSeconds)}</Text>
        </View>
        <TouchableOpacity style={cs.roundBtn} onPress={handleOpenSaveModal}>
          <Ionicons name="checkmark" size={20} color="#1DB954" />
        </TouchableOpacity>
      </View>

      <Text style={cs.sessionNameTxt}>{sessionName}</Text>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={cs.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Km + Allure card */}
        <View style={[cs.tableCard, { flexDirection: 'row', gap: 0, padding: 0, overflow: 'hidden' }]}>
          <View style={{ flex: 1, padding: 14, borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: '#ffffff22' }}>
            <Text style={[cs.notesLabel, { marginBottom: 6 }]}>Distance (km)</Text>
            <TextInput
              style={{ color: colors.text, fontSize: 22, fontWeight: '800' }}
              value={km}
              onChangeText={setKm}
              placeholder="0.0"
              placeholderTextColor={colors.textTertiary}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={{ flex: 1, padding: 14 }}>
            <Text style={[cs.notesLabel, { marginBottom: 6 }]}>Allure (min/km)</Text>
            <TextInput
              style={{ color: colors.text, fontSize: 22, fontWeight: '800' }}
              value={pace}
              onChangeText={setPace}
              placeholder="5:30"
              placeholderTextColor={colors.textTertiary}
              keyboardType="numbers-and-punctuation"
            />
          </View>
        </View>

        {/* Stats */}
        <View style={cs.statsRow}>
          <View style={cs.statCard}>
            <Text style={cs.statValue}>{totalWorkMin % 1 === 0 ? totalWorkMin : totalWorkMin.toFixed(1)}'</Text>
            <Text style={cs.statLabel}>Effort</Text>
          </View>
          <View style={cs.statCard}>
            <Text style={cs.statValue}>{totalRestMin % 1 === 0 ? totalRestMin : totalRestMin.toFixed(1)}'</Text>
            <Text style={cs.statLabel}>Récup</Text>
          </View>
          <View style={cs.statCard}>
            <Text style={cs.statValue}>{doneCount}/{intervals.length}</Text>
            <Text style={cs.statLabel}>Fait</Text>
          </View>
        </View>

        {/* Interval table */}
        <View style={cs.tableCard}>
          <View style={cs.tableHeader}>
            <Text style={[cs.colHead, cs.cNum]}>#</Text>
            <Text style={[cs.colHead, cs.cDur]}>Durée (min)</Text>
            <Text style={[cs.colHead, cs.cZone]}>Zone</Text>
            <Text style={[cs.colHead, cs.cRecov]}>Récup (min)</Text>
            <Text style={[cs.colHead, cs.cCheck]}>✓</Text>
          </View>
          {intervals.map((interval, idx) => (
            <View key={interval.id} style={cs.intervalRow}>
              {intervals.length > 1 ? (
                <TouchableOpacity style={{ width: 24, alignItems: 'center' }} onPress={() => removeInterval(interval.id)}>
                  <Ionicons name="remove-circle" size={16} color={colors.error} />
                </TouchableOpacity>
              ) : (
                <Text style={cs.rowNum}>{idx + 1}</Text>
              )}
              <TextInput
                style={[cs.setInput, cs.cDur]}
                value={interval.durationMin}
                keyboardType="decimal-pad"
                onChangeText={(v) => updateInterval(interval.id, 'durationMin', v)}
                placeholderTextColor={colors.textTertiary}
              />
              <TouchableOpacity
                style={[cs.zoneBadge, { backgroundColor: ZONE_COLORS[interval.zone - 1] }]}
                onPress={() => cycleZone(interval.id)}
              >
                <Text style={cs.zoneTxt}>{ZONE_SHORT[interval.zone - 1]}</Text>
              </TouchableOpacity>
              <TextInput
                style={[cs.setInput, cs.cRecov]}
                value={interval.recoveryMin}
                keyboardType="decimal-pad"
                onChangeText={(v) => updateInterval(interval.id, 'recoveryMin', v)}
                placeholderTextColor={colors.textTertiary}
              />
              <TouchableOpacity style={{ width: 32, alignItems: 'center' }} onPress={() => toggleDone(interval.id)}>
                <View style={[cs.checkbox, interval.done && cs.checkboxDone]}>
                  {interval.done && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={cs.addRowBtn} onPress={addInterval}>
            <Ionicons name="add" size={16} color={colors.text} />
            <Text style={cs.addRowTxt}>Ajouter un intervalle</Text>
          </TouchableOpacity>
        </View>

        {/* Notes */}
        <View style={cs.notesCard}>
          <Text style={cs.notesLabel}>Notes</Text>
          <TextInput
            style={cs.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Sensations, allure, commentaires..."
            placeholderTextColor={colors.textTertiary}
            multiline
          />
        </View>
      </ScrollView>

      {/* Save modal — reuses SaveWorkoutModal in course mode */}
      <SaveWorkoutModal
        visible={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleConfirmSave}
        workoutData={{ name: sessionName, duration: elapsedSeconds, exercises: [], startTime: new Date().toISOString() }}
        courseData={{ km, pace, intervalCount: intervals.length, totalWorkMin }}
      />
    </>
  );
}

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────

export default function SeanceScreen() {
  const [activeTab, setActiveTab] = useState<SeanceTab>('seance');
  useFocusEffect(
    useCallback(() => {
      setActiveTab('seance');
    }, [])
  );
  const isDark = useThemeStore((s) => s.isDark);
  const colors = getColors(isDark);
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        content: { flex: 1 },
      }),
    [isDark]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <SubTabBar active={activeTab} onPress={setActiveTab} />
      <View style={styles.content}>
        {/* Keep all tabs mounted — display:none hides without unmounting, preserving state */}
        <View style={{ flex: 1, display: activeTab === 'seance' ? 'flex' : 'none' }}>
          <SeanceContent />
        </View>
        <View style={{ flex: 1, display: activeTab === 'course' ? 'flex' : 'none' }}>
          <CourseContent />
        </View>
        <View style={{ flex: 1, display: activeTab === 'chrono' ? 'flex' : 'none' }}>
          <ChronoContent />
        </View>
        <View style={{ flex: 1, display: activeTab === 'eau' ? 'flex' : 'none' }}>
          <WaterContent />
        </View>
        <View style={{ flex: 1, display: activeTab === 'programme' ? 'flex' : 'none' }}>
          <ProgrammeContent onLaunch={() => setActiveTab('seance')} />
        </View>
      </View>
    </SafeAreaView>
  );
}
