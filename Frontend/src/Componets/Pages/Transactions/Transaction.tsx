"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useForm,
  type UseFormRegister,
  type UseFormSetValue,
  type FieldErrors,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { api, getErrorMessage } from "../../../utils/api";
import { API_URLS } from "../../../utils/Apiurls";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
  currentMonthValue,
  formatINR,
  monthLabel,
  type ExpenseType,
  type Transaction,
} from "../../../types/finance";
import ConfirmModal from "../../Common/ConfirmModal/ConfirmModal";
import FieldError from "../../Common/FieldError/FieldError";
import EmptyState from "../../Common/EmptyState/EmptyState";
import CategorySelect from "../../Common/CategorySelect/CategorySelect";
import { CategoryIcon } from "../../Common/Icons/CategoryIcons";
import {
  ExpenseIcon,
  IncomeIcon,
  TransactionTypeIcon,
} from "../../Common/Icons/TransactionIcons";
import { getCache, setCache, invalidateCache } from "../../../utils/pageCache";
import { TransactionSkeleton } from "../../Common/PageSkeleton/PageSkeleton";
import { usePageGsap } from "../../../hooks/usePageGsap";
import {
  exportTransactionsCsv,
  exportTransactionsPdf,
} from "../../../utils/exportTransactions";
import RecurringPanel from "./RecurringPanel";
import {
  createTransactionSchema,
  type TransactionFormValues,
} from "../../../validation/schemas";
import "./Transaction.scss";
import "../../Common/ConfirmModal/ConfirmModal.scss";

const TX_TARGETS = [".transactions__tabs"] as const;

const emptyForm: TransactionFormValues = {
  amount: "",
  description: "",
  date: new Date().toISOString().slice(0, 10),
  category: "Food",
  paymentMethod: "UPI",
  expenseType: "expense",
  notes: "",
};

const toForm = (tx: Transaction): TransactionFormValues => ({
  amount: String(tx.amount),
  description: tx.description,
  date: new Date(tx.date).toISOString().slice(0, 10),
  category: tx.category,
  paymentMethod: tx.paymentMethod,
  expenseType: tx.expenseType,
  notes: tx.notes || "",
});

