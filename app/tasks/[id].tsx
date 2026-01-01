import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import {
  getTaskById,
  updateTask,
  deleteTask,
  getSettings,
} from '../../src/services/storage';
import { scheduleTaskReminders, cancelTaskReminders } from '../../src/services/platformNotifications';
import { Task } from '../../src/types';
import { validateTask, sanitizeText } from '../../src/utils/validation';
import { Button } from '../../src/components/Button';
import { Footer } from '../../src/components/Footer';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/constants/theme';
import { formatDateForStorage, formatDate, formatTime } from '../../src/utils/dateUtils';

export default function TaskDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState<Date | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTask();
  }, [id]);

  const loadTask = async () => {
    try {
      const taskData = await getTaskById(id);
      
      if (taskData) {
        setTask(taskData);
        setTitle(taskData.title);
        setDate(new Date(taskData.date));
        
        if (taskData.time) {
          const [hours, minutes] = taskData.time.split(':').map(Number);
          const timeDate = new Date();
          timeDate.setHours(hours, minutes, 0, 0);
          setTime(timeDate);
        }
        
        setDescription(taskData.description || '');
        setPriority(taskData.priority || 'medium');
      } else {
        Alert.alert('Error', 'Task not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading task:', error);
      Alert.alert('Error', 'Failed to load task');
      router.back();
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

      await updateTask(id, taskData);

      const settings = await getSettings();
      
      if (settings.notificationsEnabled) {
        await cancelTaskReminders(id);
        const updatedTask = await getTaskById(id);
        if (updatedTask) {
          await scheduleTaskReminders(updatedTask, settings.ttsEnabled);
        }
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsEditing(false);
      await loadTask();
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelTaskReminders(id);
              await deleteTask(id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.back();
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  if (!task) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!isEditing) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            <View style={styles.viewCard}>
              <Text style={styles.viewTitle}>{task.title}</Text>
              
              <View style={styles.viewRow}>
                <Text style={styles.viewLabel}>📅 Date:</Text>
                <Text style={styles.viewValue}>{formatDate(task.date)}</Text>
              </View>
              
              {task.time && (
                <View style={styles.viewRow}>
                  <Text style={styles.viewLabel}>🕐 Time:</Text>
                  <Text style={styles.viewValue}>{formatTime(task.time)}</Text>
                </View>
              )}
              
              <View style={styles.viewRow}>
                <Text style={styles.viewLabel}>Priority:</Text>
                <View style={[styles.priorityBadge, styles[`priority${task.priority || 'medium'}`]]}>
                  <Text style={styles.priorityBadgeText}>
                    {(task.priority || 'medium').toUpperCase()}
                  </Text>
                </View>
              </View>
              
              {task.description && (
                <View style={styles.viewDescriptionContainer}>
                  <Text style={styles.viewLabel}>Description:</Text>
                  <Text style={styles.viewDescription}>{task.description}</Text>
                </View>
              )}
            </View>

            <View style={styles.buttonContainer}>
              <Button
                title="Edit"
                onPress={() => setIsEditing(true)}
                variant="secondary"
                style={styles.button}
              />
              <Button
                title="Delete"
                onPress={handleDelete}
                variant="danger"
                style={styles.button}
              />
            </View>
          </View>

          <Footer />
        </ScrollView>
      </SafeAreaView>
    );
  }

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
              onPress={() => {
                setIsEditing(false);
                loadTask();
              }}
              variant="ghost"
              style={styles.button}
            />
            <Button
              title="Save Changes"
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
  },
  viewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  viewTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  viewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  viewLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
    minWidth: 80,
  },
  viewValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  priorityBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  prioritylow: {
    backgroundColor: COLORS.success,
  },
  prioritymedium: {
    backgroundColor: COLORS.warning,
  },
  priorityhigh: {
    backgroundColor: COLORS.error,
  },
  priorityBadgeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    fontWeight: '700',
  },
  viewDescriptionContainer: {
    marginTop: SPACING.md,
  },
  viewDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginTop: SPACING.sm,
    lineHeight: 22,
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
