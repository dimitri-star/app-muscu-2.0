import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getPlatformStorage } from './storage';

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
  setLight: () => void;
  setDark: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      toggle: () => set((s) => ({ isDark: !s.isDark })),
      setLight: () => set({ isDark: false }),
      setDark: () => set({ isDark: true }),
    }),
    {
      name: 'theme-store-v1',
      storage: createJSONStorage(() => getPlatformStorage()),
    }
  )
);
