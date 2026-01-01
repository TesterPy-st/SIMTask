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
import { parseVoiceInput } from '../../src/utils/voiceParser';
import { validateTask, sanitizeText } from '../../src/utils/validation';
import { isWeb } from '../../src/utils/platformDetection';
import { startSpeechRecognition, stopSpeechRecognition, getAvailabilityMessage } from '../../src/services/speechToText';
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
  const [isListening, setIsListening] = useState(false);

  const handleVoiceInput = async () => {
    if (isListening) {
      stopSpeechRecognition();
      setIsListening(false);
      return;
    }

    const availabilityMessage = getAvailabilityMessage();
    
    if (availabilityMessage) {
      Alert.alert(
        'Voice Input Not Available',
        availabilityMessage,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Voice Input',
      'Please say your task in the following format:\n\n"Set task on [date] as [task name]"\n\nExample: "Set task on 11 January 2026 as Hackathon at 3 PM"',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Recording', 
          onPress: () => {
            setIsListening(true);
            Alert.alert('Listening...', 'Speak your task now.', [{ text: 'Stop', onPress: () => {
              stopSpeechRecognition();
              setIsListening(false);
            }}]);
            startVoiceRecognition({
              language: 'en-US',
              continuous: false,
              interimResults: false,
              onResult: (result) => {
                processVoiceInput(result.transcript);
              },
              onError: (error) => {
                Alert.alert('Voice Error', error);
                setIsListening(false);
              },
              onEnd: () => {
                setIsListening(false);
              }
            }).catch((error) => {
              Alert.alert('Voice Error', error.message);
              setIsListening(false);
            });
          }
        },
      ]
    );
  };

  const processVoiceInput = (transcript: string) => {
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
        [{ text: 'OK' }]
      );
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Parsing Failed',
        'Could not understand the task. Please try again or enter manually.',
        [{ text: 'OK' }]
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

      // Create task with timeout
      const task = await Promise.race([
        createTask(taskData),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Task creation timeout')), 10000)
        )
      ]) as Task;

      const settings = await getSettings();
      
      if (settings.notificationsEnabled) {
        try {
          await scheduleTaskReminders(task, settings.ttsEnabled);
        } catch (error) {
          console.error('Failed to schedule reminders:', error);
          // Don't fail task creation if reminders fail
        }
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Success',
        'Task created successfully!',
        [
          { 
            text: 'OK', 
            onPress: () => {
              // Force navigation back and refresh
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

          <TouchableOpacity 
            style={[styles.voiceButton, isListening && styles.voiceButtonActive]} 
            onPress={handleVoiceInput}
            disabled={loading}
          >
            {isListening ? (
              <ActivityIndicator size="small" color={COLORS.text} />
            ) : (
              <Text style={styles.voiceIcon}>🎤</Text>
            )}
            <Text style={styles.voiceButtonText}>
              {isListening ? 'Listening...' : 'Use Voice Input'}
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
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  voiceButtonActive: {
    backgroundColor: COLORS.error,
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
