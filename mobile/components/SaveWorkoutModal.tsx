import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/theme';
import { getColors } from '../constants/theme';
import type { WorkoutExercise } from '../constants/mockData';

interface WorkoutData {
  name: string;
  duration: number;
  exercises: WorkoutExercise[];
  startTime: string;
}

// Optional running-specific stats shown instead of weight/volume grid
export interface CourseModalData {
  km: string;
  pace: string;        // "5:20" or ""
  intervalCount: number;
  totalWorkMin: number;
}

interface SaveWorkoutModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (payload: {
    title: string;
    description: string;
    tags: string[];
    effortRating: number;
    energyRating: number;
    moodRating: number;
    sleepHours: string;
    sleepQuality: number;
    morningEnergy: number;
    soreness: number;
    visibility: VisibilityOption;
    photos: string[];
  }) => void;
  workoutData: WorkoutData;
  courseData?: CourseModalData; // when provided → running mode
}

const TAGS = [
  'Salle de sport',
  'Maison',
  'Hypertrophie',
  'Force',
  'Endurance',
  'Cardio',
];

type VisibilityOption = 'Tout le monde' | 'Amis' | 'Prive';
const VISIBILITY_OPTIONS: VisibilityOption[] = ['Tout le monde', 'Amis', 'Prive'];

function computeStats(exercises: WorkoutExercise[]) {
  let volume = 0;
  let totalSets = 0;
  let totalReps = 0;
  let maxWeight = 0;

  for (const ex of exercises) {
    for (const s of ex.sets) {
      if (s.done) {
        totalSets += 1;
        totalReps += s.reps;
        volume += s.reps * s.weight;
        if (s.weight > maxWeight) maxWeight = s.weight;
      }
    }
  }

  return { volume, totalSets, totalReps, maxWeight };
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h > 0) return `${h}h${rem.toString().padStart(2, '0')}`;
  return `${m} min`;
}

