"use client";

import { type ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import type { ThemeMode } from "@/context/themeConfig";
import { NotificationProvider } from "@/context/NotificationContext";
import I18nProvider from "@/components/I18nProvider";
import GoogleAuthProvider from "@/components/GoogleAuthProvider";
import AppShell from "@/components/AppShell";

export default function Providers({
  children,
  initialLanguage = "en",
  initialTheme = "light",
}: {
  children: ReactNode;
  initialLanguage?: string;
  initialTheme?: ThemeMode;
}) {
  return (
    <I18nProvider initialLanguage={initialLanguage}>
      <ThemeProvider initialTheme={initialTheme}>
        <GoogleAuthProvider>
          <AuthProvider>
            <NotificationProvider>
              <AppShell>{children}</AppShell>
            </NotificationProvider>
          </AuthProvider>
        </GoogleAuthProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
