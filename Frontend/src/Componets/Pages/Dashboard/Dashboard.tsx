"use client";

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
  Sector,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { usePathname } from "next/navigation";
import { api, getErrorMessage } from "../../../utils/api";
import { API_URLS } from "../../../utils/Apiurls";
import {
  appLocale,
  currentMonthValue,
  formatINR,
  monthLabel,
  translateCategory,
  type MonthlySummary,
} from "../../../types/finance";
import { useAuth } from "../../../context/AuthContext";
import { getCache, setCache, subscribeCache } from "../../../utils/pageCache";
import { useLayoutReady } from "../../../hooks/useLayoutReady";
import { useDashboardGsap } from "../../../hooks/useDashboardGsap";
import { useBudgetAlerts } from "../../../hooks/useBudgetAlerts";
import { DashboardSkeleton } from "../../Common/PageSkeleton/PageSkeleton";
import EmptyState from "../../Common/EmptyState/EmptyState";
import { TransactionTypeIcon } from "../../Common/Icons/TransactionIcons";
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

type TipPayload = {
  name?: string;
  value?: number;
  color?: string;
  dataKey?: string | number;
  payload?: { name?: string; value?: number; fill?: string; day?: number };
};

const ChartTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TipPayload[];
  label?: string | number;
}) => {
  const { t } = useTranslation();
  if (!active || !payload?.length) return null;
  const item = payload[0];
  // Area chart only: dataKey is "expense" and points have a day.
  const isDailySpend =
    item.dataKey === "expense" &&
    (typeof label === "number" || item.payload?.day != null);
  const rawName = item.name ?? item.payload?.name ?? label;
  const name = isDailySpend
    ? t("dashboard.dayLabel", { day: label ?? item.payload?.day ?? "" })
    : translateCategory(String(rawName ?? ""), t);
  const value = Number(item.value ?? item.payload?.value ?? 0);
  const color = item.color ?? item.payload?.fill ?? "var(--accent)";

  return (
    <div className="dashboard__tooltip">
      <span className="dashboard__tooltip-dot" style={{ background: color }} />
      <div className="dashboard__tooltip-copy">
        {name != null && String(name).trim() !== "" ? (
          <strong>{String(name)}</strong>
        ) : null}
        <em>{formatINR(value)}</em>
      </div>
    </div>
  );
};

