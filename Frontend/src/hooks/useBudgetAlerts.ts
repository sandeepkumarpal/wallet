import { useEffect, useRef } from "react";
import type { MonthlySummary } from "../types/finance";
import { formatINR } from "../types/finance";
import {
  hasAlertFlag,
  setAlertFlag,
  useNotifications,
} from "../context/NotificationContext";

const THRESHOLDS = [50, 80, 100] as const;

/**
 * Pushes budget threshold alerts into the nav bell when spend crosses 50/80/100%.
 */
export const useBudgetAlerts = (summary: MonthlySummary | null) => {
  const { addNotification } = useNotifications();
  const prevPctRef = useRef<number | null>(null);
  const prevCatRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!summary?.month) return;

    const pct =
      summary.budgetUsedPct ??
      (summary.monthlyBudget
        ? Math.round((summary.expense / summary.monthlyBudget) * 100)
        : 0);

    const prevPct = prevPctRef.current;
    prevPctRef.current = pct;

    if (summary.monthlyBudget > 0) {
      for (const t of THRESHOLDS) {
        const crossed =
          pct >= t && (prevPct === null || prevPct < t);
        if (!crossed) continue;
        const flag = `overall-${t}`;
        if (hasAlertFlag(summary.month, flag)) continue;
        setAlertFlag(summary.month, flag);
        addNotification({
          id: `${summary.month}-${flag}-${summary.expense}`,
          title: `Budget ${t}% used`,
          body: `You've spent ${formatINR(summary.expense)} of ${formatINR(summary.monthlyBudget)} this month.`,
          kind: "budget",
        });
      }
    }

    const prevCats = prevCatRef.current;
    const nextCats: Record<string, number> = {};

    for (const cat of summary.categoryBudgets || []) {
      if (!cat.limit) continue;
      nextCats[cat.category] = cat.pct;
      const prevCatPct = prevCats[cat.category];
      for (const t of THRESHOLDS) {
        const crossed =
          cat.pct >= t &&
          (prevCatPct === undefined || prevCatPct < t);
        if (!crossed) continue;
        const flag = `cat-${cat.category}-${t}`;
        if (hasAlertFlag(summary.month, flag)) continue;
        setAlertFlag(summary.month, flag);
        addNotification({
          id: `${summary.month}-${flag}-${cat.spent}`,
          title: `${cat.category} at ${t}%`,
          body: `${formatINR(cat.spent)} of ${formatINR(cat.limit)} used for ${cat.category}.`,
          kind: "category",
        });
      }
    }
    prevCatRef.current = nextCats;
  }, [summary, addNotification]);
};
