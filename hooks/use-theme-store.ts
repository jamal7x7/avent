import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";

// Define default colors
const DEFAULT_PRIMARY_COLOR_LIGHT = "#1a73e8"; // blue for light
const DEFAULT_PRIMARY_COLOR_DARK = "#90cdf4"; // lighter blue for dark
const DEFAULT_BACKGROUND_COLOR_LIGHT = "#ffffff"; // white for light
const DEFAULT_BACKGROUND_COLOR_DARK = "#0f172a"; // slate-900 for dark

interface ThemeState {
  theme: Theme;
  primaryColorLight: string;
  primaryColorDark: string;
  backgroundColorLight: string;
  backgroundColorDark: string;
  setTheme: (theme: Theme) => void;
  setPrimaryColorLight: (color: string) => void;
  setPrimaryColorDark: (color: string) => void;
  setBackgroundColorLight: (color: string) => void;
  setBackgroundColorDark: (color: string) => void;
  resetColors: () => void;
  getPrimaryColor: (theme: Theme) => string;
  getBackgroundColor: (theme: Theme) => string;
}

// This store is primarily for potential future use cases where theme needs
// to be accessed or modified outside the direct context of next-themes.
// For basic theme switching, next-themes' useTheme hook is sufficient.
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "system",
      primaryColorLight: DEFAULT_PRIMARY_COLOR_LIGHT,
      primaryColorDark: DEFAULT_PRIMARY_COLOR_DARK,
      backgroundColorLight: DEFAULT_BACKGROUND_COLOR_LIGHT,
      backgroundColorDark: DEFAULT_BACKGROUND_COLOR_DARK,
      setTheme: (theme) => set({ theme }),
      setPrimaryColorLight: (color) => set({ primaryColorLight: color }),
      setPrimaryColorDark: (color) => set({ primaryColorDark: color }),
      setBackgroundColorLight: (color) => set({ backgroundColorLight: color }),
      setBackgroundColorDark: (color) => set({ backgroundColorDark: color }),
      resetColors: () => {
        set({
          primaryColorLight: DEFAULT_PRIMARY_COLOR_LIGHT,
          primaryColorDark: DEFAULT_PRIMARY_COLOR_DARK,
          backgroundColorLight: DEFAULT_BACKGROUND_COLOR_LIGHT,
          backgroundColorDark: DEFAULT_BACKGROUND_COLOR_DARK,
        });
      },
      getPrimaryColor: (theme) => {
        if (theme === "dark") return get().primaryColorDark;
        return get().primaryColorLight;
      },
      getBackgroundColor: (theme) => {
        if (theme === "dark") return get().backgroundColorDark;
        return get().backgroundColorLight;
      },
    }),
    {
      name: "theme-storage-v2",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
