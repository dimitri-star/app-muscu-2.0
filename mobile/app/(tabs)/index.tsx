import React, { useMemo, useEffect, useState, useReducer, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Modal,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../../store/theme';
import { getColors, type ThemeColors } from '../../constants/theme';
import { useWorkoutStore, useWaterStore, useGamificationStore, useProgramStore } from '../../store';
import { weeklyProgram, exercisesDB, type Exercise } from '../../constants/mockData';
import { PROGRAMME_API, SEANCES_API } from '../../constants/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimer(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}min`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function getTodayDayIndex(): number {
  const jsDay = new Date().getDay(); // 0 = Dimanche
  return jsDay === 0 ? 6 : jsDay - 1;
}

function formatDate(): string {
  const now = new Date();
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const months = ['jan', 'fév', 'mar', 'avr', 'mai', 'jun', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc'];
  return `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]}`;
}

function getWeekDaysFromMonday(): Date[] {
  const today = new Date();
  const jsDay = today.getDay(); // 0 = Sunday
  const diffToMonday = jsDay === 0 ? -6 : 1 - jsDay;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function toDateKey(d: Date): string {
  return d.toISOString().split('T')[0];
}

function parseProgramSets(setsStr: string): { numSets: number; reps: number } {
  const m = setsStr.match(/(\d+)\s*[x×]\s*(\d+)/i);
  if (!m) return { numSets: 3, reps: 8 };
  return { numSets: parseInt(m[1], 10), reps: parseInt(m[2], 10) };
}

function parseProgramRest(restStr: string): number {
  if (!restStr) return 120;
  const minRange = restStr.match(/(\d+)-(\d+)\s*min/i);
  if (minRange) return Math.round((parseInt(minRange[1], 10) + parseInt(minRange[2], 10)) / 2) * 60;
  const min = restStr.match(/(\d+)\s*min/i);
  if (min) return parseInt(min[1], 10) * 60;
  const sec = restStr.match(/(\d+)\s*s/i);
  if (sec) return parseInt(sec[1], 10);
  return 120;
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

function resolveExercise(name: string): Exercise {
  const lower = name.toLowerCase();
  const exact = exercisesDB.find((e) => e.name.toLowerCase() === lower);
  if (exact) return exact;
  const contains = exercisesDB.find((e) => lower.includes(e.name.toLowerCase()) || e.name.toLowerCase().includes(lower));
  if (contains) return contains;
  return {
    id: `custom_${Date.now()}_${Math.random()}`,
    name,
    muscleGroup: 'Autre',
    category: 'Compound',
    equipment: 'Autre',
  };
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    appName: { color: colors.text, fontSize: 22, fontWeight: '800' },
    dateText: { color: colors.textSecondary, fontSize: 13 },
    streakBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: colors.accentMuted,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    streakBadgeText: {
      color: colors.accent,
      fontSize: 15,
      fontWeight: '800',
    },
    streakFlame: {
      fontSize: 18,
    },
    scroll: { flex: 1 },
    content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 42 },
    topControls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    avatarBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.accentMuted,
      borderWidth: 1,
      borderColor: `${colors.accent}55`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarTxt: { color: colors.accent, fontSize: 18, fontWeight: '800' },
    periodWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 4,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 4,
    },
    periodBtn: {
      width: 44,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    periodBtnActive: {
      backgroundColor: colors.background,
    },
    periodTxt: { color: colors.textSecondary, fontSize: 16, fontWeight: '700' },
    periodTxtActive: { color: colors.text, fontWeight: '800' },
    menuBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    heroSessionCard: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    heroSessionTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    heroSessionTag: {
      backgroundColor: colors.accentMuted,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    heroSessionTagText: { color: colors.accent, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
    heroSessionTitle: { color: colors.text, fontSize: 24, fontWeight: '800', marginBottom: 3 },
    heroSessionSub: { color: colors.textSecondary, fontSize: 13, marginBottom: 10 },
    heroSessionExList: { gap: 4, marginBottom: 12 },
    heroSessionExText: { color: colors.text, fontSize: 13, fontWeight: '500' },
    heroSessionBtn: {
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 13,
      alignItems: 'center',
    },
    heroSessionBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
    weekStripCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    weekTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    weekTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
    weekSubtitle: { color: colors.textSecondary, fontSize: 12 },
    weekDaysRow: { flexDirection: 'row', justifyContent: 'space-between' },
    weekDayItem: { alignItems: 'center', width: 42 },
    weekDayLabel: { color: colors.textTertiary, fontSize: 10, fontWeight: '700', marginBottom: 6 },
    weekDayCircle: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.cardAlt,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    weekDayCircleDone: { backgroundColor: `${colors.accent}22` },
    weekDayCircleToday: { borderWidth: 1.5, borderColor: colors.accent },
    weekDayNum: { color: colors.text, fontSize: 12, fontWeight: '600' },
    weekDayNumDone: { color: colors.accent, fontWeight: '800' },
    weekDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.accent },
    weekDotHidden: { backgroundColor: 'transparent' },
    quickStatsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    quickStatCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 14,
      paddingVertical: 10,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    quickStreakRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
    quickFlame: { fontSize: 16, marginTop: 1 },
    quickStatValue: { color: colors.text, fontSize: 18, fontWeight: '800' },
    quickStatLabel: { color: colors.textSecondary, fontSize: 11, marginTop: 2, textAlign: 'center' },
    quickHydroCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    quickHydroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    quickHydroTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    quickHydroTitle: { color: colors.text, fontSize: 13, fontWeight: '700' },
    quickHydroValueRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    quickHydroValue: { color: colors.accent, fontSize: 13, fontWeight: '800' },
    quickHydroProgressTrack: {
      height: 8,
      borderRadius: 8,
      backgroundColor: colors.cardAlt,
      overflow: 'hidden',
      marginBottom: 10,
    },
    quickHydroProgressFill: { height: 8, borderRadius: 8, backgroundColor: colors.accent },
    quickHydroBtns: { flexDirection: 'row', gap: 8 },
    quickHydroBtn: {
      flex: 1,
      backgroundColor: colors.accentMuted,
      borderRadius: 10,
      paddingVertical: 10,
      alignItems: 'center',
    },
    quickHydroBtnText: { color: colors.accent, fontSize: 12, fontWeight: '700' },
    trendCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    trendWeekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    trendWeekDay: { color: colors.textSecondary, fontSize: 11, fontWeight: '700', width: 38, textAlign: 'center' },
    trendGraphRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 70 },
    trendBarWrap: { width: 38, alignItems: 'center', justifyContent: 'flex-end' },
    trendBar: { width: 18, borderRadius: 9, backgroundColor: colors.accent },
    sectionTitle: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 10,
      marginTop: 20,
    },

    // ── Séance active ──
    activeCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 18,
      borderLeftWidth: 3,
      borderLeftColor: colors.accent,
      borderWidth: 1,
      borderColor: colors.border,
    },
    activeTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
    activeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: colors.accentMuted,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    activeBadgeText: { color: colors.accent, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
    activeTimer: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
    activeWorkoutName: { color: colors.text, fontSize: 17, fontWeight: '700', marginBottom: 14 },
    activeStatsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
    activeStat: {
      flex: 1,
      backgroundColor: colors.cardAlt,
      borderRadius: 10,
      paddingVertical: 10,
      alignItems: 'center',
    },
    activeStatVal: { color: colors.text, fontSize: 20, fontWeight: '800' },
    activeStatLabel: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
    continueBtn: {
      backgroundColor: colors.accent,
      borderRadius: 10,
      paddingVertical: 13,
      alignItems: 'center',
    },
    continueBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

    // ── No active workout ──
    idleCard: { backgroundColor: colors.card, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: colors.border },
    idleTitle: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 4 },
    idleSub: { color: colors.textSecondary, fontSize: 13, marginBottom: 14 },
    startBtn: {
      backgroundColor: colors.accent,
      borderRadius: 10,
      paddingVertical: 13,
      alignItems: 'center',
    },
    startBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

    // ── Programme du jour ──
    programCard: { backgroundColor: colors.card, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: colors.border },
    programTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
    programBadge: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    programBadgeText: { fontSize: 14, fontWeight: '800' },
    programInfo: { flex: 1 },
    programLabel: { color: colors.text, fontSize: 15, fontWeight: '700' },
    programSub: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
    programExList: { gap: 3 },
    programEx: { color: colors.textSecondary, fontSize: 13 },
    programMore: { color: colors.accent, fontSize: 13, fontWeight: '600', marginTop: 4 },

    // ── Eau ──
    waterCard: { backgroundColor: colors.card, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: colors.border },
    waterTopRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 10 },
    waterAmountRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
    waterAmount: { color: colors.text, fontSize: 26, fontWeight: '800' },
    waterUnit: { color: colors.textSecondary, fontSize: 14 },
    waterGoal: { color: colors.textSecondary, fontSize: 13 },
    waterTrack: { height: 8, backgroundColor: colors.cardAlt, borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
    waterFill: { height: 8, borderRadius: 4, backgroundColor: colors.info },
    waterBtns: { flexDirection: 'row', gap: 8 },
    waterBtn: {
      flex: 1,
      backgroundColor: colors.cardAlt,
      borderRadius: 8,
      paddingVertical: 9,
      alignItems: 'center',
    },
    waterBtnText: { color: colors.text, fontSize: 13, fontWeight: '600' },

    // ── Streak banner ──
    streakBanner: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 20, padding: 16, gap: 0, borderWidth: 1, borderColor: colors.border },
    streakItem: { flex: 1, alignItems: 'center' },
    streakValue: { color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: 1 },
    streakLabel: { color: colors.textSecondary, fontSize: 11 },
    streakDivider: { width: StyleSheet.hairlineWidth, backgroundColor: colors.separator, marginVertical: 4 },

    // ── Dernière séance ──
    lastCard: { backgroundColor: colors.card, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: colors.border },
    lastDate: { color: colors.textSecondary, fontSize: 12, marginBottom: 4 },
    lastTitle: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 12 },
    lastMetaRow: { flexDirection: 'row', gap: 20 },
    lastMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    lastMetaText: { color: colors.textSecondary, fontSize: 13 },
  });
}

