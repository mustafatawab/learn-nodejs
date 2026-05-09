import express from "express";
import type { Request, Response, NextFunction } from "express";
import { todoRouter } from "./src/module/todo/todo.router";
import cookieParser from "cookie-parser";
import { authRouter } from "./src/module/auth/auth.router";
import cors from "cors";
import { authenticate } from "./src/shared/middleware/auth.middleware";
import { AppError } from "./src/shared/error/AppError";

export const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);

app.use(cookieParser());

app.use(express.json());

app.use("/api/auth", authRouter);

app.use(authenticate);

app.use("/api/todos", todoRouter);

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  if (error.name === "ZodError" || error.issues) {
    return res.status(404).json({
      status: false,
      message: "Validation Error",
      error: error.errors || error.issues,
    });
  }

  return res
    .status(500)
    .json({ status: false, error: "Internal Server Error" });
});
