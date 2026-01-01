/**
 * Web storage implementation using IndexedDB
 * Provides SQLite-like API for web platform
 */

import { Task, Settings } from '../types';

const DB_NAME = 'simtask_db';
const DB_VERSION = 1;
const TASKS_STORE = 'tasks';
const SETTINGS_STORE = 'settings';

// Use window.IDBDatabase for web types
let db: any | null = null;

/**
 * Initialize IndexedDB
 */
export const initDatabase = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = (window as any).indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      db = request.result;
      resolve();
    };

    request.onupgradeneeded = (event: any) => {
      const database = (event.target as any).result;

      // Create tasks store
      if (!database.objectStoreNames.contains(TASKS_STORE)) {
        const tasksStore = database.createObjectStore(TASKS_STORE, { keyPath: 'id' });
        tasksStore.createIndex('date', 'date', { unique: false });
        tasksStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Create settings store
      if (!database.objectStoreNames.contains(SETTINGS_STORE)) {
        database.createObjectStore(SETTINGS_STORE, { keyPath: 'id' });
      }
    };
  });
};

/**
 * Get object store
 */
const getStore = (storeName: string, mode: string = 'readonly'): any => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  const transaction = db.transaction(storeName, mode);
  return transaction.objectStore(storeName);
};

/**
 * Create a new task
 */
export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
  const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  const newTask: Task = {
    ...task,
    id,
    createdAt: now,
    updatedAt: now,
    syncStatus: 'pending',
  };

  return new Promise((resolve, reject) => {
    try {
      const store = getStore(TASKS_STORE, 'readwrite');
      const request = store.add(newTask);

      request.onsuccess = () => resolve(newTask);
      request.onerror = () => reject(new Error('Failed to create task'));
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Get all tasks
 */
export const getAllTasks = async (): Promise<Task[]> => {
  return new Promise((resolve, reject) => {
    try {
      const store = getStore(TASKS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const tasks = request.result as Task[];
        // Sort by date and time
        tasks.sort((a, b) => {
          const dateCompare = a.date.localeCompare(b.date);
          if (dateCompare !== 0) return dateCompare;
          if (a.time && b.time) return a.time.localeCompare(b.time);
          if (a.time) return -1;
          if (b.time) return 1;
          return 0;
        });
        resolve(tasks);
      };
      request.onerror = () => reject(new Error('Failed to get tasks'));
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Get task by ID
 */
export const getTaskById = async (id: string): Promise<Task | null> => {
  return new Promise((resolve, reject) => {
    try {
      const store = getStore(TASKS_STORE);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new Error('Failed to get task'));
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Get tasks by date
 */
export const getTasksByDate = async (date: string): Promise<Task[]> => {
  return new Promise((resolve, reject) => {
    try {
      const store = getStore(TASKS_STORE);
      const index = store.index('date');
      const request = index.getAll(date);

      request.onsuccess = () => {
        const tasks = request.result as Task[];
        // Sort by time
        tasks.sort((a, b) => {
          if (a.time && b.time) return a.time.localeCompare(b.time);
          if (a.time) return -1;
          if (b.time) return 1;
          return 0;
        });
        resolve(tasks);
      };
      request.onerror = () => reject(new Error('Failed to get tasks by date'));
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Update task
 */
export const updateTask = async (id: string, updates: Partial<Task>): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const task = await getTaskById(id);
      if (!task) {
        reject(new Error('Task not found'));
        return;
      }

      const updatedTask: Task = {
        ...task,
        ...updates,
        id: task.id, // Ensure ID doesn't change
        createdAt: task.createdAt, // Preserve creation time
        updatedAt: new Date().toISOString(),
      };

      const store = getStore(TASKS_STORE, 'readwrite');
      const request = store.put(updatedTask);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to update task'));
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Delete task
 */
export const deleteTask = async (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const store = getStore(TASKS_STORE, 'readwrite');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to delete task'));
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Get settings
 */
export const getSettings = async (): Promise<Settings> => {
  return new Promise((resolve, reject) => {
    try {
      const store = getStore(SETTINGS_STORE);
      const request = store.get(1);

      request.onsuccess = () => {
        const settings = request.result;
        if (settings) {
          resolve(settings);
        } else {
          // Return default settings
          const defaultSettings: Settings = {
            notificationsEnabled: true,
            ttsEnabled: true,
            theme: 'auto',
            language: 'en',
          };
          // Save default settings
          updateSettings(defaultSettings).then(() => resolve(defaultSettings));
        }
      };
      request.onerror = () => reject(new Error('Failed to get settings'));
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Update settings
 */
export const updateSettings = async (settings: Partial<Settings>): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const currentSettings = await getSettings().catch(() => ({
        notificationsEnabled: true,
        ttsEnabled: true,
        theme: 'auto' as const,
        language: 'en',
      }));

      const updatedSettings = {
        id: 1,
        ...currentSettings,
        ...settings,
      };

      const store = getStore(SETTINGS_STORE, 'readwrite');
      const request = store.put(updatedSettings);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to update settings'));
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Clear all tasks
 */
export const clearAllData = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const store = getStore(TASKS_STORE, 'readwrite');
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to clear data'));
    } catch (error) {
      reject(error);
    }
  });
};
