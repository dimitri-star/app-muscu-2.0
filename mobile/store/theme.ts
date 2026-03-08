import { create } from 'zustand';

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
  setLight: () => void;
  setDark: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: true,
  toggle: () => set((s) => ({ isDark: !s.isDark })),
  setLight: () => set({ isDark: false }),
  setDark: () => set({ isDark: true }),
}));