export default function SaveWorkoutModal({
  visible,
  onClose,
  onSave,
  workoutData,
  courseData,
}: SaveWorkoutModalProps) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = getColors(isDark);

  const [title, setTitle] = useState(workoutData.name);
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [effortRating, setEffortRating] = useState(0);
  const [energyRating, setEnergyRating] = useState(0);
  const [moodRating, setMoodRating] = useState(0);
  const [sleepHours, setSleepHours] = useState('');
  const [sleepQuality, setSleepQuality] = useState(0);
  const [morningEnergy, setMorningEnergy] = useState(0);
  const [soreness, setSoreness] = useState(0);
  const [visibility, setVisibility] = useState<VisibilityOption>('Tout le monde');
  const [showVisibilityPicker, setShowVisibilityPicker] = useState(false);

  // Photos
  const [photos, setPhotos] = useState<string[]>([]);

  const stats = computeStats(workoutData.exercises);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const requestPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'web') return true;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission requise',
        "Autorise l'accès à ta galerie dans les réglages pour ajouter des photos.",
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handlePickPhoto = async () => {
    const ok = await requestPermission();
    if (!ok) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5 - photos.length,
    });

    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setPhotos((prev) => [...prev, ...uris].slice(0, 5));
    }
  };

  const handleTakePhoto = async () => {
    if (Platform.OS === 'web') {
      handlePickPhoto();
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission requise',
        "Autorise l'accès à la caméra dans les réglages.",
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotos((prev) => [...prev, result.assets[0].uri].slice(0, 5));
    }
  };

  const handleRemovePhoto = (uri: string) => {
    setPhotos((prev) => prev.filter((p) => p !== uri));
  };

  const showPhotoOptions = () => {
    if (Platform.OS === 'web') {
      handlePickPhoto();
      return;
    }
    Alert.alert('Ajouter une photo', undefined, [
      { text: 'Prendre une photo', onPress: handleTakePhoto },
      { text: 'Choisir dans la galerie', onPress: handlePickPhoto },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const STAT_GRID = courseData
    ? [
        { label: 'Distance', value: courseData.km ? `${courseData.km} km` : '—' },
        { label: 'Allure moy.', value: courseData.pace ? `${courseData.pace} /km` : '—' },
        { label: 'Durée', value: formatDuration(workoutData.duration) },
        { label: 'Intervalles', value: String(courseData.intervalCount) },
        { label: 'Effort total', value: `${courseData.totalWorkMin % 1 === 0 ? courseData.totalWorkMin : courseData.totalWorkMin.toFixed(1)} min` },
      ]
    : [
        { label: 'Volume total', value: `${Math.round(stats.volume)} kg` },
        { label: 'Exercices', value: String(workoutData.exercises.length) },
        { label: 'Series', value: String(stats.totalSets) },
        { label: 'Duree', value: formatDuration(workoutData.duration) },
        { label: 'Total reps', value: String(stats.totalReps) },
        { label: 'Poids max', value: `${stats.maxWeight} kg` },
      ];

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
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {courseData ? 'Enregistrer la course' : "Enregistrer l'entrainement"}
          </Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Title */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Titre</Text>
            <TextInput
              style={[styles.titleInput, { backgroundColor: colors.input, color: colors.text }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Nom de la seance"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          {/* Photos */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              Photos ({photos.length}/5)
            </Text>

            {/* Photos grid */}
            {photos.length > 0 && (
              <View style={styles.photosGrid}>
                {photos.map((uri) => (
                  <View key={uri} style={[styles.photoThumb, { backgroundColor: colors.card }]}>
                    <Image source={{ uri }} style={styles.photoImg} resizeMode="cover" />
                    <TouchableOpacity
                      style={styles.photoRemove}
                      onPress={() => handleRemovePhoto(uri)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="close-circle" size={22} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                ))}
                {photos.length < 5 && (
                  <TouchableOpacity
                    style={[styles.photoAddThumb, { backgroundColor: colors.card, borderColor: colors.separator }]}
                    onPress={showPhotoOptions}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={28} color={colors.textTertiary} />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Empty state — big add button */}
            {photos.length === 0 && (
              <View style={styles.photoActions}>
                <TouchableOpacity
                  style={[styles.photoActionBtn, { backgroundColor: colors.card }]}
                  onPress={handleTakePhoto}
                  activeOpacity={0.8}
                >
                  <Ionicons name="camera-outline" size={26} color={colors.text} />
                  <Text style={[styles.photoActionText, { color: colors.text }]}>Prendre une photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.photoActionBtn, { backgroundColor: colors.card }]}
                  onPress={handlePickPhoto}
                  activeOpacity={0.8}
                >
                  <Ionicons name="images-outline" size={26} color={colors.text} />
                  <Text style={[styles.photoActionText, { color: colors.text }]}>Choisir dans la galerie</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Description</Text>
            <TextInput
              style={[styles.descInput, { backgroundColor: colors.input, color: colors.text }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Decris ta seance..."
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Tags</Text>
            <View style={styles.tagsRow}>
              {TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.tagPill,
                      {
                        backgroundColor: isSelected ? colors.tagGreenBg : colors.cardAlt,
                        borderColor: isSelected ? colors.accent : 'transparent',
                        borderWidth: 1,
                      },
                    ]}
                    onPress={() => toggleTag(tag)}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        { color: isSelected ? colors.accent : colors.textSecondary },
                      ]}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Stats grid */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Statistiques</Text>
            <View style={styles.statsGrid}>
              {STAT_GRID.map((stat) => (
                <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.card }]}>
                  <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Effort percu */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Ressenti</Text>

            <View style={[styles.ratingCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.ratingTitle, { color: colors.text }]}>Effort percu</Text>
              <View style={styles.ratingRow}>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <TouchableOpacity
                    key={n}
                    style={[styles.ratingPill, { backgroundColor: effortRating === n ? colors.sliderActive : colors.sliderInactive }]}
                    onPress={() => setEffortRating(n)}
                  >
                    <Text style={[styles.ratingPillText, { color: effortRating === n ? '#000000' : colors.textSecondary }]}>{n}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.subRatingRow}>
                <View style={styles.subRatingBlock}>
                  <Text style={[styles.ratingTitle, { color: colors.text }]}>Energie</Text>
                  <View style={styles.ratingRow}>
                    {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
                      <TouchableOpacity
                        key={n}
                        style={[styles.ratingPill, { backgroundColor: energyRating === n ? colors.sliderActive : colors.sliderInactive }]}
                        onPress={() => setEnergyRating(n)}
                      >
                        <Text style={[styles.ratingPillText, { color: energyRating === n ? '#000000' : colors.textSecondary }]}>{n}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.subRatingBlock}>
                  <Text style={[styles.ratingTitle, { color: colors.text }]}>Humeur</Text>
                  <View style={styles.ratingRow}>
                    {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
                      <TouchableOpacity
                        key={n}
                        style={[styles.ratingPill, { backgroundColor: moodRating === n ? colors.sliderActive : colors.sliderInactive }]}
                        onPress={() => setMoodRating(n)}
                      >
                        <Text style={[styles.ratingPillText, { color: moodRating === n ? '#000000' : colors.textSecondary }]}>{n}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Recovery */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Récupération</Text>

            <View style={[styles.ratingCard, { backgroundColor: colors.card }]}>
              <View style={styles.sleepRow}>
                <View style={styles.sleepLeft}>
                  <Text style={[styles.ratingTitle, { color: colors.text }]}>Sommeil</Text>
                  <TextInput
                    style={[styles.sleepInput, { backgroundColor: colors.input, color: colors.text }]}
                    value={sleepHours}
                    onChangeText={setSleepHours}
                    placeholder="0h"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="decimal-pad"
                    maxLength={4}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.ratingTitle, { color: colors.text }]}>Qualité sommeil</Text>
                  <View style={styles.ratingRow}>
                    {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
                      <TouchableOpacity
                        key={n}
                        style={[styles.ratingPill, { backgroundColor: sleepQuality === n ? colors.sliderActive : colors.sliderInactive }]}
                        onPress={() => setSleepQuality(n)}
                      >
                        <Text style={[styles.ratingPillText, { color: sleepQuality === n ? '#000000' : colors.textSecondary }]}>{n}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.subRatingRow}>
                <View style={styles.subRatingBlock}>
                  <Text style={[styles.ratingTitle, { color: colors.text }]}>Énergie matin</Text>
                  <View style={styles.ratingRow}>
                    {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
                      <TouchableOpacity
                        key={n}
                        style={[styles.ratingPill, { backgroundColor: morningEnergy === n ? colors.sliderActive : colors.sliderInactive }]}
                        onPress={() => setMorningEnergy(n)}
                      >
                        <Text style={[styles.ratingPillText, { color: morningEnergy === n ? '#000000' : colors.textSecondary }]}>{n}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.subRatingBlock}>
                  <Text style={[styles.ratingTitle, { color: colors.text }]}>Courbatures</Text>
                  <View style={styles.ratingRow}>
                    {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
                      <TouchableOpacity
                        key={n}
                        style={[styles.ratingPill, { backgroundColor: soreness === n ? '#FF6B3520' : colors.sliderInactive }]}
                        onPress={() => setSoreness(n)}
                      >
                        <Text style={[styles.ratingPillText, { color: soreness === n ? '#FF6B35' : colors.textSecondary }]}>{n}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Visibility */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Visibilite</Text>
            <TouchableOpacity
              style={[styles.visibilityBtn, { backgroundColor: colors.card }]}
              onPress={() => setShowVisibilityPicker((v) => !v)}
            >
              <Ionicons
                name={visibility === 'Tout le monde' ? 'globe-outline' : visibility === 'Amis' ? 'people-outline' : 'lock-closed-outline'}
                size={18}
                color={colors.textSecondary}
              />
              <Text style={[styles.visibilityText, { color: colors.text }]}>{visibility}</Text>
              <Ionicons name={showVisibilityPicker ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textSecondary} />
            </TouchableOpacity>

            {showVisibilityPicker && (
              <View style={[styles.visibilityOptions, { backgroundColor: colors.cardAlt }]}>
                {VISIBILITY_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.visibilityOption, { borderBottomColor: colors.separator }]}
                    onPress={() => { setVisibility(opt); setShowVisibilityPicker(false); }}
                  >
                    <Text style={[styles.visibilityOptionText, { color: visibility === opt ? colors.accent : colors.text, fontWeight: visibility === opt ? '600' : '400' }]}>
                      {opt}
                    </Text>
                    {visibility === opt && <Ionicons name="checkmark" size={16} color={colors.accent} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.cta }]}
            onPress={() =>
              onSave({
                title,
                description,
                tags: selectedTags,
                effortRating,
                energyRating,
                moodRating,
                sleepHours,
                sleepQuality,
                morningEnergy,
                soreness,
                visibility,
                photos,
              })
            }
            activeOpacity={0.85}
          >
            <Text style={[styles.saveBtnText, { color: colors.ctaText }]}>
              Enregistrer et publier
            </Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const PHOTO_SIZE = 100;

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
  closeBtn: { padding: 4 },
  scroll: { padding: 16 },
  section: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  titleInput: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  // Photos
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoThumb: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoImg: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
  },
  photoRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  photoAddThumb: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoActions: {
    flexDirection: 'row',
    gap: 10,
  },
  photoActionBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  photoActionText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Rest unchanged
  descInput: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 80,
  },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  tagText: { fontSize: 13, fontWeight: '500' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCard: { width: '31%', borderRadius: 12, padding: 12, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  statLabel: { fontSize: 11, textAlign: 'center' },
  ratingCard: { borderRadius: 14, padding: 16, gap: 14 },
  ratingTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  ratingRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  ratingPill: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  ratingPillText: { fontSize: 13, fontWeight: '600' },
  subRatingRow: { flexDirection: 'row', gap: 20 },
  subRatingBlock: { flex: 1 },
  sleepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, marginBottom: 14 },
  sleepLeft: { alignItems: 'center', gap: 6 },
  sleepInput: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, fontSize: 18, fontWeight: '700', width: 56, textAlign: 'center' },
  visibilityBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, gap: 10 },
  visibilityText: { flex: 1, fontSize: 15, fontWeight: '500' },
  visibilityOptions: { borderRadius: 12, marginTop: 4, overflow: 'hidden' },
  visibilityOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  visibilityOptionText: { fontSize: 15 },
  saveBtn: { borderRadius: 14, paddingVertical: 18, alignItems: 'center', marginTop: 8 },
  saveBtnText: { fontSize: 16, fontWeight: '700' },
});
