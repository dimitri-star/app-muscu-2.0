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
import { useWorkoutStore, useWaterStore, useGamificationStore } from '../../store';
import { weeklyProgram } from '../../constants/mockData';

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
      backgroundColor: 'rgba(255, 107, 53, 0.12)',
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    streakBadgeText: {
      color: '#FF6B35',
      fontSize: 15,
      fontWeight: '800',
    },
    streakFlame: {
      fontSize: 18,
    },
    scroll: { flex: 1 },
    content: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 32 },
    sectionTitle: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 10,
      marginTop: 24,
    },

    // ── Séance active ──
    activeCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      borderLeftWidth: 3,
      borderLeftColor: colors.accent,
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
    idleCard: { backgroundColor: colors.card, borderRadius: 16, padding: 16 },
    idleTitle: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 4 },
    idleSub: { color: colors.textSecondary, fontSize: 13, marginBottom: 14 },
    startBtn: {
      backgroundColor: colors.text,
      borderRadius: 10,
      paddingVertical: 13,
      alignItems: 'center',
    },
    startBtnText: { color: colors.background, fontSize: 14, fontWeight: '700' },

    // ── Programme du jour ──
    programCard: { backgroundColor: colors.card, borderRadius: 16, padding: 16 },
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
    waterCard: { backgroundColor: colors.card, borderRadius: 16, padding: 16 },
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
    streakBanner: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 16, padding: 14, gap: 0 },
    streakItem: { flex: 1, alignItems: 'center' },
    streakValue: { color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: 1 },
    streakLabel: { color: colors.textSecondary, fontSize: 11 },
    streakDivider: { width: StyleSheet.hairlineWidth, backgroundColor: colors.separator, marginVertical: 4 },

    // ── Dernière séance ──
    lastCard: { backgroundColor: colors.card, borderRadius: 16, padding: 16 },
    lastDate: { color: colors.textSecondary, fontSize: 12, marginBottom: 4 },
    lastTitle: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 12 },
    lastMetaRow: { flexDirection: 'row', gap: 20 },
    lastMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    lastMetaText: { color: colors.textSecondary, fontSize: 13 },
  });
}

// ─── Streak Modal ─────────────────────────────────────────────────────────────

function StreakModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
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
            backgroundColor: '#E8511A',
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
                {i < workoutsThisWeek && <Ionicons name="checkmark" size={20} color="#E8511A" />}
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
                    <Text style={{ color: n === workoutStreakTarget ? '#E8511A' : '#FFFFFF', fontSize: 16, fontWeight: '800' }}>
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
  const { checkStaleWorkout } = useWorkoutStore();
  const [showStreak, setShowStreak] = useState(false);

  useEffect(() => {
    checkAndResetWeekly();
    checkStaleWorkout();
  }, []);

  const goToSeance = () => router.push('/(tabs)/seance' as any);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <View style={s.header}>
        <Text style={s.appName}>FitTrack Pro</Text>
        <TouchableOpacity style={s.streakBadge} onPress={() => setShowStreak(true)} activeOpacity={0.8}>
          <Text style={s.streakFlame}>🔥</Text>
          <Text style={s.streakBadgeText}>{workoutStreakDays}</Text>
        </TouchableOpacity>
      </View>
      <StreakModal visible={showStreak} onClose={() => setShowStreak(false)} />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.sectionTitle}>Séance</Text>
        <ActiveWorkoutCard s={s} colors={colors} onPress={goToSeance} />

        <Text style={s.sectionTitle}>Programme du jour</Text>
        <ProgramDayCard s={s} colors={colors} onPress={goToSeance} />

        <Text style={s.sectionTitle}>Hydratation</Text>
        <WaterCard s={s} colors={colors} />

        <Text style={s.sectionTitle}>Dernière séance</Text>
        <LastWorkoutCard s={s} colors={colors} />

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
