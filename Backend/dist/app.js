import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();
// Optional middlewares
app.use(cors());
app.use(cookieParser());
export { app };
