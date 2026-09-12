export const SUPPORTED_LANGUAGES = [
  { code: "en", labelKey: "languages.en" },
  { code: "hi", labelKey: "languages.hi" },
  { code: "fr", labelKey: "languages.fr" },
  { code: "de", labelKey: "languages.de" },
  { code: "es", labelKey: "languages.es" },
] as const;

export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export const LANG_STORAGE_KEY = "wallet_language";
export const LANG_COOKIE = "wallet_language";

export const SUPPORTED_LANG_CODES = SUPPORTED_LANGUAGES.map((l) => l.code);

export const normalizeLanguage = (lng?: string | null): AppLanguage => {
  const code = (lng || "en").split("-")[0]?.toLowerCase();
  return (SUPPORTED_LANG_CODES as readonly string[]).includes(code || "")
    ? (code as AppLanguage)
    : "en";
};

export const persistLanguage = (lng: string) => {
  const code = normalizeLanguage(lng);
  if (typeof window !== "undefined") {
    localStorage.setItem(LANG_STORAGE_KEY, code);
    document.cookie = `${LANG_COOKIE}=${code};path=/;max-age=31536000;samesite=lax`;
    document.documentElement.lang = code;
  }
  return code;
};
