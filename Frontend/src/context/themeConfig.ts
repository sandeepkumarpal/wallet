export type ThemeMode = "light" | "dark";

export const THEME_STORAGE_KEY = "wallet_theme";
export const THEME_COOKIE = "wallet_theme";

export const normalizeTheme = (value?: string | null): ThemeMode =>
  value === "dark" ? "dark" : "light";
