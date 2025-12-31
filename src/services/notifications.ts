import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Task } from '../types';
import { NOTIFICATION_CONFIG } from '../constants/config';
import { playTaskReminder } from './tts';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (!Device.isDevice) {
    console.log('Must use physical device for notifications');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get notification permissions');
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Task Reminders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0A84FF',
    });
  }

  return true;
};

const calculateReminderDate = (taskDate: string, taskTime?: string): Date[] => {
  const taskDateTime = new Date(taskDate);
  const now = new Date();
  const reminders: Date[] = [];

  if (taskTime) {
    const [hours, minutes] = taskTime.split(':').map(Number);
    taskDateTime.setHours(hours, minutes, 0, 0);
  } else {
    taskDateTime.setHours(9, 0, 0, 0);
  }

  const daysDifference = Math.floor((taskDateTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDifference > 1) {
    const advanceReminder = new Date(taskDateTime);
    advanceReminder.setDate(advanceReminder.getDate() - NOTIFICATION_CONFIG.advanceReminderDays);
    
    if (advanceReminder > now) {
      reminders.push(advanceReminder);
    }
  }

  if (daysDifference === 0) {
    const sameDayReminder = new Date(taskDateTime);
    sameDayReminder.setHours(sameDayReminder.getHours() - NOTIFICATION_CONFIG.sameDayReminderHours);
    
    if (sameDayReminder > now) {
      reminders.push(sameDayReminder);
    }
  }

  if (taskDateTime > now) {
    reminders.push(taskDateTime);
  }

  return reminders;
};

export const scheduleTaskReminders = async (task: Task, ttsEnabled: boolean = true): Promise<string[]> => {
  const reminderDates = calculateReminderDate(task.date, task.time);
  const notificationIds: string[] = [];

  for (const reminderDate of reminderDates) {
    try {
      const isTaskDay = reminderDate.toDateString() === new Date(task.date).toDateString();
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: isTaskDay ? '📅 Task Due Today!' : '⏰ Upcoming Task',
          body: `${task.title}\nScheduled: ${formatTaskDateTime(task.date, task.time)}`,
          data: { taskId: task.id, taskTitle: task.title, taskDate: task.date, taskTime: task.time },
          sound: true,
        },
        trigger: reminderDate,
      });

      notificationIds.push(notificationId);
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  return notificationIds;
};

export const cancelTaskReminders = async (taskId: string): Promise<void> => {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  
  for (const notification of notifications) {
    if (notification.content.data?.taskId === taskId) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
};

export const setupNotificationListener = (ttsEnabled: boolean): void => {
  Notifications.addNotificationReceivedListener(async (notification) => {
    const { taskTitle, taskDate, taskTime } = notification.request.content.data || {};
    
    if (ttsEnabled && taskTitle) {
      const message = taskTime
        ? `${taskTitle} scheduled for ${formatDateForSpeech(taskDate)} at ${formatTimeForSpeech(taskTime)}`
        : `${taskTitle} scheduled for ${formatDateForSpeech(taskDate)}`;
      
      await playTaskReminder(message);
    }
  });
};

const formatTaskDateTime = (date: string, time?: string): string => {
  const dateObj = new Date(date);
  const dateStr = dateObj.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
  
  if (time) {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${dateStr} at ${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
  
  return dateStr;
};

const formatDateForSpeech = (date: string): string => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

const formatTimeForSpeech = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};
