"use client";
import { I18nProvider } from "../components/i18n-provider";
import { Providers } from "./providers"; // Import the Providers component
import { useTheme } from "next-themes";
import { useThemeStore } from "../hooks/use-theme-store";
import { useEffect } from "react";

function ThemeColorVariables() {
  const { theme } = useTheme();
  const {
    primaryColorLight,
    primaryColorDark,
    backgroundColorLight,
    backgroundColorDark,
  } = useThemeStore();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      // Determine the actual theme (resolving 'system')
      const resolvedTheme = theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        : theme;

      // Set the correct CSS variables based on the resolved theme
      if (resolvedTheme === 'light') {
        root.style.setProperty("--background", backgroundColorLight);
        // Note: Shadcn uses oklch for colors by default. Setting hex might work
        // but ideally, you'd convert hex to oklch or adjust globals.css
        // For simplicity, we'll set hex directly here.
        // You might need to adjust how --primary is used or defined in globals.css
        // if direct hex setting causes issues with Tailwind/Shadcn components.
        root.style.setProperty("--background", backgroundColorLight);
        root.style.setProperty("--primary", primaryColorLight);
        // Set sidebar variables for light mode
        root.style.setProperty("--sidebar", backgroundColorLight);
        root.style.setProperty("--sidebar-primary", primaryColorLight);
        // Attempt contrasting foregrounds - adjust if needed
        root.style.setProperty("--sidebar-foreground", primaryColorLight); // Use primary for contrast on bg
        root.style.setProperty("--sidebar-primary-foreground", backgroundColorLight); // Use bg for contrast on primary
        // You might need to set other variables like --foreground, --card, etc. too
      } else { // resolvedTheme === 'dark'
        root.style.setProperty("--background", backgroundColorDark);
        root.style.setProperty("--primary", primaryColorDark);
        // Set sidebar variables for dark mode
        root.style.setProperty("--sidebar", backgroundColorDark);
        root.style.setProperty("--sidebar-primary", primaryColorDark);
        // Attempt contrasting foregrounds - adjust if needed
        root.style.setProperty("--sidebar-foreground", primaryColorDark); // Use primary for contrast on bg
        root.style.setProperty("--sidebar-primary-foreground", backgroundColorDark); // Use bg for contrast on primary
        // Set other dark mode variables as needed
      }
    }
    // Depend on the theme and the specific colors for that theme
  }, [theme, primaryColorLight, primaryColorDark, backgroundColorLight, backgroundColorDark]);


  return null;
}

export default function ClientLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <Providers>
      <ThemeColorVariables />
      {" "}
      {/* Wrap with Providers */}
      <I18nProvider>{children}</I18nProvider>
    </Providers>
  );
}
