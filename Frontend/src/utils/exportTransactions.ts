import type { Transaction } from "../types/finance";
import { formatINR, monthLabel } from "../types/finance";

const csvEscape = (value: string | number) => {
  const s = String(value ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

export const exportTransactionsCsv = (
  items: Transaction[],
  month: string
) => {
  const header = [
    "Date",
    "Type",
    "Category",
    "Description",
    "Amount",
    "Payment",
    "Notes",
  ];
  const rows = items.map((tx) => [
    new Date(tx.date).toLocaleDateString("en-IN"),
    tx.expenseType,
    tx.category,
    tx.description,
    tx.amount,
    tx.paymentMethod,
    tx.notes || "",
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map(csvEscape).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `wallet-${month}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportTransactionsPdf = (
  items: Transaction[],
  month: string
) => {
  const income = items
    .filter((t) => t.expenseType === "income")
    .reduce((s, t) => s + Number(t.amount), 0);
  const expense = items
    .filter((t) => t.expenseType === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);

  const rows = items
    .map(
      (tx) => `
      <tr>
        <td>${new Date(tx.date).toLocaleDateString("en-IN")}</td>
        <td>${tx.expenseType}</td>
        <td>${tx.category}</td>
        <td>${tx.description}</td>
        <td style="text-align:right">${formatINR(tx.amount)}</td>
        <td>${tx.paymentMethod}</td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Wallet — ${monthLabel(month)}</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 24px; color: #12241f; }
    h1 { font-size: 1.4rem; margin: 0 0 0.35rem; }
    p { color: #5a6f68; margin: 0 0 1rem; }
    .sum { display: flex; gap: 1.5rem; margin-bottom: 1.25rem; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border-bottom: 1px solid #ddd; padding: 8px 6px; text-align: left; }
    th { background: #eef3f1; }
  </style>
</head>
<body>
  <h1>Wallet export</h1>
  <p>${monthLabel(month)} · ${items.length} transactions</p>
  <div class="sum">
    <div>Income: <strong>${formatINR(income)}</strong></div>
    <div>Expense: <strong>${formatINR(expense)}</strong></div>
    <div>Net: <strong>${formatINR(income - expense)}</strong></div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Date</th><th>Type</th><th>Category</th>
        <th>Description</th><th>Amount</th><th>Payment</th>
      </tr>
    </thead>
    <tbody>${rows || `<tr><td colspan="6">No transactions</td></tr>`}</tbody>
  </table>
  <script>window.onload = () => { window.print(); };</script>
</body>
</html>`;

  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
};
