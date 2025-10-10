import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./router/user.routes.js";
import dotenv from "dotenv";
import { healthCheck } from "./controller/health.controller.js";
import { API_VERSION } from "./constants.js";
dotenv.config();

const app = express();

// Optional middlewares
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(bodyParser.json());
app.use(`${API_VERSION}health-check`, healthCheck);
app.use(`${API_VERSION}user`, userRoutes);

console.log("app =============>");

export { app };
