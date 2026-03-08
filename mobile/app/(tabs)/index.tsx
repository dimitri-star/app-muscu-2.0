import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import Colors, { MacroColors } from '../../constants/colors';
import { useWaterStore, useNutritionStore } from '../../store';
import { recentWorkouts } from '../../constants/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Water Gauge ──────────────────────────────────────────────────────────────

function WaterGauge({ current, goal }: { current: number; goal: number }) {
  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(current / goal, 1);
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={gaugeStyles.container}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#4C9FFF"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={gaugeStyles.textContainer}>
        <Text style={gaugeStyles.currentText}>
          {current >= 1000 ? `${(current / 1000).toFixed(1)}L` : `${current}ml`}
        </Text>
        <Text style={gaugeStyles.goalText}>
          /{goal >= 1000 ? `${goal / 1000}L` : `${goal}ml`}
        </Text>
      </View>
    </View>
  );
}

const gaugeStyles = StyleSheet.create({
  container: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  currentText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  goalText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
});

// ─── Macro Progress Bar ───────────────────────────────────────────────────────

function MacroBar({
  label,
  current,
  goal,
  unit,
  color,
}: {
  label: string;
  current: number;
  goal: number;
  unit: string;
  color: string;
}) {
  const progress = Math.min(current / goal, 1);
  return (
    <View style={macroStyles.container}>
      <View style={macroStyles.header}>
        <Text style={macroStyles.label}>{label}</Text>
        <Text style={macroStyles.value}>
          <Text style={{ color }}>{Math.round(current)}</Text>
          <Text style={macroStyles.goal}>/{goal}{unit}</Text>
        </Text>
      </View>
      <View style={macroStyles.track}>
        <View
          style={[macroStyles.fill, { width: `${progress * 100}%`, backgroundColor: color }]}
        />
      </View>
    </View>
  );
}

const macroStyles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
  },
  goal: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  track: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});

