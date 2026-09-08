import { Recurring } from "../models/recurring.model.js";
import { Transaction } from "../models/transaction.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Request, Response } from "express";

const currentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

/** Create missing transactions for active recurrings in the given month. */
export const applyRecurringForUser = async (
  userId: string,
  month?: string
) => {
  const monthKey = month || currentMonthKey();
  const [year, mon] = monthKey.split("-").map(Number);
  const daysInMonth = new Date(year, mon, 0).getDate();
  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() + 1 === mon;

  const rules = await Recurring.find({
    userId,
    active: true,
  });

  let created = 0;

  for (const rule of rules) {
    if (rule.lastGeneratedMonth === monthKey) continue;

    const day = Math.min(rule.dayOfMonth, daysInMonth);
    // Only generate if that day has arrived (for current month) or for past months
    if (isCurrentMonth && today.getDate() < day) continue;

    const date = new Date(year, mon - 1, day, 12, 0, 0, 0);

    await Transaction.create({
      amount: rule.amount,
      description: rule.description,
      date,
      category: rule.category,
      paymentMethod: rule.paymentMethod,
      expenseType: rule.expenseType,
      notes: rule.notes
        ? `${rule.notes} (recurring)`
        : "Auto-added from recurring",
      transactionBy: userId,
    });

    rule.lastGeneratedMonth = monthKey;
    await rule.save();
    created += 1;
  }

  return created;
};

const listRecurring = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, "Authentication required");

    const items = await Recurring.find({ userId })
      .sort({ dayOfMonth: 1, createdAt: -1 })
      .lean();

    res.status(200).json({ recurring: items });
  }
);

const createRecurring = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, "Authentication required");

    const {
      amount,
      description,
      category,
      paymentMethod,
      expenseType,
      notes,
      dayOfMonth,
    } = req.body;

    if (
      amount === undefined ||
      !description ||
      !category ||
      !paymentMethod ||
      !expenseType ||
      dayOfMonth === undefined
    ) {
      throw new ApiError(400, "All required fields must be provided");
    }

    if (!["income", "expense"].includes(expenseType)) {
      throw new ApiError(400, "expenseType must be income or expense");
    }

    const day = Number(dayOfMonth);
    if (!Number.isInteger(day) || day < 1 || day > 28) {
      throw new ApiError(400, "dayOfMonth must be between 1 and 28");
    }

    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount) || numericAmount < 0) {
      throw new ApiError(400, "Amount must be a valid positive number");
    }

    const item = await Recurring.create({
      amount: numericAmount,
      description: String(description).trim(),
      category: String(category).trim(),
      paymentMethod: String(paymentMethod).trim(),
      expenseType,
      notes: notes || "",
      dayOfMonth: day,
      active: true,
      lastGeneratedMonth: "",
      userId,
    });

    res.status(201).json({ message: "Recurring rule created", recurring: item });
  }
);

const updateRecurring = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, "Authentication required");

    const { id } = req.params;
    const {
      amount,
      description,
      category,
      paymentMethod,
      expenseType,
      notes,
      dayOfMonth,
      active,
    } = req.body;

    const existing = await Recurring.findOne({ _id: id, userId });
    if (!existing) throw new ApiError(404, "Recurring rule not found");

    if (amount !== undefined) {
      const numericAmount = Number(amount);
      if (Number.isNaN(numericAmount) || numericAmount < 0) {
        throw new ApiError(400, "Amount must be a valid positive number");
      }
      existing.amount = numericAmount;
    }
    if (description !== undefined)
      existing.description = String(description).trim();
    if (category !== undefined) existing.category = String(category).trim();
    if (paymentMethod !== undefined)
      existing.paymentMethod = String(paymentMethod).trim();
    if (expenseType !== undefined) {
      if (!["income", "expense"].includes(expenseType)) {
        throw new ApiError(400, "expenseType must be income or expense");
      }
      existing.expenseType = expenseType;
    }
    if (notes !== undefined) existing.notes = String(notes);
    if (dayOfMonth !== undefined) {
      const day = Number(dayOfMonth);
      if (!Number.isInteger(day) || day < 1 || day > 28) {
        throw new ApiError(400, "dayOfMonth must be between 1 and 28");
      }
      existing.dayOfMonth = day;
    }
    if (typeof active === "boolean") existing.active = active;

    await existing.save();
    res.status(200).json({ message: "Recurring updated", recurring: existing });
  }
);

const deleteRecurring = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, "Authentication required");

    const deleted = await Recurring.findOneAndDelete({
      _id: req.params.id,
      userId,
    });
    if (!deleted) throw new ApiError(404, "Recurring rule not found");

    res.status(200).json({ message: "Recurring deleted" });
  }
);

const runRecurring = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, "Authentication required");

    const month =
      typeof req.body.month === "string" ? req.body.month : currentMonthKey();
    const created = await applyRecurringForUser(userId, month);

    res.status(200).json({ message: "Recurring applied", created, month });
  }
);

export {
  listRecurring,
  createRecurring,
  updateRecurring,
  deleteRecurring,
  runRecurring,
};
