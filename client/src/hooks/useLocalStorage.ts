import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, defaultValue: T, options?: { legacyStringFallback?: boolean }) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored === null) return defaultValue;
      try {
        return JSON.parse(stored) as T;
      } catch {
        if (options?.legacyStringFallback) return stored as unknown as T;
        return defaultValue;
      }
    } catch (err) {
      console.error(`Failed to read localStorage key "${key}"`, err);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`Failed to write localStorage key "${key}"`, err);
    }
  }, [key, value]);

  return [value, setValue] as const;
}
