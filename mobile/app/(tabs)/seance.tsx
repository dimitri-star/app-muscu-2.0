import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
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
import { useWorkoutStore, useWaterStore, useProgramStore } from '../../store';
import { weeklyProgram, exercisesDB } from '../../constants/mockData';
import { PROGRAMME_API } from '../../constants/api';
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

type SeanceTab = 'seance' | 'chrono' | 'eau' | 'programme';
const SEANCE_TABS: { key: SeanceTab; label: string }[] = [
  { key: 'seance', label: 'Seance' },
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
    tableHeader: { flexDirection: 'row', paddingHorizontal: 14, paddingBottom: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.separator },
    colHead: { color: colors.textSecondary, fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
    colNum: { width: 24, textAlign: 'center' },
    colInput: { flex: 1, textAlign: 'center' },
    colRpe: { width: 44, textAlign: 'center' },
    colCheck: { width: 38 },
    setRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 6 },
    setNum: { color: colors.textSecondary, fontSize: 13, textAlign: 'center' },
    setInput: { color: colors.text, fontSize: 14, fontWeight: '600', backgroundColor: colors.input, borderRadius: 8, marginHorizontal: 3, paddingHorizontal: 6, paddingVertical: 5, textAlign: 'center' },
    rpeInput: { color: colors.accent, fontSize: 13, fontWeight: '700', backgroundColor: colors.input, borderRadius: 8, marginHorizontal: 3, paddingHorizontal: 4, paddingVertical: 5, textAlign: 'center', width: 38 },
    rpePlaceholder: { color: colors.textTertiary, fontSize: 11 },
    checkbox: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: colors.textTertiary, alignItems: 'center', justifyContent: 'center' },
    checkboxDone: { backgroundColor: colors.accent, borderColor: colors.accent },
    notesRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.separator },
    notesInput: { flex: 1, color: colors.textSecondary, fontSize: 13, backgroundColor: colors.input, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7, minHeight: 32 },
    addSetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.separator, marginHorizontal: 14, marginBottom: 4 },
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
            <Text style={[sc.colHead, sc.colNum]}>#</Text>
            <Text style={[sc.colHead, sc.colInput]}>Reps</Text>
            <Text style={[sc.colHead, sc.colInput]}>kg</Text>
            <Text style={[sc.colHead, sc.colRpe]}>RPE</Text>
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
                style={[sc.setInput, sc.colInput]}
                value={String(s.reps)}
                keyboardType="numeric"
                onChangeText={(v) => updateSet(ex.id, s.id, 'reps', parseInt(v) || 0)}
                placeholderTextColor={colors.textTertiary}
              />
              <TextInput
                style={[sc.setInput, sc.colInput]}
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
    ctaBtn: { backgroundColor: colors.cta, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 28 },
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
    scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },
    addExContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingBottom: Platform.OS === 'ios' ? 16 : 12, paddingTop: 10, backgroundColor: colors.background, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.separator },
    addExBtn: { backgroundColor: colors.cta, borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    addExText: { color: colors.ctaText, fontSize: 16, fontWeight: '700' },
    restBubble: { position: 'absolute', bottom: 90, right: 20, width: 72, height: 72, borderRadius: 36, backgroundColor: colors.accentYellowGreen, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
    restBubbleTime: { color: colors.background, fontSize: 14, fontWeight: '800' },
    restBubbleLabel: { color: colors.background, fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  });
}