// ─── Streak Modal ─────────────────────────────────────────────────────────────

function StreakModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = getColors(isDark);
  const { workoutStreakWeeks, workoutStreakTarget, workoutsThisWeek, setStreakTarget } = useGamificationStore();
  const [showObjectives, setShowObjectives] = useState(false);
  const remaining = Math.max(0, workoutStreakTarget - workoutsThisWeek);
  const message =
    workoutStreakWeeks > 0
      ? remaining === 0
        ? 'Bravo ! Streak maintenu cette semaine ! 🎉'
        : `Plus que ${remaining} entraînement${remaining > 1 ? 's' : ''} pour maintenir ton streak !`
      : "Nouvelle semaine ! C'est le moment de s'y mettre.";

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={{
            backgroundColor: colors.accent,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 28,
            paddingTop: 16,
            paddingBottom: 48,
          }}
          onPress={() => {}}
        >
          {/* Handle */}
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.35)', alignSelf: 'center', marginBottom: 20 }} />

          {/* Close */}
          <TouchableOpacity onPress={onClose} style={{ position: 'absolute', top: 20, right: 24 }}>
            <Ionicons name="close" size={24} color="rgba(255,255,255,0.75)" />
          </TouchableOpacity>

          {/* Flame */}
          <Text style={{ fontSize: 72, textAlign: 'center', marginBottom: 4 }}>🔥</Text>

          {/* Count */}
          <Text style={{ fontSize: 72, fontWeight: '900', color: '#FFFFFF', textAlign: 'center', lineHeight: 72 }}>
            {workoutStreakWeeks}
          </Text>
          <Text style={{ fontSize: 20, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginBottom: 32, fontWeight: '600' }}>
            semaine{workoutStreakWeeks > 1 ? 's' : ''} de streak
          </Text>

          {/* Week progress circles */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 24 }}>
            {Array.from({ length: workoutStreakTarget }).map((_, i) => (
              <View
                key={i}
                style={{
                  width: 36, height: 36, borderRadius: 18,
                  backgroundColor: i < workoutsThisWeek ? '#FFFFFF' : 'rgba(255,255,255,0.25)',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                {i < workoutsThisWeek && <Ionicons name="checkmark" size={20} color={colors.accent} />}
              </View>
            ))}
          </View>
          <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: 4 }}>
            {workoutsThisWeek}/{workoutStreakTarget} séances cette semaine
          </Text>

          {/* Message */}
          <Text style={{ fontSize: 16, color: '#FFFFFF', textAlign: 'center', marginBottom: 28, marginTop: 8, fontWeight: '600' }}>
            {message}
          </Text>

          {/* Goals button / inline selector */}
          {!showObjectives ? (
            <TouchableOpacity
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 14, paddingVertical: 15, alignItems: 'center' }}
              onPress={() => setShowObjectives(true)}
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
                    onPress={() => { setStreakTarget(n); setShowObjectives(false); }}
                    activeOpacity={0.8}
                  >
                    <Text style={{ color: n === workoutStreakTarget ? colors.accent : '#FFFFFF', fontSize: 16, fontWeight: '800' }}>
                      {n}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity onPress={() => setShowObjectives(false)} style={{ alignItems: 'center', paddingVertical: 6 }}>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Annuler</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Components ───────────────────────────────────────────────────────────────

