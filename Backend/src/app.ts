import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./router/user.routes.js";
import transactionRoutes from "./router/transaction.routes.js";
import dotenv from "dotenv";
import { healthCheck } from "./controller/health.controller.js";
import { API_VERSION } from "./constants.js";
import { ApiError } from "./utils/ApiError.js";
import { Request, Response, NextFunction } from "express";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(`${API_VERSION}health-check`, healthCheck);
app.use(`${API_VERSION}user`, userRoutes);
app.use(`${API_VERSION}transactions`, transactionRoutes);

app.use(
  (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
        errors: err.errors,
      });
    }

    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
);

export { app };
