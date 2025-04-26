"use client";
import { useTranslation } from "react-i18next";

export function I18nDemo() {
  const { t, i18n } = useTranslation();

  return (
    <div className="space-y-2">
      <div>{t("welcome")}</div>
      <div className="flex gap-2">
        <button
          onClick={() => i18n.changeLanguage("en_us")}
          className="px-2 py-1 border rounded"
        >
          English
        </button>
        <button
          onClick={() => i18n.changeLanguage("fr_fr")}
          className="px-2 py-1 border rounded"
        >
          Français
        </button>
        <button
          onClick={() => i18n.changeLanguage("ar_ma")}
          className="px-2 py-1 border rounded"
        >
          العربية
        </button>
      </div>
    </div>
  );
}
