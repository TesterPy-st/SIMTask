import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { createTask, getSettings } from '../../src/services/storage';
import { scheduleTaskReminders } from '../../src/services/platformNotifications';
import { parseVoiceInput } from '../../src/utils/voiceParser';
import { validateTask, sanitizeText } from '../../src/utils/validation';
import { Button } from '../../src/components/Button';
import { Footer } from '../../src/components/Footer';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/constants/theme';
import { formatDateForStorage, formatDate, formatTime } from '../../src/utils/dateUtils';

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
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  const handleVoiceInput = () => {
    setVoiceModalVisible(true);
    Alert.alert(
      'Voice Input',
      'Please say your task in the following format:\n\n"Set task on [date] as [task name]"\n\nExample: "Set task on 11 January 2026 as Hackathon at 3 PM"',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setVoiceModalVisible(false) },
        { text: 'Start Recording', onPress: startVoiceRecognition },
      ]
    );
  };

  const startVoiceRecognition = async () => {
    try {
      setIsListening(true);
      
      Alert.prompt(
        'Voice Input Simulation',
        'Enter your task (we\'ll parse it as if it were spoken):',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              setIsListening(false);
              setVoiceModalVisible(false);
            },
          },
          {
            text: 'Parse',
            onPress: (text?: string) => {
              if (text) {
                processVoiceInput(text);
              }
              setIsListening(false);
            },
          },
        ],
        'plain-text'
      );
    } catch (error) {
      console.error('Voice recognition error:', error);
      Alert.alert('Error', 'Failed to start voice recognition');
      setIsListening(false);
      setVoiceModalVisible(false);
    }
  };

  const processVoiceInput = (transcript: string) => {
    setVoiceTranscript(transcript);
    const parsed = parseVoiceInput(transcript);
    
    if (parsed) {
      setTitle(parsed.title);
      setDate(new Date(parsed.date));
      
      if (parsed.time) {
        const [hours, minutes] = parsed.time.split(':').map(Number);
        const timeDate = new Date();
        timeDate.setHours(hours, minutes, 0, 0);
        setTime(timeDate);
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Task Parsed Successfully',
        `Title: ${parsed.title}\nDate: ${formatDate(parsed.date)}${parsed.time ? `\nTime: ${formatTime(parsed.time)}` : ''}`,
        [{ text: 'OK', onPress: () => setVoiceModalVisible(false) }]
      );
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Parsing Failed',
        'Could not understand the task. Please try again or enter manually.',
        [{ text: 'OK', onPress: () => setVoiceModalVisible(false) }]
      );
    }
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

      const task = await createTask(taskData);

      const settings = await getSettings();
      
      if (settings.notificationsEnabled) {
        await scheduleTaskReminders(task, settings.ttsEnabled);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Error', 'Failed to create task. Please try again.');
    } finally {
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

          <TouchableOpacity style={styles.voiceButton} onPress={handleVoiceInput}>
            <Text style={styles.voiceIcon}>🎤</Text>
            <Text style={styles.voiceButtonText}>Use Voice Input</Text>
          </TouchableOpacity>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date *</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>📅 {formatDate(date)}</Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setDate(selectedDate);
                }
              }}
            />
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Time (Optional)</Text>
            <View style={styles.timeContainer}>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  🕐 {time ? formatTime(`${time.getHours()}:${time.getMinutes()}`) : 'No time set'}
                </Text>
              </TouchableOpacity>
              {time && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setTime(undefined)}
                >
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {showTimePicker && (
            <DateTimePicker
              value={time || new Date()}
              mode="time"
              display="default"
              onChange={(event, selectedTime) => {
                setShowTimePicker(Platform.OS === 'ios');
                if (selectedTime) {
                  setTime(selectedTime);
                }
              }}
            />
          )}

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
    backgroundColor: COLORS.primary,
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
    color: COLORS.text,
  },
  dateButton: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  dateButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
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
