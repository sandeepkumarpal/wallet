"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Dashboard from "../Pages/Dashboard/Dashboard";
import Transaction from "../Pages/Transactions/Transaction";
import Budget from "../Pages/Budget/Budget";
import Profile from "../Pages/Profile/Profile";
import "./PersistentPages.scss";

const PAGES = [
  { path: "/dashboard", Page: Dashboard },
  { path: "/transactions", Page: Transaction },
  { path: "/budget", Page: Budget },
  { path: "/profile", Page: Profile },
] as const;

const ALLOWED = new Set<string>(PAGES.map((p) => p.path));

/**
 * Pages stay mounted. Inactive panes use display:none so they don't
 * create empty scroll space. Each page runs its own GSAP enter motion.
 */
const PersistentPages = () => {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Short pages would otherwise keep the previous tall-page scroll offset
    window.scrollTo(0, 0);

    // Recharts / layout after display:none → block
    const id = requestAnimationFrame(() => {
      window.dispatchEvent(new Event("resize"));
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  useEffect(() => {
    if (!ALLOWED.has(pathname)) {
      router.replace("/dashboard");
    }
  }, [pathname, router]);

  if (!ALLOWED.has(pathname)) {
    return null;
  }

  return (
    <div className="persistent-pages">
      {PAGES.map(({ path, Page }) => {
        const active = pathname === path;
        return (
          <section
            key={path}
            className={`page-pane${active ? " is-active" : ""}`}
            aria-hidden={!active}
          >
            <Page />
          </section>
        );
      })}
    </div>
  );
};

export default PersistentPages;
