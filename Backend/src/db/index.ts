import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  try {
    const connectionInstance = await mongoose.connect(`${uri}${DB_NAME}`);
    console.log(
      `MongoDB connected !!DB HOST: ${connectionInstance.connection.host}`
    );
    return connectionInstance;
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

export default connectDB;
