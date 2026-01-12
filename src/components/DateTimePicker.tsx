/**
 * DateTime Picker for Android
 * Uses @react-native-community/datetimepicker
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { formatDate, formatTime } from '../utils/dateUtils';

interface DateTimePickerProps {
  value: Date;
  mode: 'date' | 'time';
  onChange: (date: Date) => void;
  label?: string;
  showPicker?: boolean;
  onPickerToggle?: () => void;
}

export const DateTimePickerComponent: React.FC<DateTimePickerProps> = ({
  value,
  mode,
  onChange,
  label,
  showPicker = false,
  onPickerToggle,
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={styles.dateButton}
        onPress={onPickerToggle}
      >
        <Text style={styles.dateText}>
          {mode === 'date' ? '📅 ' : '🕐 '}
          {mode === 'date'
            ? formatDate(value.toISOString().split('T')[0])
            : formatTime(`${value.getHours()}:${value.getMinutes()}`)}
        </Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={value}
          mode={mode}
          display="default"
          onChange={(event, selectedDate) => {
            onPickerToggle?.();
            if (selectedDate) {
              onChange(selectedDate);
            }
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  dateButton: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.divider,
    minHeight: 50,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
});
