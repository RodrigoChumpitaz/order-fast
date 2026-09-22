import { create } from "zustand";

export type Theme = "light" | "dark";

const STORAGE_KEY = "orderfast-theme";

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {}
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getInitialTheme(),
  toggleTheme: () => {
    const next: Theme = get().theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    set({ theme: next });
  },
}));

function syncDocumentTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

syncDocumentTheme(useThemeStore.getState().theme);
useThemeStore.subscribe((state) => syncDocumentTheme(state.theme));
