import express from "express";
import { todoRouter } from "./src/todo/todo.router";
export const app = express();

app.use(express.json());
app.use("/api/todos", todoRouter);

app.get("/test", (req, res) => {
  res.json({ message: "Hello World" });
});
