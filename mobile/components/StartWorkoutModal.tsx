import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/theme';
import { getColors } from '../constants/theme';

interface StartWorkoutModalProps {
  visible: boolean;
  onClose: () => void;
  onStartEmpty: () => void;
  onStartFromProgram: () => void;
}

export default function StartWorkoutModal({
  visible,
  onClose,
  onStartEmpty,
  onStartFromProgram,
}: StartWorkoutModalProps) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = getColors(isDark);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: colors.card }]}
          onPress={() => {}}
        >
          <View style={[styles.handle, { backgroundColor: colors.separator }]} />

          <Text style={[styles.title, { color: colors.text }]}>
            Demarrer une seance
          </Text>

          <TouchableOpacity
            style={[styles.optionBtn, { backgroundColor: colors.cardAlt }]}
            onPress={onStartEmpty}
            activeOpacity={0.8}
          >
            <View style={[styles.iconBox, { backgroundColor: colors.input }]}>
              <Ionicons name="barbell-outline" size={22} color={colors.accent} />
            </View>
            <View style={styles.optionTextWrapper}>
              <Text style={[styles.optionTitle, { color: colors.text }]}>Seance libre</Text>
              <Text style={[styles.optionSub, { color: colors.textSecondary }]}>
                Commencer sans programme
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionBtn, { backgroundColor: colors.cardAlt }]}
            onPress={onStartFromProgram}
            activeOpacity={0.8}
          >
            <View style={[styles.iconBox, { backgroundColor: colors.input }]}>
              <Ionicons name="list-outline" size={22} color={colors.accentOrange} />
            </View>
            <View style={styles.optionTextWrapper}>
              <Text style={[styles.optionTitle, { color: colors.text }]}>Depuis un programme</Text>
              <Text style={[styles.optionSub, { color: colors.textSecondary }]}>
                Suivre un jour de programme
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Annuler</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    gap: 14,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextWrapper: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionSub: {
    fontSize: 13,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 4,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
