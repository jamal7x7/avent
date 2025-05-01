"use client";

import {
  MonitorIcon,
  MoonIcon,
  Palette,
  RotateCcw,
  Settings,
  SunIcon,
  User,
} from "lucide-react";
import { useTheme } from "next-themes";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "~/components/ui/button";
// Remove ThemeToggle import if no longer used directly
// import { ThemeToggle } from "~/components/theme-toggle";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer"; // Added Drawer imports
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useIsMobile } from "~/hooks/use-mobile"; // Added useMediaQuery hook
import { useThemeStore } from "~/hooks/use-theme-store";
import { cn } from "~/lib/utils";

// Define predefined colors
const primaryColors = [
  "#3b82f6", // blue-500
  "#ef4444", // red-500
  "#22c55e", // green-500
  "#eab308", // yellow-500
  "#a855f7", // purple-500
];

// Define theme-aware background colors using Tailwind classes
const backgroundColors = [
  "bg-white dark:bg-black", // Default White/Black
  "bg-stone-100 dark:bg-stone-900", // Stone
  "bg-neutral-100 dark:bg-neutral-900", // Neutral
  "bg-zinc-100 dark:bg-zinc-900", // Zinc
  "bg-gray-100 dark:bg-gray-900", // Gray
  "bg-slate-100 dark:bg-slate-900", // Slate (Shadcn default-ish)
];

// Reusable Color Circle Component
interface ColorCircleProps {
  color: string;
  isSelected: boolean;
  onClick: () => void;
  isCustom?: boolean;
}

function ColorCircle({
  color,
  isSelected,
  onClick,
  isCustom = false,
}: ColorCircleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-8 w-8 rounded-full border-2 transition-all duration-200 ease-in-out flex items-center justify-center",
        isSelected
          ? "border-ring ring-2 ring-ring ring-offset-2 ring-offset-background"
          : "border-muted hover:border-foreground/50",
        isCustom && "border-dashed",
        !isCustom && color, // Apply the background color class if not custom
      )}
      aria-label={isCustom ? "Select custom color" : `Select color ${color}`}
    >
      {isCustom && <Palette className="h-4 w-4 text-muted-foreground" />}
    </button>
  );
}

interface SettingsModalProps {
  children: React.ReactNode; // Trigger element
}

