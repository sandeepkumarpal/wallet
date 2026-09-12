"use client";

import { type ReactNode, useEffect, useState } from "react";
import { createInstance, type i18n as I18nInstance } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import en from "@/i18n/locales/en.json";
import hi from "@/i18n/locales/hi.json";
import fr from "@/i18n/locales/fr.json";
import de from "@/i18n/locales/de.json";
import es from "@/i18n/locales/es.json";
import {
  LANG_STORAGE_KEY,
  SUPPORTED_LANG_CODES,
  normalizeLanguage,
  persistLanguage,
  type AppLanguage,
} from "@/i18n/config";

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  fr: { translation: fr },
  de: { translation: de },
  es: { translation: es },
};

function createI18n(lng: AppLanguage): I18nInstance {
  const instance = createInstance();
  instance.use(initReactI18next);
  void instance.init({
    resources,
    lng,
    fallbackLng: "en",
    supportedLngs: [...SUPPORTED_LANG_CODES],
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
  instance.on("languageChanged", (next) => {
    persistLanguage(next);
  });
  return instance;
}

type Props = {
  children: ReactNode;
  initialLanguage?: string;
};

export default function I18nProvider({
  children,
  initialLanguage = "en",
}: Props) {
  const lng = normalizeLanguage(initialLanguage);
  const [instance] = useState(() => createI18n(lng));

  useEffect(() => {
    const storedRaw = localStorage.getItem(LANG_STORAGE_KEY);
    if (storedRaw) {
      const stored = normalizeLanguage(storedRaw);
      if (stored !== normalizeLanguage(instance.language)) {
        void instance.changeLanguage(stored);
      } else {
        persistLanguage(stored);
      }
      return;
    }
    persistLanguage(lng);
  }, [instance, lng]);

  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}
