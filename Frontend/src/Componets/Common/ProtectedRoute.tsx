"use client";

import { useAuth } from "../../context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import {
  BudgetSkeleton,
  DashboardSkeleton,
  ProfileSkeleton,
  TransactionSkeleton,
} from "./PageSkeleton/PageSkeleton";

const skeletonForPath = (pathname: string) => {
  if (pathname.startsWith("/transactions")) return <TransactionSkeleton />;
  if (pathname.startsWith("/budget")) return <BudgetSkeleton />;
  if (pathname.startsWith("/profile")) return <ProfileSkeleton />;
  return <DashboardSkeleton />;
};

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading && !user) {
    return (
      <div className="page-skel-wrap" aria-busy="true">
        <div className="page-skel__head">
          <div className="skel-block skel-shine page-skel__head-title" />
          <div className="skel-block skel-shine page-skel__head-sub" />
        </div>
        {skeletonForPath(pathname)}
      </div>
    );
  }

  if (!loading && !user) return null;

  return <>{children}</>;
};

export default ProtectedRoute;
