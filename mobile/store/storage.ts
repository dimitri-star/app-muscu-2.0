import { Platform } from 'react-native';
import type { StateStorage } from 'zustand/middleware';

// On web: synchronous localStorage → hydration is immediate, data never lost on navigation
// On native: AsyncStorage from @react-native-async-storage
const webStorage: StateStorage = {
  getItem: (name: string): string | null => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value);
    } catch {}
  },
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name);
    } catch {}
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _asyncStorage: StateStorage | null = null;
function getNativeStorage(): StateStorage {
  if (!_asyncStorage) {
    _asyncStorage = require('@react-native-async-storage/async-storage').default;
  }
  return _asyncStorage!;
}

export function getPlatformStorage(): StateStorage {
  return Platform.OS === 'web' ? webStorage : getNativeStorage();
}