export function SettingsModal({ children }: SettingsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const {
    primaryColor,
    backgroundColor,
    setPrimaryColor,
    setBackgroundColor,
    resetColors,
  } = useThemeStore();

  const primaryColorInputRef = useRef<HTMLInputElement>(null);
  const backgroundColorInputRef = useRef<HTMLInputElement>(null);
  const isDesktop = !useIsMobile(); // Detect desktop screen

  const handleReset = () => {
    resetColors();
  };

  const handleCustomPrimaryClick = () => {
    primaryColorInputRef.current?.click();
  };

  const handleCustomBackgroundClick = () => {
    backgroundColorInputRef.current?.click();
  };

  const SettingsContent = () => (
    <Tabs
      defaultValue="appearance"
      orientation={isDesktop ? "vertical" : "horizontal"} // Conditional orientation
      className="h-full"
    >
      <div
        className={cn(
          "flex h-full flex-col gap-6 p-6 md:grid md:grid-cols-[180px_1fr]", // Conditional layout
          !isDesktop && "pt-0", // Adjust padding for mobile drawer
        )}
      >
        <TabsList
          className={cn(
            "flex items-start justify-start gap-2 bg-transparent p-0",
            isDesktop ? "flex-col" : "flex-row border-b pb-2", // Conditional flex direction and border
          )}
        >
          <TabsTrigger
            value="appearance"
            className="w-full justify-start data-[state=active]:bg-muted"
          >
            <Palette className="mr-2 h-4 w-4" /> Appearance
          </TabsTrigger>
          <TabsTrigger
            value="account"
            className="w-full justify-start data-[state=active]:bg-muted"
          >
            <User className="mr-2 h-4 w-4" /> Account
          </TabsTrigger>
          {/* Add more tabs here as needed */}
        </TabsList>
        <div className={cn(!isDesktop && "mt-4")}>
          {" "}
          {/* Add margin top on mobile */}
          <TabsContent value="appearance" className="mt-0 pl-0 md:pl-4">
            {/* --- Integrated Appearance Settings Start --- */}
            <div className="space-y-6">
              {/* Theme Selection */}
              <div>
                <Label className="mb-2 block font-medium">
                  {t("settings.appearance.theme", "Theme")}
                </Label>
                <RadioGroup
                  value={theme ?? "system"} // Ensure value is not undefined
                  onValueChange={setTheme}
                  className="grid max-w-md grid-cols-1 gap-4 sm:grid-cols-3"
                  aria-label={t(
                    "settings.appearance.themeSelection",
                    "Theme selection",
                  )}
                >
                  <div>
                    <RadioGroupItem
                      value="light"
                      id="light-theme"
                      className="peer sr-only"
                      aria-label={t(
                        "settings.appearance.lightTheme",
                        "Light theme",
                      )}
                    />
                    <Label
                      htmlFor="light-theme"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors"
                    >
                      <SunIcon className="mb-3 h-6 w-6" />
                      {t("settings.appearance.light", "Light")}
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value="dark"
                      id="dark-theme"
                      className="peer sr-only"
                      aria-label={t(
                        "settings.appearance.darkTheme",
                        "Dark theme",
                      )}
                    />
                    <Label
                      htmlFor="dark-theme"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors"
                    >
                      <MoonIcon className="mb-3 h-6 w-6" />
                      {t("settings.appearance.dark", "Dark")}
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value="system"
                      id="system-theme"
                      className="peer sr-only"
                      aria-label={t(
                        "settings.appearance.systemTheme",
                        "System theme",
                      )}
                    />
                    <Label
                      htmlFor="system-theme"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors"
                    >
                      <MonitorIcon className="mb-3 h-6 w-6" />
                      {t("settings.appearance.system", "System")}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Primary Color Selection */}
              <div>
                <Label className="mb-2 block font-medium">
                  {t("settings.appearance.primaryColor", "Primary Color")}
                </Label>
                <div className="flex flex-wrap items-center gap-3">
                  {primaryColors.map((color) => (
                    <ColorCircle
                      key={color}
                      color={`bg-[${color}]`} // Use Tailwind arbitrary value syntax
                      isSelected={primaryColor === color}
                      onClick={() => setPrimaryColor(color)}
                    />
                  ))}
                  <ColorCircle
                    color=""
                    isSelected={!primaryColors.includes(primaryColor)}
                    onClick={handleCustomPrimaryClick}
                    isCustom
                  />
                  <input
                    ref={primaryColorInputRef}
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="absolute h-0 w-0 opacity-0"
                    aria-label={t(
                      "settings.appearance.customPrimaryColor",
                      "Custom primary color picker",
                    )}
                  />
                </div>
              </div>

              {/* Background Color Selection */}
              <div>
                <Label className="mb-2 block font-medium">
                  {t("settings.appearance.backgroundColor", "Background Color")}
                </Label>
                <div className="flex flex-wrap items-center gap-3">
                  {backgroundColors.map((bgColorClass) => (
                    <button
                      key={bgColorClass}
                      type="button"
                      onClick={() => setBackgroundColor(bgColorClass)}
                      className={cn(
                        "h-8 w-8 rounded-full border-2 transition-all duration-200 ease-in-out",
                        backgroundColor === bgColorClass
                          ? "border-ring ring-2 ring-ring ring-offset-2 ring-offset-background"
                          : "border-muted hover:border-foreground/50",
                        bgColorClass, // Apply the background class
                      )}
                      aria-label={`Select background ${bgColorClass}`}
                    />
                  ))}
                  {/* No custom background picker for now, using predefined classes */}
                </div>
              </div>

              {/* Reset Button */}
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {t("settings.appearance.reset", "Reset Colors")}
                </Button>
              </div>
            </div>
            {/* --- Integrated Appearance Settings End --- */}
          </TabsContent>
          <TabsContent value="account" className="mt-0 pl-0 md:pl-4">
            <div className="space-y-4">
              <h4 className="font-medium">Account Information</h4>
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" defaultValue="@shadcn" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue="user@example.com"
                />
              </div>
              <Button>Save changes</Button>
            </div>
          </TabsContent>
          {/* Add more TabsContent here as needed */}
        </div>
      </div>
    </Tabs>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[650px] p-0 h-[70vh] max-h-[600px]">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Manage your account settings and preferences.
            </DialogDescription>
          </DialogHeader>
          <SettingsContent />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="h-[90vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Settings</DrawerTitle>
          <DrawerDescription>
            Manage your account settings and preferences.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-auto">
          <SettingsContent />
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