const TransactionFormFields = ({
  idPrefix,
  expenseType,
  category,
  paymentMethod,
  register,
  setValue,
  errors,
  t,
}: {
  idPrefix: string;
  expenseType: ExpenseType;
  category: string;
  paymentMethod: string;
  register: UseFormRegister<TransactionFormValues>;
  setValue: UseFormSetValue<TransactionFormValues>;
  errors: FieldErrors<TransactionFormValues>;
  t: TFunction;
}) => {
  const categories =
    expenseType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <>
      <div className="chip-row">
        {(["expense", "income"] as const).map((type) => (
          <button
            key={type}
            type="button"
            className={`chip chip--with-icon ${expenseType === type ? "is-active" : ""}`}
            onClick={() => {
              setValue("expenseType", type, { shouldValidate: true });
              setValue(
                "category",
                type === "income"
                  ? INCOME_CATEGORIES[0]
                  : EXPENSE_CATEGORIES[0],
                { shouldValidate: true }
              );
            }}
          >
            {type === "expense" ? (
              <ExpenseIcon size={16} />
            ) : (
              <IncomeIcon size={16} />
            )}
            {type === "expense"
              ? t("transactions.expense")
              : t("transactions.incomeType")}
          </button>
        ))}
      </div>
      <input type="hidden" {...register("expenseType")} />

      <div className="transactions__grid">
        <div className="field">
          <label htmlFor={`${idPrefix}-amount`}>
            {t("transactions.amount")}
          </label>
          <input
            id={`${idPrefix}-amount`}
            type="number"
            min="0"
            step="1"
            className={errors.amount ? "is-invalid" : undefined}
            aria-invalid={Boolean(errors.amount)}
            {...register("amount")}
          />
          <FieldError message={errors.amount?.message} />
        </div>
        <div className="field">
          <label htmlFor={`${idPrefix}-date`}>{t("transactions.date")}</label>
          <input
            id={`${idPrefix}-date`}
            type="date"
            className={errors.date ? "is-invalid" : undefined}
            aria-invalid={Boolean(errors.date)}
            {...register("date")}
          />
          <FieldError message={errors.date?.message} />
        </div>
        <div className="field">
          <label htmlFor={`${idPrefix}-description`}>
            {t("transactions.description")}
          </label>
          <input
            id={`${idPrefix}-description`}
            className={errors.description ? "is-invalid" : undefined}
            aria-invalid={Boolean(errors.description)}
            {...register("description")}
          />
          <FieldError message={errors.description?.message} />
        </div>
        <div className="field">
          <label htmlFor={`${idPrefix}-category`}>
            {t("transactions.category")}
          </label>
          <input type="hidden" {...register("category")} />
          <CategorySelect
            id={`${idPrefix}-category`}
            value={category}
            options={categories}
            invalid={Boolean(errors.category)}
            aria-invalid={Boolean(errors.category)}
            onChange={(next) =>
              setValue("category", next, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
          />
          <FieldError message={errors.category?.message} />
        </div>
        <div className="field">
          <label htmlFor={`${idPrefix}-payment`}>
            {t("transactions.payment")}
          </label>
          <select
            id={`${idPrefix}-payment`}
            className={errors.paymentMethod ? "is-invalid" : undefined}
            aria-invalid={Boolean(errors.paymentMethod)}
            {...register("paymentMethod")}
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
            {!PAYMENT_METHODS.includes(paymentMethod as never) && (
              <option value={paymentMethod}>{paymentMethod}</option>
            )}
          </select>
          <FieldError message={errors.paymentMethod?.message} />
        </div>
        <div className="field">
          <label htmlFor={`${idPrefix}-notes`}>{t("transactions.notes")}</label>
          <input
            id={`${idPrefix}-notes`}
            className={errors.notes ? "is-invalid" : undefined}
            aria-invalid={Boolean(errors.notes)}
            {...register("notes")}
          />
          <FieldError message={errors.notes?.message} />
        </div>
      </div>
    </>
  );
};

const TransactionPage = () => {
  const { t, i18n } = useTranslation();
  const rootRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<"list" | "add" | "recurring">("list");
  const [month, setMonth] = useState(currentMonthValue());
  const [filter, setFilter] = useState<"all" | ExpenseType>("all");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [useRange, setUseRange] = useState(false);
  const [items, setItems] = useState<Transaction[]>(
    () => getCache<Transaction[]>(`tx:${currentMonthValue()}`) || []
  );
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(
    () => !getCache(`tx:${currentMonthValue()}`)
  );
  const [saving, setSaving] = useState(false);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const txSchema = useMemo(
    () => createTransactionSchema(t),
    [t, i18n.language]
  );

  const addForm = useForm<TransactionFormValues>({
    resolver: yupResolver(txSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: emptyForm,
  });

  const editForm = useForm<TransactionFormValues>({
    resolver: yupResolver(txSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: emptyForm,
  });

  const addExpenseType = addForm.watch("expenseType");
  const addCategory = addForm.watch("category");
  const addPaymentMethod = addForm.watch("paymentMethod");
  const editExpenseType = editForm.watch("expenseType");
  const editCategory = editForm.watch("category");
  const editPaymentMethod = editForm.watch("paymentMethod");

  usePageGsap({
    rootRef,
    path: "/transactions",
    enabled: !loading || items.length > 0,
    targets: TX_TARGETS,
  });

  const load = async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent ?? !!getCache(`tx:${month}`);
    if (!silent) setLoading(true);
    setError("");
    try {
      const params: Record<string, string> = {};
      if (useRange && (dateFrom || dateTo)) {
        if (dateFrom) params.from = dateFrom;
        if (dateTo) params.to = dateTo;
      } else {
        params.month = month;
      }
      if (search.trim()) params.q = search.trim();
      if (categoryFilter) params.category = categoryFilter;
      if (paymentFilter) params.paymentMethod = paymentFilter;
      if (minAmount) params.minAmount = minAmount;
      if (maxAmount) params.maxAmount = maxAmount;

      const { data } = await api.get(API_URLS.TRANSACTIONS, { params });
      const next = data.transactions || [];
      setItems(next);
      if (!useRange && !search && !categoryFilter && !paymentFilter && !minAmount && !maxAmount) {
        setCache(`tx:${month}`, next);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Could not load transactions"));
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "recurring") return;
    const cached = getCache<Transaction[]>(`tx:${month}`);
    if (cached && !useRange && !search && !categoryFilter) {
      setItems(cached);
      setLoading(false);
      void load({ silent: true });
    } else {
      void load();
    }
  }, [month, useRange, dateFrom, dateTo]);

  const filteredItems = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((tx) => tx.expenseType === filter);
  }, [items, filter]);

  const counts = useMemo(
    () => ({
      all: items.length,
      expense: items.filter((t) => t.expenseType === "expense").length,
      income: items.filter((t) => t.expenseType === "income").length,
    }),
    [items]
  );

  const allCategories = useMemo(
    () => [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES],
    []
  );

  const refreshSummary = async () => {
    try {
      const { data } = await api.get(API_URLS.SUMMARY, {
        params: { month },
      });
      setCache(`summary:${month}`, data);
    } catch {
      invalidateCache(`summary:${month}`);
    }
  };

  const onSubmit = async (values: TransactionFormValues) => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.post(API_URLS.NEW_TRANSACTION, {
        ...values,
        amount: Number(values.amount),
      });
      setSuccess(t("transactions.saved"));
      addForm.reset({
        ...emptyForm,
        expenseType: values.expenseType,
        category:
          values.expenseType === "income"
            ? INCOME_CATEGORIES[0]
            : EXPENSE_CATEGORIES[0],
      });
      setTab("list");
      await load({ silent: true });
      await refreshSummary();
    } catch (err) {
      setError(getErrorMessage(err, t("transactions.saveFailed")));
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (tx: Transaction) => {
    setEditing(tx);
    editForm.reset(toForm(tx));
    setError("");
  };

  const closeEdit = () => {
    if (saving) return;
    setEditing(null);
  };

  const onUpdate = async (values: TransactionFormValues) => {
    if (!editing) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const { data } = await api.put(
        `${API_URLS.TRANSACTIONS}/${editing._id}`,
        {
          ...values,
          amount: Number(values.amount),
        }
      );
      setItems((prev) => {
        const next = prev.map((t) =>
          t._id === editing._id ? data.transaction : t
        );
        setCache(`tx:${month}`, next);
        return next;
      });
      setSuccess(t("transactions.updated"));
      setEditing(null);
      await refreshSummary();
    } catch (err) {
      setError(getErrorMessage(err, t("transactions.updateFailed")));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeletingBusy(true);
    setError("");
    try {
      await api.delete(`${API_URLS.TRANSACTIONS}/${deleting._id}`);
      setItems((prev) => {
        const next = prev.filter((t) => t._id !== deleting._id);
        setCache(`tx:${month}`, next);
        return next;
      });
      setSuccess(t("transactions.deleted"));
      setDeleting(null);
      await refreshSummary();
    } catch (err) {
      setError(getErrorMessage(err, t("transactions.deleteFailed")));
    } finally {
      setDeletingBusy(false);
    }
  };

  const deletePreview = useMemo(() => {
    if (!deleting) return null;
    return (
      <>
        Delete <strong>{deleting.description}</strong> (
        {deleting.expenseType === "income" ? "+" : "−"}
        {formatINR(deleting.amount)})? This cannot be undone.
      </>
    );
  }, [deleting]);

  return (
    <div className="transactions" ref={rootRef}>
      <div className="page-head">
        <div>
          <h1>{t("transactions.title")}</h1>
          <p>{monthLabel(month)}</p>
        </div>
        <div className="field" style={{ marginBottom: 0, minWidth: 180 }}>
          <label htmlFor="tx-month">Month</label>
          <input
            id="tx-month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
      </div>

      <div className="chip-row transactions__tabs">
        <button
          type="button"
          className={`chip ${tab === "list" ? "is-active" : ""}`}
          onClick={() => setTab("list")}
        >
          {t("transactions.list")}
        </button>
        <button
          type="button"
          className={`chip ${tab === "add" ? "is-active" : ""}`}
          onClick={() => setTab("add")}
        >
          {t("transactions.add")}
        </button>
        <button
          type="button"
          className={`chip ${tab === "recurring" ? "is-active" : ""}`}
          onClick={() => setTab("recurring")}
        >
          {t("transactions.recurring")}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <section
        className={`panel transactions__list tab-pane ${tab === "list" ? "is-active" : ""}`}
        aria-hidden={tab !== "list"}
      >
          <div className="transactions__toolbar">
            <div className="chip-row" role="tablist" aria-label="Filter type">
              {(
                [
                  { key: "all", label: t("transactions.all"), icon: null },
                  {
                    key: "expense",
                    label: t("transactions.expenses"),
                    icon: "expense" as const,
                  },
                  {
                    key: "income",
                    label: t("transactions.income"),
                    icon: "income" as const,
                  },
                ] as const
              ).map(({ key, label, icon }) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={filter === key}
                  className={`chip chip--with-icon ${filter === key ? "is-active" : ""}`}
                  onClick={() => setFilter(key)}
                >
                  {icon ? <TransactionTypeIcon type={icon} size={15} /> : null}
                  {label}
                  <span className="chip__count">{counts[key]}</span>
                </button>
              ))}
            </div>
            <div className="transactions__export">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => exportTransactionsCsv(filteredItems, month)}
                disabled={!filteredItems.length}
              >
                CSV
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => exportTransactionsPdf(filteredItems, month)}
                disabled={!filteredItems.length}
              >
                PDF
              </button>
            </div>
          </div>

          <div className="transactions__filters">
            <div className="field">
              <label htmlFor="tx-search">Search</label>
              <input
                id="tx-search"
                placeholder="Description, notes…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="tx-cat">Category</label>
              <select
                id="tx-cat"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All</option>
                {allCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="tx-pay">Payment</label>
              <select
                id="tx-pay"
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                <option value="">All</option>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="tx-min">Min ₹</label>
              <input
                id="tx-min"
                type="number"
                min="0"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="tx-max">Max ₹</label>
              <input
                id="tx-max"
                type="number"
                min="0"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
              />
            </div>
            <div className="field transactions__range-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={useRange}
                  onChange={(e) => setUseRange(e.target.checked)}
                />{" "}
                Custom date range
              </label>
            </div>
            {useRange && (
              <>
                <div className="field">
                  <label htmlFor="tx-from">From</label>
                  <input
                    id="tx-from"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="tx-to">To</label>
                  <input
                    id="tx-to"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </>
            )}
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => void load()}
            >
              Apply filters
            </button>
          </div>

          <div className="transactions__results" aria-busy={loading}>
            {loading && items.length === 0 ? (
              <TransactionSkeleton />
            ) : filteredItems.length === 0 ? (
              <EmptyState
                title={t("transactions.noRecordTitle")}
                description={
                  items.length === 0
                    ? t("transactions.noRecordMonth")
                    : t("transactions.noRecordFilter")
                }
                action={
                  items.length === 0 ? (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setTab("add")}
                    >
                      {t("transactions.add")}
                    </button>
                  ) : undefined
                }
              />
            ) : (
              <ul className="tx-list">
                {filteredItems.map((tx) => (
                  <li key={tx._id}>
                    <div className="tx-list__row">
                      <div className="tx-list__meta">
                        <strong>{tx.description}</strong>
                        <span className="tx-list__category">
                          <CategoryIcon category={tx.category} />
                          {tx.category} · {tx.paymentMethod} ·{" "}
                          {new Date(tx.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="transactions__actions">
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
                      <div className="transactions__btn-row">
                        <button
                          type="button"
                          className="btn btn-edit"
                          onClick={() => openEdit(tx)}
                        >
                          {t("common.edit")}
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => setDeleting(tx)}
                        >
                          {t("common.delete")}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
      </section>

      <form
        className={`panel transactions__form tab-pane ${tab === "add" ? "is-active" : ""}`}
        aria-hidden={tab !== "add"}
        onSubmit={addForm.handleSubmit(onSubmit)}
        noValidate
      >
          <h2>{t("transactions.addTitle")}</h2>
          <TransactionFormFields
            idPrefix="add"
            expenseType={addExpenseType}
            category={addCategory}
            paymentMethod={addPaymentMethod}
            register={addForm.register}
            setValue={addForm.setValue}
            errors={addForm.formState.errors}
            t={t}
          />
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? t("transactions.saving") : t("transactions.save")}
          </button>
      </form>

      <div
        className={`tab-pane ${tab === "recurring" ? "is-active" : ""}`}
        aria-hidden={tab !== "recurring"}
      >
        <RecurringPanel
          onChanged={() => {
            setCache(`tx:${month}`, null);
            void refreshSummary();
          }}
        />
      </div>

      {editing && (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={closeEdit}
        >
          <form
            className="modal-card modal-card--wide"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-tx-title"
            onClick={(e) => e.stopPropagation()}
            onSubmit={editForm.handleSubmit(onUpdate)}
            noValidate
          >
            <h2 id="edit-tx-title">{t("transactions.editTitle")}</h2>
            <TransactionFormFields
              idPrefix="edit"
              expenseType={editExpenseType}
              category={editCategory}
              paymentMethod={editPaymentMethod}
              register={editForm.register}
              setValue={editForm.setValue}
              errors={editForm.formState.errors}
              t={t}
            />
            <div className="modal-card__actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={closeEdit}
                disabled={saving}
              >
                {t("common.cancel")}
              </button>
              <button
                className="btn btn-primary"
                type="submit"
                disabled={saving}
              >
                {saving
                  ? t("transactions.updating")
                  : t("transactions.saveChanges")}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        open={!!deleting}
        title={t("transactions.deleteTitle")}
        message={deletePreview}
        confirmLabel={t("common.delete")}
        danger
        loading={deletingBusy}
        onConfirm={() => void confirmDelete()}
        onClose={() => {
          if (!deletingBusy) setDeleting(null);
        }}
      />
    </div>
  );
};

export default TransactionPage;
