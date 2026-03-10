import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/theme';
import { getColors } from '../constants/theme';

interface SettingsScreenProps {
  onBack: () => void;
}

type ObjectifOption = 'Prise de masse' | 'Seche' | 'Maintien' | 'Force';
const OBJECTIF_OPTIONS: ObjectifOption[] = ['Prise de masse', 'Seche', 'Maintien', 'Force'];

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const isDark = useThemeStore((s) => s.isDark);
  const setLight = useThemeStore((s) => s.setLight);
  const setDark = useThemeStore((s) => s.setDark);
  const colors = getColors(isDark);

  // Profil fields
  const [nom, setNom] = useState('Dimitri Alvarez');
  const [age, setAge] = useState('21');
  const [taille, setTaille] = useState('178');
  const [poids, setPoids] = useState('78');

  // Objectif
  const [objectif, setObjectif] = useState<ObjectifOption>('Force');
  const [showObjectifPicker, setShowObjectifPicker] = useState(false);

  // Macros
  const [proteines, setProteines] = useState('180');
  const [glucides, setGlucides] = useState('280');
  const [lipides, setLipides] = useState('70');
  const [calories, setCalories] = useState('2500');

  // Eau
  const [eauObjectif, setEauObjectif] = useState('3100');

  // Repos
  const [reposDefault, setReposDefault] = useState('90');

  const rowBg = { backgroundColor: colors.card };
  const separatorColor = { borderBottomColor: colors.separator };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.separator }]}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
          <Text style={[styles.backLabel, { color: colors.text }]}>Parametres</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* APPARENCE */}
        <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>Apparence</Text>
        <View style={[styles.groupCard, rowBg]}>
          <TouchableOpacity
            style={[styles.row, separatorColor, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
            onPress={setLight}
          >
            <Text style={[styles.rowLabel, { color: colors.text }]}>Mode clair</Text>
            {!isDark && <Ionicons name="checkmark-circle" size={22} color={colors.accent} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.row, { borderBottomWidth: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
            onPress={setDark}
          >
            <Text style={[styles.rowLabel, { color: colors.text }]}>Mode sombre</Text>
            {isDark && <Ionicons name="checkmark-circle" size={22} color={colors.accent} />}
          </TouchableOpacity>
        </View>

        {/* PROFIL */}
        <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>Profil</Text>
        <View style={[styles.groupCard, rowBg]}>
          <View style={[styles.row, separatorColor]}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>Nom</Text>
            <TextInput
              style={[styles.rowInput, { color: colors.text }]}
              value={nom}
              onChangeText={setNom}
              placeholder="Votre nom"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
          <View style={[styles.row, separatorColor]}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>Age</Text>
            <TextInput
              style={[styles.rowInput, { color: colors.text }]}
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              placeholder="ans"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
          <View style={[styles.row, separatorColor]}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>Taille</Text>
            <TextInput
              style={[styles.rowInput, { color: colors.text }]}
              value={taille}
              onChangeText={setTaille}
              keyboardType="numeric"
              placeholder="cm"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>Poids</Text>
            <TextInput
              style={[styles.rowInput, { color: colors.text }]}
              value={poids}
              onChangeText={setPoids}
              keyboardType="numeric"
              placeholder="kg"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
        </View>

        {/* OBJECTIFS */}
        <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>Objectifs</Text>
        <View style={[styles.groupCard, rowBg]}>
          <TouchableOpacity
            style={[styles.row, { borderBottomWidth: 0 }]}
            onPress={() => setShowObjectifPicker((v) => !v)}
          >
            <Text style={[styles.rowLabel, { color: colors.text }]}>Objectif</Text>
            <View style={styles.rowRight}>
              <Text style={[styles.rowValue, { color: colors.textSecondary }]}>{objectif}</Text>
              <Ionicons
                name={showObjectifPicker ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={colors.textTertiary}
              />
            </View>
          </TouchableOpacity>
          {showObjectifPicker && (
            <View style={[styles.pickerContainer, { borderTopColor: colors.separator, borderTopWidth: StyleSheet.hairlineWidth }]}>
              {OBJECTIF_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.pickerOption,
                    { borderBottomColor: colors.separator },
                  ]}
                  onPress={() => {
                    setObjectif(opt);
                    setShowObjectifPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerOptionText,
                      {
                        color: objectif === opt ? colors.accent : colors.text,
                        fontWeight: objectif === opt ? '600' : '400',
                      },
                    ]}
                  >
                    {opt}
                  </Text>
                  {objectif === opt && (
                    <Ionicons name="checkmark" size={16} color={colors.accent} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* MACROS */}
        <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>Macros journalieres</Text>
        <View style={[styles.groupCard, rowBg]}>
          {[
            { label: 'Proteines', value: proteines, setter: setProteines, unit: 'g' },
            { label: 'Glucides', value: glucides, setter: setGlucides, unit: 'g' },
            { label: 'Lipides', value: lipides, setter: setLipides, unit: 'g' },
            { label: 'Calories', value: calories, setter: setCalories, unit: 'kcal' },
          ].map((item, idx, arr) => (
            <View
              key={item.label}
              style={[
                styles.row,
                { borderBottomWidth: idx < arr.length - 1 ? StyleSheet.hairlineWidth : 0 },
                separatorColor,
              ]}
            >
              <Text style={[styles.rowLabel, { color: colors.text }]}>{item.label}</Text>
              <View style={styles.rowRight}>
                <TextInput
                  style={[styles.rowInput, { color: colors.text }]}
                  value={item.value}
                  onChangeText={item.setter}
                  keyboardType="numeric"
                  placeholderTextColor={colors.textTertiary}
                />
                <Text style={[styles.unitLabel, { color: colors.textTertiary }]}>{item.unit}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* EAU */}
        <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>Eau</Text>
        <View style={[styles.groupCard, rowBg]}>
          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>Objectif journalier</Text>
            <View style={styles.rowRight}>
              <TextInput
                style={[styles.rowInput, { color: colors.text }]}
                value={eauObjectif}
                onChangeText={setEauObjectif}
                keyboardType="numeric"
                placeholderTextColor={colors.textTertiary}
              />
              <Text style={[styles.unitLabel, { color: colors.textTertiary }]}>ml</Text>
            </View>
          </View>
        </View>

        {/* REPOS */}
        <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>Repos</Text>
        <View style={[styles.groupCard, rowBg]}>
          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>Temps de repos par defaut</Text>
            <View style={styles.rowRight}>
              <TextInput
                style={[styles.rowInput, { color: colors.text }]}
                value={reposDefault}
                onChangeText={setReposDefault}
                keyboardType="numeric"
                placeholderTextColor={colors.textTertiary}
              />
              <Text style={[styles.unitLabel, { color: colors.textTertiary }]}>s</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  scroll: {
    padding: 16,
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 16,
    paddingHorizontal: 4,
  },
  groupCard: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  rowInput: {
    fontSize: 15,
    textAlign: 'right',
    minWidth: 60,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowValue: {
    fontSize: 15,
  },
  unitLabel: {
    fontSize: 13,
  },
  pickerContainer: {
    overflow: 'hidden',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pickerOptionText: {
    fontSize: 15,
  },
});
