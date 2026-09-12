"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  THEME_COOKIE,
  THEME_STORAGE_KEY,
  normalizeTheme,
  type ThemeMode,
} from "./themeConfig";

export type { ThemeMode };

type ThemeContextValue = {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const persistTheme = (mode: ThemeMode) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(THEME_STORAGE_KEY, mode);
  document.cookie = `${THEME_COOKIE}=${mode};path=/;max-age=31536000;samesite=lax`;
  document.documentElement.setAttribute("data-theme", mode);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", mode === "dark" ? "#0f1714" : "#1a7a62");
  }
};

export const ThemeProvider = ({
  children,
  initialTheme = "light",
}: {
  children: ReactNode;
  initialTheme?: ThemeMode;
}) => {
  const [theme, setThemeState] = useState<ThemeMode>(() =>
    normalizeTheme(initialTheme)
  );

  useEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "dark" || saved === "light") {
      setThemeState(saved);
      persistTheme(saved);
      return;
    }
    persistTheme(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- migrate storage once on mount
  }, []);

  useEffect(() => {
    persistTheme(theme);
  }, [theme]);

  const setTheme = (mode: ThemeMode) => setThemeState(mode);
  const toggleTheme = () =>
    setThemeState((t) => (t === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
