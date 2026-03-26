import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { MacroColors } from '../../constants/colors';
import { useThemeStore } from '../../store/theme';
import { getColors } from '../../constants/theme';
import { useNutritionStore, useWaterStore, getShortDayFromDate } from '../../store';
import type { MealEntry } from '../../constants/mockData';

// ─── Tab Switcher ─────────────────────────────────────────────────────────────

function TabBar({
  active,
  onChange,
}: {
  active: 'nutrition' | 'hydratation';
  onChange: (tab: 'nutrition' | 'hydratation') => void;
}) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = getColors(isDark);
  return (
    <View style={[tabStyles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {(['nutrition', 'hydratation'] as const).map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[tabStyles.tab, active === tab && { backgroundColor: colors.background, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }]}
          onPress={() => onChange(tab)}
          activeOpacity={0.7}
        >
          <Text style={[tabStyles.label, { color: colors.textMuted }, active === tab && { color: colors.text, fontWeight: '700' }]}>
            {tab === 'nutrition' ? '🍎 Nutrition' : '💧 Hydratation'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 11,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
});

// ─── Macro Ring ───────────────────────────────────────────────────────────────

function MacroRing({
  label, current, goal, color, unit,
}: {
  label: string; current: number; goal: number; color: string; unit: string;
}) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = getColors(isDark);
  const ringStyles = MacroRingStyles(colors);
  const pct = Math.min((current / goal) * 100, 100);
  return (
    <View style={ringStyles.container}>
      <View style={[ringStyles.ring, { borderColor: color }]}>
        <Text style={[ringStyles.value, { color }]}>{Math.round(current)}</Text>
        <Text style={ringStyles.unit}>{unit}</Text>
      </View>
      <Text style={ringStyles.label}>{label}</Text>
      <Text style={[ringStyles.pct, { color }]}>{Math.round(pct)}%</Text>
    </View>
  );
}

function MacroRingStyles(colors: ReturnType<typeof getColors>) {
  return StyleSheet.create({
    container: { alignItems: 'center', flex: 1 },
    ring: {
      width: 68, height: 68, borderRadius: 34, borderWidth: 3,
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: colors.cardAlt, marginBottom: 6,
    },
    value: { fontSize: 16, fontWeight: '800' },
    unit: { color: colors.textMuted, fontSize: 9, fontWeight: '600' },
    label: { color: colors.textSecondary, fontSize: 11, fontWeight: '600' },
    pct: { fontSize: 11, fontWeight: '700', marginTop: 1 },
  });
}

// ─── Food Item Row ────────────────────────────────────────────────────────────

function FoodRow({ entry, onRemove }: { entry: MealEntry; onRemove: () => void }) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = getColors(isDark);
  const foodStyles = getFoodStyles(colors);
  const ratio = entry.foodItem.servingUnit === 'g'
    ? entry.quantity / entry.foodItem.servingSize
    : entry.quantity;
  const calories = Math.round(entry.foodItem.calories * ratio);
  const protein = Math.round(entry.foodItem.protein * ratio);
  const carbs = Math.round(entry.foodItem.carbs * ratio);
  const fat = Math.round(entry.foodItem.fat * ratio);

  return (
    <View style={foodStyles.row}>
      <View style={foodStyles.info}>
        <Text style={foodStyles.name} numberOfLines={1}>
          {entry.foodItem.name}
          {entry.foodItem.brand ? <Text style={foodStyles.brand}> • {entry.foodItem.brand}</Text> : null}
        </Text>
        <Text style={foodStyles.meta}>
          {entry.quantity}{entry.foodItem.servingUnit} · P:{protein}g G:{carbs}g L:{fat}g
        </Text>
      </View>
      <View style={foodStyles.right}>
        <View style={foodStyles.caloriesBadge}>
          <Text style={foodStyles.calories}>{calories}</Text>
          <Text style={foodStyles.kcal}>kcal</Text>
        </View>
        <TouchableOpacity onPress={onRemove} style={foodStyles.removeBtn} activeOpacity={0.7}>
          <Text style={foodStyles.removeText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function getFoodStyles(colors: ReturnType<typeof getColors>) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row', alignItems: 'center',
      paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    info: { flex: 1, marginRight: 12 },
    name: { color: colors.text, fontSize: 14, fontWeight: '600' },
    brand: { color: colors.textMuted, fontSize: 12, fontWeight: '400' },
    meta: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
    right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    caloriesBadge: { alignItems: 'center', minWidth: 44 },
    calories: { color: MacroColors.calories, fontSize: 16, fontWeight: '800' },
    kcal: { color: colors.textMuted, fontSize: 9, fontWeight: '600' },
    removeBtn: { padding: 4 },
    removeText: { color: colors.textMuted, fontSize: 13 },
  });
}

