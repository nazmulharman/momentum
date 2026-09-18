import { Platform } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL || Platform.select({
  android: 'http://10.0.2.2:3000',
  default: 'http://localhost:3000',
});

// Helper for local storage persistence (web/memory)
const getStoredData = (key: string, defaultVal: any) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const item = window.localStorage.getItem(key);
    if (item) {
      try {
        return JSON.parse(item);
      } catch (e) {
        // ignore
      }
    }
  }
  return defaultVal;
};

const setStoredData = (key: string, val: any) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      // ignore
    }
  }
};

export class ApiService {
  // --- TASKS API ---
  static async getTasks(userId: string = 'default-user-nazmul') {
    try {
      const response = await fetch(`${API_URL}/tasks?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setStoredData('app_tasks', data);
        return data;
      }
    } catch (err) {
      console.warn('API error (falling back to local storage):', err);
    }
    return getStoredData('app_tasks', null);
  }

  static async createTask(userId: string = 'default-user-nazmul', task: any) {
    try {
      const response = await fetch(`${API_URL}/tasks?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn('API error (falling back to local state):', err);
    }
    return null;
  }

  static async updateTask(id: string, updates: any) {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (response.ok) return await response.json();
    } catch (err) {
      console.warn('API error updating task:', err);
    }
    return null;
  }

  static async deleteTask(id: string) {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) return await response.json();
    } catch (err) {
      console.warn('API error deleting task:', err);
    }
    return null;
  }

  // --- HABITS API ---
  static async getHabits(userId: string = 'default-user-nazmul') {
    try {
      const response = await fetch(`${API_URL}/habits?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch habits');
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setStoredData('app_habits', data);
        return data;
      }
    } catch (err) {
      console.warn('API error (falling back to local storage):', err);
    }
    return getStoredData('app_habits', null);
  }

  static async createHabit(userId: string = 'default-user-nazmul', habit: any) {
    try {
      const response = await fetch(`${API_URL}/habits?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(habit),
      });
      if (response.ok) return await response.json();
    } catch (err) {
      console.warn('API error creating habit:', err);
    }
    return null;
  }

  static async updateHabit(id: string, updates: any) {
    try {
      const response = await fetch(`${API_URL}/habits/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (response.ok) return await response.json();
    } catch (err) {
      console.warn('API error updating habit:', err);
    }
    return null;
  }

  // --- AI COACH API ---
  static async callAiCoach(userId: string = 'default-user-nazmul', action: string, data?: any) {
    try {
      const response = await fetch(`${API_URL}/ai/coach?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, data }),
      });
      if (response.ok) return await response.json();
    } catch (err) {
      console.warn('API error (falling back to local AI simulator):', err);
    }
    return null;
  }

  // Persistent Local Storage Utilities
  static saveLocalData(key: string, data: any) {
    setStoredData(key, data);
  }

  static getLocalData(key: string, defaultVal: any) {
    return getStoredData(key, defaultVal);
  }
}
