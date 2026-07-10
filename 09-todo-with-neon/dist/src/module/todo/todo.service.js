import { prisma } from "../../shared/lib/prisma.js";
import { AppError } from "../../shared/error/AppError.js";
export const createTodo = async (input, userId) => {
    const todo = await prisma.todo.create({
        data: {
            userId,
            title: input.title,
            ...(input.description && { description: input.description }),
            completed: input.completed,
        },
    });
    return todo;
};
export const getTodos = async (userId) => {
    const todos = await prisma.todo.findMany({
        where: { userId }
    });
    return todos;
};
export const getSingleTodo = async (id, userId) => {
    const todo = await prisma.todo.findUnique({
        where: { id, userId },
    });
    return todo;
};
export const updateTodo = async (id, userId, input) => {
    const existingTodo = await prisma.todo.findUnique({
        where: { id, userId },
    });
    if (!existingTodo)
        throw new Error("Todo not found");
    const data = {};
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
export const deleteTodo = async (id, userId) => {
    const existingTodo = await prisma.todo.findUnique({
        where: { id, userId },
    });
    if (!existingTodo)
        throw new AppError("Todo not found", 404);
    const deletedTodo = await prisma.todo.delete({
        where: { id: id },
    });
    return deletedTodo;
};
//# sourceMappingURL=todo.service.js.map