function ActiveWorkoutCard({
  s,
  colors,
  onPress,
}: {
  s: ReturnType<typeof getStyles>;
  colors: ThemeColors;
  onPress: () => void;
}) {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const { isActive, workoutName, workoutStartTime, exercises } = useWorkoutStore();
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const doneSets = exercises.reduce((acc, ex) => acc + ex.sets.filter((set) => set.done).length, 0);
  const elapsedSeconds = workoutStartTime ? Math.floor((Date.now() - workoutStartTime) / 1000) : 0;

  useEffect(() => {
    if (!isActive) return;
    const iv = setInterval(() => forceUpdate(), 1000);
    return () => clearInterval(iv);
  }, [isActive]);

  if (!isActive) {
    return (
      <View style={s.idleCard}>
        <Text style={s.idleTitle}>Prêt à s'entraîner ?</Text>
        <Text style={s.idleSub}>Aucune séance active pour le moment.</Text>
        <TouchableOpacity style={s.startBtn} onPress={onPress} activeOpacity={0.85}>
          <Text style={s.startBtnText}>Commencer une séance</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.activeCard}>
      <View style={s.activeTopRow}>
        <View style={s.activeBadge}>
          <Ionicons name="radio-button-on" size={9} color={colors.accent} />
          <Text style={s.activeBadgeText}>EN COURS</Text>
        </View>
        <Text style={s.activeTimer}>{formatTimer(elapsedSeconds)}</Text>
      </View>
      <Text style={s.activeWorkoutName}>{workoutName}</Text>
      <View style={s.activeStatsRow}>
        <View style={s.activeStat}>
          <Text style={s.activeStatVal}>{doneSets}</Text>
          <Text style={s.activeStatLabel}>Séries faites</Text>
        </View>
        <View style={s.activeStat}>
          <Text style={s.activeStatVal}>{totalSets - doneSets}</Text>
          <Text style={s.activeStatLabel}>Restantes</Text>
        </View>
        <View style={s.activeStat}>
          <Text style={s.activeStatVal}>{exercises.length}</Text>
          <Text style={s.activeStatLabel}>Exercices</Text>
        </View>
      </View>
      <TouchableOpacity style={s.continueBtn} onPress={onPress} activeOpacity={0.85}>
        <Text style={s.continueBtnText}>Continuer la séance</Text>
      </TouchableOpacity>
    </View>
  );
}

