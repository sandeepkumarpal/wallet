import { useEffect, useRef, useState, type FormEvent } from "react";
import { api, getErrorMessage } from "../../../utils/api";
import { API_URLS } from "../../../utils/Apiurls";
import {
  EXPENSE_CATEGORIES,
  currentMonthValue,
  formatINR,
  monthLabel,
  type CategoryBudget,
  type MonthlySummary,
} from "../../../types/finance";
import { useAuth } from "../../../context/AuthContext";
import { getCache, setCache, subscribeCache } from "../../../utils/pageCache";
import { BudgetSkeleton } from "../../Common/PageSkeleton/PageSkeleton";
import { usePageGsap } from "../../../hooks/usePageGsap";
import "./Budget.scss";

const BUDGET_TARGETS = [
  ".budget-page__hero",
  ".budget-page__form",
  ".budget-page__category",
  ".budget-page__cats",
] as const;

const Budget = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const { refreshUser } = useAuth();
  const [month] = useState(currentMonthValue());
  const [summary, setSummary] = useState<MonthlySummary | null>(() =>
    getCache<MonthlySummary>(`summary:${currentMonthValue()}`)
  );
  const [budget, setBudget] = useState(() => {
    const cached = getCache<MonthlySummary>(`summary:${currentMonthValue()}`);
    return cached ? String(cached.monthlyBudget || "") : "";
  });
  const [catRows, setCatRows] = useState<CategoryBudget[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingCats, setSavingCats] = useState(false);
  const [loading, setLoading] = useState(
    () => !getCache(`summary:${currentMonthValue()}`)
  );

  usePageGsap({
    rootRef,
    path: "/budget",
    enabled: Boolean(summary) && !loading,
    targets: BUDGET_TARGETS,
  });

  const applySummary = (data: MonthlySummary) => {
    setSummary(data);
    setBudget(String(data.monthlyBudget || ""));
    setCatRows(
      (data.categoryBudgets || []).map(
        (c: { category: string; limit: number }) => ({
          category: c.category,
          limit: c.limit,
        })
      )
    );
    setLoading(false);
  };

  const load = async (silent = false) => {
    if (!silent && !getCache(`summary:${month}`)) setLoading(true);
    try {
      const { data } = await api.get(API_URLS.SUMMARY, { params: { month } });
      applySummary(data);
      setCache(`summary:${month}`, data);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load budget"));
      setLoading(false);
    }
  };

  useEffect(() => {
    const cacheKey = `summary:${month}`;
    const cached = getCache<MonthlySummary>(cacheKey);
    if (cached) {
      applySummary(cached);
      void load(true);
    } else {
      void load(false);
    }

    return subscribeCache((key, value) => {
      if (key !== cacheKey) return;
      if (value) {
        applySummary(value as MonthlySummary);
        return;
      }
      void load(true);
    });
  }, [month]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.put(API_URLS.BUDGET, { monthlyBudget: Number(budget) });
      setSuccess("Monthly budget updated");
      await refreshUser();
      await load();
    } catch (err) {
      setError(getErrorMessage(err, "Could not update budget"));
    } finally {
      setSaving(false);
    }
  };

  const onSaveCategories = async (e: FormEvent) => {
    e.preventDefault();
    setSavingCats(true);
    setError("");
    setSuccess("");
    try {
      await api.put(API_URLS.CATEGORY_BUDGETS, {
        categoryBudgets: catRows.filter((r) => r.category && r.limit >= 0),
      });
      setSuccess("Category budgets saved");
      await refreshUser();
      await load();
    } catch (err) {
      setError(getErrorMessage(err, "Could not save category budgets"));
    } finally {
      setSavingCats(false);
    }
  };

  const addCatRow = () => {
    const used = new Set(catRows.map((r) => r.category));
    const next = EXPENSE_CATEGORIES.find((c) => !used.has(c)) || "Other";
    setCatRows([...catRows, { category: next, limit: 0 }]);
  };

  const remaining = summary ? summary.remaining : 0;
  const usedPct =
    summary && summary.monthlyBudget
      ? Math.min(
          100,
          Math.round((summary.expense / summary.monthlyBudget) * 100)
        )
      : 0;

  return (
    <div className="budget-page" ref={rootRef}>
      <div className="page-head">
        <div>
          <h1>Monthly budget</h1>
          <p>Plan for {monthLabel(month)}</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {loading && !summary ? (
        <BudgetSkeleton />
      ) : (
        <>
          <section className="panel budget-page__hero">
            <p>Remaining this month</p>
            <h2>{formatINR(remaining)}</h2>
            <div className="dashboard__bar" style={{ marginTop: "1rem" }}>
              <span style={{ width: `${usedPct}%` }} />
            </div>
            <small>
              {summary
                ? `${formatINR(summary.expense)} spent of ${formatINR(summary.monthlyBudget)}`
                : "—"}
            </small>
          </section>

          <form className="panel budget-page__form" onSubmit={onSubmit}>
            <h2>Set spending limit</h2>
            <p>This is your target ceiling for expenses this month.</p>
            <div className="field">
              <label htmlFor="budget">Monthly budget (₹)</label>
              <input
                id="budget"
                type="number"
                min="0"
                step="100"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                required
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save budget"}
            </button>
          </form>

          <form
            className="panel budget-page__category"
            onSubmit={onSaveCategories}
          >
            <h2>Category budgets</h2>
            <p>Cap spend per category. Alerts fire at 50%, 80%, and 100%.</p>

            {catRows.length === 0 && (
              <p className="budget-page__hint">No category limits yet.</p>
            )}

            <ul className="budget-page__cat-edit">
              {catRows.map((row, idx) => {
                const status = summary?.categoryBudgets?.find(
                  (c) => c.category === row.category
                );
                const pct = status
                  ? Math.min(100, status.pct)
                  : 0;
                return (
                  <li key={`${row.category}-${idx}`}>
                    <div className="budget-page__cat-edit-row">
                      <select
                        value={row.category}
                        onChange={(e) => {
                          const next = [...catRows];
                          next[idx] = {
                            ...next[idx],
                            category: e.target.value,
                          };
                          setCatRows(next);
                        }}
                      >
                        {EXPENSE_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        placeholder="Limit ₹"
                        value={row.limit || ""}
                        onChange={(e) => {
                          const next = [...catRows];
                          next[idx] = {
                            ...next[idx],
                            limit: Number(e.target.value) || 0,
                          };
                          setCatRows(next);
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() =>
                          setCatRows(catRows.filter((_, i) => i !== idx))
                        }
                      >
                        Remove
                      </button>
                    </div>
                    {status && status.limit > 0 && (
                      <div className="budget-page__cat-progress">
                        <div className="dashboard__bar">
                          <span
                            style={{
                              width: `${pct}%`,
                              background:
                                pct >= 100
                                  ? "var(--danger)"
                                  : pct >= 80
                                    ? "var(--warn)"
                                    : undefined,
                            }}
                          />
                        </div>
                        <small>
                          {formatINR(status.spent)} / {formatINR(status.limit)}{" "}
                          ({status.pct}%)
                        </small>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="budget-page__cat-actions">
              <button type="button" className="btn btn-ghost" onClick={addCatRow}>
                Add category
              </button>
              <button
                className="btn btn-primary"
                type="submit"
                disabled={savingCats}
              >
                {savingCats ? "Saving…" : "Save category budgets"}
              </button>
            </div>
          </form>

          {summary && summary.categoryBreakdown.length > 0 && (
            <section className="panel budget-page__cats">
              <h2>Where it went</h2>
              <ul>
                {summary.categoryBreakdown.map((cat) => (
                  <li key={cat.name}>
                    <span>{cat.name}</span>
                    <strong>{formatINR(cat.value)}</strong>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default Budget;
