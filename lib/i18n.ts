import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ar from "../locales/ar.json";
import en from "../locales/en.json";
import fr from "../locales/fr.json";

// You can add more locales as needed

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    ar: { translation: ar },
  },
  lng: "en", // Default language
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  supportedLngs: ["en", "fr", "ar"],
  detection: {
    order: ["localStorage", "navigator"],
    caches: ["localStorage"],
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
