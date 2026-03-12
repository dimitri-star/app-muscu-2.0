import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/theme';
import { getColors } from '../constants/theme';
import { useWorkoutStore } from '../store';

interface ExerciseItem {
  id: string;
  name: string;
  muscle: string;
  equipment: string;
  isCustom?: true;
}

const DEFAULT_EXERCISES: ExerciseItem[] = [
  { id: 'e1', name: 'Developpe couche', muscle: 'Pectoraux', equipment: 'Barre' },
  { id: 'e2', name: 'Developpe incline halteres', muscle: 'Pectoraux', equipment: 'Halteres' },
  { id: 'e3', name: 'Ecartes poulie basse', muscle: 'Pectoraux', equipment: 'Cable' },
  { id: 'e4', name: 'Dips', muscle: 'Pectoraux', equipment: 'Poids de corps' },
  { id: 'e5', name: 'Developpe militaire', muscle: 'Epaules', equipment: 'Barre' },
  { id: 'e6', name: 'Elevations laterales', muscle: 'Epaules', equipment: 'Halteres' },
  { id: 'e7', name: 'Oiseau halteres', muscle: 'Epaules', equipment: 'Halteres' },
  { id: 'e8', name: 'Tractions', muscle: 'Dos', equipment: 'Barre de traction' },
  { id: 'e9', name: 'Rowing barre', muscle: 'Dos', equipment: 'Barre' },
  { id: 'e10', name: 'Rowing haltere', muscle: 'Dos', equipment: 'Halteres' },
  { id: 'e11', name: 'Tirage poulie haute', muscle: 'Dos', equipment: 'Cable' },
  { id: 'e12', name: 'Souleve de terre', muscle: 'Dos', equipment: 'Barre' },
  { id: 'e13', name: 'Curl biceps barre', muscle: 'Biceps', equipment: 'Barre' },
  { id: 'e14', name: 'Curl marteau', muscle: 'Biceps', equipment: 'Halteres' },
  { id: 'e15', name: 'Curl poulie basse', muscle: 'Biceps', equipment: 'Cable' },
  { id: 'e16', name: 'Triceps poulie haute', muscle: 'Triceps', equipment: 'Cable' },
  { id: 'e17', name: 'Extension triceps', muscle: 'Triceps', equipment: 'Halteres' },
  { id: 'e18', name: 'Dips banc', muscle: 'Triceps', equipment: 'Poids de corps' },
  { id: 'e19', name: 'Squat barre', muscle: 'Jambes', equipment: 'Barre' },
  { id: 'e20', name: 'Presse a cuisses', muscle: 'Jambes', equipment: 'Machine' },
  { id: 'e21', name: 'Fentes avant', muscle: 'Jambes', equipment: 'Halteres' },
  { id: 'e22', name: 'Leg curl', muscle: 'Jambes', equipment: 'Machine' },
  { id: 'e23', name: 'Souleve de terre roumain', muscle: 'Jambes', equipment: 'Barre' },
  { id: 'e24', name: 'Mollets debout', muscle: 'Jambes', equipment: 'Machine' },
  { id: 'e25', name: 'Crunch', muscle: 'Abdos', equipment: 'Poids de corps' },
  { id: 'e26', name: 'Gainage planche', muscle: 'Abdos', equipment: 'Poids de corps' },
  { id: 'e27', name: 'Releve de jambes suspendu', muscle: 'Abdos', equipment: 'Barre de traction' },
  { id: 'e28', name: 'Ab wheel', muscle: 'Abdos', equipment: 'Ab wheel' },
  { id: 'e29', name: 'Hip thrust', muscle: 'Fessiers', equipment: 'Barre' },
  { id: 'e30', name: 'Face pull', muscle: 'Epaules', equipment: 'Cable' },
  { id: 'e31', name: 'Curl inversé barre', muscle: 'Avant-bras', equipment: 'Barre' },
  { id: 'e32', name: 'Curl inversé haltères', muscle: 'Avant-bras', equipment: 'Halteres' },
  { id: 'e33', name: 'Flexion poignets barre', muscle: 'Avant-bras', equipment: 'Barre' },
  { id: 'e34', name: 'Extension poignets barre', muscle: 'Avant-bras', equipment: 'Barre' },
  { id: 'e35', name: 'Rotation pronation/supination', muscle: 'Avant-bras', equipment: 'Halteres' },
  { id: 'e36', name: 'Farmer carry', muscle: 'Avant-bras', equipment: 'Halteres' },
  { id: 'e37', name: 'Dead hang', muscle: 'Avant-bras', equipment: 'Barre de traction' },
];

const FILTER_PILLS = ['Tous', 'Pectoraux', 'Dos', 'Epaules', 'Biceps', 'Triceps', 'Avant-bras', 'Jambes', 'Abdos', 'Fessiers'];

