"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";
import * as React from "react";

// This component specifically uses 'use client' and wraps the NextThemesProvider.
// It's kept separate to clearly distinguish client-side theme logic.
export function ThemeProviderClient({
  children,
  ...props
}: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
