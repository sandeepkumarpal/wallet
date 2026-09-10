"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import AppNav from "@/Componets/Common/AppNav/AppNav";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isLanding = pathname === "/";

  return (
    <div className={`app-shell${isLanding ? " app-shell--landing" : ""}`}>
      {!isAuthPage && !isLanding && <AppNav />}
      <main
        className={`app-main ${
          isAuthPage ? "app-main--auth" : ""
        }${isLanding ? " app-main--landing" : ""}`}
      >
        {children}
      </main>
    </div>
  );
}
