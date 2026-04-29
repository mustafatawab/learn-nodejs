import type { TodoCreateInput, TodoUpdateInput } from "./todo.schema";
import { prisma } from "../lib/prisma";

export const createTodo = async (input: TodoCreateInput) => {
  const todo = await prisma.todo.create({
    data: {
      title: input.title,
      ...(input.description && { description: input.description }),
      completed: input.completed,
    },
  });

  return todo;
};

export const getTodos = async () => {
  const todos = await prisma.todo.findMany();
  return todos;
};

export const getSingleTodo = async (id: string) => {
  const todo = await prisma.todo.findUnique({
    where: { id: id },
  });
  return todo;
};

export const updateTodo = async (id: string, input: TodoUpdateInput) => {
  const existingTodo = await prisma.todo.findUnique({
    where: { id: id },
  });

  if (!existingTodo) throw new Error("Todo not found");

  const data: Partial<TodoUpdateInput> = {};

  if (input.title !== undefined) {
    data.title = input.title;
  }
  if (input.description !== undefined) {
    data.description = input.description;
  }
  if (input.completed !== undefined) {
    data.completed = input.completed;
  }

  const todo = await prisma.todo.update({
    where: { id: id },
    data,
  });
  return todo;
};

export const deleteTodo = async (id: string) => {
  const existingTodo = await prisma.todo.findUnique({
    where: { id: id },
  });

  if (!existingTodo) throw new Error("Todo not found");

  await prisma.todo.delete({
    where: { id: id },
  });
};
