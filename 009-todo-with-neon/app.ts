import express from "express";
import { todoRouter } from "./src/module/todo/todo.router";
import cookieParser from "cookie-parser";
import { authRouter } from "./src/module/auth/auth.router";
import cors from "cors";
import { authenticate } from "./src/shared/middleware/auth.middleware";

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



app.use(authenticate)

app.use("/api/todos", todoRouter);
