import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useThemeStore } from '../store/theme';
import { getColors } from '../constants/theme';

interface CustomWaterModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (ml: number) => void;
}

export default function CustomWaterModal({
  visible,
  onClose,
  onAdd,
}: CustomWaterModalProps) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = getColors(isDark);

  const [value, setValue] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setValue('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [visible]);

  const handleAdd = () => {
    const ml = parseInt(value, 10);
    if (!isNaN(ml) && ml > 0) {
      onAdd(ml);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.card, { backgroundColor: colors.card }]}
          onPress={() => {}}
        >
          <Text style={[styles.title, { color: colors.text }]}>Quantite d'eau</Text>

          <View style={[styles.inputRow, { backgroundColor: colors.input }]}>
            <TextInput
              ref={inputRef}
              style={[styles.input, { color: colors.text }]}
              value={value}
              onChangeText={setValue}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.textTertiary}
              returnKeyType="done"
              onSubmitEditing={handleAdd}
            />
            <Text style={[styles.unit, { color: colors.textSecondary }]}>ml</Text>
          </View>

          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: colors.cardAlt }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: colors.accent }]}
              onPress={handleAdd}
            >
              <Text style={styles.addText}>Ajouter</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  card: {
    width: '100%',
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 18,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  unit: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
  addBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
});