// ─── Meal Section ─────────────────────────────────────────────────────────────

const MEAL_CONFIG = {
  breakfast: { label: 'Petit-déjeuner', emoji: '🌅', color: '#1DB954' },
  lunch:     { label: 'Déjeuner',       emoji: '☀️',  color: '#17A94D' },
  dinner:    { label: 'Dîner',          emoji: '🌙',  color: '#139143' },
  snack:     { label: 'Collations',     emoji: '🍌',  color: '#1DB954' },
} as const;

function MealSection({
  type, entries, totals, onRemove,
}: {
  type: keyof typeof MEAL_CONFIG;
  entries: MealEntry[];
  totals: { calories: number; protein: number; carbs: number; fat: number };
  onRemove: (id: string) => void;
}) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = getColors(isDark);
  const mealStyles = getMealStyles(colors);
  const [expanded, setExpanded] = useState(true);
  const config = MEAL_CONFIG[type];

  return (
    <View style={mealStyles.section}>
      <TouchableOpacity
        style={mealStyles.header}
        onPress={() => setExpanded((v) => !v)}
        activeOpacity={0.7}
      >
        <View style={mealStyles.headerLeft}>
          <View style={[mealStyles.dot, { backgroundColor: config.color }]} />
          <Text style={mealStyles.emoji}>{config.emoji}</Text>
          <Text style={mealStyles.title}>{config.label}</Text>
          <Text style={mealStyles.count}>{entries.length} aliments</Text>
        </View>
        <View style={mealStyles.headerRight}>
          <Text style={[mealStyles.mealCalories, { color: config.color }]}>
            {Math.round(totals.calories)} kcal
          </Text>
          <Text style={mealStyles.chevron}>{expanded ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>

      {expanded && (
        <>
          {entries.map((entry) => (
            <FoodRow key={entry.id} entry={entry} onRemove={() => onRemove(entry.id)} />
          ))}
          <TouchableOpacity style={mealStyles.addBtn} activeOpacity={0.7}>
            <Text style={[mealStyles.addBtnText, { color: config.color }]}>
              + Ajouter un aliment
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

function getMealStyles(colors: ReturnType<typeof getColors>) {
  return StyleSheet.create({
    section: {
      backgroundColor: colors.card, borderRadius: 16, overflow: 'hidden',
      marginBottom: 12, borderWidth: 1, borderColor: colors.border,
    },
    header: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'center', padding: 14,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    emoji: { fontSize: 16 },
    title: { color: colors.text, fontSize: 15, fontWeight: '700' },
    count: { color: colors.textMuted, fontSize: 12 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    mealCalories: { fontSize: 14, fontWeight: '800' },
    chevron: { color: colors.textMuted, fontSize: 10 },
    addBtn: { paddingVertical: 12, paddingHorizontal: 14, borderTopWidth: 1, borderTopColor: colors.border },
    addBtnText: { fontSize: 13, fontWeight: '700' },
  });
}

// ─── Water Gauge ──────────────────────────────────────────────────────────────

function WaterGaugeLarge({ current, goal }: { current: number; goal: number }) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = getColors(isDark);
  const size = 160;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(current / goal, 1);
  const dashOffset = circumference * (1 - progress);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={colors.border} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={colors.accent} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round"
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={{ color: colors.accent, fontSize: 28, fontWeight: '900' }}>
          {current >= 1000 ? `${(current / 1000).toFixed(1)}L` : `${current}ml`}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 13 }}>
          / {goal >= 1000 ? `${(goal / 1000).toFixed(1)}L` : `${goal}ml`}
        </Text>
        <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '700', marginTop: 2 }}>
          {Math.round((current / goal) * 100)}%
        </Text>
      </View>
    </View>
  );
}

// ─── Hydration Tab ────────────────────────────────────────────────────────────