const MUSCLE_OPTIONS = ['Pectoraux', 'Dos', 'Epaules', 'Biceps', 'Triceps', 'Avant-bras', 'Jambes', 'Abdos', 'Fessiers', 'Autre'];
const EQUIPMENT_OPTIONS = ['Barre', 'Halteres', 'Cable', 'Machine', 'Poids de corps', 'Barre de traction', 'Autre'];

interface ExerciseSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (exercise: ExerciseItem) => void;
}

export default function ExerciseSearchModal({
  visible,
  onClose,
  onSelect,
}: ExerciseSearchModalProps) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = getColors(isDark);
  const customExercises = useWorkoutStore((s) => s.customExercises);
  const addCustomExercise = useWorkoutStore((s) => s.addCustomExercise);

  // Search state
  const [searchText, setSearchText] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('Tous');

  // Create mode
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createMuscle, setCreateMuscle] = useState('Pectoraux');
  const [createEquipment, setCreateEquipment] = useState('Barre');
  const [showMusclePicker, setShowMusclePicker] = useState(false);
  const [showEquipmentPicker, setShowEquipmentPicker] = useState(false);

  const allExercises = useMemo(() => [...DEFAULT_EXERCISES, ...customExercises], [customExercises]);

  const filtered = useMemo(() => {
    return allExercises.filter((ex) => {
      const matchesSearch =
        searchText.trim() === '' ||
        ex.name.toLowerCase().includes(searchText.toLowerCase()) ||
        ex.muscle.toLowerCase().includes(searchText.toLowerCase());
      const matchesMuscle =
        selectedMuscle === 'Tous' || ex.muscle === selectedMuscle;
      return matchesSearch && matchesMuscle;
    });
  }, [searchText, selectedMuscle, allExercises]);

  const handleCreateSave = () => {
    if (createName.trim().length < 2) {
      Alert.alert('Nom requis', 'Entre un nom d\'exercice (minimum 2 caracteres).');
      return;
    }
    const newEx: ExerciseItem = {
      id: `custom_${Date.now()}`,
      name: createName.trim(),
      muscle: createMuscle,
      equipment: createEquipment,
      isCustom: true,
    };
    addCustomExercise(newEx);
    onSelect(newEx);
    onClose();
    // reset form
    setCreateName('');
    setCreateMuscle('Pectoraux');
    setCreateEquipment('Barre');
    setShowCreate(false);
  };

  const handleClose = () => {
    setShowCreate(false);
    setSearchText('');
    setSelectedMuscle('Tous');
    setShowMusclePicker(false);
    setShowEquipmentPicker(false);
    onClose();
  };

  const renderItem = ({ item }: { item: ExerciseItem }) => (
    <View style={[styles.exerciseRow, { borderBottomColor: colors.separator }]}>
      <View style={[styles.exerciseIcon, { backgroundColor: colors.cardAlt }]}>
        <Ionicons name="barbell-outline" size={20} color={colors.textSecondary} />
      </View>
      <View style={styles.exerciseInfo}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <Text style={[styles.exerciseName, { color: colors.text }]}>{item.name}</Text>
          {item.isCustom && (
            <View style={{ backgroundColor: colors.accent + '25', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
              <Text style={{ color: colors.accent, fontSize: 10, fontWeight: '700' }}>Custom</Text>
            </View>
          )}
        </View>
        <Text style={[styles.exerciseMuscle, { color: colors.textSecondary }]}>
          {item.muscle} · {item.equipment}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.addBtn, { backgroundColor: colors.accent }]}
        onPress={() => {
          onSelect(item);
          onClose();
        }}
      >
        <Ionicons name="add" size={20} color="#000000" />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>

        {/* ── Header ── */}
        <View style={[styles.header, { borderBottomColor: colors.separator }]}>
          {showCreate ? (
            <TouchableOpacity style={styles.backBtn} onPress={() => setShowCreate(false)}>
              <Ionicons name="chevron-back" size={22} color={colors.text} />
              <Text style={[styles.backText, { color: colors.text }]}>Retour</Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.headerTitle, { color: colors.text }]}>Choisir un exercice</Text>
          )}
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {showCreate ? (
          /* ── Create form ── */
          <ScrollView contentContainerStyle={styles.createContainer} keyboardShouldPersistTaps="handled">
            <Text style={[styles.createSectionLabel, { color: colors.textSecondary }]}>NOM DE L'EXERCICE</Text>
            <TextInput
              style={[styles.createInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.separator }]}
              placeholder="Ex: Curl concentration..."
              placeholderTextColor={colors.textTertiary}
              value={createName}
              onChangeText={setCreateName}
              autoFocus
              autoCorrect={false}
            />

            <Text style={[styles.createSectionLabel, { color: colors.textSecondary, marginTop: 20 }]}>GROUPE MUSCULAIRE</Text>
            <TouchableOpacity
              style={[styles.pickerBtn, { backgroundColor: colors.card, borderColor: colors.separator }]}
              onPress={() => { setShowMusclePicker((v) => !v); setShowEquipmentPicker(false); }}
            >
              <Text style={[styles.pickerBtnText, { color: colors.text }]}>{createMuscle}</Text>
              <Ionicons name={showMusclePicker ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            {showMusclePicker && (
              <View style={[styles.pickerList, { backgroundColor: colors.card, borderColor: colors.separator }]}>
                {MUSCLE_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.pickerOption, { borderBottomColor: colors.separator }]}
                    onPress={() => { setCreateMuscle(opt); setShowMusclePicker(false); }}
                  >
                    <Text style={[styles.pickerOptionText, { color: createMuscle === opt ? colors.accent : colors.text }]}>{opt}</Text>
                    {createMuscle === opt && <Ionicons name="checkmark" size={18} color={colors.accent} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={[styles.createSectionLabel, { color: colors.textSecondary, marginTop: 20 }]}>EQUIPEMENT</Text>
            <TouchableOpacity
              style={[styles.pickerBtn, { backgroundColor: colors.card, borderColor: colors.separator }]}
              onPress={() => { setShowEquipmentPicker((v) => !v); setShowMusclePicker(false); }}
            >
              <Text style={[styles.pickerBtnText, { color: colors.text }]}>{createEquipment}</Text>
              <Ionicons name={showEquipmentPicker ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            {showEquipmentPicker && (
              <View style={[styles.pickerList, { backgroundColor: colors.card, borderColor: colors.separator }]}>
                {EQUIPMENT_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.pickerOption, { borderBottomColor: colors.separator }]}
                    onPress={() => { setCreateEquipment(opt); setShowEquipmentPicker(false); }}
                  >
                    <Text style={[styles.pickerOptionText, { color: createEquipment === opt ? colors.accent : colors.text }]}>{opt}</Text>
                    {createEquipment === opt && <Ionicons name="checkmark" size={18} color={colors.accent} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.accent }]}
              onPress={handleCreateSave}
              activeOpacity={0.85}
            >
              <Text style={styles.saveBtnText}>Ajouter l'exercice</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          /* ── Search view ── */
          <>
            {/* Search bar */}
            <View style={[styles.searchBar, { backgroundColor: colors.input }]}>
              <Ionicons name="search" size={18} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Rechercher un exercice..."
                placeholderTextColor={colors.textTertiary}
                value={searchText}
                onChangeText={setSearchText}
                autoCorrect={false}
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Filter pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pillsRow}
            >
              {FILTER_PILLS.map((pill) => {
                const isActive = selectedMuscle === pill;
                return (
                  <TouchableOpacity
                    key={pill}
                    style={[
                      styles.pill,
                      { backgroundColor: isActive ? colors.accent : colors.cardAlt },
                    ]}
                    onPress={() => setSelectedMuscle(pill)}
                  >
                    <Text style={[styles.pillText, { color: isActive ? '#000000' : colors.textSecondary }]}>
                      {pill}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* List */}
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.list}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="search-outline" size={48} color={colors.textTertiary} />
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    Aucun exercice trouve
                  </Text>
                  <TouchableOpacity
                    style={[styles.emptyCreateBtn, { backgroundColor: colors.accent }]}
                    onPress={() => {
                      setCreateName(searchText);
                      setShowCreate(true);
                    }}
                  >
                    <Text style={styles.emptyCreateBtnText}>Creer "{searchText || 'un exercice'}"</Text>
                  </TouchableOpacity>
                </View>
              }
            />

            {/* Footer: create button */}
            <View style={[styles.footer, { borderTopColor: colors.separator, backgroundColor: colors.background }]}>
              <TouchableOpacity
                style={[styles.createBtn, { borderColor: colors.text }]}
                onPress={() => setShowCreate(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle-outline" size={18} color={colors.text} />
                <Text style={[styles.createBtnText, { color: colors.text }]}>Creer un exercice personnalise</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { fontSize: 16, fontWeight: '500' },
  closeBtn: { padding: 4 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  pillsRow: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  pillText: { fontSize: 13, fontWeight: '500' },
  list: { paddingHorizontal: 16 },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseInfo: { flex: 1 },
  exerciseName: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  exerciseMuscle: { fontSize: 12 },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15 },
  emptyCreateBtn: {
    marginTop: 8,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  emptyCreateBtnText: { color: '#000000', fontSize: 14, fontWeight: '700' },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 13,
  },
  createBtnText: { fontSize: 15, fontWeight: '600' },
  // Create form
  createContainer: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },
  createSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  createInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
  },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  pickerBtnText: { fontSize: 15, fontWeight: '500' },
  pickerList: {
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 4,
    overflow: 'hidden',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pickerOptionText: { fontSize: 15 },
  saveBtn: {
    marginTop: 32,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnText: { color: '#000000', fontSize: 16, fontWeight: '700' },
});
