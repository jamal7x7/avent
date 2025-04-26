"use client";
import { useTranslation } from "react-i18next";
import GlobeIcon from "~/components/icons/globe";
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

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n } = useTranslation();
  const current =
    languages.find((l) => l.code === i18n.language) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`h-9 w-9 rounded-full bg-background transition-colors hover:bg-muted ${className || ""}`}
          aria-label="Switch language"
        >
          <GlobeIcon className="h-[1.2rem] w-[1.2rem]" />
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
