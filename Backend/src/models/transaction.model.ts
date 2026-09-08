import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type ExpenseType = "income" | "expense";

export interface ITransaction extends Document {
  amount: number;
  date: Date;
  category: string;
  paymentMethod: string;
  expenseType: ExpenseType;
  notes?: string;
  description: string;
  transactionBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    expenseType: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    transactionBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

export const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", transactionSchema);
