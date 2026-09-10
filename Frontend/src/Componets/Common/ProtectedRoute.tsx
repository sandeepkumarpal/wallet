"use client";

import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  // Keep shell stable — never blank the whole app while auth hydrates if we already have a user
  if (loading && !user) {
    return (
      <div className="page-loading" aria-busy="true">
        <div className="page-loading__bar" />
      </div>
    );
  }

  if (!loading && !user) return null;

  return <>{children}</>;
};

export default ProtectedRoute;
