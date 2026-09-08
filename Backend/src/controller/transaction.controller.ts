import { Transaction } from "../models/transaction.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { applyRecurringForUser } from "./recurring.controller.js";
import { Request, Response } from "express";

const getMonthRange = (month?: string) => {
  const now = new Date();
  const [year, mon] = (
    month ||
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  )
    .split("-")
    .map(Number);
  const start = new Date(year, mon - 1, 1);
  const end = new Date(year, mon, 0, 23, 59, 59, 999);
  return { start, end, year, month: mon };
};

const newTransaction = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const {
      amount,
      date,
      category,
      paymentMethod,
      paymentmethod,
      expenseType,
      notes,
      description,
    } = req.body;

    const method = paymentMethod || paymentmethod;

    if (
      amount === undefined ||
      amount === null ||
      amount === "" ||
      !date ||
      !category ||
      !method ||
      !expenseType ||
      !description
    ) {
      throw new ApiError(400, "All required fields must be provided");
    }

    if (!["income", "expense"].includes(expenseType)) {
      throw new ApiError(400, "expenseType must be income or expense");
    }

    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount) || numericAmount < 0) {
      throw new ApiError(400, "Amount must be a valid positive number");
    }

    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, "Authentication required");
    }

    const transaction = await Transaction.create({
      amount: numericAmount,
      date: new Date(date),
      category: String(category).trim(),
      paymentMethod: String(method).trim(),
      expenseType,
      notes: notes || "",
      description: String(description).trim(),
      transactionBy: userId,
    });

    res.status(201).json({
      message: "Transaction created successfully",
      transaction,
    });
  }
);

const getTransactions = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, "Authentication required");
    }

    const {
      month,
      expenseType,
      category,
      paymentMethod,
      q,
      minAmount,
      maxAmount,
      from,
      to,
    } = req.query;

    // Apply due recurring items when loading a month view
    if (month && typeof month === "string") {
      await applyRecurringForUser(userId, month);
    }

    const filter: Record<string, unknown> = { transactionBy: userId };

    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (typeof from === "string" && from) {
        dateFilter.$gte = new Date(from);
      }
      if (typeof to === "string" && to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }
      filter.date = dateFilter;
    } else if (month && typeof month === "string") {
      const { start, end } = getMonthRange(month);
      filter.date = { $gte: start, $lte: end };
    }

    if (expenseType === "income" || expenseType === "expense") {
      filter.expenseType = expenseType;
    }

    if (typeof category === "string" && category.trim()) {
      filter.category = category.trim();
    }

    if (typeof paymentMethod === "string" && paymentMethod.trim()) {
      filter.paymentMethod = paymentMethod.trim();
    }

    if (minAmount !== undefined || maxAmount !== undefined) {
      const amountFilter: Record<string, number> = {};
      if (typeof minAmount === "string" && minAmount !== "") {
        const n = Number(minAmount);
        if (!Number.isNaN(n)) amountFilter.$gte = n;
      }
      if (typeof maxAmount === "string" && maxAmount !== "") {
        const n = Number(maxAmount);
        if (!Number.isNaN(n)) amountFilter.$lte = n;
      }
      if (Object.keys(amountFilter).length) filter.amount = amountFilter;
    }

    if (typeof q === "string" && q.trim()) {
      const regex = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { description: regex },
        { notes: regex },
        { category: regex },
      ];
    }

    const transactions = await Transaction.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    res.status(200).json({ transactions });
  }
);

const deleteTransaction = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, "Authentication required");
    }

    const { id } = req.params;
    const deleted = await Transaction.findOneAndDelete({
      _id: id,
      transactionBy: userId,
    });

    if (!deleted) {
      throw new ApiError(404, "Transaction not found");
    }

    res.status(200).json({ message: "Transaction deleted successfully" });
  }
);

const updateTransaction = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, "Authentication required");
    }

    const { id } = req.params;
    const {
      amount,
      date,
      category,
      paymentMethod,
      paymentmethod,
      expenseType,
      notes,
      description,
    } = req.body;

    const method = paymentMethod || paymentmethod;

    if (
      amount === undefined ||
      amount === null ||
      amount === "" ||
      !date ||
      !category ||
      !method ||
      !expenseType ||
      !description
    ) {
      throw new ApiError(400, "All required fields must be provided");
    }

    if (!["income", "expense"].includes(expenseType)) {
      throw new ApiError(400, "expenseType must be income or expense");
    }

    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount) || numericAmount < 0) {
      throw new ApiError(400, "Amount must be a valid positive number");
    }

    const updated = await Transaction.findOneAndUpdate(
      { _id: id, transactionBy: userId },
      {
        amount: numericAmount,
        date: new Date(date),
        category: String(category).trim(),
        paymentMethod: String(method).trim(),
        expenseType,
        notes: notes || "",
        description: String(description).trim(),
      },
      { new: true }
    );

    if (!updated) {
      throw new ApiError(404, "Transaction not found");
    }

    res.status(200).json({
      message: "Transaction updated successfully",
      transaction: updated,
    });
  }
);

