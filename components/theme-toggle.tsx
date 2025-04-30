"use client";

import { RiMoonLine, RiSunLine } from "@remixicon/react";
import { useTheme } from "next-themes";
import * as React from "react";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch by rendering only on client-side
  React.useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  if (!mounted) {
    // Render a placeholder div instead of a Button to avoid nesting issues
    return (
      <div
        className={cn(
          "h-9 w-9 rounded-full flex items-center justify-center",
          "bg-transparent", // Mimic ghost variant
          className,
        )}
        aria-hidden="true"
      >
        <RiSunLine className="text-muted-foreground/60" size={22} />
        <span className="sr-only">Loading theme toggle</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className={cn(
            "h-9 w-9 rounded-full flex items-center justify-center focus:outline-none focus:ring hover:bg-sidebar-accent cursor-pointer",
            className,
          )}
        >
          {theme === "dark" ? (
            <RiMoonLine className="text-muted-foreground/60" size={22} />
          ) : (
            <RiSunLine className="text-muted-foreground/60" size={22} />
          )}
          <span className="sr-only">Toggle theme</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={cn(
            "flex items-center gap-2 cursor-pointer",
            theme === "light" && "font-medium text-primary",
          )}
        >
          <RiSunLine className="text-muted-foreground/60" size={18} />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={cn(
            "flex items-center gap-2 cursor-pointer",
            theme === "dark" && "font-medium text-primary",
          )}
        >
          <RiMoonLine className="text-muted-foreground/60" size={18} />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={cn(
            "flex items-center gap-2 cursor-pointer",
            (theme === "system" || !theme) && "font-medium text-primary",
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4 text-muted-foreground/60"
            aria-hidden="true"
            role="img"
          >
            <title>System Theme Icon</title>
            <path
              fillRule="evenodd"
              d="M3.5 2A1.5 1.5 0 002 3.5V15a3 3 0 003 3h12a1.5 1.5 0 001.5-1.5V3.5A1.5 1.5 0 0017 2H3.5zM5 5.75c0-.41.334-.75.75-.75h8.5a.75.75 0 010 1.5h-8.5a.75.75 0 01-.75-.75zM5.75 8.25a.75.75 0 00-.75.75v3.25c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75V9a.75.75 0 00-.75-.75h-8.5z"
              clipRule="evenodd"
            />
          </svg>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
