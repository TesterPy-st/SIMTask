/**
 * Platform-aware DateTime Picker
 * Native: @react-native-community/datetimepicker
 * Web: HTML5 input elements with better mobile support
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { isWeb } from '../utils/platformDetection';
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
  const [webDate, setWebDate] = useState(
    mode === 'date' 
      ? value.toISOString().split('T')[0] 
      : `${value.getHours().toString().padStart(2, '0')}:${value.getMinutes().toString().padStart(2, '0')}`
  );

  const handleWebChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setWebDate(newValue);

    if (mode === 'date') {
      const newDate = new Date(newValue);
      newDate.setHours(value.getHours(), value.getMinutes(), 0, 0);
      onChange(newDate);
    } else {
      const [hours, minutes] = newValue.split(':').map(Number);
      const newDate = new Date(value);
      newDate.setHours(hours, minutes, 0, 0);
      onChange(newDate);
    }
  };

  // Web: Use HTML5 input with better styling
  if (isWeb()) {
    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View style={styles.webPickerContainer}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => {
                      const input = document.getElementById(`${mode}-input`) as HTMLInputElement;
              if (input) {
                // On mobile, use showPicker() if available (native picker)
                // On desktop, click() will open the browser's date/time picker
                if (typeof (input as any).showPicker === 'function') {
                  (input as any).showPicker();
                } else {
                  input.focus();
                  input.click();
                }
              }
            }}
          >
            <Text style={styles.dateText}>
              {mode === 'date' ? '📅 ' : '🕐 '}
              {mode === 'date' ? formatDate(webDate) : formatTime(webDate)}
            </Text>
          </TouchableOpacity>
          <input
            id={`${mode}-input`}
            type={mode}
            value={webDate}
            onChange={handleWebChange}
            style={styles.hiddenInput}
            inputMode={mode === 'date' ? 'none' : 'text'}
          />
        </View>
      </View>
    );
  }

  // Native: Use React Native Community DateTimePicker
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
  webPickerContainer: {
    position: 'relative',
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
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    cursor: 'pointer',
  },
});
