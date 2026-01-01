/**
 * Storage interface for Android
 * Uses SQLite via expo-sqlite
 */

import { Task, Settings } from '../types';
import * as nativeStorage from './nativeStorage';

/**
 * Initialize the database
 */
export const initDatabase = async (): Promise<void> => {
  return nativeStorage.initDatabase();
};

/**
 * Create a new task
 */
export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
  return nativeStorage.createTask(task);
};

/**
 * Get all tasks
 */
export const getAllTasks = async (): Promise<Task[]> => {
  return nativeStorage.getAllTasks();
};

/**
 * Get task by ID
 */
export const getTaskById = async (id: string): Promise<Task | null> => {
  return nativeStorage.getTaskById(id);
};

/**
 * Get tasks by date
 */
export const getTasksByDate = async (date: string): Promise<Task[]> => {
  return nativeStorage.getTasksByDate(date);
};

/**
 * Update task
 */
export const updateTask = async (id: string, updates: Partial<Task>): Promise<void> => {
  return nativeStorage.updateTask(id, updates);
};

/**
 * Delete task
 */
export const deleteTask = async (id: string): Promise<void> => {
  return nativeStorage.deleteTask(id);
};

/**
 * Get settings
 */
export const getSettings = async (): Promise<Settings> => {
  return nativeStorage.getSettings();
};

/**
 * Update settings
 */
export const updateSettings = async (settings: Partial<Settings>): Promise<void> => {
  return nativeStorage.updateSettings(settings);
};

/**
 * Clear all data
 */
export const clearAllData = async (): Promise<void> => {
  return nativeStorage.clearAllData();
};
