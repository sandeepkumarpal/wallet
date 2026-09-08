import mongoose, { Schema, Document, Model, Types } from "mongoose";
import type { ExpenseType } from "./transaction.model.js";

export interface IRecurring extends Document {
  amount: number;
  description: string;
  category: string;
  paymentMethod: string;
  expenseType: ExpenseType;
  notes: string;
  dayOfMonth: number;
  active: boolean;
  lastGeneratedMonth: string;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const recurringSchema = new Schema<IRecurring>(
  {
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    paymentMethod: { type: String, required: true, trim: true },
    expenseType: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    notes: { type: String, trim: true, default: "" },
    dayOfMonth: { type: Number, required: true, min: 1, max: 28 },
    active: { type: Boolean, default: true },
    lastGeneratedMonth: { type: String, default: "" },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

export const Recurring: Model<IRecurring> =
  mongoose.models.Recurring ||
  mongoose.model<IRecurring>("Recurring", recurringSchema);
