import { createTodo, updateTodo, deleteTodo, getSingleTodo, getTodos, } from "./todo.service.js";
import { todoCreateSchema, todoUpdateSchema } from "./todo.schema.js";
export const createTodoHandler = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        const validatedData = todoCreateSchema.parse(req.body);
        const todo = await createTodo(validatedData, userId);
        return res.status(201).json(todo);
    }
    catch (error) {
        next(error);
    }
};
export const getAllTodosHandler = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        const todos = await getTodos(userId);
        if (todos.length == 0) {
            return res.json({ message: "No todos found" });
        }
        return res.json({ todos });
    }
    catch (error) {
        next(error);
    }
};
export const getSingleTodoHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const todo = await getSingleTodo(id, userId);
        return res.json(todo);
    }
    catch (error) {
        next(error);
    }
};
export const updateTodoHandler = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        const validatedData = todoUpdateSchema.parse(req.body);
        const todo = await updateTodo(id, userId, validatedData);
        return res.json(todo);
    }
    catch (error) {
        next(error);
    }
};
export const deleteTodoHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const deletedTodo = await deleteTodo(userId, id);
        return res
            .status(200)
            .json({ message: "Todo deleted successfully", todo: deletedTodo });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=todo.controller.js.map