// ─── Home Screen ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const { current: waterCurrent, goal: waterGoal, addWater } = useWaterStore();
  const { getTotals, goals } = useNutritionStore();
  const totals = getTotals();

  const today = new Date();
  const dateStr = today.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const dateCapitalized = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  const lastWorkout = recentWorkouts[0];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour, Dimitri 👋</Text>
            <Text style={styles.date}>{dateCapitalized}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>D</Text>
          </View>
        </View>

        {/* ── Quick Stats Row ── */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statValue}>2,847</Text>
            <Text style={styles.statLabel}>kcal brûlées</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>💪</Text>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>séances ce mois</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>⚡</Text>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>jours de suite</Text>
          </View>
        </View>

        {/* ── Water Tracker ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>💧 Hydratation</Text>
            <Text style={styles.cardSubtitle}>
              {Math.round((waterCurrent / waterGoal) * 100)}% de l'objectif
            </Text>
          </View>
          <View style={styles.waterContent}>
            <WaterGauge current={waterCurrent} goal={waterGoal} />
            <View style={styles.waterButtons}>
              <TouchableOpacity
                style={styles.waterBtn}
                onPress={() => addWater(250)}
                activeOpacity={0.7}
              >
                <Text style={styles.waterBtnText}>+250ml</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.waterBtn, styles.waterBtnLarge]}
                onPress={() => addWater(500)}
                activeOpacity={0.7}
              >
                <Text style={[styles.waterBtnText, styles.waterBtnTextLarge]}>+500ml</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.waterBtn}
                onPress={() => addWater(750)}
                activeOpacity={0.7}
              >
                <Text style={styles.waterBtnText}>+750ml</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Macros Card ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🥗 Macros du jour</Text>
            <Text style={styles.cardSubtitle}>
              {Math.round(goals.calories - totals.calories)} kcal restantes
            </Text>
          </View>

          <View style={styles.caloriesRow}>
            <View>
              <Text style={styles.caloriesValue}>
                {Math.round(totals.calories)}
                <Text style={styles.caloriesGoal}> / {goals.calories}</Text>
              </Text>
              <Text style={styles.caloriesLabel}>Calories consommées</Text>
            </View>
            <View style={styles.caloriePie}>
              <Text style={styles.caloriePieText}>
                {Math.round((totals.calories / goals.calories) * 100)}%
              </Text>
            </View>
          </View>

          <MacroBar
            label="Protéines"
            current={totals.protein}
            goal={goals.protein}
            unit="g"
            color={MacroColors.protein}
          />
          <MacroBar
            label="Glucides"
            current={totals.carbs}
            goal={goals.carbs}
            unit="g"
            color={MacroColors.carbs}
          />
          <MacroBar
            label="Lipides"
            current={totals.fat}
            goal={goals.fat}
            unit="g"
            color={MacroColors.fat}
          />
        </View>

        {/* ── Today's Workout Card ── */}
        <View style={[styles.card, styles.workoutCard]}>
          <View style={styles.workoutCardBadge}>
            <Text style={styles.workoutCardBadgeText}>AUJOURD'HUI</Text>
          </View>
          <Text style={styles.workoutCardTitle}>Push — Poitrine & Triceps</Text>
          <View style={styles.workoutCardMeta}>
            <Text style={styles.workoutCardMetaText}>4 exercices</Text>
            <Text style={styles.workoutCardMetaDot}>•</Text>
            <Text style={styles.workoutCardMetaText}>~60 min</Text>
            <Text style={styles.workoutCardMetaDot}>•</Text>
            <Text style={styles.workoutCardMetaText}>Force + Hypertrophie</Text>
          </View>
          <View style={styles.workoutCardExercises}>
            {['Développé couché', 'Développé incliné', 'Épaules', 'Triceps'].map((ex, i) => (
              <View key={i} style={styles.workoutExTag}>
                <Text style={styles.workoutExTagText}>{ex}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={styles.startButton}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/seance')}
          >
            <Text style={styles.startButtonText}>Démarrer la séance →</Text>
          </TouchableOpacity>
        </View>

        {/* ── Last Session Card ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>📊 Dernière séance</Text>
            <Text style={styles.cardSubtitle}>Lundi 4 mars</Text>
          </View>
          <Text style={styles.lastSessionName}>{lastWorkout.name}</Text>
          <View style={styles.lastSessionStats}>
            <View style={styles.lastSessionStat}>
              <Text style={styles.lastSessionStatValue}>{lastWorkout.duration}'</Text>
              <Text style={styles.lastSessionStatLabel}>Durée</Text>
            </View>
            <View style={styles.lastSessionStat}>
              <Text style={styles.lastSessionStatValue}>
                {lastWorkout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)}
              </Text>
              <Text style={styles.lastSessionStatLabel}>Séries</Text>
            </View>
            <View style={styles.lastSessionStat}>
              <Text style={styles.lastSessionStatValue}>
                {(lastWorkout.totalVolume / 1000).toFixed(1)}T
              </Text>
              <Text style={styles.lastSessionStatLabel}>Volume</Text>
            </View>
            <View style={styles.lastSessionStat}>
              <Text style={styles.lastSessionStatValue}>
                {lastWorkout.exercises.length}
              </Text>
              <Text style={styles.lastSessionStatLabel}>Exercices</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 8,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  date: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statEmoji: {
    fontSize: 20,
    marginBottom: 6,
  },
  statValue: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    textAlign: 'center',
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  cardSubtitle: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  waterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  waterButtons: {
    flex: 1,
    gap: 8,
  },
  waterBtn: {
    backgroundColor: Colors.inputBackground,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  waterBtnLarge: {
    backgroundColor: 'rgba(76, 159, 255, 0.15)',
    borderColor: '#4C9FFF',
  },
  waterBtnText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  waterBtnTextLarge: {
    color: '#4C9FFF',
  },
  caloriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  caloriesValue: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  caloriesGoal: {
    color: Colors.textMuted,
    fontSize: 16,
    fontWeight: '500',
  },
  caloriesLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  caloriePie: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    borderWidth: 2,
    borderColor: MacroColors.calories,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caloriePieText: {
    color: MacroColors.calories,
    fontSize: 14,
    fontWeight: '800',
  },
  workoutCard: {
    backgroundColor: Colors.card,
    borderColor: Colors.border,
    borderWidth: 1,
  },
  workoutCardBadge: {
    backgroundColor: Colors.accentMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  workoutCardBadgeText: {
    color: Colors.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  workoutCardTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  workoutCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  workoutCardMetaText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  workoutCardMetaDot: {
    color: Colors.textMuted,
  },
  workoutCardExercises: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  workoutExTag: {
    backgroundColor: 'rgba(76, 159, 255, 0.12)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(76, 159, 255, 0.25)',
  },
  workoutExTagText: {
    color: '#4C9FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  lastSessionName: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 14,
  },
  lastSessionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lastSessionStat: {
    alignItems: 'center',
  },
  lastSessionStatValue: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  lastSessionStatLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 3,
  },
  bottomPadding: {
    height: 20,
  },
});
