import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
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
import { getCache, setCache, invalidateCache } from "../../../utils/pageCache";
import { TransactionSkeleton } from "../../Common/PageSkeleton/PageSkeleton";
import { usePageGsap } from "../../../hooks/usePageGsap";
import {
  exportTransactionsCsv,
  exportTransactionsPdf,
} from "../../../utils/exportTransactions";
import RecurringPanel from "./RecurringPanel";
import "./Transaction.scss";
import "../../Common/ConfirmModal/ConfirmModal.scss";

const TX_TARGETS = [".transactions__tabs"] as const;

const emptyForm = {
  amount: "",
  description: "",
  date: new Date().toISOString().slice(0, 10),
  category: "Food",
  paymentMethod: "UPI",
  expenseType: "expense" as ExpenseType,
  notes: "",
};

type FormState = typeof emptyForm;

const toForm = (tx: Transaction): FormState => ({
  amount: String(tx.amount),
  description: tx.description,
  date: new Date(tx.date).toISOString().slice(0, 10),
  category: tx.category,
  paymentMethod: tx.paymentMethod,
  expenseType: tx.expenseType,
  notes: tx.notes || "",
});

const TransactionFormFields = ({
  form,
  setForm,
  idPrefix,
}: {
  form: FormState;
  setForm: (next: FormState) => void;
  idPrefix: string;
}) => {
  const categories =
    form.expenseType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <>
      <div className="chip-row">
        {(["expense", "income"] as const).map((type) => (
          <button
            key={type}
            type="button"
            className={`chip ${form.expenseType === type ? "is-active" : ""}`}
            onClick={() =>
              setForm({
                ...form,
                expenseType: type,
                category:
                  type === "income"
                    ? INCOME_CATEGORIES[0]
                    : EXPENSE_CATEGORIES[0],
              })
            }
          >
            {type === "expense" ? "Expense" : "Income"}
          </button>
        ))}
      </div>

      <div className="transactions__grid">
        <div className="field">
          <label htmlFor={`${idPrefix}-amount`}>Amount (₹)</label>
          <input
            id={`${idPrefix}-amount`}
            type="number"
            min="0"
            step="1"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label htmlFor={`${idPrefix}-date`}>Date</label>
          <input
            id={`${idPrefix}-date`}
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label htmlFor={`${idPrefix}-description`}>Description</label>
          <input
            id={`${idPrefix}-description`}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label htmlFor={`${idPrefix}-category`}>Category</label>
          <select
            id={`${idPrefix}-category`}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            {!categories.includes(form.category as never) && (
              <option value={form.category}>{form.category}</option>
            )}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`${idPrefix}-payment`}>Payment method</label>
          <select
            id={`${idPrefix}-payment`}
            value={form.paymentMethod}
            onChange={(e) =>
              setForm({ ...form, paymentMethod: e.target.value })
            }
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
            {!PAYMENT_METHODS.includes(form.paymentMethod as never) && (
              <option value={form.paymentMethod}>{form.paymentMethod}</option>
            )}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`${idPrefix}-notes`}>Notes</label>
          <input
            id={`${idPrefix}-notes`}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>
      </div>
    </>
  );
};

const TransactionPage = () => {
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
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(
    () => !getCache(`tx:${currentMonthValue()}`)
  );
  const [saving, setSaving] = useState(false);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.post(API_URLS.NEW_TRANSACTION, {
        ...form,
        amount: Number(form.amount),
      });
      setSuccess("Transaction saved");
      setForm({
        ...emptyForm,
        expenseType: form.expenseType,
        category:
          form.expenseType === "income"
            ? INCOME_CATEGORIES[0]
            : EXPENSE_CATEGORIES[0],
      });
      setTab("list");
      await load({ silent: true });
      await refreshSummary();
    } catch (err) {
      setError(getErrorMessage(err, "Could not save transaction"));
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (tx: Transaction) => {
    setEditing(tx);
    setEditForm(toForm(tx));
    setError("");
  };

  const closeEdit = () => {
    if (saving) return;
    setEditing(null);
  };

  const onUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const { data } = await api.put(
        `${API_URLS.TRANSACTIONS}/${editing._id}`,
        {
          ...editForm,
          amount: Number(editForm.amount),
        }
      );
      setItems((prev) => {
        const next = prev.map((t) =>
          t._id === editing._id ? data.transaction : t
        );
        setCache(`tx:${month}`, next);
        return next;
      });
      setSuccess("Transaction updated");
      setEditing(null);
      await refreshSummary();
    } catch (err) {
      setError(getErrorMessage(err, "Could not update transaction"));
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
      setSuccess("Transaction deleted");
      setDeleting(null);
      await refreshSummary();
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete"));
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
          <h1>Transactions</h1>
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
          History
        </button>
        <button
          type="button"
          className={`chip ${tab === "add" ? "is-active" : ""}`}
          onClick={() => setTab("add")}
        >
          Add new
        </button>
        <button
          type="button"
          className={`chip ${tab === "recurring" ? "is-active" : ""}`}
          onClick={() => setTab("recurring")}
        >
          Recurring
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
                  { key: "all", label: "All" },
                  { key: "expense", label: "Expenses" },
                  { key: "income", label: "Income" },
                ] as const
              ).map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={filter === key}
                  className={`chip ${filter === key ? "is-active" : ""}`}
                  onClick={() => setFilter(key)}
                >
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
              <div className="empty-state">
                {items.length === 0
                  ? "No transactions for this month."
                  : `No ${filter === "all" ? "" : filter + " "}transactions.`}
              </div>
            ) : (
              <ul className="tx-list">
                {filteredItems.map((tx) => (
                  <li key={tx._id}>
                    <div>
                      <strong>{tx.description}</strong>
                      <span>
                        {tx.category} · {tx.paymentMethod} ·{" "}
                        {new Date(tx.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <div className="transactions__actions">
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
                      <div className="transactions__btn-row">
                        <button
                          type="button"
                          className="btn btn-edit"
                          onClick={() => openEdit(tx)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => setDeleting(tx)}
                        >
                          Delete
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
        onSubmit={onSubmit}
      >
          <h2>Add transaction</h2>
          <TransactionFormFields
            form={form}
            setForm={setForm}
            idPrefix="add"
          />
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save transaction"}
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
            onSubmit={onUpdate}
          >
            <h2 id="edit-tx-title">Edit transaction</h2>
            <TransactionFormFields
              form={editForm}
              setForm={setEditForm}
              idPrefix="edit"
            />
            <div className="modal-card__actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={closeEdit}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                type="submit"
                disabled={saving}
              >
                {saving ? "Updating…" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        open={!!deleting}
        title="Delete transaction?"
        message={deletePreview}
        confirmLabel="Delete"
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
