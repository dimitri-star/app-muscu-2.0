import React, { useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
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
  const { isActive, workoutName, timerSeconds, exercises } = useWorkoutStore();
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const doneSets = exercises.reduce((acc, ex) => acc + ex.sets.filter((set) => set.done).length, 0);

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
        <Text style={s.activeTimer}>{formatTimer(timerSeconds)}</Text>
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

  useEffect(() => {
    checkAndResetDaily();
  }, []);

  return (
    <View style={s.waterCard}>
      <View style={s.waterTopRow}>
        <View style={s.waterAmountRow}>
          <Text style={s.waterAmount}>{current}</Text>
          <Text style={s.waterUnit}>ml</Text>
        </View>
        <Text style={s.waterGoal}>/ {goal} ml</Text>
      </View>
      <View style={s.waterTrack}>
        <View style={[s.waterFill, { width: `${Math.round(pct * 100)}%` as any }]} />
      </View>
      <View style={s.waterBtns}>
        {[250, 500, 750].map((a) => (
          <TouchableOpacity key={a} style={s.waterBtn} onPress={() => addWater(a)} activeOpacity={0.8}>
            <Text style={s.waterBtnText}>+{a} ml</Text>
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

  const goToSeance = () => router.push('/(tabs)/seance' as any);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <View style={s.header}>
        <Text style={s.appName}>FitTrack Pro</Text>
        <Text style={s.dateText}>{formatDate()}</Text>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.sectionTitle}>Performances</Text>
        <StreakBanner s={s} colors={colors} />

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
