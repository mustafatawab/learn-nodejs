import express from "express";
import type { Request, Response, NextFunction } from "express";
import { todoRouter } from "./src/module/todo/todo.router";
import cookieParser from "cookie-parser";
import { authRouter } from "./src/module/auth/auth.router";
import cors from "cors";
import { authenticate } from "./src/shared/middleware/auth.middleware";
import { AppError } from "./src/shared/error/AppError";

export const app = express();

// allows your frontend to talk to the API
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);

// lets you read req.cookies (needed for your JWT)
app.use(cookieParser());

//  parses incoming JSON request bodies
app.use(express.json());

// registered before authenticate, so login/register don't require a token
app.use("/api/auth", authRouter);

// mounted globally — everything after this point is protected
app.use(authenticate);

// Todos Protected APIs
app.use("/api/todos", todoRouter);


// Whenever any middleware or route calls next(error), Express skips everything else and comes straight here.
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

  console.error("Unexpected Error: ", error);
  return res
    .status(500)
    .json({ status: false, error: "Internal Server Error" });
});
