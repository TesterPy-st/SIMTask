export interface Task {
  id: string;
  title: string;
  date: string;
  time?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  createdAt: string;
  updatedAt: string;
  syncStatus?: 'synced' | 'pending' | 'failed';
  reminderScheduled?: boolean;
}

export interface ReminderConfig {
  taskId: string;
  taskTitle: string;
  taskDate: string;
  taskTime?: string;
  reminderDate: Date;
  reminderType: 'advance' | 'day-of';
}

export interface Settings {
  notificationsEnabled: boolean;
  ttsEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
}
