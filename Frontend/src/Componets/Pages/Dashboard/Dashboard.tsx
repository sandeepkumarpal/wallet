import { useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link, useLocation } from "react-router-dom";
import { api, getErrorMessage } from "../../../utils/api";
import { API_URLS } from "../../../utils/Apiurls";
import {
  currentMonthValue,
  formatINR,
  monthLabel,
  type MonthlySummary,
} from "../../../types/finance";
import { useAuth } from "../../../context/AuthContext";
import { getCache, setCache, subscribeCache } from "../../../utils/pageCache";
import { useLayoutReady } from "../../../hooks/useLayoutReady";
import { useDashboardGsap } from "../../../hooks/useDashboardGsap";
import { useBudgetAlerts } from "../../../hooks/useBudgetAlerts";
import { DashboardSkeleton } from "../../Common/PageSkeleton/PageSkeleton";
import "./Dashboard.scss";

const PIE_COLORS = [
  "#1a7a62",
  "#c45c26",
  "#0f4f42",
  "#2ea57f",
  "#b93737",
  "#5a6f68",
  "#d4a017",
  "#3d7ea6",
];

const daysLeftInMonth = (month: string) => {
  const [y, m] = month.split("-").map(Number);
  const end = new Date(y, m, 0);
  const today = new Date();
  const isCurrent =
    today.getFullYear() === y && today.getMonth() + 1 === m;
  if (!isCurrent) return end.getDate();
  return Math.max(0, end.getDate() - today.getDate());
};

