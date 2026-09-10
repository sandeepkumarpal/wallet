"use client";

import { useEffect, useState, type FormEvent } from "react";
import { api, getErrorMessage } from "../../../utils/api";
import { API_URLS } from "../../../utils/Apiurls";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
  formatINR,
  type ExpenseType,
  type RecurringRule,
} from "../../../types/finance";
import EmptyState from "../../Common/EmptyState/EmptyState";
import CategorySelect from "../../Common/CategorySelect/CategorySelect";
import { CategoryIcon } from "../../Common/Icons/CategoryIcons";
import {
  ExpenseIcon,
  IncomeIcon,
  TransactionTypeIcon,
} from "../../Common/Icons/TransactionIcons";

const empty = {
  amount: "",
  description: "",
  category: "Salary",
  paymentMethod: "Bank Transfer",
  expenseType: "income" as ExpenseType,
  notes: "",
  dayOfMonth: "1",
};

type Props = {
  onChanged?: () => void;
};

const RecurringPanel = ({ onChanged }: Props) => {
  const [items, setItems] = useState<RecurringRule[]>([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(API_URLS.RECURRING);
      setItems(data.recurring || []);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load recurring rules"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const categories =
    form.expenseType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.post(API_URLS.RECURRING, {
        ...form,
        amount: Number(form.amount),
        dayOfMonth: Number(form.dayOfMonth),
      });
      setSuccess("Recurring rule added");
      setForm(empty);
      await load();
      onChanged?.();
    } catch (err) {
      setError(getErrorMessage(err, "Could not create recurring rule"));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item: RecurringRule) => {
    try {
      await api.put(`${API_URLS.RECURRING}/${item._id}`, {
        active: !item.active,
      });
      await load();
      onChanged?.();
    } catch (err) {
      setError(getErrorMessage(err, "Could not update rule"));
    }
  };

  const remove = async (id: string) => {
    try {
      await api.delete(`${API_URLS.RECURRING}/${id}`);
      await load();
      onChanged?.();
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete rule"));
    }
  };

  return (
    <div className="recurring-panel">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form className="panel transactions__form" onSubmit={onSubmit}>
        <h2>Add recurring</h2>
        <p className="recurring-panel__hint">
          Auto-creates a transaction each month on the chosen day (1–28).
        </p>
        <div className="chip-row">
          {(["income", "expense"] as const).map((type) => (
            <button
              key={type}
              type="button"
              className={`chip chip--with-icon ${form.expenseType === type ? "is-active" : ""}`}
              onClick={() =>
                setForm({
                  ...form,
                  expenseType: type,
                  category: type === "income" ? "Salary" : "Rent",
                })
              }
            >
              {type === "income" ? (
                <IncomeIcon size={16} />
              ) : (
                <ExpenseIcon size={16} />
              )}
              {type === "income" ? "Income" : "Expense"}
            </button>
          ))}
        </div>
        <div className="transactions__grid">
          <div className="field">
            <label htmlFor="rec-amount">Amount (₹)</label>
            <input
              id="rec-amount"
              type="number"
              min="0"
              required
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="rec-day">Day of month</label>
            <input
              id="rec-day"
              type="number"
              min="1"
              max="28"
              required
              value={form.dayOfMonth}
              onChange={(e) => setForm({ ...form, dayOfMonth: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="rec-desc">Description</label>
            <input
              id="rec-desc"
              required
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <div className="field">
            <label htmlFor="rec-cat">Category</label>
            <CategorySelect
              id="rec-cat"
              value={form.category}
              options={categories}
              onChange={(category) => setForm({ ...form, category })}
            />
          </div>
          <div className="field">
            <label htmlFor="rec-pay">Payment</label>
            <select
              id="rec-pay"
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
            </select>
          </div>
        </div>
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save recurring"}
        </button>
      </form>

      <section className="panel">
        <h2>Your recurring</h2>
        {loading ? (
          <p className="recurring-panel__hint">Loading…</p>
        ) : items.length === 0 ? (
          <EmptyState
            title="No record found"
            description="No recurring rules yet. Add one above to auto-create monthly transactions."
          />
        ) : (
          <ul className="tx-list">
            {items.map((item) => (
              <li key={item._id}>
                <div className="tx-list__row">
                  <div className="tx-list__meta">
                    <strong>{item.description}</strong>
                    <span className="tx-list__category">
                      <CategoryIcon category={item.category} />
                      Day {item.dayOfMonth} · {item.category} ·{" "}
                      {item.expenseType}
                      {!item.active ? " · paused" : ""}
                    </span>
                  </div>
                </div>
                <div className="transactions__actions">
                  <div className="tx-list__amount">
                    <em
                      className={
                        item.expenseType === "income"
                          ? "is-income"
                          : "is-expense"
                      }
                    >
                      {formatINR(item.amount)}
                    </em>
                    <span
                      className={`tx-type-icon ${
                        item.expenseType === "income"
                          ? "is-income"
                          : "is-expense"
                      }`}
                      aria-hidden
                    >
                      <TransactionTypeIcon type={item.expenseType} size={18} />
                    </span>
                  </div>
                  <div className="transactions__btn-row">
                    <button
                      type="button"
                      className="btn btn-edit"
                      onClick={() => void toggleActive(item)}
                    >
                      {item.active ? "Pause" : "Resume"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => void remove(item._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default RecurringPanel;