const getMonthlySummary = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, "Authentication required");
    }

    const monthParam =
      typeof req.query.month === "string" ? req.query.month : undefined;
    const { start, end, year, month } = getMonthRange(monthParam);
    const monthKey = `${year}-${String(month).padStart(2, "0")}`;

    await applyRecurringForUser(userId, monthKey);

    const prevStart = new Date(year, month - 2, 1);
    const prevEnd = new Date(year, month - 1, 0, 23, 59, 59, 999);

    const [current, previous, user] = await Promise.all([
      Transaction.find({
        transactionBy: userId,
        date: { $gte: start, $lte: end },
      })
        .sort({ date: -1, createdAt: -1 })
        .lean(),
      Transaction.find({
        transactionBy: userId,
        date: { $gte: prevStart, $lte: prevEnd },
      }).lean(),
      User.findById(userId)
        .select("monthlyBudget fullName email categoryBudgets")
        .lean(),
    ]);

    const sumByType = (
      items: {
        amount: number;
        expenseType: string;
        category: string;
        date: Date;
      }[],
      type: string
    ) =>
      items
        .filter((t) => t.expenseType === type)
        .reduce((acc, t) => acc + Number(t.amount), 0);

    const income = sumByType(current, "income");
    const expense = sumByType(current, "expense");
    const prevExpense = sumByType(previous, "expense");
    const prevIncome = sumByType(previous, "income");
    const monthlyBudget = user?.monthlyBudget ?? 0;
    const remaining = monthlyBudget - expense;

    const byCategory: Record<string, number> = {};
    current
      .filter((t) => t.expenseType === "expense")
      .forEach((t) => {
        byCategory[t.category] =
          (byCategory[t.category] || 0) + Number(t.amount);
      });

    const categoryBreakdown = Object.entries(byCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const categoryBudgets = (user?.categoryBudgets || []).map((cb) => {
      const spent = byCategory[cb.category] || 0;
      const limit = Number(cb.limit) || 0;
      const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
      return {
        category: cb.category,
        limit,
        spent,
        remaining: limit - spent,
        pct,
      };
    });

    const daysInMonth = end.getDate();
    const dailySpend: Record<string, number> = {};
    current
      .filter((t) => t.expenseType === "expense")
      .forEach((t) => {
        const key = new Date(t.date).getDate().toString();
        dailySpend[key] = (dailySpend[key] || 0) + Number(t.amount);
      });

    const trend = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      return {
        day: String(day),
        expense: dailySpend[String(day)] || 0,
      };
    });

    const budgetUsedPct =
      monthlyBudget > 0 ? Math.round((expense / monthlyBudget) * 100) : 0;

    res.status(200).json({
      month: monthKey,
      income,
      expense,
      balance: income - expense,
      monthlyBudget,
      remaining,
      budgetUsedPct,
      prevExpense,
      prevIncome,
      categoryBreakdown,
      categoryBudgets,
      trend,
      recent: current.slice(0, 5),
    });
  }
);

const updateMonthlyBudget = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, "Authentication required");
    }

    const { monthlyBudget } = req.body;
    const value = Number(monthlyBudget);

    if (Number.isNaN(value) || value < 0) {
      throw new ApiError(400, "monthlyBudget must be a valid number");
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { monthlyBudget: value },
      { new: true }
    ).select("monthlyBudget fullName email categoryBudgets");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    res.status(200).json({
      message: "Monthly budget updated",
      monthlyBudget: user.monthlyBudget,
      categoryBudgets: user.categoryBudgets,
    });
  }
);

const updateCategoryBudgets = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, "Authentication required");
    }

    const { categoryBudgets } = req.body;
    if (!Array.isArray(categoryBudgets)) {
      throw new ApiError(400, "categoryBudgets must be an array");
    }

    const cleaned = categoryBudgets
      .map((item: { category?: string; limit?: number | string }) => ({
        category: String(item.category || "").trim(),
        limit: Number(item.limit),
      }))
      .filter((item) => item.category && !Number.isNaN(item.limit) && item.limit >= 0);

    // Dedupe by category (last wins)
    const map = new Map<string, number>();
    cleaned.forEach((c) => map.set(c.category, c.limit));
    const next = Array.from(map.entries()).map(([category, limit]) => ({
      category,
      limit,
    }));

    const user = await User.findByIdAndUpdate(
      userId,
      { categoryBudgets: next },
      { new: true }
    ).select("monthlyBudget categoryBudgets");

    if (!user) throw new ApiError(404, "User not found");

    res.status(200).json({
      message: "Category budgets updated",
      categoryBudgets: user.categoryBudgets,
      monthlyBudget: user.monthlyBudget,
    });
  }
);

export {
  newTransaction,
  getTransactions,
  deleteTransaction,
  updateTransaction,
  getMonthlySummary,
  updateMonthlyBudget,
  updateCategoryBudgets,
};
