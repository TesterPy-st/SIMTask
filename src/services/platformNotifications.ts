/**
 * Platform-aware notifications service
 * Native: expo-notifications
 * Web: Web Notifications API
 */

import { Platform } from 'react-native';
import { isWeb } from '../utils/platformDetection';
import { Task } from '../types';
import { NOTIFICATION_CONFIG } from '../constants/config';
import { playTaskReminder } from './textToSpeech';

// Web notification storage
const webNotifications = new Map<string, number[]>();

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (isWeb()) {
    // Web Notifications API
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    const NotificationAPI = (window as any).Notification;

    if (NotificationAPI.permission === 'granted') {
      return true;
    }

    if (NotificationAPI.permission !== 'denied') {
      const permission = await NotificationAPI.requestPermission();
      return permission === 'granted';
    }

    return false;
  } else {
    // Native notifications
    const Notifications = await import('expo-notifications');
    const Device = await import('expo-device');

    if (!Device.default.isDevice) {
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
  }
};

/**
 * Calculate reminder dates for a task
 */
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

/**
 * Format task date and time for display
 */
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

/**
 * Schedule task reminders
 */
export const scheduleTaskReminders = async (task: Task, ttsEnabled: boolean = true): Promise<string[]> => {
  const reminderDates = calculateReminderDate(task.date, task.time);
  const notificationIds: string[] = [];

  if (isWeb()) {
    // Schedule web notifications using setTimeout
    const timeouts: number[] = [];
    
    for (const reminderDate of reminderDates) {
      const delay = reminderDate.getTime() - Date.now();
      
      if (delay > 0 && typeof window !== 'undefined') {
        const timeoutId = window.setTimeout(() => {
          const isTaskDay = reminderDate.toDateString() === new Date(task.date).toDateString();
          const title = isTaskDay ? '📅 Task Due Today!' : '⏰ Upcoming Task';
          const body = `${task.title}\nScheduled: ${formatTaskDateTime(task.date, task.time)}`;
          
          const NotificationAPI = (window as any).Notification;
          if (NotificationAPI && NotificationAPI.permission === 'granted') {
            new NotificationAPI(title, {
              body,
              icon: '/favicon.png',
              tag: task.id,
            });
          }
          
          // Play TTS if enabled
          if (ttsEnabled) {
            const message = task.time
              ? `${task.title} scheduled for ${formatTaskDateTime(task.date, task.time)}`
              : `${task.title} scheduled for ${formatTaskDateTime(task.date)}`;
            playTaskReminder(message);
          }
        }, delay);
        
        timeouts.push(timeoutId);
        notificationIds.push(`web_${task.id}_${timeoutId}`);
      }
    }
    
    // Store timeouts for cancellation
    webNotifications.set(task.id, timeouts);
  } else {
    // Use expo-notifications for native
    const Notifications = await import('expo-notifications');
    
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
          trigger: { 
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: reminderDate 
          },
        });

        notificationIds.push(notificationId);
      } catch (error) {
        console.error('Error scheduling notification:', error);
      }
    }
  }

  return notificationIds;
};

/**
 * Cancel task reminders
 */
export const cancelTaskReminders = async (taskId: string): Promise<void> => {
  if (isWeb()) {
    // Cancel web notifications
    const timeouts = webNotifications.get(taskId);
    if (timeouts && typeof window !== 'undefined') {
      timeouts.forEach(timeoutId => window.clearTimeout(timeoutId));
      webNotifications.delete(taskId);
    }
  } else {
    // Cancel native notifications
    const Notifications = await import('expo-notifications');
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    
    for (const notification of notifications) {
      if (notification.content.data?.taskId === taskId) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  }
};

/**
 * Setup notification listener
 */
export const setupNotificationListener = async (ttsEnabled: boolean): Promise<void> => {
  if (isWeb()) {
    // Web notifications are handled in scheduleTaskReminders
    console.log('Web notification listener setup (handled inline)');
  } else {
    // Setup native notification listener
    const Notifications = await import('expo-notifications');
    
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    
    Notifications.addNotificationReceivedListener(async (notification) => {
      const data = notification.request.content.data as any || {};
      const { taskTitle, taskDate, taskTime } = data;
      
      if (ttsEnabled && taskTitle) {
        const message = taskTime
          ? `${String(taskTitle)} scheduled for ${formatTaskDateTime(String(taskDate), String(taskTime))}`
          : `${String(taskTitle)} scheduled for ${formatTaskDateTime(String(taskDate))}`;
        
        await playTaskReminder(message);
      }
    });
  }
};
