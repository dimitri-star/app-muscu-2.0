import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { recentWorkouts } from '../../constants/mockData';
import SettingsScreen from '../../components/SettingsScreen';

// ─── Types ────────────────────────────────────────────────────────────────────

type ProfilTab = 'historique' | 'stats' | 'pr' | 'programmes' | 'calendrier';

const PROFIL_TABS: { key: ProfilTab; label: string }[] = [
  { key: 'historique', label: 'Historique' },
  { key: 'stats', label: 'Stats' },
  { key: 'pr', label: 'PR' },
  { key: 'programmes', label: 'Programmes' },
  { key: 'calendrier', label: 'Calendrier' },
];

// ─── Mock data ────────────────────────────────────────────────────────────────

const PERSONAL_RECORDS = [
  { id: 'pr1', exercise: 'Développé couché', weight: 100, reps: 1, date: '15 Jan 2025' },
  { id: 'pr2', exercise: 'Squat barre', weight: 130, reps: 1, date: '22 Fév 2025' },
  { id: 'pr3', exercise: 'Soulevé de terre', weight: 160, reps: 1, date: '8 Mar 2025' },
  { id: 'pr4', exercise: 'Curl biceps', weight: 40, reps: 8, date: '1 Mar 2025' },
];

const PROGRAMS = [
  { id: 'p1', name: 'PPL — Push Pull Legs', duration: '6 jours/sem', split: 'Push / Pull / Legs', active: true },
  { id: 'p2', name: 'Upper/Lower Split', duration: '4 jours/sem', split: 'Upper / Lower', active: false },
  { id: 'p3', name: 'Full Body 3x', duration: '3 jours/sem', split: 'Full Body', active: false },
];

const WORKOUT_DAYS = [3, 5, 8, 10, 12, 15, 17, 19, 22, 24, 26];

type StatPeriod = 'semaine' | 'mois' | 'annee' | 'tout';
const STAT_PERIODS: { key: StatPeriod; label: string }[] = [
  { key: 'semaine', label: 'Semaine' },
  { key: 'mois', label: 'Mois' },
  { key: 'annee', label: 'Année' },
  { key: 'tout', label: 'Tout' },
];

// ─── Sub-tab bar ──────────────────────────────────────────────────────────────

