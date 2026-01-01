/**
 * Native storage implementation using SQLite
 * Wrapper around expo-sqlite for iOS and Android
 */

import * as SQLite from 'expo-sqlite';
import { Task, Settings } from '../types';

let db: SQLite.SQLiteDatabase | null = null;

export const initDatabase = async (): Promise<void> => {
  try {
    db = await SQLite.openDatabaseAsync('simtask.db');
    
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT,
        description TEXT,
        priority TEXT,
        category TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        syncStatus TEXT DEFAULT 'pending',
        reminderScheduled INTEGER DEFAULT 0
      );
      
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        notificationsEnabled INTEGER DEFAULT 1,
        ttsEnabled INTEGER DEFAULT 1,
        theme TEXT DEFAULT 'auto',
        language TEXT DEFAULT 'en'
      );
      
      INSERT OR IGNORE INTO settings (id) VALUES (1);
    `);
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
  if (!db) throw new Error('Database not initialized');
  
  const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  const newTask: Task = {
    ...task,
    id,
    createdAt: now,
    updatedAt: now,
    syncStatus: 'pending',
  };
  
  await db.runAsync(
    `INSERT INTO tasks (id, title, date, time, description, priority, category, createdAt, updatedAt, syncStatus, reminderScheduled)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      newTask.id,
      newTask.title,
      newTask.date,
      newTask.time || null,
      newTask.description || null,
      newTask.priority || null,
      newTask.category || null,
      newTask.createdAt,
      newTask.updatedAt,
      newTask.syncStatus || 'pending',
      newTask.reminderScheduled ? 1 : 0,
    ]
  );
  
  return newTask;
};

export const getAllTasks = async (): Promise<Task[]> => {
  if (!db) throw new Error('Database not initialized');
  
  const result = await db.getAllAsync<any>('SELECT * FROM tasks ORDER BY date ASC, time ASC');
  
  return result.map(row => ({
    ...row,
    reminderScheduled: row.reminderScheduled === 1,
  }));
};

export const getTaskById = async (id: string): Promise<Task | null> => {
  if (!db) throw new Error('Database not initialized');
  
  const result = await db.getFirstAsync<any>('SELECT * FROM tasks WHERE id = ?', [id]);
  
  if (!result) return null;
  
  return {
    ...result,
    reminderScheduled: result.reminderScheduled === 1,
  };
};

export const getTasksByDate = async (date: string): Promise<Task[]> => {
  if (!db) throw new Error('Database not initialized');
  
  const result = await db.getAllAsync<any>('SELECT * FROM tasks WHERE date = ? ORDER BY time ASC', [date]);
  
  return result.map(row => ({
    ...row,
    reminderScheduled: row.reminderScheduled === 1,
  }));
};

export const updateTask = async (id: string, updates: Partial<Task>): Promise<void> => {
  if (!db) throw new Error('Database not initialized');
  
  const now = new Date().toISOString();
  const fields: string[] = [];
  const values: any[] = [];
  
  Object.entries(updates).forEach(([key, value]) => {
    if (key !== 'id' && key !== 'createdAt') {
      fields.push(`${key} = ?`);
      if (key === 'reminderScheduled') {
        values.push(value ? 1 : 0);
      } else {
        values.push(value === undefined ? null : value);
      }
    }
  });
  
  fields.push('updatedAt = ?');
  values.push(now);
  values.push(id);
  
  await db.runAsync(
    `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
};

export const deleteTask = async (id: string): Promise<void> => {
  if (!db) throw new Error('Database not initialized');
  
  await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
};

export const getSettings = async (): Promise<Settings> => {
  if (!db) throw new Error('Database not initialized');
  
  const result = await db.getFirstAsync<any>('SELECT * FROM settings WHERE id = 1');
  
  return {
    notificationsEnabled: result?.notificationsEnabled === 1,
    ttsEnabled: result?.ttsEnabled === 1,
    theme: result?.theme || 'auto',
    language: result?.language || 'en',
  };
};

export const updateSettings = async (settings: Partial<Settings>): Promise<void> => {
  if (!db) throw new Error('Database not initialized');
  
  const fields: string[] = [];
  const values: any[] = [];
  
  Object.entries(settings).forEach(([key, value]) => {
    fields.push(`${key} = ?`);
    if (typeof value === 'boolean') {
      values.push(value ? 1 : 0);
    } else {
      values.push(value);
    }
  });
  
  values.push(1);
  
  await db.runAsync(
    `UPDATE settings SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
};

export const clearAllData = async (): Promise<void> => {
  if (!db) throw new Error('Database not initialized');
  
  await db.execAsync('DELETE FROM tasks');
};
