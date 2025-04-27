"use client";
import { useTranslation } from "react-i18next";
import { RiGlobalLine } from "@remixicon/react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

const languages = [
  { code: "en_us", label: "English" },
  { code: "fr_fr", label: "Français" },
  { code: "ar_ma", label: "العربية" },
];

export function LanguageSwitcher({ className, isCollapsed }: { className?: string; isCollapsed?: boolean }) {
  const { t, i18n } = useTranslation();
  const normalizedLang = (i18n.language || "").toLowerCase().replace("-", "_");
  const current =
    languages.find((l) => l.code === normalizedLang) ||
    languages.find((l) => l.code.startsWith(normalizedLang.split("_")[0])) ||
    languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={
            isCollapsed === false
              ? `h-9 w-full min-w-[140px] rounded-full focus:outline-none focus:ring hover:bg-sidebar-accent flex items-center justify-start px-3 gap-3 ${className || ""}`
              : `h-9 w-9 rounded-full focus:outline-none focus:ring hover:bg-sidebar-accent flex items-center justify-center ${className || ""}`
          }
          aria-label="Switch language"
        >
          <RiGlobalLine size={22} className="text-muted-foreground/60" />
          {isCollapsed === false && (
            <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">
              {current.label}
            </span>
          )}
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            className={
              lang.code === i18n.language ? "font-medium text-primary" : ""
            }
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
