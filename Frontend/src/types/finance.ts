export type ExpenseType = "income" | "expense";

export interface CategoryBudget {
  category: string;
  limit: number;
}

export interface CategoryBudgetStatus extends CategoryBudget {
  spent: number;
  remaining: number;
  pct: number;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  profilePic?: string;
  monthlyBudget?: number;
  categoryBudgets?: CategoryBudget[];
}

export interface Transaction {
  _id: string;
  amount: number;
  description: string;
  date: string;
  category: string;
  paymentMethod: string;
  notes?: string;
  expenseType: ExpenseType;
  transactionBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecurringRule {
  _id: string;
  amount: number;
  description: string;
  category: string;
  paymentMethod: string;
  expenseType: ExpenseType;
  notes?: string;
  dayOfMonth: number;
  active: boolean;
  lastGeneratedMonth?: string;
}

export interface MonthlySummary {
  month: string;
  income: number;
  expense: number;
  balance: number;
  monthlyBudget: number;
  remaining: number;
  budgetUsedPct?: number;
  prevExpense: number;
  prevIncome: number;
  categoryBreakdown: { name: string; value: number }[];
  categoryBudgets?: CategoryBudgetStatus[];
  trend: { day: string; expense: number }[];
  recent: Transaction[];
}

export const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Rent",
  "Utilities",
  "Shopping",
  "Health",
  "Entertainment",
  "Education",
  "Other",
] as const;

export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investment",
  "Gift",
  "Other",
] as const;

export const PAYMENT_METHODS = [
  "UPI",
  "Cash",
  "Card",
  "Bank Transfer",
  "Other",
] as const;

export const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

export const currentMonthValue = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

export const monthLabel = (month: string) => {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });
};
