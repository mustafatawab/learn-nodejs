import express from "express";
import { todoRouter } from "./src/module/todo/todo.router";

import { authRouter } from "./src/module/auth/auth.router";


export const app = express();

app.use(express.json());

app.use("/api/todos", todoRouter);
app.use("/api/auth" , authRouter)