function SubTabBar({
  active,
  onPress,
}: {
  active: ProfilTab;
  onPress: (t: ProfilTab) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={subStyles.row}
      style={subStyles.container}
    >
      {PROFIL_TABS.map((tab) => {
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

// ─── Profile header ───────────────────────────────────────────────────────────

function ProfileHeader() {
  return (
    <View style={headerStyles.container}>
      {/* Avatar row */}
      <View style={headerStyles.avatarRow}>
        <View style={headerStyles.avatar} />
        <View style={headerStyles.userInfo}>
          <Text style={headerStyles.name}>Alex Dupont</Text>
          <Text style={headerStyles.handle}>@alexdupont</Text>
          <Text style={headerStyles.bio}>Powerlifter | 3 ans de pratique</Text>
        </View>
      </View>

      {/* Stats row */}
      <View style={headerStyles.statsRow}>
        <View style={headerStyles.statItem}>
          <Text style={headerStyles.statValue}>24</Text>
          <Text style={headerStyles.statLabel}>séances</Text>
        </View>
        <View style={headerStyles.statDivider} />
        <View style={headerStyles.statItem}>
          <Text style={headerStyles.statValue}>142</Text>
          <Text style={headerStyles.statLabel}>followers</Text>
        </View>
        <View style={headerStyles.statDivider} />
        <View style={headerStyles.statItem}>
          <Text style={headerStyles.statValue}>90</Text>
          <Text style={headerStyles.statLabel}>following</Text>
        </View>
      </View>

      {/* Edit button */}
      <TouchableOpacity style={headerStyles.editBtn}>
        <Text style={headerStyles.editBtnText}>Modifier le profil</Text>
      </TouchableOpacity>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.separator,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 14,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#3A3A3C',
  },
  userInfo: {
    flex: 1,
    paddingTop: 4,
  },
  name: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  handle: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  bio: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingVertical: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 30,
    backgroundColor: Colors.separator,
  },
  editBtn: {
    borderWidth: 1,
    borderColor: Colors.text,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  editBtnText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});

// ─── Tab: HISTORIQUE ──────────────────────────────────────────────────────────

function HistoriqueContent() {
  return (
    <ScrollView contentContainerStyle={tabStyles.container}>
      {recentWorkouts.map((w) => (
        <TouchableOpacity key={w.id} style={tabStyles.historyCard}>
          <View style={tabStyles.historyLeft}>
            <Text style={tabStyles.historyDate}>{w.date}</Text>
            <Text style={tabStyles.historyName}>{w.name}</Text>
          </View>
          <View style={tabStyles.historyRight}>
            <Text style={tabStyles.historyMeta}>
              {(w.totalVolume / 1000).toFixed(1)} t
            </Text>
            <Text style={tabStyles.historyMetaSub}>{w.duration} min</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ─── Tab: STATS ───────────────────────────────────────────────────────────────

function StatsContent() {
  const [period, setPeriod] = useState<StatPeriod>('mois');

  const STAT_CARDS = [
    { label: 'Total séances', value: '24', sub: 'séances' },
    { label: 'Volume total', value: '182 340', sub: 'kg' },
    { label: 'Séries totales', value: '312', sub: 'séries' },
    { label: 'Durée moy.', value: '58', sub: 'min' },
  ];

  // Fake weekly volume data
  const WEEKLY = [
    { day: 'L', val: 65 },
    { day: 'M', val: 0 },
    { day: 'M', val: 80 },
    { day: 'J', val: 0 },
    { day: 'V', val: 90 },
    { day: 'S', val: 70 },
    { day: 'D', val: 0 },
  ];
  const maxVal = Math.max(...WEEKLY.map((d) => d.val), 1);

  return (
    <ScrollView contentContainerStyle={tabStyles.container}>
      {/* Period filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={statsStyles.periodRow}
      >
        {STAT_PERIODS.map((p) => {
          const isActive = period === p.key;
          return (
            <TouchableOpacity
              key={p.key}
              style={[statsStyles.periodPill, isActive && statsStyles.periodPillActive]}
              onPress={() => setPeriod(p.key)}
            >
              <Text style={[statsStyles.periodText, isActive && statsStyles.periodTextActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 2x2 grid */}
      <View style={statsStyles.grid}>
        {STAT_CARDS.map((c) => (
          <View key={c.label} style={statsStyles.gridCard}>
            <Text style={statsStyles.gridValue}>{c.value}</Text>
            <Text style={statsStyles.gridSub}>{c.sub}</Text>
            <Text style={statsStyles.gridLabel}>{c.label}</Text>
          </View>
        ))}
      </View>

      {/* Volume chart */}
      <View style={statsStyles.chartCard}>
        <Text style={statsStyles.chartTitle}>Volume hebdomadaire</Text>
        <View style={statsStyles.chart}>
          {WEEKLY.map((d, i) => {
            const h = (d.val / maxVal) * 80;
            return (
              <View key={i} style={statsStyles.barCol}>
                <View style={statsStyles.barTrack}>
                  {d.val > 0 && (
                    <View
                      style={[
                        statsStyles.barFill,
                        { height: h },
                      ]}
                    />
                  )}
                </View>
                <Text style={statsStyles.barDay}>{d.day}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const statsStyles = StyleSheet.create({
  periodRow: {
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  periodPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
  },
  periodPillActive: {
    backgroundColor: Colors.text,
  },
  periodText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  periodTextActive: {
    color: Colors.background,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  gridCard: {
    width: '47.5%',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
  },
  gridValue: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 2,
  },
  gridSub: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginBottom: 6,
  },
  gridLabel: {
    color: Colors.textTertiary,
    fontSize: 12,
    fontWeight: '500',
  },
  chartCard: {
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
    width: 22,
    borderRadius: 6,
    backgroundColor: Colors.cardAlt,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginBottom: 6,
  },
  barFill: {
    width: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 6,
  },
  barDay: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
});

// ─── Tab: PR ──────────────────────────────────────────────────────────────────

function PRContent() {
  return (
    <ScrollView contentContainerStyle={tabStyles.container}>
      <Text style={prStyles.sectionTitle}>Records personnels</Text>
      {PERSONAL_RECORDS.map((pr) => (
        <View key={pr.id} style={prStyles.prCard}>
          <View style={prStyles.prLeft}>
            <Text style={prStyles.prExercise}>{pr.exercise}</Text>
            <Text style={prStyles.prDate}>{pr.date}</Text>
          </View>
          <View style={prStyles.prRight}>
            <Text style={prStyles.prWeight}>{pr.weight} kg</Text>
            <Text style={prStyles.prReps}>× {pr.reps} rep{pr.reps > 1 ? 's' : ''}</Text>
          </View>
        </View>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const prStyles = StyleSheet.create({
  sectionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  prCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  prLeft: {
    flex: 1,
  },
  prExercise: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  prDate: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  prRight: {
    alignItems: 'flex-end',
  },
  prWeight: {
    color: Colors.accent,
    fontSize: 18,
    fontWeight: '800',
  },
  prReps: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
});

// ─── Tab: PROGRAMMES ──────────────────────────────────────────────────────────

function ProgrammesContent() {
  return (
    <ScrollView contentContainerStyle={tabStyles.container}>
      <Text style={progStyles.sectionTitle}>Mes programmes</Text>
      {PROGRAMS.map((p) => (
        <TouchableOpacity
          key={p.id}
          style={[
            progStyles.programCard,
            p.active && progStyles.programCardActive,
          ]}
        >
          <View style={progStyles.programTop}>
            <Text style={progStyles.programName}>{p.name}</Text>
            {p.active && (
              <View style={progStyles.activeBadge}>
                <Text style={progStyles.activeBadgeText}>ACTIF</Text>
              </View>
            )}
          </View>
          <Text style={progStyles.programMeta}>{p.duration} · {p.split}</Text>
        </TouchableOpacity>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const progStyles = StyleSheet.create({
  sectionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  programCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  programCardActive: {
    borderColor: Colors.accent,
  },
  programTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  programName: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  programMeta: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  activeBadge: {
    backgroundColor: Colors.tagGreenBg,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activeBadgeText: {
    color: Colors.accent,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

// ─── Tab: CALENDRIER ──────────────────────────────────────────────────────────

const WEEKDAY_HEADERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function CalendrierContent() {
  // Generate March 2025 grid
  // March 1, 2025 is a Saturday → index 5 (Mon=0)
  const monthName = 'Mars 2025';
  const firstDayOffset = 5; // Saturday
  const daysInMonth = 31;
  const cells: (number | null)[] = [
    ...Array(firstDayOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    cells.push(...Array(remaining).fill(null));
  }

  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  return (
    <ScrollView contentContainerStyle={tabStyles.container}>
      <View style={calStyles.header}>
        <TouchableOpacity style={calStyles.navBtn}>
          <Ionicons name="chevron-back" size={18} color={Colors.text} />
        </TouchableOpacity>
        <Text style={calStyles.monthTitle}>{monthName}</Text>
        <TouchableOpacity style={calStyles.navBtn}>
          <Ionicons name="chevron-forward" size={18} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Weekday headers */}
      <View style={calStyles.weekRow}>
        {WEEKDAY_HEADERS.map((d, i) => (
          <Text key={i} style={calStyles.weekDay}>{d}</Text>
        ))}
      </View>

      {/* Calendar grid */}
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={calStyles.weekRow}>
          {row.map((day, colIndex) => {
            const hasWorkout = day !== null && WORKOUT_DAYS.includes(day);
            return (
              <TouchableOpacity
                key={colIndex}
                style={calStyles.dayCell}
                disabled={day === null}
              >
                {day !== null && (
                  <View style={[calStyles.dayBadge, hasWorkout && calStyles.dayBadgeWorkout]}>
                    <Text style={[calStyles.dayText, hasWorkout && calStyles.dayTextWorkout]}>
                      {day}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {/* Legend */}
      <View style={calStyles.legend}>
        <View style={calStyles.legendItem}>
          <View style={[calStyles.legendDot, { backgroundColor: Colors.text }]} />
          <Text style={calStyles.legendText}>Jour d'entrainement</Text>
        </View>
        <View style={calStyles.legendItem}>
          <View style={[calStyles.legendDot, { backgroundColor: Colors.textTertiary }]} />
          <Text style={calStyles.legendText}>Repos</Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const calStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navBtn: {
    padding: 6,
  },
  monthTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 4,
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBadgeWorkout: {
    backgroundColor: Colors.text,
  },
  dayText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '400',
  },
  dayTextWorkout: {
    color: Colors.background,
    fontWeight: '700',
  },
  legend: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 16,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
});

// ─── Shared tab styles ────────────────────────────────────────────────────────

const tabStyles = StyleSheet.create({
  container: {
    padding: 16,
  },
  historyCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyLeft: {
    flex: 1,
  },
  historyDate: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 3,
  },
  historyName: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  historyRight: {
    alignItems: 'flex-end',
    marginRight: 4,
  },
  historyMeta: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  historyMetaSub: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
});

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────

export default function ProfilScreen() {
  const [activeTab, setActiveTab] = useState<ProfilTab>('historique');
  const [showSettings, setShowSettings] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Settings icon top-right */}
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>Profil</Text>
        <TouchableOpacity style={styles.settingsBtn} onPress={() => setShowSettings(true)} activeOpacity={0.7}>
          <Ionicons name="settings-outline" size={22} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <Modal visible={showSettings} animationType="slide" presentationStyle="fullScreen">
        <SettingsScreen onBack={() => setShowSettings(false)} />
      </Modal>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <ProfileHeader />

        <SubTabBar active={activeTab} onPress={setActiveTab} />

        <View style={styles.tabContent}>
          {activeTab === 'historique' && <HistoriqueContent />}
          {activeTab === 'stats' && <StatsContent />}
          {activeTab === 'pr' && <PRContent />}
          {activeTab === 'programmes' && <ProgrammesContent />}
          {activeTab === 'calendrier' && <CalendrierContent />}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 2,
  },
  screenTitle: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  settingsBtn: {
    padding: 6,
  },
  scroll: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
});
