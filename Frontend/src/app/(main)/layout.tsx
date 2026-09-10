"use client";

import { type ReactNode } from "react";
import ProtectedRoute from "@/Componets/Common/ProtectedRoute";
import PersistentPages from "@/Componets/Common/PersistentPages";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <PersistentPages />
      {children}
    </ProtectedRoute>
  );
}
