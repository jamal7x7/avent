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

// Define background color pairs (light hex, dark hex)
const backgroundColors = [
  { light: "#ffffff", dark: "#000000", name: "White/Black" },
  { light: "#f5f5f4", dark: "#1c1917", name: "Stone" }, // stone-100, stone-900 approx
  { light: "#f5f5f5", dark: "#171717", name: "Neutral" }, // neutral-100, neutral-900 approx
  { light: "#f4f4f5", dark: "#18181b", name: "Zinc" }, // zinc-100, zinc-900 approx
  { light: "#f3f4f6", dark: "#111827", name: "Gray" }, // gray-100, gray-900 approx
  { light: "#f1f5f9", dark: "#0f172a", name: "Slate" }, // slate-100, slate-900 (Shadcn default-ish)
];

// Reusable Color Circle Component
interface ColorCircleProps {
  hexColor?: string; // Use hex color for inline style
  isSelected: boolean;
  onClick: () => void;
  isCustom?: boolean;
  ariaLabel?: string; // More specific aria-label
}

function ColorCircle({
  hexColor,
  isSelected,
  onClick,
  isCustom = false,
  ariaLabel,
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
        // Removed applying color class here
      )}
      style={!isCustom && hexColor ? { backgroundColor: hexColor } : {}} // Apply background color via inline style
      aria-label={ariaLabel || (isCustom ? "Select custom color" : `Select color ${hexColor}`)}
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
    primaryColorLight,
    primaryColorDark,
    backgroundColorLight,
    backgroundColorDark,
    setPrimaryColorLight,
    setPrimaryColorDark,
    setBackgroundColorLight,
    setBackgroundColorDark,
    resetColors,
    getPrimaryColor,
    getBackgroundColor,
  } = useThemeStore();

  const primaryColorInputLightRef = useRef<HTMLInputElement>(null);
  const primaryColorInputDarkRef = useRef<HTMLInputElement>(null);
  const backgroundColorInputLightRef = useRef<HTMLInputElement>(null);
  const backgroundColorInputDarkRef = useRef<HTMLInputElement>(null);
  const isDesktop = !useIsMobile();

  const handleReset = () => {
    resetColors();
  };

  const handleCustomPrimaryClick = (mode: 'light' | 'dark') => {
    if (mode === 'light') primaryColorInputLightRef.current?.click();
    else primaryColorInputDarkRef.current?.click();
  };

  const handleCustomBackgroundClick = (mode: 'light' | 'dark') => {
    if (mode === 'light') backgroundColorInputLightRef.current?.click();
    else backgroundColorInputDarkRef.current?.click();
  };

  // Helper to render color pickers for a given mode
  const renderColorPickers = (mode: 'light' | 'dark') => (
    <>
      {/* Primary Color Selection */}
      <div>
        <Label className="mb-2 block font-medium">
          {t(
            `settings.appearance.primaryColor${mode === 'dark' ? 'Dark' : 'Light'}`,
            `Primary Color (${mode.charAt(0).toUpperCase() + mode.slice(1)})`,
          )}
        </Label>
        <div className="flex flex-wrap items-center gap-3">
          {primaryColors.map((color) => (
            <ColorCircle
              key={color + mode}
              hexColor={color} // Use hexColor prop
              isSelected={
                (mode === 'light' ? primaryColorLight : primaryColorDark) === color
              }
              onClick={() =>
                mode === 'light'
                  ? setPrimaryColorLight(color)
                  : setPrimaryColorDark(color)
              }
              ariaLabel={`Select primary color ${color} (${mode})`} // Add specific aria-label
            />
          ))}
          <ColorCircle
            // Removed color prop
            isSelected={
              !primaryColors.includes(
                mode === 'light' ? primaryColorLight : primaryColorDark,
              )
            }
            onClick={() => handleCustomPrimaryClick(mode)}
            isCustom
            ariaLabel={`Select custom primary color (${mode})`} // Add specific aria-label
          />
          <input
            ref={mode === 'light' ? primaryColorInputLightRef : primaryColorInputDarkRef}
            type="color"
            value={mode === 'light' ? primaryColorLight : primaryColorDark}
            onChange={(e) =>
              mode === 'light'
                ? setPrimaryColorLight(e.target.value)
                : setPrimaryColorDark(e.target.value)
            }
            className="absolute h-0 w-0 opacity-0"
            aria-label={t(
              `settings.appearance.customPrimaryColor${mode === 'dark' ? 'Dark' : 'Light'}`,
              `Custom primary color picker (${mode})`,
            )}
          />
        </div>
      </div>
      {/* Background Color Selection */}
      <div>
        <Label className="mb-2 block font-medium">
          {t(
            `settings.appearance.backgroundColor${mode === 'dark' ? 'Dark' : 'Light'}`,
            `Background Color (${mode.charAt(0).toUpperCase() + mode.slice(1)})`,
          )}
        </Label>
        <div className="flex flex-wrap items-center gap-3">
          {backgroundColors.map((bgColor) => {
            const currentBgColor = mode === 'light' ? bgColor.light : bgColor.dark;
            const isSelected =
              (mode === 'light'
                ? backgroundColorLight === bgColor.light
                : backgroundColorDark === bgColor.dark);

            return (
              <button
                key={bgColor.name + mode}
                type="button"
                onClick={() => {
                  if (mode === 'light') {
                    setBackgroundColorLight(bgColor.light);
                  } else {
                    setBackgroundColorDark(bgColor.dark);
                  }
                }}
                className={cn(
                  "h-8 w-8 rounded-full border-2 transition-all duration-200 ease-in-out",
                  isSelected
                    ? "border-ring ring-2 ring-ring ring-offset-2 ring-offset-background"
                    : "border-muted hover:border-foreground/50",
                )}
                style={{ backgroundColor: currentBgColor }} // Apply background color directly
                aria-label={`Select background ${bgColor.name} (${mode})`}
              />
            );
          })}
          {/* Consider adding a custom background color picker here if needed */}
          {/* Example: Similar structure to the primary color custom picker */}
        </div>
      </div>
    </>
  );

  const SettingsContent = () => (
    <Tabs
      defaultValue="appearance"
      orientation={isDesktop ? "vertical" : "horizontal"}
      className="h-full"
    >
      <div
        className={cn(
          "flex h-full flex-col gap-6 p-6 md:grid md:grid-cols-[180px_1fr]",
          !isDesktop && "pt-0",
        )}
      >
        <TabsList
          className={cn(
            "flex items-start justify-start gap-2 bg-transparent p-0",
            isDesktop ? "flex-col" : "flex-row border-b pb-2",
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
        </TabsList>
        <div className={cn(!isDesktop && "mt-4")}>
          <TabsContent value="appearance" className="mt-0 pl-0 md:pl-4">
            {/* --- Integrated Appearance Settings Start --- */}
            <div className="space-y-6">
              {/* Theme Selection */}
              <div>
                <Label className="mb-2 block font-medium">
                  {t("settings.appearance.theme", "Theme")}
                </Label>
                <RadioGroup
                  value={theme ?? "system"}
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

              {/* Color Pickers for Light/Dark */}
              {theme === "system" && (
                <div className="space-y-8">
                  <div>
                    <div className="mb-2 font-semibold text-sm text-muted-foreground">
                      {t(
                        "settings.appearance.lightModeColors",
                        "Light Mode Colors",
                      )}
                    </div>
                    {renderColorPickers("light")}
                  </div>
                  <div>
                    <div className="mb-2 font-semibold text-sm text-muted-foreground">
                      {t(
                        "settings.appearance.darkModeColors",
                        "Dark Mode Colors",
                      )}
                    </div>
                    {renderColorPickers("dark")}
                  </div>
                </div>
              )}
              {theme === "light" && renderColorPickers("light")}
              {theme === "dark" && renderColorPickers("dark")}

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
