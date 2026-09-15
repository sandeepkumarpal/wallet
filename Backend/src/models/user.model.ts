import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategoryBudget {
  category: string;
  limit: number;
}

export type AuthProvider = "local" | "google" | "both";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password?: string;
  googleId?: string;
  authProvider: AuthProvider;
  profilePic?: string;
  monthlyBudget: number;
  categoryBudgets: ICategoryBudget[];
  createdAt?: Date;
  updatedAt?: Date;
}

const categoryBudgetSchema = new Schema<ICategoryBudget>(
  {
    category: { type: String, required: true, trim: true },
    limit: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const userSchema: Schema<IUser> = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,
      trim: true,
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
      trim: true,
    },
    authProvider: {
      type: String,
      enum: ["local", "google", "both"],
      default: "local",
    },
    profilePic: {
      type: String,
    },
    monthlyBudget: {
      type: Number,
      default: 0,
      min: 0,
    },
    categoryBudgets: {
      type: [categoryBudgetSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
