import mongoose, { Schema, Document, Model } from "mongoose";

// Define a TypeScript interface for the User document
export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  profilePic?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Create the schema
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
      required: true,
      trim: true,
    },
    profilePic: {
      type: String,
    },
  },
  { timestamps: true }
);

// Create and export the model
export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