const renderActivePieShape = (props: PieSectorDataItem) => {
  const {
    cx = 0,
    cy = 0,
    innerRadius = 0,
    outerRadius = 0,
    startAngle,
    endAngle,
    fill,
  } = props;

  return (
    <g style={{ outline: "none" }}>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={Number(outerRadius) + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="none"
        style={{ outline: "none" }}
      />
    </g>
  );
};

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
  const { t, i18n } = useTranslation();
  const locale = appLocale(i18n.resolvedLanguage || i18n.language);
  const { user } = useAuth();
  const pathname = usePathname();
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
        setError(getErrorMessage(err, t("dashboard.loadFailed")));
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
  }, [month, pathname, t]);

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
      { key: "expense", name: t("dashboard.expense"), value: summary.expense },
      { key: "income", name: t("dashboard.income"), value: summary.income },
    ].filter((d) => d.value > 0);
  }, [summary, t]);

  const categoryPieData = useMemo(() => {
    if (!summary) return [];
    return summary.categoryBreakdown.slice(0, 8).map((cat) => ({
      ...cat,
      label: translateCategory(cat.name, t),
    }));
  }, [summary, t]);

  return (
    <div className="dashboard" ref={rootRef}>
      <div className="page-head dashboard__head">
        <div>
          <p className="dashboard__eyebrow">{monthLabel(month, locale)}</p>
          <h1>
            {t("dashboard.greeting", {
              name: user?.fullName?.split(" ")[0] || t("dashboard.greetingFallback"),
            })}
          </h1>
          <p>{t("dashboard.subtitle")}</p>
        </div>
        <div className="dashboard__head-actions">
          <div className="field dashboard__month-field">
            <label htmlFor="month">{t("dashboard.month")}</label>
            <input
              id="month"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>
          <Link href="/transactions" className="btn btn-primary dashboard__add">
            {t("dashboard.addTransaction")}
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading && !summary && <DashboardSkeleton />}

      {summary && (
        <div className={loading ? "dashboard__content is-refreshing" : "dashboard__content"}>
          {summary.monthlyBudget > 0 && summary.remaining < 0 && (
            <div className="alert alert-error dashboard__warn">
              {t("dashboard.overBudget", {
                amount: formatINR(Math.abs(summary.remaining)),
              })}
            </div>
          )}

          {summary.monthlyBudget === 0 && (
            <div className="dashboard__nudge panel">
              <div>
                <h2>{t("dashboard.setMonthBudget")}</h2>
                <p>{t("dashboard.setMonthBudgetSub")}</p>
              </div>
              <Link href="/budget" className="btn btn-primary dashboard__add">
                {t("dashboard.setBudget")}
              </Link>
            </div>
          )}

          <div className="stat-grid">
            <div className="stat-card stat-card--accent">
              <span>{t("dashboard.leftInBudget")}</span>
              <strong>{formatINR(summary.remaining)}</strong>
              <small>
                {t("dashboard.daysLeft", { count: daysLeftInMonth(month) })}
              </small>
            </div>
            <div className="stat-card">
              <span>{t("dashboard.spent")}</span>
              <strong className="is-expense">{formatINR(summary.expense)}</strong>
              {spendDelta ? (
                <small className={spendDelta.diff > 0 ? "is-expense" : "is-income"}>
                  {spendDelta.diff > 0 ? "▲" : "▼"}{" "}
                  {t("dashboard.vsLastMonthChange", {
                    pct: Math.abs(spendDelta.pct),
                  })}
                </small>
              ) : (
                <small>{t("dashboard.vsLastMonth")} —</small>
              )}
            </div>
            <div className="stat-card">
              <span>{t("dashboard.income")}</span>
              <strong className="is-income">{formatINR(summary.income)}</strong>
              <small>
                {t("dashboard.lastMonth", {
                  amount: formatINR(summary.prevIncome),
                })}
              </small>
            </div>
            <div className="stat-card">
              <span>{t("dashboard.net")}</span>
              <strong className={summary.balance >= 0 ? "is-income" : "is-expense"}>
                {formatINR(summary.balance)}
              </strong>
              <small>{t("dashboard.incomeMinusExpense")}</small>
            </div>
          </div>

          <section className="dashboard__budget panel">
            <div className="dashboard__budget-top">
              <div>
                <h2>{t("dashboard.budgetPace")}</h2>
                <p>
                  {t("dashboard.ofBudget", {
                    spent: formatINR(summary.expense),
                    budget: formatINR(summary.monthlyBudget),
                  })}
                </p>
              </div>
              <Link href="/budget" className="btn btn-ghost dashboard__ghost">
                {t("dashboard.adjust")}
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
                  ? t("dashboard.noBudgetYet")
                  : t("dashboard.percentUsed", { pct: budgetProgress })}
              </small>
              {dailyPace && summary.monthlyBudget > 0 && (
                <small>
                  {dailyPace.ahead
                    ? t("dashboard.onPace")
                    : t("dashboard.abovePace")}{" "}
                  ·{" "}
                  {t("dashboard.pacePerDay", {
                    amount: formatINR(dailyPace.leftoverPerDay),
                  })}
                </small>
              )}
            </div>
          </section>

          <div className="dashboard__grid">
            <section className="panel dashboard__chart">
              <div className="dashboard__budget-top">
                <h2>{t("dashboard.dailySpending")}</h2>
                <span className="dashboard__chip">{t("dashboard.thisMonth")}</span>
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
                      content={<ChartTooltip />}
                      cursor={{ stroke: "var(--accent)", strokeWidth: 1, strokeOpacity: 0.35 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      stroke="var(--accent)"
                      fill="url(#spend)"
                      strokeWidth={2}
                      isAnimationActive={false}
                      activeDot={{
                        r: 5,
                        stroke: "var(--surface)",
                        strokeWidth: 2,
                        fill: "var(--accent)",
                      }}
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
                <h2>{t("dashboard.byCategory")}</h2>
                <span className="dashboard__chip">{t("transactions.expenses")}</span>
              </div>
              {categoryPieData.length === 0 ? (
                <EmptyState
                  title={t("transactions.noRecordTitle")}
                  description={t("dashboard.noExpenses")}
                  action={
                    <Link href="/transactions" className="btn btn-primary">
                      {t("dashboard.logPurchase")}
                    </Link>
                  }
                />
              ) : (
                <>
                  <div className="dashboard__pie-wrap">
                    {chartsReady ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={categoryPieData}
                          dataKey="value"
                          nameKey="label"
                          cx="50%"
                          cy="50%"
                          innerRadius={52}
                          outerRadius={78}
                          paddingAngle={2}
                          stroke="var(--surface)"
                          strokeWidth={2}
                          isAnimationActive={false}
                          activeShape={renderActivePieShape}
                        >
                          {categoryPieData.map((entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={PIE_COLORS[index % PIE_COLORS.length]}
                              stroke="var(--surface)"
                              strokeWidth={2}
                              style={{ outline: "none" }}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
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
                              {cat.label}
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
              <h2>{t("dashboard.incomeVsExpense")}</h2>
                <span className="dashboard__chip">{t("dashboard.thisMonth")}</span>
            </div>
            {typePieData.length === 0 ? (
              <EmptyState
                title={t("transactions.noRecordTitle")}
                description={t("dashboard.addIncomeOrExpense")}
              />
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
                        stroke="var(--surface)"
                        strokeWidth={2}
                        isAnimationActive={false}
                        activeShape={renderActivePieShape}
                      >
                        {typePieData.map((entry) => (
                          <Cell
                            key={entry.key}
                            fill={
                              entry.key === "income"
                                ? "var(--income)"
                                : "var(--expense)"
                            }
                            stroke="var(--surface)"
                            strokeWidth={2}
                            style={{ outline: "none" }}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
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
                    <span>{t("dashboard.incomeShare")}</span>
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
                    <span>{t("dashboard.expenseShare")}</span>
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
                    <span>{t("dashboard.totalMoved")}</span>
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
              <h2>{t("dashboard.recent")}</h2>
              <Link
                href="/transactions"
                className="btn btn-ghost dashboard__ghost"
              >
                {t("dashboard.viewAll")}
              </Link>
            </div>
            {summary.recent.length === 0 ? (
              <EmptyState
                title={t("transactions.noRecordTitle")}
                description={t("dashboard.nothingLogged", {
                  month: monthLabel(month, locale),
                })}
                action={
                  <Link href="/transactions" className="btn btn-primary">
                    {t("dashboard.addFirst")}
                  </Link>
                }
              />
            ) : (
              <ul className="tx-list">
                {summary.recent.map((tx) => (
                  <li key={tx._id}>
                    <div className="tx-list__main">
                      <div>
                        <strong>{tx.description}</strong>
                        <span>
                          {translateCategory(tx.category, t)} ·{" "}
                          {new Date(tx.date).toLocaleDateString(locale, {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="tx-list__amount">
                      <em
                        className={
                          tx.expenseType === "income"
                            ? "is-income"
                            : "is-expense"
                        }
                      >
                        {tx.expenseType === "income" ? "+" : "−"}
                        {formatINR(tx.amount)}
                      </em>
                      <span
                        className={`tx-type-icon ${
                          tx.expenseType === "income"
                            ? "is-income"
                            : "is-expense"
                        }`}
                        aria-hidden
                      >
                        <TransactionTypeIcon
                          type={tx.expenseType}
                          size={18}
                        />
                      </span>
                    </div>
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
