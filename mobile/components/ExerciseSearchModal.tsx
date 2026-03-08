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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/theme';
import { getColors } from '../constants/theme';

interface ExerciseItem {
  id: string;
  name: string;
  muscle: string;
  equipment: string;
}

const EXERCISES: ExerciseItem[] = [
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
];

const FILTER_PILLS = ['Tous', 'Pectoraux', 'Dos', 'Epaules', 'Biceps', 'Triceps', 'Jambes', 'Abdos'];

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

  const [searchText, setSearchText] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('Tous');

  const filtered = useMemo(() => {
    return EXERCISES.filter((ex) => {
      const matchesSearch =
        searchText.trim() === '' ||
        ex.name.toLowerCase().includes(searchText.toLowerCase()) ||
        ex.muscle.toLowerCase().includes(searchText.toLowerCase());
      const matchesMuscle =
        selectedMuscle === 'Tous' || ex.muscle === selectedMuscle;
      return matchesSearch && matchesMuscle;
    });
  }, [searchText, selectedMuscle]);

  const renderItem = ({ item }: { item: ExerciseItem }) => (
    <View style={[styles.exerciseRow, { borderBottomColor: colors.separator }]}>
      <View style={[styles.exerciseIcon, { backgroundColor: colors.cardAlt }]}>
        <Ionicons name="barbell-outline" size={20} color={colors.textSecondary} />
      </View>
      <View style={styles.exerciseInfo}>
        <Text style={[styles.exerciseName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.exerciseMuscle, { color: colors.textSecondary }]}>{item.muscle}</Text>
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
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.separator }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Choisir un exercice</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

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
                <Text
                  style={[
                    styles.pillText,
                    { color: isActive ? '#000000' : colors.textSecondary },
                  ]}
                >
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
            </View>
          }
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
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
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  pillsRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
  },
  list: {
    paddingHorizontal: 16,
  },
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
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  exerciseMuscle: {
    fontSize: 12,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
  },
});
