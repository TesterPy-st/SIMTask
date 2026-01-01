import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { createTask, getSettings } from '../../src/services/storage';
import { scheduleTaskReminders } from '../../src/services/platformNotifications';
import { validateTask, sanitizeText } from '../../src/utils/validation';
import { Button } from '../../src/components/Button';
import { Footer } from '../../src/components/Footer';
import { DateTimePickerComponent } from '../../src/components/DateTimePicker';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/constants/theme';
import { formatDateForStorage, formatDate, formatTime } from '../../src/utils/dateUtils';
import { Task } from '../../src/types';

export default function CreateTaskScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState<Date | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVoiceInput = () => {
    Alert.alert(
      'Voice Input',
      'Voice input is currently not available on Android. Please enter your task manually using the text fields.',
      [{ text: 'OK' }]
    );
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    setLoading(true);
    
    try {
      const taskDate = formatDateForStorage(date);
      const taskTime = time
        ? `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`
        : undefined;

      // Validate and sanitize inputs
      const taskData = {
        title: sanitizeText(title.trim()),
        date: taskDate,
        time: taskTime,
        description: description.trim() ? sanitizeText(description.trim()) : undefined,
        priority,
      };

      const validation = validateTask(taskData);
      if (!validation.valid) {
        Alert.alert('Validation Error', validation.errors.join('\n'));
        setLoading(false);
        return;
      }

      // Create task
      const task = await createTask(taskData);

      const settings = await getSettings();

      if (settings.notificationsEnabled) {
        try {
          await scheduleTaskReminders(task, settings.ttsEnabled);
        } catch (error) {
          console.error('Failed to schedule reminders:', error);
          // Don't fail task creation if reminders fail
        }
      }

      setLoading(false);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Task Added Successfully',
        'Your task has been created and reminders have been scheduled.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert(
        'Error',
        'Failed to create task. Please try again.',
        [{ text: 'OK' }]
      );
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Task Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter task title"
              placeholderTextColor={COLORS.textTertiary}
            />
          </View>

          <TouchableOpacity
            style={styles.voiceButton}
            onPress={handleVoiceInput}
            disabled={loading}
          >
            <Text style={styles.voiceIcon}>🎤</Text>
            <Text style={styles.voiceButtonText}>
              Use Voice Input (Not Available)
            </Text>
          </TouchableOpacity>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date *</Text>
            <DateTimePickerComponent
              value={date}
              mode="date"
              onChange={setDate}
              showPicker={showDatePicker}
              onPickerToggle={() => setShowDatePicker(!showDatePicker)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Time (Optional)</Text>
            <View style={styles.timeContainer}>
              <DateTimePickerComponent
                value={time || new Date()}
                mode="time"
                onChange={(newTime) => setTime(newTime)}
                showPicker={showTimePicker}
                onPickerToggle={() => setShowTimePicker(!showTimePicker)}
              />
              {time && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setTime(undefined)}
                  disabled={loading}
                >
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityContainer}>
              {(['low', 'medium', 'high'] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityButton,
                    priority === p && styles.priorityButtonActive,
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text
                    style={[
                      styles.priorityButtonText,
                      priority === p && styles.priorityButtonTextActive,
                    ]}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add description"
              placeholderTextColor={COLORS.textTertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              onPress={() => router.back()}
              variant="ghost"
              style={styles.button}
            />
            <Button
              title="Create Task"
              onPress={handleSave}
              loading={loading}
              style={styles.button}
            />
          </View>
        </View>

        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  textArea: {
    minHeight: 100,
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  voiceIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  voiceButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  timeContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  clearButton: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    justifyContent: 'center',
  },
  clearButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    fontWeight: '600',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  priorityButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  priorityButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  priorityButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  priorityButtonTextActive: {
    color: COLORS.text,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  button: {
    flex: 1,
  },
});
