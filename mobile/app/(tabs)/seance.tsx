import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert, Animated, Modal, Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import Colors from '../../constants/colors';
import { useWorkoutStore } from '../../store';
import { exercisesDB } from '../../constants/mockData';
import type { WorkoutExercise, WorkoutSet, Exercise } from '../../constants/mockData';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function fmtRest(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m > 0 && sec > 0) return `${m}min ${sec}s`;
  if (m > 0) return `${m}min`;
  return `${s}s`;
}

// ─── Tab Bar ──────────────────────────────────────────────────────────────────

function TabBar({ active, onChange }: { active: 'seance' | 'chrono'; onChange: (t: 'seance' | 'chrono') => void }) {
  return (
    <View style={tabSt.bar}>
      {(['seance', 'chrono'] as const).map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[tabSt.tab, active === tab && tabSt.active]}
          onPress={() => onChange(tab)}
          activeOpacity={0.7}
        >
          <Text style={[tabSt.label, active === tab && tabSt.labelActive]}>
            {tab === 'seance' ? '💪 Séance' : '⏱ Chrono repos'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const tabSt = StyleSheet.create({
  bar: {
    flexDirection: 'row', backgroundColor: Colors.card, borderRadius: 14, padding: 4,
    marginHorizontal: 16, marginTop: 10, borderWidth: 1, borderColor: Colors.border,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 11 },
  active: {
    backgroundColor: Colors.background,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  label: { color: Colors.textMuted, fontSize: 14, fontWeight: '600' },
  labelActive: { color: Colors.text, fontWeight: '700' },
});

// ─── Rest Overlay (auto, from set check) ─────────────────────────────────────

function RestOverlay({ seconds, total, onStop }: { seconds: number; total: number; onStop: () => void }) {
  const pulse = useRef(new Animated.Value(1)).current;
  const size = 140; const stroke = 10; const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const progress = total > 0 ? seconds / total : 0;
  const offset = circ * (1 - progress);
  const isLow = seconds <= 10;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.04, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[restSt.wrap, { transform: [{ scale: pulse }] }]}>
      <View style={restSt.box}>
        <Text style={restSt.label}>REPOS</Text>
        <View style={{ alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
          <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
            <Circle cx={size / 2} cy={size / 2} r={r} stroke={Colors.border} strokeWidth={stroke} fill="none" />
            <Circle
              cx={size / 2} cy={size / 2} r={r}
              stroke={isLow ? Colors.error : Colors.accent}
              strokeWidth={stroke} fill="none"
              strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            />
          </Svg>
          <Text style={[restSt.time, { position: 'absolute', color: isLow ? Colors.error : Colors.text }]}>
            {fmt(seconds)}
          </Text>
        </View>
        <TouchableOpacity style={restSt.skip} onPress={onStop} activeOpacity={0.7}>
          <Text style={restSt.skipTxt}>Passer ›</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const restSt = StyleSheet.create({
  wrap: { position: 'absolute', bottom: 90, left: 16, right: 16, zIndex: 100, alignItems: 'center' },
  box: {
    backgroundColor: Colors.background, borderRadius: 24, paddingVertical: 18, paddingHorizontal: 28,
    alignItems: 'center', borderWidth: 1.5, borderColor: Colors.accent,
    shadowColor: Colors.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 16,
    elevation: 12, width: '100%',
  },
  label: { color: Colors.accent, fontSize: 11, fontWeight: '800', letterSpacing: 2, marginBottom: 6 },
  time: { fontSize: 36, fontWeight: '900', letterSpacing: -1 },
  skip: { marginTop: 10, backgroundColor: Colors.accentMuted, borderRadius: 20, paddingHorizontal: 24, paddingVertical: 9 },
  skipTxt: { color: Colors.accent, fontSize: 14, fontWeight: '700' },
});

// ─── Rest Time Modal ──────────────────────────────────────────────────────────

function RestTimeModal({
  visible, current, onSave, onClose,
}: { visible: boolean; current: number; onSave: (s: number) => void; onClose: () => void }) {
  const [val, setVal] = useState(String(current));
  const presets = [30, 45, 60, 90, 120, 150, 180, 240, 300];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={rtmSt.overlay}>
        <View style={rtmSt.box}>
          <Text style={rtmSt.title}>Temps de repos</Text>
          <View style={rtmSt.inputRow}>
            <TextInput
              style={rtmSt.input}
              value={val}
              onChangeText={setVal}
              keyboardType="number-pad"
              selectTextOnFocus
            />
            <Text style={rtmSt.unit}>secondes</Text>
          </View>
          <View style={rtmSt.grid}>
            {presets.map((p) => (
              <TouchableOpacity
                key={p}
                style={[rtmSt.chip, Number(val) === p && rtmSt.chipActive]}
                onPress={() => setVal(String(p))}
                activeOpacity={0.7}
              >
                <Text style={[rtmSt.chipTxt, Number(val) === p && rtmSt.chipTxtActive]}>{fmtRest(p)}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={rtmSt.btns}>
            <TouchableOpacity style={rtmSt.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={rtmSt.cancelTxt}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={rtmSt.saveBtn}
              onPress={() => { onSave(Math.max(10, Number(val) || 90)); onClose(); }}
              activeOpacity={0.8}
            >
              <Text style={rtmSt.saveTxt}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const rtmSt = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  box: { backgroundColor: Colors.background, borderRadius: 24, padding: 24, width: '100%', borderWidth: 1, borderColor: Colors.border },
  title: { color: Colors.text, fontSize: 18, fontWeight: '800', marginBottom: 16 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card,
    borderRadius: 14, borderWidth: 1.5, borderColor: Colors.accent, paddingHorizontal: 16, marginBottom: 14,
  },
  input: { flex: 1, fontSize: 28, fontWeight: '800', color: Colors.text, paddingVertical: 12 },
  unit: { color: Colors.textMuted, fontSize: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: Colors.border },
  chipActive: { borderColor: Colors.accent, backgroundColor: Colors.accentMuted },
  chipTxt: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  chipTxtActive: { color: Colors.accent, fontWeight: '800' },
  btns: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  cancelTxt: { color: Colors.textSecondary, fontSize: 15, fontWeight: '600' },
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.accent, alignItems: 'center' },
  saveTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },
});

// ─── Add Exercise Modal ───────────────────────────────────────────────────────

const MUSCLE_GROUPS = ['Tous', 'Poitrine', 'Dos', 'Épaules', 'Biceps', 'Triceps', 'Quadriceps', 'Mollets'];

function AddExerciseModal({ visible, onAdd, onClose }: {
  visible: boolean;
  onAdd: (ex: Exercise) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Tous');

  const filtered = exercisesDB.filter((ex) => {
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchGroup = filter === 'Tous' || ex.muscleGroup.toLowerCase().includes(filter.toLowerCase());
    return matchSearch && matchGroup;
  });

  const MUSCLE_COLORS: Record<string, string> = {
    Poitrine: '#4C9FFF', Dos: '#1DB954', Épaules: '#FFB800',
    Biceps: '#FF4F9A', Triceps: '#FF6B35', Quadriceps: '#FF6B35',
    'Dos / Ischio': '#1DB954', Mollets: '#7C4DFF',
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={aemSt.overlay}>
        <View style={aemSt.sheet}>
          <View style={aemSt.handle} />
          <Text style={aemSt.title}>Ajouter un exercice</Text>

          {/* Search */}
          <View style={aemSt.searchBar}>
            <Text style={{ fontSize: 15 }}>🔍</Text>
            <TextInput
              style={aemSt.searchInput}
              placeholder="Rechercher..."
              placeholderTextColor={Colors.textMuted}
              value={search}
              onChangeText={setSearch}
              autoFocus
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Text style={{ color: Colors.textMuted, fontSize: 14 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Filter chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={aemSt.filterScroll}>
            {MUSCLE_GROUPS.map((g) => (
              <TouchableOpacity
                key={g}
                style={[aemSt.filterChip, filter === g && aemSt.filterChipActive]}
                onPress={() => setFilter(g)}
                activeOpacity={0.7}
              >
                <Text style={[aemSt.filterTxt, filter === g && aemSt.filterTxtActive]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Exercise list */}
          <ScrollView style={aemSt.list} showsVerticalScrollIndicator={false}>
            {filtered.length === 0 ? (
              <Text style={aemSt.empty}>Aucun exercice trouvé.</Text>
            ) : (
              filtered.map((ex) => (
                <TouchableOpacity
                  key={ex.id}
                  style={aemSt.exRow}
                  onPress={() => { onAdd(ex); onClose(); setSearch(''); setFilter('Tous'); }}
                  activeOpacity={0.7}
                >
                  <View style={[aemSt.exDot, { backgroundColor: MUSCLE_COLORS[ex.muscleGroup] ?? Colors.accent }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={aemSt.exName}>{ex.name}</Text>
                    <Text style={aemSt.exMeta}>{ex.muscleGroup} · {ex.equipment} · {ex.category}</Text>
                  </View>
                  <Text style={aemSt.exAdd}>+</Text>
                </TouchableOpacity>
              ))
            )}
            <View style={{ height: 40 }} />
          </ScrollView>

          <TouchableOpacity style={aemSt.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={aemSt.closeTxt}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const aemSt = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 20, maxHeight: '90%', borderWidth: 1, borderColor: Colors.border,
  },
  handle: { width: 36, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  title: { color: Colors.text, fontSize: 20, fontWeight: '800', marginBottom: 14 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 4,
    marginBottom: 12, borderWidth: 1, borderColor: Colors.border, gap: 10,
  },
  searchInput: { flex: 1, color: Colors.text, fontSize: 15, paddingVertical: 10 },
  filterScroll: { marginBottom: 12 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border, marginRight: 8,
  },
  filterChipActive: { borderColor: Colors.accent, backgroundColor: Colors.accentMuted },
  filterTxt: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  filterTxtActive: { color: Colors.accent, fontWeight: '700' },
  list: { maxHeight: 380 },
  empty: { color: Colors.textMuted, textAlign: 'center', paddingVertical: 30 },
  exRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  exDot: { width: 10, height: 10, borderRadius: 5 },
  exName: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  exMeta: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  exAdd: { color: Colors.accent, fontSize: 22, fontWeight: '800', paddingHorizontal: 4 },
  closeBtn: {
    marginTop: 14, paddingVertical: 14, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  closeTxt: { color: Colors.textSecondary, fontSize: 15, fontWeight: '600' },
});

// ─── Set Row ──────────────────────────────────────────────────────────────────

function SetRow({ set, index, exerciseId, restTime }: {
  set: WorkoutSet; index: number; exerciseId: string; restTime: number;
}) {
  const { toggleSetDone, updateSet, removeSet, startRestTimer } = useWorkoutStore();

  const handleToggle = () => {
    const wasDone = set.done;
    toggleSetDone(exerciseId, set.id);
    if (!wasDone) startRestTimer(restTime);
  };

  return (
    <View style={[setSt.row, set.done && setSt.rowDone]}>
      <Text style={setSt.idx}>{index + 1}</Text>
      <TextInput
        style={setSt.input}
        value={String(set.reps)}
        keyboardType="number-pad"
        onChangeText={(v) => updateSet(exerciseId, set.id, 'reps', Number(v) || 0)}
        placeholderTextColor={Colors.textMuted}
        selectTextOnFocus
      />
      <TextInput
        style={setSt.input}
        value={set.weight === 0 ? '' : String(set.weight)}
        placeholder="—"
        keyboardType="decimal-pad"
        onChangeText={(v) => updateSet(exerciseId, set.id, 'weight', parseFloat(v) || 0)}
        placeholderTextColor={Colors.textMuted}
        selectTextOnFocus
      />
      <TouchableOpacity
        style={[setSt.check, set.done && setSt.checkDone]}
        onPress={handleToggle}
        activeOpacity={0.7}
      >
        <Text style={[setSt.checkTxt, set.done && { color: '#fff' }]}>{set.done ? '✓' : '○'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => removeSet(exerciseId, set.id)} style={setSt.del} activeOpacity={0.7}>
        <Text style={setSt.delTxt}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const setSt = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, borderRadius: 6, paddingHorizontal: 0 },
  rowDone: { backgroundColor: 'rgba(29,185,84,0.06)' },
  idx: { color: Colors.textMuted, fontSize: 11, fontWeight: '700', width: 18, textAlign: 'center' },
  input: {
    flex: 1, minWidth: 0, color: Colors.text, fontSize: 13, fontWeight: '600', textAlign: 'center',
    backgroundColor: Colors.inputBackground, borderRadius: 6, paddingVertical: 5,
    marginHorizontal: 2, borderWidth: 1, borderColor: Colors.border,
  },
  check: {
    width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center', marginLeft: 2,
  },
  checkDone: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  checkTxt: { color: Colors.textMuted, fontSize: 11, fontWeight: '800' },
  del: { padding: 2, marginLeft: 0, minWidth: 24, alignItems: 'center', justifyContent: 'center' },
  delTxt: { color: Colors.textMuted, fontSize: 10 },
});

// ─── Exercise Card ────────────────────────────────────────────────────────────

function ExerciseCard({ exercise }: { exercise: WorkoutExercise }) {
  const { addSet, removeExercise, updateRestTime, updateNotes } = useWorkoutStore();
  const [showRestModal, setShowRestModal] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notesVal, setNotesVal] = useState(exercise.notes ?? '');

  const done = exercise.sets.filter((s) => s.done).length;
  const total = exercise.sets.length;
  const allDone = done === total && total > 0;

  const MUSCLE_COLORS: Record<string, string> = {
    Poitrine: '#4C9FFF', Dos: '#1DB954', Épaules: '#FFB800',
    Biceps: '#FF4F9A', Triceps: '#FF6B35', Quadriceps: '#FF6B35',
    'Dos / Ischio': '#1DB954', Mollets: '#7C4DFF',
  };
  const muscleColor = MUSCLE_COLORS[exercise.exercise.muscleGroup] ?? Colors.accent;

  return (
    <View style={[exSt.card, allDone && exSt.cardDone]}>
      {/* Header: gauche = nom + meta (tronqués), droite = repos + poubelle (toujours visibles) */}
      <View style={exSt.header}>
        <View style={exSt.headerLeft}>
          <View style={exSt.nameRow}>
            <View style={[exSt.muscleDot, { backgroundColor: muscleColor }]} />
            <Text style={exSt.name} numberOfLines={1}>{exercise.exercise.name}</Text>
          </View>
          <Text style={exSt.meta} numberOfLines={1}>
            {exercise.exercise.muscleGroup} · {exercise.exercise.equipment}
            {' · '}
            <Text style={[exSt.progress, allDone && exSt.progressDone]}>
              {done}/{total} séries{allDone ? ' ✓' : ''}
            </Text>
          </Text>
        </View>

        <View style={exSt.headerRight}>
          <TouchableOpacity style={exSt.restBadge} onPress={() => setShowRestModal(true)} activeOpacity={0.7}>
            <Text style={exSt.restTxt} numberOfLines={1}>⏱ {fmtRest(exercise.restTime)}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={exSt.deleteBtn}
            onPress={() =>
              Alert.alert('Supprimer ?', exercise.exercise.name, [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Supprimer', style: 'destructive', onPress: () => removeExercise(exercise.id) },
              ])
            }
            activeOpacity={0.7}
          >
            <Text style={exSt.deleteTxt}>🗑</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Table header */}
      <View style={exSt.tableHead}>
        <Text style={[exSt.th, exSt.thNum]}>#</Text>
        <Text style={[exSt.th, exSt.thReps]}>Réps</Text>
        <Text style={[exSt.th, exSt.thPoids]}>Poids</Text>
        <Text style={[exSt.th, exSt.thCheck]}>✓</Text>
        <View style={exSt.thDel} />
      </View>

      {/* Sets */}
      {exercise.sets.map((set, i) => (
        <SetRow key={set.id} set={set} index={i} exerciseId={exercise.id} restTime={exercise.restTime} />
      ))}

      {/* Add set */}
      <TouchableOpacity style={exSt.addSet} onPress={() => addSet(exercise.id)} activeOpacity={0.7}>
        <Text style={exSt.addSetTxt}>+ Ajouter une série</Text>
      </TouchableOpacity>

      {/* Notes toggle */}
      <TouchableOpacity
        style={exSt.notesToggle}
        onPress={() => setShowNotes((v) => !v)}
        activeOpacity={0.7}
      >
        <Text style={exSt.notesToggletxt}>
          📝 Notes{exercise.notes ? ` · ${exercise.notes.slice(0, 30)}${exercise.notes.length > 30 ? '…' : ''}` : ''}
        </Text>
        <Text style={exSt.chevron}>{showNotes ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {showNotes && (
        <TextInput
          style={exSt.notesInput}
          placeholder="Conseils, sensations, PR..."
          placeholderTextColor={Colors.textMuted}
          value={notesVal}
          onChangeText={(v) => { setNotesVal(v); updateNotes(exercise.id, v); }}
          multiline
          numberOfLines={2}
        />
      )}

      <RestTimeModal
        visible={showRestModal}
        current={exercise.restTime}
        onSave={(s) => updateRestTime(exercise.id, s)}
        onClose={() => setShowRestModal(false)}
      />
    </View>
  );
}

const exSt = StyleSheet.create({
  card: {
    backgroundColor: Colors.card, borderRadius: 14, padding: 10,
    marginBottom: 10, borderWidth: 1, borderColor: Colors.border,
    maxWidth: '100%',
  },
  cardDone: { borderColor: Colors.accent, borderWidth: 1.5 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  headerLeft: { flex: 1, minWidth: 0 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  muscleDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  name: { color: Colors.text, fontSize: 15, fontWeight: '700', flex: 1 },
  meta: { color: Colors.textSecondary, fontSize: 11, marginLeft: 14 },
  progress: { color: Colors.textSecondary, fontWeight: '600' },
  progressDone: { color: Colors.accent },
  restBadge: {
    backgroundColor: Colors.inputBackground, paddingHorizontal: 6, paddingVertical: 4,
    borderRadius: 14, borderWidth: 1, borderColor: Colors.border, minWidth: 0,
  },
  restTxt: { color: Colors.textSecondary, fontSize: 10, fontWeight: '600' },
  deleteBtn: { padding: 4 },
  deleteTxt: { fontSize: 13 },
  tableHead: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 2,
    paddingHorizontal: 0, paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  th: { color: Colors.textMuted, fontSize: 9, fontWeight: '700', textAlign: 'center', letterSpacing: 0.2 },
  thNum: { width: 18 },
  thReps: { flex: 1, minWidth: 0 },
  thPoids: { flex: 1, minWidth: 0 },
  thCheck: { width: 26, marginLeft: 2 },
  thDel: { width: 24 },
  addSet: {
    marginTop: 6, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed', alignItems: 'center',
  },
  addSetTxt: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  notesToggle: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 6, paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  notesToggletxt: { color: Colors.textMuted, fontSize: 12, flex: 1 },
  chevron: { color: Colors.textMuted, fontSize: 10 },
  notesInput: {
    marginTop: 8, backgroundColor: Colors.inputBackground, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, color: Colors.text,
    fontSize: 13, borderWidth: 1, borderColor: Colors.border,
  },
});

// ─── Chrono Tab ───────────────────────────────────────────────────────────────

interface SavedTimer { id: string; label: string; seconds: number }

const PRESETS = [
  { label: '30s', seconds: 30 }, { label: '45s', seconds: 45 },
  { label: '1 min', seconds: 60 }, { label: '1:30', seconds: 90 },
  { label: '2 min', seconds: 120 }, { label: '2:30', seconds: 150 },
  { label: '3 min', seconds: 180 }, { label: '4 min', seconds: 240 },
  { label: '5 min', seconds: 300 },
];

function ChronoTab() {
  const [total, setTotal] = useState(90);
  const [remaining, setRemaining] = useState(90);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const iRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulse = useRef(new Animated.Value(1)).current;

  const [showCustom, setShowCustom] = useState(false);
  const [cMin, setCMin] = useState('1');
  const [cSec, setCSec] = useState('30');
  const [cLabel, setCLabel] = useState('');
  const [saved, setSaved] = useState<SavedTimer[]>([
    { id: 's1', label: 'Squat lourds', seconds: 240 },
    { id: 's2', label: 'Isolation', seconds: 60 },
  ]);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    if (finished) {
      Vibration.vibrate([0, 400, 200, 400]);
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.06, duration: 400, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulse.setValue(1);
    }
  }, [finished]);

  const play = () => {
    if (finished) return;
    setRunning(true);
    iRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) { clearInterval(iRef.current!); setRunning(false); setFinished(true); return 0; }
        return r - 1;
      });
    }, 1000);
  };

  const pause = () => { setRunning(false); if (iRef.current) clearInterval(iRef.current); };

  const reset = (newTotal?: number) => {
    pause();
    const t = newTotal ?? total;
    setTotal(t); setRemaining(t); setFinished(false);
  };

  const selectPreset = (s: number) => reset(s);

  const adjust = (delta: number) => {
    const newTotal = Math.max(10, total + delta);
    setTotal(newTotal);
    if (!running) setRemaining((r) => Math.max(0, Math.min(r + delta, newTotal)));
  };

  const handleFinished = () => {
    setHistory((h) => [`${fmtRest(total)} ✓`, ...h.slice(0, 9)]);
    reset();
  };

  const saveCustom = () => {
    const t = (parseInt(cMin, 10) || 0) * 60 + (parseInt(cSec, 10) || 0);
    if (t < 5 || t > 3600) { Alert.alert('Durée invalide', '5s minimum, 60min maximum'); return; }
    const label = cLabel.trim() || fmtRest(t);
    setSaved((p) => [...p, { id: `c_${Date.now()}`, label, seconds: t }]);
    reset(t);
    setShowCustom(false);
    setCLabel(''); setCMin('1'); setCSec('30');
  };

  // SVG ring
  const SIZE = 210; const STROKE = 14; const R = (SIZE - STROKE) / 2;
  const CIRC = 2 * Math.PI * R;
  const progress = total > 0 ? remaining / total : 0;
  const dashOffset = CIRC * (1 - progress);
  const isLow = remaining <= 10 && remaining > 0;
  const ringColor = finished ? Colors.accent : isLow ? Colors.error : '#4C9FFF';

  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={chSt.scroll}>

      {/* ── Horloge ── */}
      <View style={chSt.clockCard}>
        <Animated.View style={{ transform: [{ scale: pulse }], alignItems: 'center' }}>
          <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={SIZE} height={SIZE} style={{ transform: [{ rotate: '-90deg' }] }}>
              <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={Colors.border} strokeWidth={STROKE} fill="none" />
              <Circle
                cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={ringColor} strokeWidth={STROKE} fill="none"
                strokeDasharray={CIRC} strokeDashoffset={dashOffset} strokeLinecap="round"
              />
            </Svg>
            <View style={{ position: 'absolute', alignItems: 'center' }}>
              {finished ? (
                <>
                  <Text style={{ fontSize: 44 }}>✅</Text>
                  <Text style={{ color: Colors.accent, fontSize: 18, fontWeight: '800', marginTop: 8 }}>Terminé !</Text>
                  <TouchableOpacity style={chSt.finBtn} onPress={handleFinished} activeOpacity={0.8}>
                    <Text style={chSt.finBtnTxt}>Recommencer</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={[chSt.clockTime, { color: isLow ? Colors.error : Colors.text }]}>
                    {mm > 0 ? `${mm}:${ss.toString().padStart(2, '0')}` : ss}
                  </Text>
                  <Text style={chSt.clockSub}>
                    {running ? 'en cours' : remaining === total ? 'prêt' : 'en pause'}
                  </Text>
                  <Text style={chSt.clockTotal}>/ {fmtRest(total)}</Text>
                </>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Adjust */}
        <View style={chSt.adjRow}>
          {[{ l: '−15s', d: -15 }, { l: '−30s', d: -30 }, { l: '+30s', d: 30 }, { l: '+1min', d: 60 }].map((b) => (
            <TouchableOpacity key={b.l} style={chSt.adjBtn} onPress={() => adjust(b.d)} activeOpacity={0.7}>
              <Text style={chSt.adjTxt}>{b.l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Controls */}
        <View style={chSt.ctrlRow}>
          <TouchableOpacity style={chSt.resetBtn} onPress={() => reset()} activeOpacity={0.7}>
            <Text style={chSt.resetTxt}>↺ Reset</Text>
          </TouchableOpacity>
          {!finished && (
            <TouchableOpacity
              style={[chSt.playBtn, running && chSt.pauseBtn]}
              onPress={running ? pause : play}
              activeOpacity={0.8}
            >
              <Text style={chSt.playTxt}>{running ? '⏸ Pause' : '▶ Démarrer'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Presets ── */}
      <View style={chSt.card}>
        <Text style={chSt.cardTitle}>⚡ Durées prédéfinies</Text>
        <View style={chSt.grid}>
          {PRESETS.map((p) => {
            const sel = p.seconds === total;
            return (
              <TouchableOpacity
                key={p.seconds}
                style={[chSt.chip, sel && chSt.chipSel]}
                onPress={() => selectPreset(p.seconds)}
                activeOpacity={0.7}
              >
                <Text style={[chSt.chipTxt, sel && chSt.chipTxtSel]}>{p.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── Mes chronomètres ── */}
      <View style={chSt.card}>
        <View style={chSt.cardHeader}>
          <Text style={chSt.cardTitle}>🔖 Mes chronomètres</Text>
          <TouchableOpacity style={chSt.createBtn} onPress={() => setShowCustom(true)} activeOpacity={0.7}>
            <Text style={chSt.createTxt}>+ Créer</Text>
          </TouchableOpacity>
        </View>
        {saved.length === 0 ? (
          <Text style={chSt.empty}>Aucun chronomètre sauvegardé.</Text>
        ) : saved.map((t) => {
          const sel = t.seconds === total;
          return (
            <View key={t.id} style={[chSt.savedRow, sel && chSt.savedRowSel]}>
              <TouchableOpacity
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}
                onPress={() => selectPreset(t.seconds)}
                activeOpacity={0.7}
              >
                <View style={[chSt.savedDot, sel && { backgroundColor: Colors.accent }]} />
                <View>
                  <Text style={[chSt.savedLabel, sel && { color: Colors.accent }]}>{t.label}</Text>
                  <Text style={chSt.savedDur}>{fmtRest(t.seconds)}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => Alert.alert('Supprimer ?', t.label, [
                  { text: 'Annuler', style: 'cancel' },
                  { text: 'Supprimer', style: 'destructive', onPress: () => setSaved((p) => p.filter((x) => x.id !== t.id)) },
                ])}
                style={{ padding: 8 }} activeOpacity={0.7}
              >
                <Text style={{ color: Colors.textMuted, fontSize: 14 }}>🗑</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {/* ── Historique ── */}
      {history.length > 0 && (
        <View style={chSt.card}>
          <Text style={chSt.cardTitle}>📋 Historique des repos</Text>
          {history.map((h, i) => (
            <View key={i} style={chSt.histRow}>
              <View style={chSt.histDot} />
              <Text style={chSt.histTxt}>Repos {h}</Text>
            </View>
          ))}
        </View>
      )}

      {/* ── Modal créer chrono ── */}
      <Modal visible={showCustom} transparent animationType="slide">
        <View style={cmSt.overlay}>
          <View style={cmSt.sheet}>
            <Text style={cmSt.title}>Créer un chronomètre</Text>
            <Text style={cmSt.fieldLbl}>Nom (optionnel)</Text>
            <TextInput
              style={cmSt.input}
              placeholder="Ex: Squat lourds, Isolation..."
              placeholderTextColor={Colors.textMuted}
              value={cLabel}
              onChangeText={setCLabel}
            />
            <Text style={cmSt.fieldLbl}>Durée</Text>
            <View style={cmSt.durRow}>
              <View style={cmSt.durField}>
                <TextInput style={cmSt.durInput} value={cMin} onChangeText={setCMin} keyboardType="number-pad" selectTextOnFocus />
                <Text style={cmSt.durUnit}>min</Text>
              </View>
              <Text style={cmSt.durSep}>:</Text>
              <View style={cmSt.durField}>
                <TextInput style={cmSt.durInput} value={cSec} onChangeText={(v) => setCSec(v.slice(0, 2))} keyboardType="number-pad" selectTextOnFocus />
                <Text style={cmSt.durUnit}>sec</Text>
              </View>
            </View>
            <Text style={[cmSt.fieldLbl, { marginTop: 8 }]}>Raccourcis</Text>
            <View style={cmSt.qGrid}>
              {[30, 45, 60, 90, 120, 150, 180, 240, 300].map((s) => (
                <TouchableOpacity
                  key={s} style={cmSt.qChip}
                  onPress={() => { setCMin(String(Math.floor(s / 60))); setCSec(String(s % 60).padStart(2, '0')); }}
                  activeOpacity={0.7}
                >
                  <Text style={cmSt.qTxt}>{fmtRest(s)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={cmSt.btns}>
              <TouchableOpacity style={cmSt.cancelBtn} onPress={() => setShowCustom(false)} activeOpacity={0.7}>
                <Text style={cmSt.cancelTxt}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={cmSt.saveBtn} onPress={saveCustom} activeOpacity={0.8}>
                <Text style={cmSt.saveTxt}>Créer & Lancer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const chSt = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingTop: 12 },
  clockCard: {
    backgroundColor: Colors.card, borderRadius: 24, padding: 20,
    marginBottom: 14, borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  clockTime: { fontSize: 62, fontWeight: '900', letterSpacing: -2 },
  clockSub: { color: Colors.textMuted, fontSize: 13, marginTop: 4 },
  clockTotal: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  finBtn: { marginTop: 12, backgroundColor: Colors.accent, borderRadius: 20, paddingHorizontal: 22, paddingVertical: 10 },
  finBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 14 },
  adjRow: { flexDirection: 'row', gap: 8, marginTop: 16, marginBottom: 14, width: '100%' },
  adjBtn: {
    flex: 1, backgroundColor: Colors.background, borderRadius: 10,
    paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  adjTxt: { color: Colors.textSecondary, fontSize: 13, fontWeight: '700' },
  ctrlRow: { flexDirection: 'row', gap: 10, width: '100%' },
  resetBtn: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  resetTxt: { color: Colors.textSecondary, fontSize: 15, fontWeight: '700' },
  playBtn: { flex: 1, backgroundColor: '#4C9FFF', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  pauseBtn: { backgroundColor: '#FFB800' },
  playTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
  card: { backgroundColor: Colors.card, borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: Colors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardTitle: { color: Colors.text, fontSize: 15, fontWeight: '700', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.background },
  chipSel: { borderColor: '#4C9FFF', backgroundColor: 'rgba(76,159,255,0.1)' },
  chipTxt: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  chipTxtSel: { color: '#4C9FFF', fontWeight: '800' },
  createBtn: { backgroundColor: Colors.accentMuted, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: Colors.accent },
  createTxt: { color: Colors.accent, fontSize: 13, fontWeight: '700' },
  empty: { color: Colors.textMuted, textAlign: 'center', paddingVertical: 14 },
  savedRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  savedRowSel: { backgroundColor: 'rgba(29,185,84,0.04)', borderRadius: 10, paddingHorizontal: 6 },
  savedDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.border },
  savedLabel: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  savedDur: { color: Colors.textMuted, fontSize: 12, marginTop: 1 },
  histRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  histDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent },
  histTxt: { color: Colors.textSecondary, fontSize: 13 },
});

const cmSt = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 },
  title: { color: Colors.text, fontSize: 20, fontWeight: '800', marginBottom: 18 },
  fieldLbl: { color: Colors.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase' },
  input: { backgroundColor: Colors.card, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: Colors.text, fontSize: 15, borderWidth: 1, borderColor: Colors.border, marginBottom: 16 },
  durRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  durField: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.card, borderRadius: 14, borderWidth: 1.5, borderColor: '#4C9FFF', paddingHorizontal: 16 },
  durInput: { flex: 1, fontSize: 30, fontWeight: '800', color: Colors.text, paddingVertical: 12 },
  durUnit: { color: Colors.textMuted, fontSize: 14 },
  durSep: { color: Colors.textMuted, fontSize: 28, fontWeight: '700' },
  qGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  qChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card },
  qTxt: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  btns: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  cancelTxt: { color: Colors.textSecondary, fontSize: 15, fontWeight: '600' },
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.accent, alignItems: 'center' },
  saveTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },
});

// ─── Séance Screen ────────────────────────────────────────────────────────────

export default function SeanceScreen() {
  const [tab, setTab] = useState<'seance' | 'chrono'>('seance');
  const [showAddEx, setShowAddEx] = useState(false);

  const {
    isActive, timerSeconds, workoutName, exercises,
    restTimerActive, restTimerSeconds, restTimerTotal,
    tickTimer, tickRestTimer, stopRestTimer, endWorkout, addExercise,
  } = useWorkoutStore();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isActive) timerRef.current = setInterval(tickTimer, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive]);

  useEffect(() => {
    if (restTimerActive) {
      restRef.current = setInterval(tickRestTimer, 1000);
    } else {
      if (restRef.current) clearInterval(restRef.current);
    }
    return () => { if (restRef.current) clearInterval(restRef.current); };
  }, [restTimerActive]);

  const totalSets = exercises.reduce((a, ex) => a + ex.sets.length, 0);
  const doneSets  = exercises.reduce((a, ex) => a + ex.sets.filter((s) => s.done).length, 0);
  const volume    = exercises.reduce((a, ex) => a + ex.sets.reduce((b, s) => b + (s.done ? s.weight * s.reps : 0), 0), 0);

  const handleFinish = () => {
    Alert.alert(
      'Terminer la séance ?',
      `${doneSets}/${totalSets} séries · ${fmt(timerSeconds)} · ${volume.toLocaleString('fr-FR')} kg`,
      [
        { text: 'Continuer', style: 'cancel' },
        { text: 'Terminer ✓', style: 'destructive', onPress: endWorkout },
      ]
    );
  };

  return (
    <SafeAreaView style={sc.safe} edges={['top']}>
      {/* Header */}
      <View style={sc.header}>
        <View style={{ flex: 1 }}>
          <Text style={sc.headerSub}>💪 Séance en cours</Text>
          <Text style={sc.workoutName} numberOfLines={1}>{workoutName}</Text>
        </View>
        <TouchableOpacity style={sc.finBtn} onPress={handleFinish} activeOpacity={0.8}>
          <Text style={sc.finBtnTxt}>Terminer</Text>
        </TouchableOpacity>
      </View>

      {/* Stats (Séries + Volume) */}
      <View style={sc.statsBar}>
        <View style={sc.stat}>
          <Text style={sc.statVal}>{doneSets}/{totalSets}</Text>
          <Text style={sc.statLbl}>Séries</Text>
        </View>
        <View style={sc.div} />
        <View style={sc.stat}>
          <Text style={sc.statVal}>{volume.toLocaleString('fr-FR')}</Text>
          <Text style={sc.statLbl}>Volume kg</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={sc.progTrack}>
        <View style={[sc.progFill, { width: totalSets > 0 ? `${(doneSets / totalSets) * 100}%` : '0%' }]} />
      </View>

      {/* Tabs */}
      <TabBar active={tab} onChange={setTab} />

      {/* Content */}
      {tab === 'seance' ? (
        <ScrollView
          style={sc.scroll}
          contentContainerStyle={sc.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {exercises.length === 0 ? (
            <View style={sc.emptyState}>
              <Text style={sc.emptyEmoji}>💪</Text>
              <Text style={sc.emptyTitle}>Aucun exercice</Text>
              <Text style={sc.emptySubtitle}>Ajoute un exercice pour commencer</Text>
            </View>
          ) : (
            exercises.map((ex) => <ExerciseCard key={ex.id} exercise={ex} />)
          )}

          <TouchableOpacity style={sc.addExBtn} onPress={() => setShowAddEx(true)} activeOpacity={0.7}>
            <Text style={sc.addExTxt}>➕  Ajouter un exercice</Text>
          </TouchableOpacity>

          <View style={{ height: 24 }} />
        </ScrollView>
      ) : (
        <ChronoTab />
      )}

      {/* Rest overlay */}
      {restTimerActive && tab === 'seance' && (
        <RestOverlay seconds={restTimerSeconds} total={restTimerTotal} onStop={stopRestTimer} />
      )}

      {/* Add exercise modal */}
      <AddExerciseModal
        visible={showAddEx}
        onAdd={(ex) => addExercise(ex)}
        onClose={() => setShowAddEx(false)}
      />
    </SafeAreaView>
  );
}

const sc = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerSub: { color: Colors.textSecondary, fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginBottom: 2 },
  workoutName: { color: Colors.text, fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  finBtn: {
    backgroundColor: 'rgba(255,76,76,0.12)', paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,76,76,0.35)', marginLeft: 12,
  },
  finBtnTxt: { color: Colors.error, fontSize: 14, fontWeight: '700' },
  statsBar: {
    flexDirection: 'row', backgroundColor: Colors.card,
    marginHorizontal: 16, marginTop: 8, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { color: Colors.text, fontSize: 17, fontWeight: '800', letterSpacing: -0.5 },
  statLbl: { color: Colors.textSecondary, fontSize: 10, marginTop: 2 },
  div: { width: 1, backgroundColor: Colors.border, marginHorizontal: 4 },
  progTrack: { height: 3, backgroundColor: Colors.border, marginHorizontal: 16, marginTop: 6, borderRadius: 2, overflow: 'hidden' },
  progFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 2 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8 },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyEmoji: { fontSize: 48, marginBottom: 8 },
  emptyTitle: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  emptySubtitle: { color: Colors.textMuted, fontSize: 14 },
  addExBtn: {
    backgroundColor: Colors.card, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', borderWidth: 1.5, borderColor: Colors.accent,
    borderStyle: 'dashed', marginBottom: 8,
  },
  addExTxt: { color: Colors.accent, fontSize: 15, fontWeight: '700' },
});