function ProgramDayCard({
  s,
  colors,
  onPress,
}: {
  s: ReturnType<typeof getStyles>;
  colors: ThemeColors;
  onPress: () => void;
}) {
  const dayIndex = getTodayDayIndex();
  const day = weeklyProgram[dayIndex];
  const isRest = day.type === 'rest';

  return (
    <TouchableOpacity style={s.programCard} onPress={onPress} activeOpacity={0.85}>
      <View style={s.programTop}>
        <View style={[s.programBadge, { backgroundColor: day.color + '33' }]}>
          <Text style={[s.programBadgeText, { color: day.color }]}>{day.shortDay}</Text>
        </View>
        <View style={s.programInfo}>
          <Text style={s.programLabel}>{day.label}</Text>
          <Text style={s.programSub}>
            {isRest ? 'Jour de repos' : `${day.exercises.length} exercices prévus`}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
      </View>
      {!isRest && (
        <View style={s.programExList}>
          {day.exercises.slice(0, 3).map((ex, i) => (
            <Text key={i} style={s.programEx}>• {ex}</Text>
          ))}
          {day.exercises.length > 3 && (
            <Text style={s.programMore}>+{day.exercises.length - 3} autres exercices</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

function WaterCard({
  s,
  colors,
}: {
  s: ReturnType<typeof getStyles>;
  colors: ThemeColors;
}) {
  const { current, goal, addWater, checkAndResetDaily } = useWaterStore();
  const pct = Math.min(current / goal, 1);

  const floatY = useRef(new Animated.Value(0)).current;
  const floatOpacity = useRef(new Animated.Value(0)).current;
  const [lastAdded, setLastAdded] = useState<number | null>(null);

  useEffect(() => {
    checkAndResetDaily();
  }, []);

  const handleAddWater = (amount: number) => {
    addWater(amount);
    setLastAdded(amount);
    floatY.setValue(0);
    floatOpacity.setValue(1);
    Animated.parallel([
      Animated.timing(floatY, { toValue: -56, duration: 1100, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(500),
        Animated.timing(floatOpacity, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
    ]).start();
  };

  return (
    <View style={[s.waterCard, { overflow: 'visible' }]}>
      {/* Floating animation */}
      {lastAdded !== null && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 8,
            alignSelf: 'center',
            zIndex: 20,
            opacity: floatOpacity,
            transform: [{ translateY: floatY }],
          }}
        >
          <Text style={{ color: colors.info, fontSize: 17, fontWeight: '800' }}>
            💧 +{lastAdded} ml
          </Text>
        </Animated.View>
      )}

      <View style={s.waterTopRow}>
        <View style={s.waterAmountRow}>
          <Text style={{ fontSize: 20 }}>💧</Text>
          <Text style={s.waterAmount}>{current}</Text>
          <Text style={s.waterUnit}>ml</Text>
        </View>
        <Text style={s.waterGoal}>/ {goal} ml 💧</Text>
      </View>
      <View style={s.waterTrack}>
        <View style={[s.waterFill, { width: `${Math.round(pct * 100)}%` as any }]} />
      </View>
      <View style={s.waterBtns}>
        {[250, 500, 750].map((a) => (
          <TouchableOpacity key={a} style={s.waterBtn} onPress={() => handleAddWater(a)} activeOpacity={0.8}>
            <Text style={s.waterBtnText}>💧 +{a} ml</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function LastWorkoutCard({
  s,
  colors,
}: {
  s: ReturnType<typeof getStyles>;
  colors: ThemeColors;
}) {
  const { savedWorkouts } = useWorkoutStore();
  const last = savedWorkouts[0];
  if (!last) return null;
  return (
    <View style={s.lastCard}>
      <Text style={s.lastDate}>
        {new Date(last.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}
      </Text>
      <Text style={s.lastTitle}>{last.name}</Text>
      <View style={s.lastMetaRow}>
        <View style={s.lastMeta}>
          <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
          <Text style={s.lastMetaText}>{last.duration} min</Text>
        </View>
        <View style={s.lastMeta}>
          <Ionicons name="barbell-outline" size={14} color={colors.textSecondary} />
          <Text style={s.lastMetaText}>{(last.totalVolume / 1000).toFixed(1)} t</Text>
        </View>
        <View style={s.lastMeta}>
          <Ionicons name="list-outline" size={14} color={colors.textSecondary} />
          <Text style={s.lastMetaText}>{last.exercises.length} exercices</Text>
        </View>
      </View>
    </View>
  );
}

function StreakBanner({ s, colors }: { s: ReturnType<typeof getStyles>; colors: ThemeColors }) {
  const { workoutStreakWeeks, waterStreakDays, totalXp, level } = useGamificationStore();
  return (
    <View style={s.streakBanner}>
      <View style={s.streakItem}>
        <Text style={s.streakValue}>{workoutStreakWeeks}</Text>
        <Text style={s.streakLabel}>sem. streak</Text>
      </View>
      <View style={s.streakDivider} />
      <View style={s.streakItem}>
        <Text style={s.streakValue}>{waterStreakDays}</Text>
        <Text style={s.streakLabel}>jours eau</Text>
      </View>
      <View style={s.streakDivider} />
      <View style={s.streakItem}>
        <Text style={s.streakValue}>{totalXp}</Text>
        <Text style={s.streakLabel}>{level}</Text>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = getColors(isDark);
  const s = useMemo(() => getStyles(colors), [isDark]);
  const router = useRouter();
  const { workoutStreakDays, checkAndResetWeekly } = useGamificationStore();
  const { checkStaleWorkout, savedWorkouts, clearExercises, startWorkout, addExercise, addExerciseFromProgram, syncSavedWorkoutsFromApi } = useWorkoutStore();
  const { fetchProgram } = useProgramStore();
  const { current: waterCurrent, goal: waterGoal, addWater, checkAndResetDaily } = useWaterStore();
  const [showStreak, setShowStreak] = useState(false);
  const [period, setPeriod] = useState<'J' | 'S' | 'M'>('J');
  const streakPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    checkAndResetWeekly();
    checkStaleWorkout();
    checkAndResetDaily();
    syncSavedWorkoutsFromApi(SEANCES_API);
  }, []);

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(streakPulse, { toValue: 1.18, duration: 700, useNativeDriver: true }),
        Animated.timing(streakPulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [streakPulse]);

  const goToSeance = async () => {
    await fetchProgram(PROGRAMME_API);
    const dayIndex = getTodayDayIndex();
    const webDay = useProgramStore.getState().program?.days[dayIndex];

    clearExercises();
    startWorkout();

    if (webDay && webDay.type !== 'rest' && webDay.exercises.length > 0) {
      webDay.exercises.forEach((ex) => {
        const exercise = resolveExercise(ex.name);
        const { numSets, reps } = resolveProgramPrescription(ex);
        const restTime = parseProgramRest(ex.rest);
        addExerciseFromProgram(exercise, numSets, reps, restTime, `${ex.sets} — repos ${ex.rest}`);
      });
    } else if (!isRestDay) {
      todayProgram.exercises.forEach((exName) => addExercise(resolveExercise(exName)));
    }

    router.push('/(tabs)/seance' as any);
  };
  const weekDays = getWeekDaysFromMonday();
  const todayKey = toDateKey(new Date());
  const workoutDateSet = new Set(savedWorkouts.map((w) => w.date.slice(0, 10)));
  const sessionsThisWeek = weekDays.filter((d) => workoutDateSet.has(toDateKey(d))).length;
  const avgDuration = savedWorkouts.length
    ? Math.round(savedWorkouts.reduce((acc, w) => acc + w.duration, 0) / savedWorkouts.length)
    : 0;
  const dayShortLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const todayWorkouts = savedWorkouts.filter((w) => w.date.slice(0, 10) === todayKey);
  const todayMinutes = todayWorkouts.reduce((acc, w) => acc + w.duration, 0);
  const weekMinutes = savedWorkouts
    .filter((w) => weekDays.some((d) => toDateKey(d) === w.date.slice(0, 10)))
    .reduce((acc, w) => acc + w.duration, 0);
  const monthCutoff = new Date();
  monthCutoff.setDate(monthCutoff.getDate() - 30);
  const monthMinutes = savedWorkouts
    .filter((w) => new Date(w.date) >= monthCutoff)
    .reduce((acc, w) => acc + w.duration, 0);
  const targetByPeriod = { J: 60, S: 300, M: 1200 };
  const valueByPeriod = { J: todayMinutes, S: weekMinutes, M: monthMinutes };
  const todayProgram = weeklyProgram[getTodayDayIndex()];
  const isRestDay = todayProgram.type === 'rest';
  const trendValuesWeek = weekDays.map((d) => {
    const key = toDateKey(d);
    return savedWorkouts
      .filter((w) => w.date.slice(0, 10) === key)
      .reduce((acc, w) => acc + w.duration, 0);
  });
  // J: cumulative weekly completion (graph rises when sessions are done)
  const trendValuesDay = weekDays.map((_, i) => {
    let doneCount = 0;
    for (let j = 0; j <= i; j += 1) {
      if (workoutDateSet.has(toDateKey(weekDays[j]))) doneCount += 1;
    }
    return doneCount;
  });
  const trendValuesMonth = Array.from({ length: 7 }, (_, i) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - ((6 - i) * 4));
    return savedWorkouts
      .filter((w) => new Date(w.date) >= cutoff)
      .reduce((acc, w) => acc + w.duration, 0);
  });
  const trendValues = period === 'J' ? trendValuesDay : period === 'S' ? trendValuesWeek : trendValuesMonth;
  const maxTrend = Math.max(...trendValues, 1);
  const sessionsByPeriod = {
    J: todayWorkouts.length,
    S: sessionsThisWeek,
    M: savedWorkouts.filter((w) => new Date(w.date) >= monthCutoff).length,
  };
  const durationByPeriod = {
    J: todayMinutes,
    S: weekMinutes,
    M: monthMinutes,
  };
  const hydrationByPeriod = {
    J: (waterCurrent / 1000).toFixed(1),
    S: ((waterCurrent * 7) / 1000).toFixed(1),
    M: ((waterCurrent * 30) / 1000).toFixed(1),
  };
  const hydroPct = Math.min(1, Math.max(0, waterGoal > 0 ? waterCurrent / waterGoal : 0));
  const trendLabels = dayShortLabels;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <View style={s.header} />
      <StreakModal visible={showStreak} onClose={() => setShowStreak(false)} />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.topControls}>
          <TouchableOpacity
            style={s.avatarBtn}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/profil' as any)}
          >
            <Text style={s.avatarTxt}>DA</Text>
          </TouchableOpacity>
          <View style={s.periodWrap}>
            {(['J', 'S', 'M'] as const).map((p) => {
              const active = period === p;
              return (
                <TouchableOpacity
                  key={p}
                  style={[s.periodBtn, active && s.periodBtnActive]}
                  activeOpacity={0.8}
                  onPress={() => setPeriod(p)}
                >
                  <Text style={[s.periodTxt, active && s.periodTxtActive]}>{p}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity style={s.menuBtn} activeOpacity={0.8} onPress={() => setShowStreak(true)}>
            <Ionicons name="ellipsis-horizontal" size={20} color={colors.accent} />
          </TouchableOpacity>
        </View>

        <View style={s.heroSessionCard}>
          <View style={s.heroSessionTop}>
            <View style={s.heroSessionTag}>
              <Text style={s.heroSessionTagText}>SEANCE DU JOUR</Text>
            </View>
            <Ionicons name="barbell-outline" size={18} color={colors.accent} />
          </View>
          <Text style={s.heroSessionTitle}>{todayProgram.label}</Text>
          <Text style={s.heroSessionSub}>
            {isRestDay ? 'Jour de recuperation' : `${todayProgram.exercises.length} exercices prevus`}
          </Text>
          {!isRestDay && (
            <View style={s.heroSessionExList}>
              {todayProgram.exercises.slice(0, 3).map((ex, i) => (
                <Text key={i} style={s.heroSessionExText}>• {ex}</Text>
              ))}
            </View>
          )}
          <TouchableOpacity style={s.heroSessionBtn} activeOpacity={0.85} onPress={goToSeance}>
            <Text style={s.heroSessionBtnText}>Commencer la seance</Text>
          </TouchableOpacity>
        </View>

        <View style={s.quickStatsRow}>
          <View style={s.quickStatCard}>
            <View style={s.quickStreakRow}>
              <Animated.Text style={[s.quickFlame, { transform: [{ scale: streakPulse }] }]}>🔥</Animated.Text>
              <Text style={s.quickStatValue}>{workoutStreakDays}</Text>
            </View>
            <Text style={s.quickStatLabel}>Streak</Text>
          </View>
          <View style={s.quickStatCard}>
            <Text style={s.quickStatValue}>{hydrationByPeriod[period]}L</Text>
            <Text style={s.quickStatLabel}>Hydratation {period}</Text>
          </View>
          <View style={s.quickStatCard}>
            <Text style={s.quickStatValue}>{durationByPeriod[period]} min</Text>
            <Text style={s.quickStatLabel}>Duree {period}</Text>
          </View>
          <View style={s.quickStatCard}>
            <Text style={s.quickStatValue}>{sessionsByPeriod[period]}</Text>
            <Text style={s.quickStatLabel}>Seances {period}</Text>
          </View>
        </View>

        <View style={s.quickHydroCard}>
          <View style={s.quickHydroTop}>
            <View style={s.quickHydroTitleRow}>
              <Ionicons name="water" size={15} color={colors.accent} />
              <Text style={s.quickHydroTitle}>Hydratation rapide</Text>
            </View>
            <View style={s.quickHydroValueRow}>
              <Text style={s.quickHydroValue}>
                {(waterCurrent / 1000).toFixed(1)}L / {(waterGoal / 1000).toFixed(1)}L
              </Text>
            </View>
          </View>
          <View style={s.quickHydroProgressTrack}>
            <View style={[s.quickHydroProgressFill, { width: `${Math.round(hydroPct * 100)}%` }]} />
          </View>
          <View style={s.quickHydroBtns}>
            {[250, 500, 750].map((amount) => (
              <TouchableOpacity
                key={amount}
                style={s.quickHydroBtn}
                activeOpacity={0.85}
                onPress={() => addWater(amount)}
              >
                <Text style={s.quickHydroBtnText}>💧 +{amount} ml</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={s.weekStripCard}>
          <View style={s.weekTitleRow}>
            <Text style={s.weekTitle}>Validation semaine</Text>
            <Text style={s.weekSubtitle}>{formatDate()}</Text>
          </View>
          <View style={s.weekDaysRow}>
            {weekDays.map((day, i) => {
              const key = toDateKey(day);
              const isDone = workoutDateSet.has(key);
              const isToday = key === todayKey;
              return (
                <View key={key} style={s.weekDayItem}>
                  <Text style={s.weekDayLabel}>{dayShortLabels[i]}</Text>
                  <View style={[s.weekDayCircle, isDone && s.weekDayCircleDone, isToday && s.weekDayCircleToday]}>
                    <Text style={[s.weekDayNum, isDone && s.weekDayNumDone]}>{day.getDate()}</Text>
                  </View>
                  <View style={[s.weekDot, !isDone && s.weekDotHidden]} />
                </View>
              );
            })}
          </View>
        </View>

        <View style={s.trendCard}>
          <View style={s.trendWeekRow}>
            {trendLabels.map((d, i) => (
              <Text key={i} style={s.trendWeekDay}>{d}</Text>
            ))}
          </View>
          <View style={s.trendGraphRow}>
            {trendValues.map((v, i) => (
              <View key={i} style={s.trendBarWrap}>
                <View
                  style={[
                    s.trendBar,
                    {
                      height: Math.max(8, Math.round((v / maxTrend) * 54)),
                      backgroundColor:
                        period === 'J'
                          ? workoutDateSet.has(toDateKey(weekDays[i]))
                            ? colors.accent
                            : colors.cardAlt
                          : colors.accent,
                    },
                  ]}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