function HydrationTab() {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = getColors(isDark);
  const hydroStyles = getHydroStyles(colors);
  const modalStyles = getModalStyles(colors);
  const { current, goal, entries, weekHistory, addWater, removeEntry, setGoal } = useWaterStore();
  const [customInput, setCustomInput] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalInput, setGoalInput] = useState(String(goal / 1000));

  const handleAddCustom = () => {
    const amount = parseInt(customInput, 10);
    if (!amount || amount <= 0 || amount > 5000) {
      Alert.alert('Quantité invalide', 'Entre une quantité entre 1 et 5000 ml.');
      return;
    }
    addWater(amount);
    setCustomInput('');
    setShowCustom(false);
  };

  const handleSaveGoal = () => {
    const newGoal = parseFloat(goalInput) * 1000;
    if (!newGoal || newGoal < 500 || newGoal > 10000) {
      Alert.alert('Objectif invalide', 'Entre un objectif entre 0.5L et 10L.');
      return;
    }
    setGoal(newGoal);
    setShowGoalModal(false);
  };

  const maxDay = Math.max(...weekHistory.map((d) => d.goal));

  return (
    <View>
      {/* ── Jauge principale ── */}
      <View style={hydroStyles.gaugeCard}>
        <View style={hydroStyles.gaugeRow}>
          <WaterGaugeLarge current={current} goal={goal} />
          <View style={hydroStyles.gaugeInfo}>
            <View style={hydroStyles.statRow}>
              <Text style={hydroStyles.statLabel}>Consommé</Text>
              <Text style={[hydroStyles.statValue, { color: colors.accent }]}>
                {(current / 1000).toFixed(2)}L
              </Text>
            </View>
            <View style={hydroStyles.statRow}>
              <Text style={hydroStyles.statLabel}>Restant</Text>
              <Text style={hydroStyles.statValue}>
                {Math.max(0, (goal - current) / 1000).toFixed(2)}L
              </Text>
            </View>
            <View style={hydroStyles.statRow}>
              <Text style={hydroStyles.statLabel}>Objectif</Text>
              <TouchableOpacity onPress={() => { setGoalInput(String(goal / 1000)); setShowGoalModal(true); }}>
                <Text style={[hydroStyles.statValue, { color: colors.accent }]}>
                  {(goal / 1000).toFixed(1)}L ✎
                </Text>
              </TouchableOpacity>
            </View>
            <View style={hydroStyles.statRow}>
              <Text style={hydroStyles.statLabel}>Entrées</Text>
              <Text style={hydroStyles.statValue}>{entries.length}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── Boutons rapides ── */}
      <View style={hydroStyles.quickCard}>
        <Text style={hydroStyles.sectionTitle}>Ajouter rapidement</Text>
        <View style={hydroStyles.quickRow}>
          {[150, 250, 330, 500].map((amount) => (
            <TouchableOpacity
              key={amount}
              style={hydroStyles.quickBtn}
              onPress={() => addWater(amount)}
              activeOpacity={0.7}
            >
              <Text style={hydroStyles.quickBtnAmount}>{amount}</Text>
              <Text style={hydroStyles.quickBtnUnit}>ml</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={hydroStyles.bigBtn}
          onPress={() => addWater(750)}
          activeOpacity={0.8}
        >
          <Text style={hydroStyles.bigBtnText}>+ 750 ml  🥤</Text>
        </TouchableOpacity>

        {/* Custom input */}
        {showCustom ? (
          <View style={hydroStyles.customRow}>
            <TextInput
              style={hydroStyles.customInput}
              placeholder="Quantité en ml..."
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              value={customInput}
              onChangeText={setCustomInput}
              autoFocus
            />
            <TouchableOpacity style={hydroStyles.customConfirm} onPress={handleAddCustom} activeOpacity={0.8}>
              <Text style={hydroStyles.customConfirmText}>Ajouter</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowCustom(false)} style={hydroStyles.customCancel}>
              <Text style={hydroStyles.customCancelText}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={hydroStyles.customToggle} onPress={() => setShowCustom(true)} activeOpacity={0.7}>
            <Text style={hydroStyles.customToggleText}>+ Quantité personnalisée</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Historique du jour ── */}
      <View style={hydroStyles.historyCard}>
        <View style={hydroStyles.historyHeader}>
          <Text style={hydroStyles.sectionTitle}>Aujourd'hui</Text>
          <Text style={hydroStyles.historyTotal}>{entries.length} entrées</Text>
        </View>

        {entries.length === 0 ? (
          <Text style={hydroStyles.emptyText}>Aucune entrée pour aujourd'hui.</Text>
        ) : (
          [...entries].reverse().map((entry) => (
            <View key={entry.id} style={hydroStyles.entryRow}>
              <View style={hydroStyles.entryDot} />
              <View style={hydroStyles.entryInfo}>
                <Text style={hydroStyles.entryTime}>{entry.time}</Text>
                <Text style={hydroStyles.entryAmount}>{entry.amount} ml</Text>
              </View>
              <Text style={[hydroStyles.entryAmountBig, { color: colors.accent }]}>
                {(entry.amount / 1000).toFixed(2)}L
              </Text>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    'Supprimer cette entrée ?',
                    `${entry.amount} ml à ${entry.time}`,
                    [
                      { text: 'Annuler', style: 'cancel' },
                      { text: 'Supprimer', style: 'destructive', onPress: () => removeEntry(entry.id) },
                    ]
                  )
                }
                style={hydroStyles.deleteBtn}
                activeOpacity={0.7}
              >
                <Text style={hydroStyles.deleteText}>🗑</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* ── Historique 7 jours ── */}
      <View style={hydroStyles.weekCard}>
        <Text style={hydroStyles.sectionTitle}>7 derniers jours</Text>
        <View style={hydroStyles.weekBars}>
          {weekHistory.map((day) => {
            const pct = Math.min(day.amount / day.goal, 1);
            const todayStr = new Date().toISOString().split('T')[0];
            const isToday = day.date === todayStr;
            const label = getShortDayFromDate(day.date);
            return (
              <View key={day.date} style={hydroStyles.barCol}>
                <Text style={hydroStyles.barAmount}>
                  {day.amount >= 1000 ? `${(day.amount / 1000).toFixed(1)}` : day.amount > 0 ? day.amount : ''}
                </Text>
                <View style={hydroStyles.barTrack}>
                  <View
                    style={[
                      hydroStyles.barFill,
                      {
                        height: `${pct * 100}%`,
                        backgroundColor: isToday ? colors.accent : pct >= 1 ? colors.accent : colors.border,
                      },
                    ]}
                  />
                </View>
                <Text style={[hydroStyles.barDay, isToday && { color: colors.accent, fontWeight: '800' }]}>
                  {label}
                </Text>
              </View>
            );
          })}
        </View>
        <View style={hydroStyles.weekLegend}>
          <View style={[hydroStyles.legendDot, { backgroundColor: colors.accent }]} />
          <Text style={hydroStyles.legendText}>Objectif atteint</Text>
          <View style={[hydroStyles.legendDot, { backgroundColor: colors.accent, marginLeft: 12 }]} />
          <Text style={hydroStyles.legendText}>Aujourd'hui</Text>
          <View style={[hydroStyles.legendDot, { backgroundColor: colors.border, marginLeft: 12 }]} />
          <Text style={hydroStyles.legendText}>Incomplet</Text>
        </View>
      </View>

      {/* ── Modal modifier objectif ── */}
      <Modal visible={showGoalModal} transparent animationType="fade">
        <View style={modalStyles.overlay}>
          <View style={modalStyles.box}>
            <Text style={modalStyles.title}>Modifier l'objectif</Text>
            <Text style={modalStyles.subtitle}>Objectif quotidien d'eau (en litres)</Text>
            <View style={modalStyles.inputRow}>
              <TextInput
                style={modalStyles.input}
                value={goalInput}
                onChangeText={setGoalInput}
                keyboardType="decimal-pad"
                autoFocus
                selectTextOnFocus
              />
              <Text style={modalStyles.inputSuffix}>L</Text>
            </View>
            <View style={modalStyles.presets}>
              {['1.5', '2', '2.5', '3', '3.5', '4'].map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[modalStyles.preset, goalInput === v && modalStyles.presetActive]}
                  onPress={() => setGoalInput(v)}
                  activeOpacity={0.7}
                >
                  <Text style={[modalStyles.presetText, goalInput === v && { color: colors.accent }]}>
                    {v}L
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={modalStyles.buttons}>
              <TouchableOpacity style={modalStyles.cancelBtn} onPress={() => setShowGoalModal(false)} activeOpacity={0.7}>
                <Text style={modalStyles.cancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={modalStyles.saveBtn} onPress={handleSaveGoal} activeOpacity={0.8}>
                <Text style={modalStyles.saveText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function getHydroStyles(colors: ReturnType<typeof getColors>) {
  return StyleSheet.create({
    gaugeCard: {
      backgroundColor: colors.card, borderRadius: 18, padding: 18,
      marginBottom: 14, borderWidth: 1, borderColor: colors.border,
    },
    gaugeRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
    gaugeInfo: { flex: 1, gap: 12 },
    statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    statLabel: { color: colors.textSecondary, fontSize: 13 },
    statValue: { color: colors.text, fontSize: 14, fontWeight: '700' },

    quickCard: {
      backgroundColor: colors.card, borderRadius: 18, padding: 18,
      marginBottom: 14, borderWidth: 1, borderColor: colors.border,
    },
    sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 14 },
    quickRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
    quickBtn: {
      flex: 1, backgroundColor: colors.background, borderRadius: 12,
      paddingVertical: 14, alignItems: 'center',
      borderWidth: 1.5, borderColor: colors.accent,
    },
    quickBtnAmount: { color: colors.accent, fontSize: 16, fontWeight: '800' },
    quickBtnUnit: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
    bigBtn: {
      backgroundColor: colors.accentMuted, borderRadius: 14,
      paddingVertical: 14, alignItems: 'center',
      borderWidth: 1.5, borderColor: colors.accent, marginBottom: 10,
    },
    bigBtnText: { color: colors.accent, fontSize: 16, fontWeight: '800' },
    customRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
    customInput: {
      flex: 1, backgroundColor: colors.background, borderRadius: 12,
      paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
      color: colors.text, borderWidth: 1, borderColor: colors.border,
    },
    customConfirm: {
      backgroundColor: colors.accent, borderRadius: 12,
      paddingHorizontal: 16, paddingVertical: 12,
    },
    customConfirmText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    customCancel: { padding: 8 },
    customCancelText: { color: colors.textMuted, fontSize: 16 },
    customToggle: {
      alignItems: 'center', paddingVertical: 10,
      borderWidth: 1, borderColor: colors.border, borderRadius: 12, borderStyle: 'dashed',
    },
    customToggleText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },

    historyCard: {
      backgroundColor: colors.card, borderRadius: 18, padding: 18,
      marginBottom: 14, borderWidth: 1, borderColor: colors.border,
    },
    historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    historyTotal: { color: colors.textMuted, fontSize: 12 },
    emptyText: { color: colors.textMuted, textAlign: 'center', paddingVertical: 20 },
    entryRow: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    entryDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
    entryInfo: { flex: 1 },
    entryTime: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
    entryAmount: { color: colors.text, fontSize: 14, fontWeight: '600' },
    entryAmountBig: { fontSize: 15, fontWeight: '800' },
    deleteBtn: { padding: 6 },
    deleteText: { fontSize: 16 },

    weekCard: {
      backgroundColor: colors.card, borderRadius: 18, padding: 18,
      marginBottom: 14, borderWidth: 1, borderColor: colors.border,
    },
    weekBars: { flexDirection: 'row', gap: 8, height: 120, alignItems: 'flex-end', marginBottom: 8 },
    barCol: { flex: 1, alignItems: 'center', gap: 4 },
    barAmount: { color: colors.textMuted, fontSize: 9, fontWeight: '600' },
    barTrack: {
      flex: 1, width: '100%', backgroundColor: colors.border,
      borderRadius: 6, overflow: 'hidden', justifyContent: 'flex-end',
    },
    barFill: { width: '100%', borderRadius: 6, minHeight: 4 },
    barDay: { color: colors.textSecondary, fontSize: 11, fontWeight: '600' },
    weekLegend: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginTop: 4 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { color: colors.textMuted, fontSize: 11 },
  });
}

function getModalStyles(colors: ReturnType<typeof getColors>) {
  return StyleSheet.create({
    overlay: {
      flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center', alignItems: 'center', padding: 24,
    },
    box: {
      backgroundColor: colors.background, borderRadius: 24, padding: 24,
      width: '100%', borderWidth: 1, borderColor: colors.border,
    },
    title: { color: colors.text, fontSize: 20, fontWeight: '800', marginBottom: 6 },
    subtitle: { color: colors.textSecondary, fontSize: 13, marginBottom: 20 },
    inputRow: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: colors.card, borderRadius: 14, borderWidth: 1.5,
      borderColor: colors.accent, paddingHorizontal: 16, marginBottom: 16,
    },
    input: { flex: 1, fontSize: 28, fontWeight: '800', color: colors.text, paddingVertical: 14 },
    inputSuffix: { color: colors.textMuted, fontSize: 20, fontWeight: '600' },
    presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
    preset: {
      paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
      borderWidth: 1, borderColor: colors.border,
    },
    presetActive: { borderColor: colors.accent, backgroundColor: colors.accentMuted },
    presetText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
    buttons: { flexDirection: 'row', gap: 10 },
    cancelBtn: {
      flex: 1, paddingVertical: 14, borderRadius: 14,
      borderWidth: 1, borderColor: colors.border, alignItems: 'center',
    },
    cancelText: { color: colors.textSecondary, fontSize: 15, fontWeight: '600' },
    saveBtn: {
      flex: 1, paddingVertical: 14, borderRadius: 14,
      backgroundColor: colors.accent, alignItems: 'center',
    },
    saveText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  });
}

// ─── Nutrition Screen ─────────────────────────────────────────────────────────

export default function NutritionScreen() {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = getColors(isDark);
  const styles = getNutritionStyles(colors);
  const { meals, goals, getTotals, getMealTotals, removeMeal, checkAndResetDaily } = useNutritionStore();
  const { checkAndResetDaily: checkWaterDaily } = useWaterStore();
  const [activeTab, setActiveTab] = useState<'nutrition' | 'hydratation'>('nutrition');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    checkAndResetDaily();
    checkWaterDaily();
  }, []);

  const totals = getTotals();

  const caloriesRemaining = Math.max(goals.calories - totals.calories, 0);
  const caloriesOverflow = totals.calories > goals.calories;
  const getMealEntries = (type: MealEntry['mealType']) => meals.filter((m) => m.mealType === type);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.title}>Nutrition</Text>
          <Text style={styles.date}>Aujourd'hui</Text>
        </View>

        {/* ── Tab Switcher ── */}
        <TabBar active={activeTab} onChange={setActiveTab} />

        {activeTab === 'nutrition' ? (
          <>
            {/* ── Calories Summary ── */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryTop}>
                <View>
                  <Text style={styles.summaryLabel}>
                    {caloriesOverflow ? 'Dépassement' : 'Calories restantes'}
                  </Text>
                  <Text style={[styles.summaryValue, caloriesOverflow && { color: colors.error }]}>
                    {caloriesOverflow
                      ? `+${Math.round(totals.calories - goals.calories)}`
                      : Math.round(caloriesRemaining)}
                  </Text>
                  <Text style={styles.summaryGoal}>
                    {Math.round(totals.calories)} / {goals.calories} kcal
                  </Text>
                </View>
                <View style={styles.summaryBreakdown}>
                  {[
                    { label: 'Consommées', value: Math.round(totals.calories), color: MacroColors.calories },
                    { label: 'Objectif', value: goals.calories, color: colors.textMuted },
                    { label: 'Brûlées', value: 320, color: colors.accent },
                  ].map((row) => (
                    <View key={row.label} style={styles.summaryRow}>
                      <View style={[styles.summaryDot, { backgroundColor: row.color }]} />
                      <Text style={styles.summaryBreakdownLabel}>{row.label}</Text>
                      <Text style={styles.summaryBreakdownValue}>{row.value}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.calBar}>
                <View
                  style={[
                    styles.calBarFill,
                    {
                      width: `${Math.min((totals.calories / goals.calories) * 100, 100)}%`,
                      backgroundColor: caloriesOverflow ? colors.error : MacroColors.calories,
                    },
                  ]}
                />
              </View>
              <View style={styles.macroRings}>
                <MacroRing label="Protéines" current={totals.protein} goal={goals.protein} color={MacroColors.protein} unit="g" />
                <MacroRing label="Glucides"  current={totals.carbs}   goal={goals.carbs}   color={MacroColors.carbs}   unit="g" />
                <MacroRing label="Lipides"   current={totals.fat}     goal={goals.fat}     color={MacroColors.fat}     unit="g" />
              </View>
            </View>

            {/* ── Search Bar ── */}
            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un aliment..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Text style={styles.searchClear}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* ── Meal Sections ── */}
            {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => (
              <MealSection
                key={type}
                type={type}
                entries={getMealEntries(type)}
                totals={getMealTotals(type)}
                onRemove={removeMeal}
              />
            ))}

            {/* ── Daily Macro Summary ── */}
            <View style={styles.macroSummaryCard}>
              <Text style={styles.macroSummaryTitle}>Récapitulatif du jour</Text>
              {[
                { label: 'Protéines', current: totals.protein, goal: goals.protein, color: MacroColors.protein, unit: 'g' },
                { label: 'Glucides',  current: totals.carbs,   goal: goals.carbs,   color: MacroColors.carbs,   unit: 'g' },
                { label: 'Lipides',   current: totals.fat,     goal: goals.fat,     color: MacroColors.fat,     unit: 'g' },
              ].map((macro) => (
                <View key={macro.label} style={styles.macroSummaryRow}>
                  <View style={styles.macroSummaryLeft}>
                    <View style={[styles.macroSummaryDot, { backgroundColor: macro.color }]} />
                    <Text style={styles.macroSummaryLabel}>{macro.label}</Text>
                  </View>
                  <View style={styles.macroSummaryTrack}>
                    <View
                      style={[
                        styles.macroSummaryFill,
                        {
                          width: `${Math.min((macro.current / macro.goal) * 100, 100)}%`,
                          backgroundColor: macro.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.macroSummaryValue, { color: macro.color }]}>
                    {Math.round(macro.current)}/{macro.goal}{macro.unit}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <HydrationTab />
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

function getNutritionStyles(colors: ReturnType<typeof getColors>) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    content: { paddingHorizontal: 16, paddingTop: 8 },
    header: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'center', marginBottom: 16, paddingTop: 8,
    },
    title: { color: colors.text, fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
    date: { color: colors.accent, fontSize: 14, fontWeight: '600' },
    summaryCard: {
      backgroundColor: colors.card, borderRadius: 18, padding: 18,
      marginBottom: 14, borderWidth: 1, borderColor: colors.border,
    },
    summaryTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    summaryLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '500', marginBottom: 4 },
    summaryValue: { color: MacroColors.calories, fontSize: 36, fontWeight: '900', letterSpacing: -1 },
    summaryGoal: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
    summaryBreakdown: { justifyContent: 'center', gap: 6 },
    summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    summaryDot: { width: 8, height: 8, borderRadius: 4 },
    summaryBreakdownLabel: { color: colors.textSecondary, fontSize: 12, width: 80 },
    summaryBreakdownValue: { color: colors.text, fontSize: 12, fontWeight: '700' },
    calBar: { height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden', marginBottom: 16 },
    calBarFill: { height: '100%', borderRadius: 4 },
    macroRings: { flexDirection: 'row', paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border },
    searchBar: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card,
      borderRadius: 14, paddingHorizontal: 14, paddingVertical: 4,
      marginBottom: 14, borderWidth: 1, borderColor: colors.border, gap: 10,
    },
    searchIcon: { fontSize: 16 },
    searchInput: { flex: 1, color: colors.text, fontSize: 15, paddingVertical: 12 },
    searchClear: { color: colors.textMuted, fontSize: 14, padding: 4 },
    macroSummaryCard: {
      backgroundColor: colors.card, borderRadius: 16, padding: 16,
      marginBottom: 8, borderWidth: 1, borderColor: colors.border,
    },
    macroSummaryTitle: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 14 },
    macroSummaryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
    macroSummaryLeft: { flexDirection: 'row', alignItems: 'center', gap: 6, width: 90 },
    macroSummaryDot: { width: 8, height: 8, borderRadius: 4 },
    macroSummaryLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '500' },
    macroSummaryTrack: { flex: 1, height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
    macroSummaryFill: { height: '100%', borderRadius: 3 },
    macroSummaryValue: { fontSize: 12, fontWeight: '700', width: 80, textAlign: 'right' },
    bottomPadding: { height: 20 },
  });
}
