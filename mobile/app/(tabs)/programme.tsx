import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { useThemeStore } from '../../store/theme';
import { getColors } from '../../constants/theme';
import { useProgramStore, useWorkoutStore, type ProgramDay, type DayType } from '../../store/index';
import { PROGRAMME_API } from '../../constants/api';

const { width: SW } = Dimensions.get('window');

// ─── Constants ────────────────────────────────────────────────────────────────

const DAY_LABELS: Record<DayType, string> = {
  push: 'Push',
  pull: 'Pull',
  legs: 'Legs',
  rest: 'Repos',
  cardio: 'Cardio',
  full: 'Full',
};

const DAY_EMOJIS: Record<DayType, string> = {
  push: '🏋️',
  pull: '💪',
  legs: '🦵',
  rest: '😴',
  cardio: '🏃',
  full: '⚡',
};

// ─── Progress Ring ─────────────────────────────────────────────────────────────

function ProgressRing({
  pct,
  size = 88,
  stroke = 8,
  color,
}: {
  pct: number;
  size?: number;
  stroke?: number;
  color: string;
}) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = getColors(isDark);
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={colors.border}
        strokeWidth={stroke}
        fill="none"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={`${circ}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ─── Day Pill ─────────────────────────────────────────────────────────────────

function getPillStyles(colors: ReturnType<typeof getColors>) {
  return StyleSheet.create({
    wrap: {
      alignItems: 'center',
      paddingTop: 10,
      paddingBottom: 8,
      paddingHorizontal: 8,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: colors.border,
      minWidth: 52,
      gap: 6,
      position: 'relative',
    },
    wrapToday: {
      borderStyle: 'dashed',
      borderColor: colors.textSecondary,
    },
    todayDot: {
      position: 'absolute',
      top: 5,
      right: 5,
      width: 5,
      height: 5,
      borderRadius: 2.5,
    },
    day: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: '800',
    },
    labelWrap: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    label: {
      fontSize: 9,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
  });
}

function DayPill({
  shortDay,
  label,
  isSelected,
  isToday,
  type,
  color,
  onPress,
}: {
  shortDay: string;
  label: string;
  isSelected: boolean;
  isToday: boolean;
  type: DayType;
  color: string;
  onPress: () => void;
}) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = getColors(isDark);
  const pill = getPillStyles(colors);
  const isRest = type === 'rest';
  const displayColor = isRest ? colors.textMuted : color;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        pill.wrap,
        isSelected && { backgroundColor: `${displayColor}18`, borderColor: displayColor },
        isToday && !isSelected && pill.wrapToday,
      ]}
    >
      {isToday && (
        <View style={[pill.todayDot, { backgroundColor: displayColor }]} />
      )}
      <Text style={[pill.day, isSelected && { color: displayColor }]}>{shortDay}</Text>
      <View
        style={[
          pill.labelWrap,
          { backgroundColor: isSelected ? `${displayColor}25` : colors.cardElevated },
        ]}
      >
        <Text style={[pill.label, { color: isSelected ? displayColor : colors.textMuted }]}>
          {DAY_LABELS[type]}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Day Banner ───────────────────────────────────────────────────────────────

function getDetailStyles(colors: ReturnType<typeof getColors>) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 20,
      marginBottom: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 16,
      paddingLeft: 20,
      position: 'relative',
    },
    bannerAccent: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
      borderTopLeftRadius: 20,
    },
    bannerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    bannerEmoji: {
      fontSize: 28,
    },
    bannerType: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1.5,
      marginBottom: 1,
    },
    bannerDay: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '800',
      letterSpacing: -0.3,
    },
    bannerLabel: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 1,
    },
    startBtn: {
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 12,
      flexShrink: 0,
    },
    startBtnText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '800',
    },
    body: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 16,
      gap: 10,
    },
    restWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 8,
    },
    restEmoji: {
      fontSize: 28,
    },
    restTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '700',
    },
    restSub: {
      color: colors.textMuted,
      fontSize: 12,
      marginTop: 2,
    },
    exRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      paddingVertical: 2,
    },
    exNum: {
      width: 30,
      height: 30,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      marginTop: 2,
    },
    exNumText: {
      fontSize: 12,
      fontWeight: '800',
    },
    exBody: {
      flex: 1,
      gap: 5,
    },
    exName: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    exChips: {
      flexDirection: 'row',
      gap: 6,
    },
    chip: {
      paddingHorizontal: 9,
      paddingVertical: 3,
      borderRadius: 6,
    },
    chipText: {
      fontSize: 11,
      fontWeight: '800',
    },
    chipRest: {
      paddingHorizontal: 9,
      paddingVertical: 3,
      borderRadius: 6,
      backgroundColor: colors.cardElevated,
    },
    chipRestText: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: '600',
    },
  });
}

function DayDetail({ program }: { program: ProgramDay }) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = getColors(isDark);
  const detail = getDetailStyles(colors);
  const isRest = program.type === 'rest';
  const color = program.color;

  return (
    <View style={detail.card}>
      {/* Colored banner top */}
      <View style={[detail.banner, { backgroundColor: `${color}18` }]}>
        <View style={[detail.bannerAccent, { backgroundColor: color }]} />
        <View style={detail.bannerLeft}>
          <Text style={detail.bannerEmoji}>{DAY_EMOJIS[program.type]}</Text>
          <View>
            <Text style={[detail.bannerType, { color }]}>
              {DAY_LABELS[program.type].toUpperCase()}
            </Text>
            <Text style={detail.bannerDay}>{program.day}</Text>
            <Text style={detail.bannerLabel}>{program.label}</Text>
          </View>
        </View>
        {!isRest && (
          <TouchableOpacity
            style={[detail.startBtn, { backgroundColor: color }]}
            activeOpacity={0.85}
          >
            <Text style={detail.startBtnText}>Démarrer ›</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Exercise list */}
      <View style={detail.body}>
        {program.exercises.length === 0 ? (
          <View style={detail.restWrap}>
            <Text style={detail.restEmoji}>🛌</Text>
            <View>
              <Text style={detail.restTitle}>Repos complet</Text>
              <Text style={detail.restSub}>Récupération · Nutrition · Sommeil</Text>
            </View>
          </View>
        ) : (
          program.exercises.map((ex, i) => (
            <View key={ex.id} style={detail.exRow}>
              <View style={[detail.exNum, { backgroundColor: `${color}15` }]}>
                <Text style={[detail.exNumText, { color }]}>{i + 1}</Text>
              </View>
              <View style={detail.exBody}>
                <Text style={detail.exName}>{ex.name}</Text>
                <View style={detail.exChips}>
                  <View style={[detail.chip, { backgroundColor: `${color}15` }]}>
                    <Text style={[detail.chipText, { color }]}>{ex.sets}</Text>
                  </View>
                  <View style={detail.chipRest}>
                    <Text style={detail.chipRestText}>⏱ {ex.rest}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
}


// ─── Week Row ─────────────────────────────────────────────────────────────────

function getWeekRowStyles(colors: ReturnType<typeof getColors>) {
  return StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      alignItems: 'stretch',
      backgroundColor: colors.card,
      borderRadius: 14,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    stripe: {
      width: 4,
      borderTopLeftRadius: 14,
      borderBottomLeftRadius: 14,
    },
    inner: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 12,
      gap: 12,
    },
    dayBox: {
      width: 44,
      height: 44,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    dayText: {
      fontSize: 13,
      fontWeight: '800',
    },
    todayDot: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 5,
      height: 5,
      borderRadius: 2.5,
    },
    info: {
      flex: 1,
    },
    label: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
    },
    sub: {
      color: colors.textMuted,
      fontSize: 12,
      marginTop: 2,
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
  });
}

function WeekRow({
  day,
  index,
  isSelected,
  isToday,
  onPress,
}: {
  day: ProgramDay;
  index: number;
  isSelected: boolean;
  isToday: boolean;
  onPress: () => void;
}) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = getColors(isDark);
  const weekRow = getWeekRowStyles(colors);
  const isRest = day.type === 'rest';
  const color = isRest ? colors.textMuted : day.color;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        weekRow.wrap,
        isSelected && { borderColor: color, backgroundColor: `${color}07` },
      ]}
    >
      {/* Color stripe */}
      <View style={[weekRow.stripe, { backgroundColor: color }]} />

      <View style={weekRow.inner}>
        {/* Day box */}
        <View style={[weekRow.dayBox, { backgroundColor: `${color}15` }]}>
          <Text style={[weekRow.dayText, { color }]}>{day.shortDay}</Text>
          {isToday && <View style={[weekRow.todayDot, { backgroundColor: color }]} />}
        </View>

        {/* Info */}
        <View style={weekRow.info}>
          <Text style={weekRow.label}>{day.label}</Text>
          <Text style={weekRow.sub}>
            {day.exercises.length} {isRest ? 'activité' : 'exercice'}
            {day.exercises.length > 1 ? 's' : ''}
          </Text>
        </View>

        {/* Type badge */}
        <View style={[weekRow.badge, { backgroundColor: `${color}15` }]}>
          <Text style={[weekRow.badgeText, { color }]}>
            {DAY_LABELS[day.type]}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}


// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ProgrammeScreen() {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = getColors(isDark);
  const s = getScreenStyles(colors);
  const todayIndex = new Date().getDay();
  const adjustedToday = todayIndex === 0 ? 6 : todayIndex - 1;
  const [selectedDay, setSelectedDay] = useState(adjustedToday);
  const [refreshing, setRefreshing] = useState(false);

  const { program, isLoading, lastSynced, syncError, fetchProgram } = useProgramStore();
  const { savedWorkouts } = useWorkoutStore();

  useFocusEffect(
    useCallback(() => {
      fetchProgram(PROGRAMME_API);
    }, [fetchProgram])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProgram(PROGRAMME_API);
    setRefreshing(false);
  }, [fetchProgram]);

  const days = program?.days ?? [];
  const selectedProgram = days[Math.min(selectedDay, days.length - 1)];
  const pct = program ? Math.round((program.currentWeek / program.weeks) * 100) : 0;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <Text style={s.title}>Programme</Text>
          <View style={s.headerRight}>
            {isLoading && !refreshing && (
              <ActivityIndicator size="small" color={colors.accent} />
            )}
            {lastSynced && !syncError ? (
              <View style={s.syncBadge}>
                <View style={s.syncDot} />
                <Text style={s.syncText}>Synchro {lastSynced}</Text>
              </View>
            ) : syncError ? (
              <View style={[s.syncBadge, s.syncError]}>
                <Text style={[s.syncText, { color: colors.error }]}>Hors ligne</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* ── Program Hero Card ── */}
        {program ? (
          <View style={s.heroCard}>
            {/* Left: info */}
            <View style={s.heroLeft}>
              <View style={s.heroBadge}>
                <Text style={s.heroBadgeText}>● ACTIF</Text>
              </View>
              <Text style={s.heroName}>{program.name}</Text>
              <Text style={s.heroDesc}>{program.frequency} · {program.focus}</Text>

              <View style={s.heroStats}>
                <View style={s.heroStat}>
                  <Text style={s.heroStatVal}>{program.weeks}</Text>
                  <Text style={s.heroStatLbl}>semaines</Text>
                </View>
                <View style={s.heroStatDivider} />
                <View style={s.heroStat}>
                  <Text style={s.heroStatVal}>{program.currentWeek}</Text>
                  <Text style={s.heroStatLbl}>en cours</Text>
                </View>
                <View style={s.heroStatDivider} />
                <View style={s.heroStat}>
                  <Text style={[s.heroStatVal, { color: colors.accent }]}>S{program.currentWeek}</Text>
                  <Text style={s.heroStatLbl}>semaine</Text>
                </View>
              </View>
            </View>

            {/* Right: circular progress */}
            <View style={s.heroRing}>
              <ProgressRing pct={pct} size={90} stroke={7} color={colors.accent} />
              <View style={s.ringLabel}>
                <Text style={s.ringPct}>{pct}%</Text>
                <Text style={s.ringLbl}>done</Text>
              </View>
            </View>
          </View>
        ) : isLoading ? (
          <View style={s.loadingCard}>
            <ActivityIndicator color={colors.accent} />
            <Text style={s.loadingText}>Chargement...</Text>
          </View>
        ) : syncError ? (
          <View style={s.errorCard}>
            <Text style={s.errorEmoji}>📡</Text>
            <Text style={s.errorTitle}>Serveur web non disponible</Text>
            <Text style={s.errorSub}>
              Lance l'app web puis tire vers le bas pour synchroniser.
            </Text>
            <TouchableOpacity style={s.retryBtn} onPress={onRefresh}>
              <Text style={s.retryText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* ── Day Selector ── */}
        {days.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Semaine en cours</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.pillRow}
            >
              {days.map((day, i) => (
                <DayPill
                  key={day.id}
                  shortDay={day.shortDay}
                  label={day.label}
                  isSelected={selectedDay === i}
                  isToday={adjustedToday === i}
                  type={day.type}
                  color={day.color}
                  onPress={() => setSelectedDay(i)}
                />
              ))}
            </ScrollView>

            {/* ── Selected Day Detail ── */}
            {selectedProgram && <DayDetail program={selectedProgram} />}

            {/* ── Week Overview ── */}
            <Text style={s.sectionTitle}>Vue d'ensemble</Text>
            {days.map((day, i) => (
              <WeekRow
                key={day.id}
                day={day}
                index={i}
                isSelected={selectedDay === i}
                isToday={adjustedToday === i}
                onPress={() => setSelectedDay(i)}
              />
            ))}
          </>
        )}

        {/* ── Recent Sessions ── */}
        <Text style={[s.sectionTitle, { marginTop: 8 }]}>Séances récentes</Text>
        {savedWorkouts.slice(0, 3).map((workout, i) => {
          const sessionColors = [colors.accent, '#17A94D', '#139143'];
          const c = sessionColors[i % sessionColors.length];
          return (
            <View key={workout.id} style={[s.sessionCard, { borderLeftColor: c }]}>
              <View style={s.sessionLeft}>
                <Text style={s.sessionName}>{workout.name}</Text>
                <Text style={s.sessionDate}>
                  {new Date(workout.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </Text>
              </View>
              <View style={[s.sessionBadge, { backgroundColor: `${c}15` }]}>
                <Text style={[s.sessionDur, { color: c }]}>{workout.duration}</Text>
                <Text style={[s.sessionDurLbl, { color: c }]}>min</Text>
              </View>
            </View>
          );
        })}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Main Styles ──────────────────────────────────────────────────────────────

function getScreenStyles(colors: ReturnType<typeof getColors>) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    content: { paddingHorizontal: 16, paddingTop: 8 },

    // Header
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      paddingTop: 8,
    },
    title: {
      color: colors.text,
      fontSize: 28,
      fontWeight: '800',
      letterSpacing: -0.5,
    },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    syncBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
      backgroundColor: colors.accentMuted,
    },
    syncError: { backgroundColor: 'rgba(255,76,76,0.1)' },
    syncDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.accent,
    },
    syncText: { color: colors.accent, fontSize: 11, fontWeight: '700' },

    // Hero card
    heroCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
    },
    heroLeft: { flex: 1 },
    heroBadge: {
      alignSelf: 'flex-start',
      backgroundColor: colors.accentMuted,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      marginBottom: 10,
    },
    heroBadgeText: {
      color: colors.accent,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1.5,
    },
    heroName: {
      color: colors.text,
      fontSize: 17,
      fontWeight: '800',
      letterSpacing: -0.3,
      marginBottom: 4,
    },
    heroDesc: {
      color: colors.textSecondary,
      fontSize: 12,
      marginBottom: 16,
    },
    heroStats: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    heroStat: { alignItems: 'center' },
    heroStatVal: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '800',
    },
    heroStatLbl: {
      color: colors.textMuted,
      fontSize: 10,
      marginTop: 1,
    },
    heroStatDivider: {
      width: 1,
      height: 28,
      backgroundColor: colors.border,
    },
    heroRing: {
      width: 90,
      height: 90,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 12,
    },
    ringLabel: {
      position: 'absolute',
      alignItems: 'center',
    },
    ringPct: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '800',
    },
    ringLbl: {
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: '600',
      letterSpacing: 0.5,
    },

    // Loading / Error
    loadingCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 40,
      marginBottom: 24,
      alignItems: 'center',
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    loadingText: { color: colors.textSecondary, fontSize: 14 },
    errorCard: {
      backgroundColor: 'rgba(255,76,76,0.05)',
      borderRadius: 20,
      padding: 28,
      marginBottom: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,76,76,0.15)',
    },
    errorEmoji: { fontSize: 32, marginBottom: 10 },
    errorTitle: {
      color: colors.error,
      fontSize: 16,
      fontWeight: '800',
      marginBottom: 6,
    },
    errorSub: {
      color: colors.textSecondary,
      fontSize: 13,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 16,
    },
    retryBtn: {
      paddingHorizontal: 22,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: colors.accentMuted,
    },
    retryText: { color: colors.accent, fontSize: 13, fontWeight: '800' },

    // Section title
    sectionTitle: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      marginBottom: 12,
    },

    // Day pills row
    pillRow: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 2,
      marginBottom: 16,
    },

    // Recent sessions
    sessionCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 14,
      paddingLeft: 16,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
      borderLeftWidth: 3,
    },
    sessionLeft: { flex: 1 },
    sessionName: { color: colors.text, fontSize: 14, fontWeight: '700' },
    sessionDate: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 3,
      textTransform: 'capitalize',
    },
    sessionBadge: {
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
    },
    sessionDur: { fontSize: 18, fontWeight: '800' },
    sessionDurLbl: { fontSize: 10, fontWeight: '600', marginTop: 1 },
  });
}
