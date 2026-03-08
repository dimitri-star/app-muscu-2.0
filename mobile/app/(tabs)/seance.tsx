import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import Colors from '../../constants/colors';
import { useWorkoutStore, useNutritionStore, useWaterStore } from '../../store';
import { recentWorkouts, weeklyProgram, exercisesDB } from '../../constants/mockData';
import type { WorkoutExercise, Exercise } from '../../constants/mockData';
import StartWorkoutModal from '../../components/StartWorkoutModal';
import ExerciseSearchModal from '../../components/ExerciseSearchModal';
import SaveWorkoutModal from '../../components/SaveWorkoutModal';
import CustomWaterModal from '../../components/CustomWaterModal';

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

// ─── Sub-tab pill row ─────────────────────────────────────────────────────────

type SeanceTab = 'seance' | 'chrono' | 'nutrition' | 'eau' | 'programme';
const SEANCE_TABS: { key: SeanceTab; label: string }[] = [
  { key: 'seance', label: 'Seance' },
  { key: 'chrono', label: 'Chrono' },
  { key: 'nutrition', label: 'Nutrition' },
  { key: 'eau', label: 'Eau' },
  { key: 'programme', label: 'Programme' },
];

function SubTabBar({
  active,
  onPress,
}: {
  active: SeanceTab;
  onPress: (t: SeanceTab) => void;
}) {
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

const subStyles = StyleSheet.create({
  container: {
    flexGrow: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.separator,
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  pillActive: {
    backgroundColor: Colors.text,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  pillTextActive: {
    color: Colors.background,
    fontWeight: '600',
  },
});

// ─── TAB: SEANCE ─────────────────────────────────────────────────────────────

function ExerciseCard({ ex }: { ex: WorkoutExercise }) {
  const { toggleSetDone, updateSet, addSet } = useWorkoutStore();
  const [expanded, setExpanded] = useState(true);
  const doneSets = ex.sets.filter((s) => s.done).length;

  return (
    <View style={seanceStyles.exCard}>
      {/* Header - tappable to collapse */}
      <TouchableOpacity
        style={seanceStyles.exHeader}
        onPress={() => setExpanded((e) => !e)}
        activeOpacity={0.7}
      >
        <Text style={seanceStyles.exName}>{ex.exercise.name}</Text>
        <View style={seanceStyles.progressDots}>
          {ex.sets.map((s) => (
            <View
              key={s.id}
              style={[
                seanceStyles.dot,
                s.done ? seanceStyles.dotDone : seanceStyles.dotPending,
              ]}
            />
          ))}
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={Colors.textTertiary}
          style={{ marginLeft: 6 }}
        />
      </TouchableOpacity>

      {expanded && (
        <>
          {/* Table header */}
          <View style={seanceStyles.tableHeader}>
            <Text style={[seanceStyles.colHead, seanceStyles.colNum]}>#</Text>
            <Text style={[seanceStyles.colHead, seanceStyles.colInput]}>Reps</Text>
            <Text style={[seanceStyles.colHead, seanceStyles.colInput]}>Poids</Text>
            <Text style={[seanceStyles.colHead, seanceStyles.colCheck]}>Fait</Text>
          </View>

          {/* Sets */}
          {ex.sets.map((s, i) => (
            <View key={s.id} style={seanceStyles.setRow}>
              <Text style={[seanceStyles.setNum, seanceStyles.colNum]}>{i + 1}</Text>
              <TextInput
                style={[seanceStyles.setInput, seanceStyles.colInput]}
                value={String(s.reps)}
                keyboardType="numeric"
                onChangeText={(v) =>
                  updateSet(ex.id, s.id, 'reps', parseInt(v) || 0)
                }
                placeholderTextColor={Colors.textTertiary}
              />
              <TextInput
                style={[seanceStyles.setInput, seanceStyles.colInput]}
                value={String(s.weight)}
                keyboardType="numeric"
                onChangeText={(v) =>
                  updateSet(ex.id, s.id, 'weight', parseFloat(v) || 0)
                }
                placeholderTextColor={Colors.textTertiary}
              />
              <TouchableOpacity
                style={[seanceStyles.colCheck, { alignItems: 'center' }]}
                onPress={() => toggleSetDone(ex.id, s.id)}
              >
                <View style={[seanceStyles.checkbox, s.done && seanceStyles.checkboxDone]}>
                  {s.done && (
                    <Ionicons name="checkmark" size={14} color={Colors.background} />
                  )}
                </View>
              </TouchableOpacity>
            </View>
          ))}

          {/* Add set */}
          <TouchableOpacity
            style={seanceStyles.addSetBtn}
            onPress={() => addSet(ex.id)}
          >
            <Ionicons name="add" size={16} color={Colors.text} />
            <Text style={seanceStyles.addSetText}>Ajouter une serie</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const seanceStyles = StyleSheet.create({
  exCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  exHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 8,
    gap: 10,
  },
  exName: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  progressDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotDone: {
    backgroundColor: Colors.accent,
  },
  dotPending: {
    backgroundColor: Colors.textTertiary,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.separator,
  },
  colHead: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  colNum: {
    width: 28,
    textAlign: 'center',
  },
  colInput: {
    flex: 1,
    textAlign: 'center',
  },
  colCheck: {
    width: 44,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  setNum: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  setInput: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
    backgroundColor: Colors.input,
    borderRadius: 8,
    marginHorizontal: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    textAlign: 'center',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: Colors.textTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.separator,
    marginHorizontal: 14,
    marginBottom: 4,
  },
  addSetText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
});

// Program day picker modal (inline)
function ProgramDayPicker({
  visible,
  onClose,
  onSelectDay,
}: {
  visible: boolean;
  onClose: () => void;
  onSelectDay: (dayIndex: number) => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={dayPickerStyles.overlay} onPress={onClose}>
        <Pressable style={dayPickerStyles.sheet} onPress={() => {}}>
          <View style={dayPickerStyles.handle} />
          <Text style={dayPickerStyles.title}>Choisir un jour</Text>
          <ScrollView>
            {weeklyProgram.map((day, index) => (
              <TouchableOpacity
                key={day.day}
                style={dayPickerStyles.dayRow}
                onPress={() => {
                  onSelectDay(index);
                  onClose();
                }}
              >
                <View style={[dayPickerStyles.dayBadge, { backgroundColor: day.color + '33' }]}>
                  <Text style={[dayPickerStyles.dayShort, { color: day.color }]}>{day.shortDay}</Text>
                </View>
                <View style={dayPickerStyles.dayInfo}>
                  <Text style={dayPickerStyles.dayLabel}>{day.label}</Text>
                  <Text style={dayPickerStyles.dayMeta}>
                    {day.type === 'rest' ? 'Repos' : `${day.exercises.length} exercices`}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
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

const dayPickerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.separator,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.separator,
    gap: 12,
  },
  dayBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayShort: {
    fontSize: 13,
    fontWeight: '700',
  },
  dayInfo: {
    flex: 1,
  },
  dayLabel: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  dayMeta: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  cancelText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
});

function SeanceContent() {
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
    addExercise,
    clearExercises,
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

  const handleSelectDay = (dayIndex: number) => {
    const day = weeklyProgram[dayIndex];
    clearExercises();
    startWorkout();
    // Add exercises from the program day
    if (day.type !== 'rest') {
      day.exercises.forEach((exStr) => {
        const exercise = resolveExercise(exStr);
        addExercise(exercise);
      });
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
    setShowSaveModal(false);
    endWorkout();
    Alert.alert('Seance enregistree', 'Bravo, ta seance a ete enregistree avec succes !');
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
          {recentWorkouts.map((w) => (
            <View key={w.id} style={activeStyles.historyCard}>
              <Text style={activeStyles.historyDate}>{w.date}</Text>
              <Text style={activeStyles.historyName}>{w.name}</Text>
              <View style={activeStyles.historyMeta}>
                <Text style={activeStyles.historyMetaText}>
                  {(w.totalVolume / 1000).toFixed(1)} t
                </Text>
                <Text style={activeStyles.historyMetaSep}>&middot;</Text>
                <Text style={activeStyles.historyMetaText}>{w.duration} min</Text>
              </View>
            </View>
          ))}
        </ScrollView>

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
          <Ionicons name="close" size={20} color={Colors.text} />
        </TouchableOpacity>
        <View style={activeStyles.timerCenter}>
          <Ionicons name="timer-outline" size={14} color={Colors.accentOrange} />
          <Text style={activeStyles.timer}>{formatTime(timerSeconds)}</Text>
        </View>
        <TouchableOpacity
          style={activeStyles.roundBtn}
          onPress={() => setShowSaveModal(true)}
        >
          <Ionicons name="checkmark" size={20} color={Colors.text} />
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
          <ExerciseCard key={ex.id} ex={ex} />
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add exercise button */}
      <View style={activeStyles.addExContainer}>
        <TouchableOpacity
          style={activeStyles.addExBtn}
          onPress={() => setShowExerciseModal(true)}
        >
          <Ionicons name="add" size={18} color={Colors.ctaText} />
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

const activeStyles = StyleSheet.create({
  // Idle
  idleContainer: {
    padding: 16,
  },
  idleTitle: {
    color: Colors.text,
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 16,
  },
  ctaBtn: {
    backgroundColor: Colors.cta,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 28,
  },
  ctaBtnText: {
    color: Colors.ctaText,
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  historyCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  historyDate: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  historyName: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyMetaText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  historyMetaSep: {
    color: Colors.textTertiary,
    fontSize: 13,
  },

  // Active
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  roundBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timer: {
    color: Colors.accentOrange,
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  workoutName: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  addExContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 16 : 12,
    paddingTop: 10,
    backgroundColor: Colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.separator,
  },
  addExBtn: {
    backgroundColor: Colors.cta,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addExText: {
    color: Colors.ctaText,
    fontSize: 16,
    fontWeight: '700',
  },
  restBubble: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.accentYellowGreen,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  restBubbleTime: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '800',
  },
  restBubbleLabel: {
    color: Colors.background,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

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

function ChronoContent() {
  const [mode, setMode] = useState<ChronoMode>('chrono');

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
          <Text style={chronoStyles.bigTime}>00:20</Text>
          <Text style={chronoStyles.reposHint}>Tabata: 20s effort / 10s repos</Text>
          <View style={chronoStyles.btnRow}>
            <TouchableOpacity style={[chronoStyles.mainBtn, chronoStyles.greenBtn]}>
              <Text style={chronoStyles.mainBtnText}>Demarrer</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const chronoStyles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  modeRow: {
    gap: 8,
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  modePill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
  },
  modePillActive: {
    backgroundColor: Colors.text,
  },
  modePillText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  modePillTextActive: {
    color: Colors.background,
    fontWeight: '600',
  },
  watchContainer: {
    alignItems: 'center',
    width: '100%',
  },
  bigTime: {
    color: Colors.text,
    fontSize: 64,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
    marginBottom: 32,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  mainBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
    minWidth: 130,
    alignItems: 'center',
  },
  greenBtn: {
    backgroundColor: Colors.accent,
  },
  orangeBtn: {
    backgroundColor: Colors.accentOrange,
  },
  mainBtnText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
  grayBtn: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 30,
    backgroundColor: Colors.card,
  },
  grayBtnText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  presetRow: {
    gap: 8,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  presetPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.card,
  },
  presetPillActive: {
    backgroundColor: Colors.accent,
  },
  presetText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  presetTextActive: {
    color: Colors.background,
    fontWeight: '700',
  },
  lapsContainer: {
    width: '100%',
    marginTop: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: 'hidden',
  },
  lapsTitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    letterSpacing: 0.5,
  },
  lapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.separator,
  },
  lapNum: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  lapSplit: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontVariant: ['tabular-nums'],
    flex: 1,
    textAlign: 'center',
  },
  lapTime: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    flex: 1,
    textAlign: 'right',
  },
  reposHint: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 8,
  },
});

// ─── TAB: NUTRITION ───────────────────────────────────────────────────────────

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Petit-dejeuner',
  lunch: 'Dejeuner',
  dinner: 'Diner',
  snack: 'Collations',
};

function MacroBar({
  label,
  current,
  goal,
  color,
  unit = 'g',
}: {
  label: string;
  current: number;
  goal: number;
  color: string;
  unit?: string;
}) {
  const pct = Math.min(current / goal, 1);
  return (
    <View style={nutStyles.macroRow}>
      <Text style={nutStyles.macroLabel}>{label}</Text>
      <View style={nutStyles.barContainer}>
        <View style={[nutStyles.barFill, { width: `${pct * 100}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={nutStyles.macroValue}>
        {Math.round(current)}/{goal}{unit}
      </Text>
    </View>
  );
}

function MealSection({ mealType }: { mealType: MealType }) {
  const { meals, getMealTotals } = useNutritionStore();
  const [expanded, setExpanded] = useState(true);
  const items = meals.filter((m) => m.mealType === mealType);
  const totals = getMealTotals(mealType);

  return (
    <View style={nutStyles.mealSection}>
      <TouchableOpacity
        style={nutStyles.mealHeader}
        onPress={() => setExpanded((e) => !e)}
      >
        <Text style={nutStyles.mealTitle}>{MEAL_LABELS[mealType]}</Text>
        <View style={nutStyles.mealHeaderRight}>
          <Text style={nutStyles.mealKcal}>{Math.round(totals.calories)} kcal</Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={Colors.textSecondary}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View>
          {items.map((m) => {
            const ratio =
              m.foodItem.servingUnit === 'g'
                ? m.quantity / m.foodItem.servingSize
                : m.quantity;
            const kcal = Math.round(m.foodItem.calories * ratio);
            return (
              <View key={m.id} style={nutStyles.foodRow}>
                <View style={{ flex: 1 }}>
                  <Text style={nutStyles.foodName}>{m.foodItem.name}</Text>
                  <Text style={nutStyles.foodGrams}>
                    {m.quantity}{m.foodItem.servingUnit}
                  </Text>
                </View>
                <Text style={nutStyles.foodKcal}>{kcal} kcal</Text>
              </View>
            );
          })}
          <TouchableOpacity style={nutStyles.addFoodBtn}>
            <Ionicons name="add" size={14} color={Colors.textSecondary} />
            <Text style={nutStyles.addFoodText}>Ajouter un aliment</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function NutritionContent() {
  const { getTotals, goals } = useNutritionStore();
  const totals = getTotals();

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={nutStyles.container}>
      {/* Macro summary */}
      <View style={nutStyles.summaryCard}>
        <Text style={nutStyles.summaryTitle}>Macros du jour</Text>
        <MacroBar
          label="Proteines"
          current={totals.protein}
          goal={goals.protein}
          color="#3B82F6"
        />
        <MacroBar
          label="Glucides"
          current={totals.carbs}
          goal={goals.carbs}
          color={Colors.accentOrange}
        />
        <MacroBar
          label="Lipides"
          current={totals.fat}
          goal={goals.fat}
          color="#EF4444"
        />
        <MacroBar
          label="Calories"
          current={totals.calories}
          goal={goals.calories}
          color={Colors.accent}
          unit=" kcal"
        />
      </View>

      {/* Meal sections */}
      {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((mt) => (
        <MealSection key={mt} mealType={mt} />
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const nutStyles = StyleSheet.create({
  container: {
    padding: 16,
  },
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 10,
  },
  summaryTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  macroLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    width: 80,
  },
  barContainer: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.cardAlt,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  macroValue: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
    width: 80,
    textAlign: 'right',
  },
  mealSection: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  mealTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  mealHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealKcal: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.separator,
  },
  foodName: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  foodGrams: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 1,
  },
  foodKcal: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  addFoodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.separator,
  },
  addFoodText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
});

// ─── TAB: EAU ─────────────────────────────────────────────────────────────────

const WATER_GAUGE_SIZE = 200;
const WATER_GAUGE_STROKE = 18;
const WATER_RADIUS = (WATER_GAUGE_SIZE - WATER_GAUGE_STROKE) / 2;
const WATER_CIRCUMFERENCE = 2 * Math.PI * WATER_RADIUS;

function WaterContent() {
  const { current, goal, weekHistory, entries, addWater, removeEntry } = useWaterStore();
  const pct = Math.min(current / goal, 1);
  const strokeDash = WATER_CIRCUMFERENCE * pct;
  const maxBar = Math.max(...weekHistory.map((d) => d.amount), 1);
  const [showWaterModal, setShowWaterModal] = useState(false);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={waterStyles.container}>
      {/* Circular gauge */}
      <View style={waterStyles.gaugeWrapper}>
        <Svg width={WATER_GAUGE_SIZE} height={WATER_GAUGE_SIZE}>
          {/* Background circle */}
          <Circle
            cx={WATER_GAUGE_SIZE / 2}
            cy={WATER_GAUGE_SIZE / 2}
            r={WATER_RADIUS}
            stroke={Colors.card}
            strokeWidth={WATER_GAUGE_STROKE}
            fill="none"
          />
          {/* Progress circle */}
          <Circle
            cx={WATER_GAUGE_SIZE / 2}
            cy={WATER_GAUGE_SIZE / 2}
            r={WATER_RADIUS}
            stroke={Colors.accent}
            strokeWidth={WATER_GAUGE_STROKE}
            fill="none"
            strokeDasharray={`${strokeDash} ${WATER_CIRCUMFERENCE}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            rotation="-90"
            origin={`${WATER_GAUGE_SIZE / 2}, ${WATER_GAUGE_SIZE / 2}`}
          />
        </Svg>
        <View style={waterStyles.gaugeInner}>
          <Text style={waterStyles.gaugeMain}>
            {(current / 1000).toFixed(1)}L
          </Text>
          <Text style={waterStyles.gaugeGoal}>/ {(goal / 1000).toFixed(0)}L</Text>
          <Text style={waterStyles.gaugePct}>{Math.round(pct * 100)}%</Text>
        </View>
      </View>

      {/* Quick add buttons */}
      <View style={waterStyles.quickAddRow}>
        {[
          { label: '+250 ml', amount: 250 },
          { label: '+500 ml', amount: 500 },
        ].map((btn) => (
          <TouchableOpacity
            key={btn.amount}
            style={waterStyles.quickBtn}
            onPress={() => addWater(btn.amount)}
          >
            <Text style={waterStyles.quickBtnText}>{btn.label}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={waterStyles.quickBtn}
          onPress={() => setShowWaterModal(true)}
        >
          <Text style={waterStyles.quickBtnText}>Autre</Text>
        </TouchableOpacity>
      </View>

      {/* Today's entries history */}
      {entries.length > 0 && (
        <View style={waterStyles.historyCard}>
          <Text style={waterStyles.historyTitle}>Historique du jour</Text>
          {entries.map((entry) => (
            <View key={entry.id} style={waterStyles.entryRow}>
              <Text style={waterStyles.entryTime}>{entry.time}</Text>
              <Text style={waterStyles.entryAmount}>{entry.amount} ml</Text>
              <TouchableOpacity
                style={waterStyles.deleteBtn}
                onPress={() => removeEntry(entry.id)}
              >
                <Ionicons name="close" size={16} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* 7-day bar chart */}
      <View style={waterStyles.chartCard}>
        <Text style={waterStyles.chartTitle}>7 derniers jours</Text>
        <View style={waterStyles.chart}>
          {weekHistory.map((d) => {
            const h = (d.amount / maxBar) * 80;
            const isGoal = d.amount >= d.goal;
            return (
              <View key={d.day} style={waterStyles.barCol}>
                <View style={waterStyles.barTrack}>
                  <View
                    style={[
                      waterStyles.barFill,
                      { height: h, backgroundColor: isGoal ? Colors.accent : Colors.cardAlt },
                    ]}
                  />
                </View>
                <Text style={waterStyles.barDay}>{d.day}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <CustomWaterModal
        visible={showWaterModal}
        onClose={() => setShowWaterModal(false)}
        onAdd={(ml) => {
          addWater(ml);
          setShowWaterModal(false);
        }}
      />
    </ScrollView>
  );
}

const waterStyles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  gaugeWrapper: {
    width: WATER_GAUGE_SIZE,
    height: WATER_GAUGE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  gaugeInner: {
    position: 'absolute',
    alignItems: 'center',
  },
  gaugeMain: {
    color: Colors.text,
    fontSize: 32,
    fontWeight: '800',
  },
  gaugeGoal: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  gaugePct: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  quickAddRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    width: '100%',
  },
  quickBtn: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  quickBtnText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  historyCard: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  historyTitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.separator,
  },
  entryTime: {
    color: Colors.textSecondary,
    fontSize: 13,
    width: 50,
    fontVariant: ['tabular-nums'],
  },
  entryAmount: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  deleteBtn: {
    padding: 6,
  },
  chartCard: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
  },
  chartTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    height: 80,
    width: 24,
    borderRadius: 6,
    backgroundColor: Colors.cardAlt,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginBottom: 6,
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  barDay: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
});

// ─── TAB: PROGRAMME ───────────────────────────────────────────────────────────

const TODAY_INDEX = new Date().getDay(); // 0=Sun, 1=Mon…
// Map JS day (0=Sun) to our weeklyProgram index (0=Mon)
const todayProgramIndex = TODAY_INDEX === 0 ? 6 : TODAY_INDEX - 1;

function ProgrammeContent() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={progStyles.container}>
      {/* Active program header */}
      <View style={progStyles.headerCard}>
        <Text style={progStyles.programName}>PPL — 3 jours/semaine</Text>
        <Text style={progStyles.programMeta}>6 jours · Push / Pull / Legs</Text>
      </View>

      {/* Days list */}
      {weeklyProgram.map((day, i) => {
        const isToday = i === todayProgramIndex;
        const isRest = day.type === 'rest';
        return (
          <View
            key={day.day}
            style={[
              progStyles.dayCard,
              isToday && progStyles.dayCardToday,
            ]}
          >
            <View style={progStyles.dayLeft}>
              <Text style={[progStyles.dayShort, { color: day.color }]}>
                {day.shortDay}
              </Text>
              {isToday && (
                <View style={progStyles.todayDot} />
              )}
            </View>
            <View style={progStyles.dayCenter}>
              <Text style={progStyles.dayLabel}>{day.label}</Text>
              <Text style={progStyles.dayExCount}>
                {isRest ? 'Journee de recuperation' : `${day.exercises.length} exercices`}
              </Text>
            </View>
            {isRest ? (
              <View style={progStyles.reposBadge}>
                <Text style={progStyles.reposBadgeText}>REPOS</Text>
              </View>
            ) : (
              <Ionicons
                name="chevron-forward"
                size={16}
                color={Colors.textTertiary}
              />
            )}
          </View>
        );
      })}

      {/* CTA */}
      <TouchableOpacity style={progStyles.launchBtn}>
        <Text style={progStyles.launchBtnText}>Lancer la seance du jour</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const progStyles = StyleSheet.create({
  container: {
    padding: 16,
  },
  headerCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  programName: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  programMeta: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  dayCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dayCardToday: {
    borderColor: Colors.cardAlt,
    backgroundColor: '#232323',
  },
  dayLeft: {
    width: 40,
    alignItems: 'center',
  },
  dayShort: {
    fontSize: 13,
    fontWeight: '700',
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.accent,
    marginTop: 3,
  },
  dayCenter: {
    flex: 1,
    marginLeft: 10,
  },
  dayLabel: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  dayExCount: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  reposBadge: {
    backgroundColor: Colors.tagGreenBg,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  reposBadgeText: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  launchBtn: {
    backgroundColor: Colors.cta,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  launchBtnText: {
    color: Colors.ctaText,
    fontSize: 16,
    fontWeight: '700',
  },
});

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────

export default function SeanceScreen() {
  const [activeTab, setActiveTab] = useState<SeanceTab>('seance');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      <SubTabBar active={activeTab} onPress={setActiveTab} />

      <View style={styles.content}>
        {activeTab === 'seance' && <SeanceContent />}
        {activeTab === 'chrono' && <ChronoContent />}
        {activeTab === 'nutrition' && <NutritionContent />}
        {activeTab === 'eau' && <WaterContent />}
        {activeTab === 'programme' && <ProgrammeContent />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
});
