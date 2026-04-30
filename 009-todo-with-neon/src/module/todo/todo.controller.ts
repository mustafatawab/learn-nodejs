import type { NextFunction, Request, Response } from "express";
import {
  createTodo,
  updateTodo,
  deleteTodo,
  getSingleTodo,
  getTodos,
} from "./todo.service";

export const createTodoHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = req.body;
    const todo = await createTodo(data);

    return res.status(201).json(todo);
  } catch (error) {
    next(error);
  }
};

export const getAllTodosHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const todos = await getTodos();
    if (todos.length == 0) {
      return res.json({ message: "No todos found" });
    }
    return res.json(todos);
  } catch (error) {
    next(error);
  }
};

export const getSingleTodoHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const todo = await getSingleTodo(id as string);
    return res.json(todo);

  } catch (error) {
    next(error);
  }
};

export const updateTodoHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const data = req.body;

    const todo = await updateTodo(id as string, data);

    return res.json(todo);
  } catch (error) {
    next(error);
  }
};

export const deleteTodoHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const deletedTodo = await deleteTodo(id as string);

    return res
      .status(200)
      .json({ message: "Todo deleted successfully", todo: deletedTodo });
  } catch (error) {
    next(error);
  }
};
