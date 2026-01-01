/**
 * Unified storage interface
 * Automatically selects between native SQLite and web IndexedDB
 */

import { isWeb } from '../utils/platformDetection';
import { Task, Settings } from '../types';

// Platform-specific storage implementations
let storageImpl: any = null;

// Dynamically import the correct storage implementation
const getStorageImpl = async () => {
  if (storageImpl) return storageImpl;
  
  if (isWeb()) {
    storageImpl = await import('./webStorage');
  } else {
    storageImpl = await import('./nativeStorage');
  }
  
  return storageImpl;
};

/**
 * Initialize the database
 */
export const initDatabase = async (): Promise<void> => {
  const impl = await getStorageImpl();
  return impl.initDatabase();
};

/**
 * Create a new task
 */
export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
  const impl = await getStorageImpl();
  return impl.createTask(task);
};

/**
 * Get all tasks
 */
export const getAllTasks = async (): Promise<Task[]> => {
  const impl = await getStorageImpl();
  return impl.getAllTasks();
};

/**
 * Get task by ID
 */
export const getTaskById = async (id: string): Promise<Task | null> => {
  const impl = await getStorageImpl();
  return impl.getTaskById(id);
};

/**
 * Get tasks by date
 */
export const getTasksByDate = async (date: string): Promise<Task[]> => {
  const impl = await getStorageImpl();
  return impl.getTasksByDate(date);
};

/**
 * Update task
 */
export const updateTask = async (id: string, updates: Partial<Task>): Promise<void> => {
  const impl = await getStorageImpl();
  return impl.updateTask(id, updates);
};

/**
 * Delete task
 */
export const deleteTask = async (id: string): Promise<void> => {
  const impl = await getStorageImpl();
  return impl.deleteTask(id);
};

/**
 * Get settings
 */
export const getSettings = async (): Promise<Settings> => {
  const impl = await getStorageImpl();
  return impl.getSettings();
};

/**
 * Update settings
 */
export const updateSettings = async (settings: Partial<Settings>): Promise<void> => {
  const impl = await getStorageImpl();
  return impl.updateSettings(settings);
};

/**
 * Clear all data
 */
export const clearAllData = async (): Promise<void> => {
  const impl = await getStorageImpl();
  return impl.clearAllData();
};
