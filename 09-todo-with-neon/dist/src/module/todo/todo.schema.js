import { z } from "zod";
export const todoCreateSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    completed: z.boolean().default(false),
});
export const todoUpdateSchema = z.object({
    title: z.string().min(1, "Title is required").optional(),
    description: z.string().optional(),
    completed: z.boolean().optional(),
});
//# sourceMappingURL=todo.schema.js.map