function SeanceContent() {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = getColors(isDark);
  const activeStyles = useMemo(() => getActiveStyles(colors), [isDark]);
  const seanceStyles = useMemo(() => getSeanceStyles(colors), [isDark]);
  const {
    isActive,
    timerSeconds,
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
    tickTimer,
    tickRestTimer,
    stopRestTimer,
  } = useWorkoutStore();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [showStartModal, setShowStartModal] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<import('../../constants/mockData').Workout | null>(null);

  // Main workout timer
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => tickTimer(), 1000);
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

  const handleStartFromProgram = () => {
    setShowStartModal(false);
    setShowDayPicker(true);
  };

  const { program: webProgram } = useProgramStore();
  const { addExerciseFromProgram } = useWorkoutStore();

  const handleSelectDay = (dayIndex: number) => {
    clearExercises();
    startWorkout();

    const webDay = webProgram?.days[dayIndex];
    const localDay = weeklyProgram[dayIndex];
    const isRest = webDay ? webDay.type === 'rest' : localDay.type === 'rest';

    if (!isRest) {
      if (webDay && webDay.exercises.length > 0) {
        webDay.exercises.forEach((ex) => {
          const exercise = resolveExercise(ex.name);
          const { numSets, reps } = parseProgramSets(ex.sets);
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

  const handleSave = () => {
    saveWorkout({ name: workoutName, duration: timerSeconds, exercises });
    setShowSaveModal(false);
    Alert.alert('Séance enregistrée !', 'Bravo, ta séance a été ajoutée à ton historique.');
  };

  if (!isActive) {
    return (
      <>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={activeStyles.idleContainer}>
          <Text style={activeStyles.idleTitle}>Seance</Text>
          <TouchableOpacity
            style={activeStyles.ctaBtn}
            onPress={() => setShowStartModal(true)}
          >
            <Text style={activeStyles.ctaBtnText}>Commencer une seance</Text>
          </TouchableOpacity>

          <Text style={activeStyles.sectionTitle}>Dernieres seances</Text>
          {savedWorkouts.slice(0, 10).map((w) => (
            <TouchableOpacity key={w.id} style={activeStyles.historyCard} onPress={() => setSelectedWorkout(w)} activeOpacity={0.75}>
              <Text style={activeStyles.historyDate}>{new Date(w.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</Text>
              <Text style={activeStyles.historyName}>{w.name}</Text>
              <View style={activeStyles.historyMeta}>
                <Text style={activeStyles.historyMetaText}>
                  {(w.totalVolume / 1000).toFixed(1)} t
                </Text>
                <Text style={activeStyles.historyMetaSep}>&middot;</Text>
                <Text style={activeStyles.historyMetaText}>{w.duration} min</Text>
                <Text style={activeStyles.historyMetaSep}>&middot;</Text>
                <Text style={activeStyles.historyMetaText}>{w.exercises.length} exercice{w.exercises.length > 1 ? 's' : ''}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

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
      </>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Active header */}
      <View style={activeStyles.activeHeader}>
        <TouchableOpacity style={activeStyles.roundBtn} onPress={endWorkout}>
          <Ionicons name="close" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={activeStyles.timerCenter}>
          <Ionicons name="timer-outline" size={14} color={colors.accentOrange} />
          <Text style={activeStyles.timer}>{formatTime(timerSeconds)}</Text>
        </View>
        <TouchableOpacity
          style={activeStyles.roundBtn}
          onPress={() => setShowSaveModal(true)}
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
          duration: timerSeconds,
          exercises,
          startTime: new Date().toISOString(),
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

interface LapEntry {
  id: number;
  time: string;
  split: string;
}

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
  const isDark = useThemeStore((s) => s.isDark);
  const colors = getColors(isDark);
  const chronoStyles = useMemo(() => getChronoStyles(colors), [isDark]);

  // Stopwatch
  const [swRunning, setSwRunning] = useState(false);
  const [swSeconds, setSwSeconds] = useState(0);
  const [laps, setLaps] = useState<LapEntry[]>([]);
  const swRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastLapRef = useRef(0);

  useEffect(() => {
    if (swRunning) {
      swRef.current = setInterval(() => setSwSeconds((s) => s + 1), 1000);
    } else {
      if (swRef.current) clearInterval(swRef.current);
    }
    return () => { if (swRef.current) clearInterval(swRef.current); };
  }, [swRunning]);

  const handleLap = () => {
    const split = swSeconds - lastLapRef.current;
    lastLapRef.current = swSeconds;
    setLaps((prev) => [
      { id: Date.now(), time: formatTime(swSeconds), split: formatTime(split) },
      ...prev,
    ]);
  };

  const handleSwReset = () => {
    setSwRunning(false);
    setSwSeconds(0);
    setLaps([]);
    lastLapRef.current = 0;
  };

  // Timer / Repos
  const [timerPreset, setTimerPreset] = useState(60);
  const [timerRemaining, setTimerRemaining] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reposDefault = 90;
  const [reposRemaining, setReposRemaining] = useState(reposDefault);
  const [reposRunning, setReposRunning] = useState(false);
  const reposRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Tabata
  const TABATA_WORK = 20;
  const TABATA_REST = 10;
  const [tabataRunning, setTabataRunning] = useState(false);
  const [tabataIsWork, setTabataIsWork] = useState(true);
  const [tabataRemaining, setTabataRemaining] = useState(TABATA_WORK);
  const [tabataRounds, setTabataRounds] = useState(0);
  const tabataRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tabataStateRef = useRef({ isWork: true, remaining: TABATA_WORK });

  useEffect(() => {
    if (tabataRunning) {
      tabataRef.current = setInterval(() => {
        tabataStateRef.current.remaining -= 1;
        if (tabataStateRef.current.remaining <= 0) {
          const nextIsWork = !tabataStateRef.current.isWork;
          if (tabataStateRef.current.isWork) setTabataRounds((r) => r + 1);
          tabataStateRef.current = { isWork: nextIsWork, remaining: nextIsWork ? TABATA_WORK : TABATA_REST };
        }
        setTabataIsWork(tabataStateRef.current.isWork);
        setTabataRemaining(tabataStateRef.current.remaining);
      }, 1000);
    } else {
      if (tabataRef.current) clearInterval(tabataRef.current);
    }
    return () => { if (tabataRef.current) clearInterval(tabataRef.current); };
  }, [tabataRunning]);

  const handleTabataReset = () => {
    setTabataRunning(false);
    setTabataIsWork(true);
    setTabataRemaining(TABATA_WORK);
    setTabataRounds(0);
    tabataStateRef.current = { isWork: true, remaining: TABATA_WORK };
  };

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerRemaining((s) => {
          if (s <= 1) {
            setTimerRunning(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  useEffect(() => {
    if (reposRunning) {
      reposRef.current = setInterval(() => {
        setReposRemaining((s) => {
          if (s <= 1) {
            setReposRunning(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (reposRef.current) clearInterval(reposRef.current);
    }
    return () => { if (reposRef.current) clearInterval(reposRef.current); };
  }, [reposRunning]);

  const CHRONO_MODES: { key: ChronoMode; label: string }[] = [
    { key: 'chrono', label: 'Chrono' },
    { key: 'timer', label: 'Timer' },
    { key: 'repos', label: 'Repos' },
    { key: 'tabata', label: 'Tabata' },
  ];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={chronoStyles.container}>
      {/* Mode selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={chronoStyles.modeRow}
      >
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
          <Text style={chronoStyles.bigTime}>{formatTime(swSeconds)}</Text>
          <View style={chronoStyles.btnRow}>
            <TouchableOpacity
              style={chronoStyles.grayBtn}
              onPress={handleSwReset}
            >
              <Text style={chronoStyles.grayBtnText}>Reinitialiser</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[chronoStyles.mainBtn, swRunning ? chronoStyles.orangeBtn : chronoStyles.greenBtn]}
              onPress={() => setSwRunning((r) => !r)}
            >
              <Text style={chronoStyles.mainBtnText}>{swRunning ? 'Pause' : 'Demarrer'}</Text>
            </TouchableOpacity>
            {swRunning && (
              <TouchableOpacity style={chronoStyles.grayBtn} onPress={handleLap}>
                <Text style={chronoStyles.grayBtnText}>Tour</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Laps */}
          {laps.length > 0 && (
            <View style={chronoStyles.lapsContainer}>
              <Text style={chronoStyles.lapsTitle}>Tours</Text>
              {laps.map((lap, i) => (
                <View key={lap.id} style={chronoStyles.lapRow}>
                  <Text style={chronoStyles.lapNum}>Tour {laps.length - i}</Text>
                  <Text style={chronoStyles.lapSplit}>{lap.split}</Text>
                  <Text style={chronoStyles.lapTime}>{lap.time}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Timer */}
      {mode === 'timer' && (
        <View style={chronoStyles.watchContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={chronoStyles.presetRow}
          >
            {TIMER_PRESETS.map((p) => (
              <TouchableOpacity
                key={p.seconds}
                style={[
                  chronoStyles.presetPill,
                  timerPreset === p.seconds && chronoStyles.presetPillActive,
                ]}
                onPress={() => {
                  setTimerPreset(p.seconds);
                  setTimerRemaining(p.seconds);
                  setTimerRunning(false);
                }}
              >
                <Text
                  style={[
                    chronoStyles.presetText,
                    timerPreset === p.seconds && chronoStyles.presetTextActive,
                  ]}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={chronoStyles.bigTime}>{formatTime(timerRemaining)}</Text>

          <View style={chronoStyles.btnRow}>
            <TouchableOpacity
              style={chronoStyles.grayBtn}
              onPress={() => {
                setTimerRunning(false);
                setTimerRemaining(timerPreset);
              }}
            >
              <Text style={chronoStyles.grayBtnText}>Reinitialiser</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[chronoStyles.mainBtn, timerRunning ? chronoStyles.orangeBtn : chronoStyles.greenBtn]}
              onPress={() => {
                if (timerRemaining === 0) setTimerRemaining(timerPreset);
                setTimerRunning((r) => !r);
              }}
            >
              <Text style={chronoStyles.mainBtnText}>{timerRunning ? 'Pause' : 'Demarrer'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Repos */}
      {mode === 'repos' && (
        <View style={chronoStyles.watchContainer}>
          <Text style={chronoStyles.bigTime}>{formatTime(reposRemaining)}</Text>
          <View style={chronoStyles.btnRow}>
            <TouchableOpacity
              style={chronoStyles.grayBtn}
              onPress={() => {
                setReposRunning(false);
                setReposRemaining(reposDefault);
              }}
            >
              <Text style={chronoStyles.grayBtnText}>Reinitialiser</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[chronoStyles.mainBtn, reposRunning ? chronoStyles.orangeBtn : chronoStyles.greenBtn]}
              onPress={() => {
                if (reposRemaining === 0) setReposRemaining(reposDefault);
                setReposRunning((r) => !r);
              }}
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
            {formatTime(tabataRemaining)}
          </Text>
          <Text style={chronoStyles.reposHint}>Tabata: {TABATA_WORK}s effort / {TABATA_REST}s repos</Text>
          <View style={chronoStyles.btnRow}>
            <TouchableOpacity style={chronoStyles.grayBtn} onPress={handleTabataReset}>
              <Text style={chronoStyles.grayBtnText}>Reinitialiser</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[chronoStyles.mainBtn, tabataRunning ? chronoStyles.orangeBtn : chronoStyles.greenBtn]}
              onPress={() => setTabataRunning((r) => !r)}
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
            return (
              <View key={d.day} style={waterStyles.barCol}>
                <View style={waterStyles.barTrack}>
                  <View style={[waterStyles.barFill, { height: h, backgroundColor: isGoal ? colors.accent : colors.info }]} />
                </View>
                <Text style={waterStyles.barDay}>{d.day}</Text>
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
          const { numSets, reps } = parseProgramSets(ex.sets);
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
        {activeTab === 'seance' && <SeanceContent />}
        {activeTab === 'chrono' && <ChronoContent />}
        {activeTab === 'eau' && <WaterContent />}
        {activeTab === 'programme' && <ProgrammeContent onLaunch={() => setActiveTab('seance')} />}
      </View>
    </SafeAreaView>
  );
}
