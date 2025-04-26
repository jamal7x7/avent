import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import ar from "../locales/ar.json";
import en from "../locales/en.json";
import fr from "../locales/fr.json";

const resources = {
  en_us: { translation: en },
  fr_fr: { translation: fr },
  ar_ma: { translation: ar },
};

// Initialize i18next
if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: "en_us",
      supportedLngs: ["en_us", "fr_fr", "ar_ma"],
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: [
          "querystring",
          "cookie",
          "localStorage",
          "navigator",
          "htmlTag",
        ],
        caches: ["localStorage", "cookie"],
      },
    });
}

export default i18n;
