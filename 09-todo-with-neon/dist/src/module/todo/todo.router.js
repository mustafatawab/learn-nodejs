import { Router } from "express";
import { createTodoHandler, deleteTodoHandler, getAllTodosHandler, getSingleTodoHandler, updateTodoHandler, } from "./todo.controller.js";
const router = Router();
router.get("/", getAllTodosHandler);
router.get("/:id", getSingleTodoHandler);
router.post("/", createTodoHandler);
router.put("/:id", updateTodoHandler);
router.delete("/:id", deleteTodoHandler);
export { router as todoRouter };
//# sourceMappingURL=todo.router.js.map