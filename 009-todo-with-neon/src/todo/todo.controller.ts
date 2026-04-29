import type { Request, Response } from "express";
import {
  createTodo,
  updateTodo,
  deleteTodo,
  getSingleTodo,
  getTodos,
} from "./todo.service";

export const createTodoHandler = async (req: Request, res: Response) => {
  const data = req.body;
  const todo = await createTodo(data);

  res.status(201).json(todo);
};

export const getAllTodosHandler = async (req: Request, res: Response) => {
  const todos = await getTodos();
  res.json(todos);
};

export const getSingleTodoHandler = async (req: Request, res: Response) => {
  const { id } = req.params;

  const todo = await getSingleTodo(id as string);

  res.json(todo);
};

export const updateTodoHandler = async (req: Request, res: Response) => {
  const { id } = req.params;

  const data = req.body;

  const todo = await updateTodo(id as string, data);

  res.json(todo);
};

export const deleteTodoHandler = async (req: Request, res: Response) => {
  const { id } = req.params;

  await deleteTodo(id as string);

  res.status(204).send();
};
