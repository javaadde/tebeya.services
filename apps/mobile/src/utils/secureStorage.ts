// Safe storage abstraction for JWT tokens and persisted preferences

const MEMORY_STORAGE = new Map<string, string>();

export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // Ignore fallback errors
    }
    MEMORY_STORAGE.set(key, value);
  },

  async getItem(key: string): Promise<string | null> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = window.localStorage.getItem(key);
        if (item) return item;
      }
    } catch {
      // Ignore fallback errors
    }
    return MEMORY_STORAGE.get(key) || null;
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Ignore fallback errors
    }
    MEMORY_STORAGE.delete(key);
  },
};