const Dashboard = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const rootRef = useRef<HTMLDivElement>(null);
  const layoutReady = useLayoutReady();
  const chartsReady = layoutReady;
  const [month, setMonth] = useState(currentMonthValue());
  const [summary, setSummary] = useState<MonthlySummary | null>(() =>
    getCache<MonthlySummary>(`summary:${currentMonthValue()}`)
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(
    () => !getCache(`summary:${currentMonthValue()}`)
  );
  const summaryRef = useRef(summary);
  summaryRef.current = summary;

  useEffect(() => {
    let active = true;
    const cacheKey = `summary:${month}`;

    const apply = (data: MonthlySummary) => {
      if (!active) return;
      setSummary(data);
      setCache(cacheKey, data);
      setLoading(false);
    };

    const load = async (silent: boolean) => {
      if (!silent) setLoading(true);
      setError("");
      try {
        const { data } = await api.get(API_URLS.SUMMARY, {
          params: { month },
        });
        apply(data);
      } catch (err) {
        if (!active) return;
        setError(getErrorMessage(err, "Could not load summary"));
        setLoading(false);
      }
    };

    const cached = getCache<MonthlySummary>(cacheKey);
    if (cached) {
      setSummary(cached);
      setLoading(false);
      void load(true);
    } else if (summaryRef.current && pathname === "/dashboard") {
      void load(true);
    } else {
      void load(false);
    }

    const unsub = subscribeCache((key, value) => {
      if (key !== cacheKey) return;
      if (value) {
        setSummary(value as MonthlySummary);
        setLoading(false);
        return;
      }
      void load(true);
    });

    return () => {
      active = false;
      unsub();
    };
  }, [month, pathname]);

  const budgetProgress = useMemo(() => {
    if (!summary || !summary.monthlyBudget) return 0;
    return Math.min(
      100,
      Math.round((summary.expense / summary.monthlyBudget) * 100)
    );
  }, [summary]);

  useDashboardGsap({
    rootRef,
    enabled: Boolean(summary) && chartsReady,
    budgetProgress,
  });

  useBudgetAlerts(summary);

  const spendDelta = useMemo(() => {
    if (!summary) return null;
    if (!summary.prevExpense) return null;
    const diff = summary.expense - summary.prevExpense;
    const pct = Math.round((diff / summary.prevExpense) * 100);
    return { diff, pct };
  }, [summary]);

  const dailyPace = useMemo(() => {
    if (!summary?.monthlyBudget) return null;
    const [y, m] = month.split("-").map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const today = new Date();
    const dayNum =
      today.getFullYear() === y && today.getMonth() + 1 === m
        ? today.getDate()
        : daysInMonth;
    const ideal = (summary.monthlyBudget / daysInMonth) * dayNum;
    return {
      ideal,
      ahead: summary.expense <= ideal,
      leftoverPerDay:
        daysLeftInMonth(month) > 0
          ? Math.max(0, summary.remaining) / daysLeftInMonth(month)
          : 0,
    };
  }, [summary, month]);

  const chartMax = useMemo(() => {
    if (!summary?.trend?.length) return 1000;
    return Math.max(...summary.trend.map((t) => t.expense), 100);
  }, [summary]);

  const typePieData = useMemo(() => {
    if (!summary) return [];
    return [
      { name: "Expense", value: summary.expense },
      { name: "Income", value: summary.income },
    ].filter((d) => d.value > 0);
  }, [summary]);

  const categoryPieData = useMemo(() => {
    if (!summary) return [];
    return summary.categoryBreakdown.slice(0, 8);
  }, [summary]);

  return (
    <div className="dashboard" ref={rootRef}>
      <div className="page-head dashboard__head">
        <div>
          <p className="dashboard__eyebrow">{monthLabel(month)}</p>
          <h1>Hi, {user?.fullName?.split(" ")[0] || "there"}</h1>
          <p>Your money this month, at a glance.</p>
        </div>
        <div className="dashboard__head-actions">
          <div className="field dashboard__month-field">
            <label htmlFor="month">Month</label>
            <input
              id="month"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>
          <Link to="/transactions" className="btn btn-primary dashboard__add">
            Add transaction
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading && !summary && <DashboardSkeleton />}

      {summary && (
        <div className={loading ? "dashboard__content is-refreshing" : "dashboard__content"}>
          {summary.monthlyBudget > 0 && summary.remaining < 0 && (
            <div className="alert alert-error dashboard__warn">
              You are {formatINR(Math.abs(summary.remaining))} over budget this
              month.
            </div>
          )}

          {summary.monthlyBudget === 0 && (
            <div className="dashboard__nudge panel">
              <div>
                <h2>Set this month’s budget</h2>
                <p>Track what’s left after everyday spending.</p>
              </div>
              <Link to="/budget" className="btn btn-primary dashboard__add">
                Set budget
              </Link>
            </div>
          )}

          <div className="stat-grid">
            <div className="stat-card stat-card--accent">
              <span>Left in budget</span>
              <strong>{formatINR(summary.remaining)}</strong>
              <small>
                {daysLeftInMonth(month)} day
                {daysLeftInMonth(month) === 1 ? "" : "s"} left
              </small>
            </div>
            <div className="stat-card">
              <span>Spent</span>
              <strong className="is-expense">{formatINR(summary.expense)}</strong>
              {spendDelta ? (
                <small className={spendDelta.diff > 0 ? "is-expense" : "is-income"}>
                  {spendDelta.diff > 0 ? "▲" : "▼"} {Math.abs(spendDelta.pct)}% vs
                  last month
                </small>
              ) : (
                <small>vs last month —</small>
              )}
            </div>
            <div className="stat-card">
              <span>Income</span>
              <strong className="is-income">{formatINR(summary.income)}</strong>
              <small>Last month {formatINR(summary.prevIncome)}</small>
            </div>
            <div className="stat-card">
              <span>Net</span>
              <strong className={summary.balance >= 0 ? "is-income" : "is-expense"}>
                {formatINR(summary.balance)}
              </strong>
              <small>Income − expenses</small>
            </div>
          </div>

          <section className="dashboard__budget panel">
            <div className="dashboard__budget-top">
              <div>
                <h2>Budget pace</h2>
                <p>
                  {formatINR(summary.expense)} of{" "}
                  {formatINR(summary.monthlyBudget)}
                </p>
              </div>
              <Link to="/budget" className="btn btn-ghost dashboard__ghost">
                Adjust
              </Link>
            </div>
            <div
              className={`dashboard__bar ${
                budgetProgress >= 90 ? "is-hot" : ""
              }`}
            >
              <span style={{ width: `${budgetProgress}%` }} />
            </div>
            <div className="dashboard__budget-meta">
              <small>
                {summary.monthlyBudget === 0
                  ? "No budget set yet."
                  : `${budgetProgress}% used`}
              </small>
              {dailyPace && summary.monthlyBudget > 0 && (
                <small>
                  {dailyPace.ahead ? "On pace" : "Above pace"} · ~{" "}
                  {formatINR(dailyPace.leftoverPerDay)}/day left
                </small>
              )}
            </div>
          </section>

          <div className="dashboard__grid">
            <section className="panel dashboard__chart">
              <div className="dashboard__budget-top">
                <h2>Daily spending</h2>
                <span className="dashboard__chip">This month</span>
              </div>
              <div className="dashboard__chart-wrap">
                {chartsReady ? (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={summary.trend}>
                    <defs>
                      <linearGradient id="spend" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="var(--accent)"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="100%"
                          stopColor="var(--accent)"
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      stroke="var(--line)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                      minTickGap={16}
                      tick={{ fill: "var(--muted)", fontSize: 12 }}
                    />
                    <YAxis
                      width={48}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "var(--muted)", fontSize: 12 }}
                      tickFormatter={(v) =>
                        chartMax >= 1000
                          ? `${Math.round(Number(v) / 1000)}k`
                          : String(Math.round(Number(v)))
                      }
                    />
                    <Tooltip
                      formatter={(value) => formatINR(Number(value ?? 0))}
                      labelFormatter={(label) => `Day ${label}`}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid var(--line)",
                        background: "var(--surface)",
                        color: "var(--ink)",
                      }}
                      labelStyle={{ color: "var(--muted)" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      stroke="var(--accent)"
                      fill="url(#spend)"
                      strokeWidth={2}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                ) : (
                  <div className="dashboard__chart-slot" aria-hidden />
                )}
              </div>
            </section>

            <section className="panel dashboard__cats">
              <div className="dashboard__budget-top">
                <h2>By category</h2>
                <span className="dashboard__chip">Expenses</span>
              </div>
              {categoryPieData.length === 0 ? (
                <div className="empty-state">
                  No expenses yet.{" "}
                  <Link to="/transactions">Log a purchase</Link>
                </div>
              ) : (
                <>
                  <div className="dashboard__pie-wrap">
                    {chartsReady ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={categoryPieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={52}
                          outerRadius={78}
                          paddingAngle={2}
                          isAnimationActive={false}
                        >
                          {categoryPieData.map((entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={PIE_COLORS[index % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => formatINR(Number(value ?? 0))}
                          contentStyle={{
                            borderRadius: 12,
                            border: "1px solid var(--line)",
                            background: "var(--surface)",
                            color: "var(--ink)",
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          iconType="circle"
                          wrapperStyle={{ fontSize: 12, color: "var(--muted)" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    ) : (
                      <div className="dashboard__chart-slot" aria-hidden />
                    )}
                  </div>
                  <ul>
                    {categoryPieData.slice(0, 5).map((cat, index) => {
                      const pct = summary.expense
                        ? Math.round((cat.value / summary.expense) * 100)
                        : 0;
                      return (
                        <li key={cat.name}>
                          <div>
                            <strong>
                              <i
                                className="dashboard__swatch"
                                style={{
                                  background:
                                    PIE_COLORS[index % PIE_COLORS.length],
                                }}
                                aria-hidden
                              />
                              {cat.name}
                            </strong>
                            <span>{pct}%</span>
                          </div>
                          <em>{formatINR(cat.value)}</em>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </section>
          </div>

          <section className="panel dashboard__type-pie">
            <div className="dashboard__budget-top">
              <h2>Income vs expense</h2>
              <span className="dashboard__chip">This month</span>
            </div>
            {typePieData.length === 0 ? (
              <div className="empty-state">
                Add income or expenses to see the split.
              </div>
            ) : (
              <div className="dashboard__type-pie-layout">
                <div className="dashboard__pie-wrap">
                  {chartsReady ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={typePieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={58}
                        outerRadius={88}
                        paddingAngle={3}
                        isAnimationActive={false}
                      >
                        {typePieData.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={
                              entry.name === "Income"
                                ? "var(--income)"
                                : "var(--expense)"
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatINR(Number(value ?? 0))}
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid var(--line)",
                          background: "var(--surface)",
                          color: "var(--ink)",
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        wrapperStyle={{ fontSize: 13, color: "var(--muted)" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  ) : (
                    <div className="dashboard__chart-slot" aria-hidden />
                  )}
                </div>
                <ul className="dashboard__type-stats">
                  <li>
                    <span>Income share</span>
                    <strong className="is-income">
                      {summary.income + summary.expense
                        ? Math.round(
                            (summary.income /
                              (summary.income + summary.expense)) *
                              100
                          )
                        : 0}
                      %
                    </strong>
                  </li>
                  <li>
                    <span>Expense share</span>
                    <strong className="is-expense">
                      {summary.income + summary.expense
                        ? Math.round(
                            (summary.expense /
                              (summary.income + summary.expense)) *
                              100
                          )
                        : 0}
                      %
                    </strong>
                  </li>
                  <li>
                    <span>Total moved</span>
                    <strong>
                      {formatINR(summary.income + summary.expense)}
                    </strong>
                  </li>
                </ul>
              </div>
            )}
          </section>

          <section className="panel dashboard__recent">
            <div className="dashboard__budget-top">
              <h2>Recent activity</h2>
              <Link
                to="/transactions"
                className="btn btn-ghost dashboard__ghost"
              >
                View all
              </Link>
            </div>
            {summary.recent.length === 0 ? (
              <div className="empty-state">
                Nothing logged for {monthLabel(month)}.{" "}
                <Link to="/transactions">Add your first transaction</Link>
              </div>
            ) : (
              <ul className="tx-list">
                {summary.recent.map((tx) => (
                  <li key={tx._id}>
                    <div className="tx-list__main">
                      <span
                        className={`tx-list__dot ${
                          tx.expenseType === "income"
                            ? "is-income"
                            : "is-expense"
                        }`}
                        aria-hidden
                      />
                      <div>
                        <strong>{tx.description}</strong>
                        <span>
                          {tx.category} ·{" "}
                          {new Date(tx.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                    </div>
                    <em
                      className={
                        tx.expenseType === "income" ? "is-income" : "is-expense"
                      }
                    >
                      {tx.expenseType === "income" ? "+" : "−"}
                      {formatINR(tx.amount)}
                    </em>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
