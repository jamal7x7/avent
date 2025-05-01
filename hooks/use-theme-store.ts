import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";

// Define default colors
const DEFAULT_PRIMARY_COLOR = "#1a73e8"; // Example: blue
const DEFAULT_BACKGROUND_COLOR_LIGHT = "#ffffff"; // Example: white for light
const DEFAULT_BACKGROUND_COLOR_DARK = "#0f172a"; // Example: slate-900 for dark

interface ThemeState {
  theme: Theme;
  primaryColor: string;
  backgroundColor: string;
  setTheme: (theme: Theme) => void;
  setPrimaryColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  resetColors: () => void; // Added reset action
}

// This store is primarily for potential future use cases where theme needs
// to be accessed or modified outside the direct context of next-themes.
// For basic theme switching, next-themes' useTheme hook is sufficient.
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "system", // Default theme
      primaryColor: DEFAULT_PRIMARY_COLOR,
      // Set initial background based on a default assumption or leave it simple
      backgroundColor: DEFAULT_BACKGROUND_COLOR_LIGHT,
      setTheme: (theme) => set({ theme }),
      setPrimaryColor: (color) => set({ primaryColor: color }),
      setBackgroundColor: (color) => set({ backgroundColor: color }),
      resetColors: () => {
        // Reset colors to defaults.
        // Consider theme context for background reset if needed.
        // For simplicity, resetting to light mode defaults here.
        // A more complex logic could check the current 'theme' from next-themes
        // or the persisted 'theme' state if it's kept in sync.
        set({
          primaryColor: DEFAULT_PRIMARY_COLOR,
          backgroundColor: DEFAULT_BACKGROUND_COLOR_LIGHT, // Or adjust based on theme
        });
      },
    }),
    {
      name: "theme-storage", // Name of the item in storage (must be unique)
      storage: createJSONStorage(() => localStorage), // Use localStorage
      // You might want to synchronize this with next-themes's actual theme
      // if using both extensively, but for now, it's a separate persistence.
      // Also consider how primary/background colors interact with light/dark themes.
    },
  ),
);
